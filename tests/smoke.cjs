const { chromium } = require("playwright");
const fs = require("fs");
const http = require("http");
const path = require("path");
const assert = require("assert");
const root = path.resolve(__dirname, "../public");
const artifacts = process.env.ARTIFACTS_DIR || "/tmp/dgames-test";
fs.mkdirSync(artifacts, { recursive: true });
const server = http.createServer((req, res) => {
  let p = path.join(root, decodeURIComponent(req.url.split("?")[0]));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory())
    p = path.join(p, "index.html");
  if (!p.startsWith(root) || !fs.existsSync(p)) {
    res.writeHead(404);
    return res.end("Not found");
  }
  res.setHeader(
    "Content-Type",
    {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
      ".svg": "image/svg+xml",
      ".png": "image/png",
    }[path.extname(p)] || "application/octet-stream",
  );
  res.end(fs.readFileSync(p));
});
(async () => {
  await new Promise((r) => server.listen(8123, r));
  const b = await chromium.launch({
    executablePath: process.env.CHROME_BIN || "/usr/bin/google-chrome",
    args: ["--no-sandbox"],
  });
  let page = await b.newPage({ viewport: { width: 1280, height: 900 } });
  let errors = [];
  page.on("pageerror", (e) => errors.push(e.message + " " + e.stack));
  await page.goto("http://localhost:8123");
  await page
    .getByRole("button", { name: "See all", exact: false })
    .first()
    .click();
  assert.equal(await page.locator("#all-games-grid .dg-game-card").count(), 11);
  await page.screenshot({
    path: path.join(artifacts, "library.png"),
    fullPage: true,
  });
  await page.getByRole("searchbox").fill("no-such-game");
  assert.equal(await page.locator("#all-games-grid .dg-game-card").count(), 0);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.locator("#all-games-grid .dg-save-btn").first().click();
  assert.equal(await page.locator("#saved-count").innerText(), "1");
  await page.reload();
  assert.equal(await page.locator("#saved-count").innerText(), "1");
  await page.locator(".dg-album").nth(1).click();
  assert.equal(await page.locator("#all-games-grid .dg-game-card").count(), 3);
  await page.getByRole("searchbox").fill("");
  await page.locator('.dg-sidebar [data-category="all"]').click();
  let gameResults = [];
  for (let i = 0; i < 11; i++) {
    await page.locator("#all-games-grid .dg-game-launch").nth(i).click();
    await page.locator("#game-iframe").waitFor();
    let f;
    for (let n = 0; n < 30; n++) {
      f = page
        .frames()
        .find((f) => f.url().includes("localhost") && f !== page.mainFrame());
      if (f && (await f.locator("body").count())) break;
      await page.waitForTimeout(100);
    }
    await f.waitForLoadState("load");
    const title = await f.title();
    const start = f
      .locator(
        "button#start, #startBtn, #btn-start, #start-btn, #btn-play, #play",
      )
      .filter({ visible: true });
    if (await start.count()) {
      await start.first().click();
      await page.waitForTimeout(400);
    }
    if (i === 10) {
      assert.equal(await f.locator("#board button").count(), 25);
      await f.locator("#board button").first().click();
      assert.equal(await f.locator("#board button").first().innerText(), "△");
    }
    let canvases = await f.locator("canvas").count();
    gameResults.push({ title, canvases });
    await page.screenshot({ path: path.join(artifacts, "game-" + i + ".png") });
    await f.evaluate(() =>
      parent.postMessage({ type: "dgames:home" }, location.origin),
    );
    await page.locator("#game-modal").waitFor({ state: "hidden" });
    assert.equal(
      await page.locator("#game-iframe").getAttribute("src"),
      "about:blank",
    );
  }
  console.log(JSON.stringify({ errors, gameResults }, null, 2));
  assert.equal(errors.length, 0);
  await page.locator('.dg-sidebar [data-view="home"]').click();
  await page.locator("#featured-play").click();
  await page.locator("#modal-reload").click();
  await page.waitForTimeout(200);
  await page.locator("#modal-close").click();
  await page.locator("#featured-play").click();
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#game-modal").isVisible(), false);
  await page.goto("http://localhost:8123");
  await page.evaluate(() => localStorage.setItem("dgames-favorites", "broken"));
  await page.reload();
  assert.equal(await page.locator("#saved-count").innerText(), "0");
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("http://localhost:8123");
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({
      path: path.join(artifacts, "home-" + width + ".png"),
      fullPage: true,
    });
    if (width === 390)
      await page.screenshot({
        path: path.join(artifacts, "mobile-viewport.png"),
      });
  }
  console.log(
    "PASS: catalog, search/empty/reset, collections, saved persistence/corruption, all player routes, iframe teardown, 4 responsive widths",
  );
  await b.close();
  server.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
