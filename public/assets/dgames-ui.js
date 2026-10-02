(() => {
  if (window.__DGAMES_CHROME__) return;
  window.__DGAMES_CHROME__ = true;

  const rawTitle = document.title
    .replace(/\s*[—-]\s*D['’]Games.*$/i, "")
    .trim();
  const title = rawTitle || "D’GAME";
  const root = document.createElement("div");
  root.className = "dg-chrome";
  root.innerHTML = [
    '<span class="dg-corner a" aria-hidden="true"></span>',
    '<span class="dg-corner b" aria-hidden="true"></span>',
    '<span class="dg-corner c" aria-hidden="true"></span>',
    '<span class="dg-corner d" aria-hidden="true"></span>',
    '<div class="dg-top">',
    '<div class="dg-brand">',
    '<span class="dg-mark" aria-hidden="true">D</span>',
    '<span class="dg-title-wrap"><span class="dg-title" data-title></span><span class="dg-live">D\'GAMES · FIELD CONSOLE</span></span>',
    "</div>",
    '<div class="dg-actions">',
    '<button class="dg-btn" type="button" data-action="home" aria-label="Back to D\'Games"><span class="dg-btn-label"><span class="dg-btn-glyph">⌂</span><span>DECK</span></span></button>',
    '<button class="dg-btn" type="button" data-action="restart" aria-label="Restart game"><span class="dg-btn-label"><span class="dg-btn-glyph">↻</span><span>RESET</span></span></button>',
    '<button class="dg-btn" type="button" data-action="fullscreen" aria-label="Enter fullscreen"><span class="dg-btn-label"><span class="dg-btn-glyph">⛶</span><span>FULL</span></span></button>',
    "</div>",
    "</div>",
    '<div class="dg-hud-tag" aria-hidden="true">D\'GAMES / INPUT LINK / READY</div>',
    '<div class="dg-bottom">',
    '<div class="dg-status" role="status" aria-live="polite">',
    '<span class="dg-led" aria-hidden="true"></span>',
    '<span class="dg-status-copy"><span class="dg-status-main" data-status>LIVE INPUT</span><span class="dg-status-sub" data-sub>TOUCH / KEYBOARD · SIGNAL GOOD</span></span>',
    "</div>",
    '<div class="dg-meter" aria-hidden="true">',
    '<div class="dg-meter-head"><span>SYSTEM LOAD</span><span data-meter-label>READY</span></div>',
    '<div class="dg-meter-track"><div class="dg-meter-fill"></div></div>',
    "</div>",
    "</div>",
  ].join("");

  root.querySelector("[data-title]").textContent = title;
  document.body.appendChild(root);

  const embedded = window.parent !== window;
  if (embedded) document.body.classList.add("dg-embedded");
  const home = () => {
    if (window.parent && window.parent !== window)
      window.parent.postMessage(
        { type: "dgames:home" },
        window.location.origin,
      );
    else window.location.href = "/";
  };
  const restart = () => window.location.reload();
  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };

  root.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "home") home();
      if (action === "restart") restart();
      if (action === "fullscreen") fullscreen();
    });
  });

  document.addEventListener("fullscreenchange", () => {
    const btn = root.querySelector('[data-action="fullscreen"]');
    const active = !!document.fullscreenElement;
    btn.querySelector(".dg-btn-glyph").textContent = active ? "×" : "⛶";
    btn.setAttribute(
      "aria-label",
      active ? "Exit fullscreen" : "Enter fullscreen",
    );
  });

  const fill = root.querySelector(".dg-meter-fill");
  const meterLabel = root.querySelector("[data-meter-label]");
  let lastWidth = 68;

  const readNumber = (selectors) => {
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      if (!node) continue;
      const value = Number.parseFloat(
        (node.textContent || "").replace(/[^0-9.\\-]/g, ""),
      );
      if (Number.isFinite(value)) return value;
    }
    return null;
  };

  const updateMeter = () => {
    if (document.hidden) return;
    const energyNode = document.querySelector("#energy");
    if (energyNode) {
      const match = (energyNode.style.width || "").match(/([0-9.]+)/);
      if (match) lastWidth = Math.max(4, Math.min(100, Number(match[1])));
      meterLabel.textContent = "ENERGY";
    } else {
      const health = readNumber(["#health", "#hud-health"]);
      if (health !== null && health <= 100) {
        lastWidth = Math.max(4, Math.min(100, health));
        meterLabel.textContent = "SHIELD";
      } else {
        const score = readNumber(["#score", "#hud-score", "#s"]);
        lastWidth = score === null ? 68 : 45 + (Math.abs(score) % 55);
        meterLabel.textContent = "RUN";
      }
    }
    fill.style.width = lastWidth + "%";
  };

  const setReady = () => {
    root.querySelector("[data-status]").textContent = "LIVE INPUT";
    root.querySelector("[data-sub]").textContent =
      "TOUCH / KEYBOARD · SIGNAL GOOD";
    root.querySelector(".dg-led").style.background = "var(--dg-olive)";
  };
  const setStandby = () => {
    root.querySelector("[data-status]").textContent = "STANDBY";
    root.querySelector("[data-sub]").textContent =
      "WINDOW UNFOCUSED · RESUME INPUT";
  };

  updateMeter();
  const meterTimer = embedded ? null : window.setInterval(updateMeter, 900);

  window.addEventListener("pointerdown", setReady, { passive: true });
  window.addEventListener("keydown", setReady, { passive: true });
  window.addEventListener("blur", setStandby);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) setStandby();
    else {
      setReady();
      updateMeter();
    }
  });

  window.addEventListener("pagehide", () => window.clearInterval(meterTimer), {
    once: true,
  });
})();
