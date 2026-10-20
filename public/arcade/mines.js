ARCADE.define("mines", (ctx) => {
  if (!document.getElementById("css-mines")) { const s = document.createElement("style"); s.id = "css-mines"; s.textContent = `
  .mn{display:grid;gap:4px;touch-action:manipulation;-webkit-user-select:none;user-select:none}
  .mn .cl{aspect-ratio:1;display:grid;place-items:center;border-radius:8px;background:var(--surface);border:2px solid var(--line);box-shadow:0 3px 0 var(--line);font-weight:900;cursor:pointer;transition:transform .05s,background .15s,opacity .3s}
  .mn .cl:active{transform:translateY(2px);box-shadow:0 1px 0 var(--line)}
  .mn .cl.open{background:var(--bg);box-shadow:none;border-color:transparent;cursor:default;animation:mnin .18s both}
  @keyframes mnin{from{transform:scale(.7);opacity:.4}to{transform:scale(1);opacity:1}}
  .mn .cl.flag{background:var(--sun);border-color:var(--sun-d)}
  .mn .cl.boom{background:var(--coral);border-color:var(--coral-d);animation:shake .3s}
  .mn .cl.n1{color:#4a3b86}.mn .cl.n2{color:#6ba032}.mn .cl.n3{color:#d4755d}.mn .cl.n4{color:#7fb7d1}
  .mn .cl.n5{color:#d8b948}.mn .cl.n6{color:#a6784a}.mn .cl.n7{color:#282d26}.mn .cl.n8{color:#74776b}
  .mnhud{display:flex;gap:8px;justify-content:center;width:100%;margin-bottom:6px;align-items:center}
  .mnhud span{background:var(--bg);border:2px solid var(--line);border-radius:12px;padding:4px 12px;font-weight:800;font-size:14px}
  .mnhud span b{color:var(--coral-d)}
  .mnhud .flagbtn{background:var(--surface);border:2px solid var(--line);border-radius:12px;padding:4px 12px;font-weight:800;font-size:14px;box-shadow:0 3px 0 var(--line);min-height:34px}
  .mnhud .flagbtn.on{background:var(--sun);border-color:var(--sun-d)}`; document.head.appendChild(s); }
  const CFG = (l) => l <= 2 ? { n: 6, m: 6 } : l <= 4 ? { n: 7, m: 9 } : l <= 6 ? { n: 8, m: 12 } : l <= 8 ? { n: 9, m: 16 } : l <= 10 ? { n: 10, m: 22 } : l === 11 ? { n: 11, m: 28 } : { n: 12, m: 35 };
  let level = ctx.level, cfg = CFG(level), N = cfg.n, M = cfg.m;
  let mine, open, flag, count, over, first, flagMode = false, t0, timerIv, timers = [];
  let best = ctx.store.get("clear" + N, 0);
  const wrap = document.createElement("div");
  wrap.innerHTML = `<div class="mnhud"><span><b id="mnm"></b> mines</span><span>Time <b id="mnt">0:00</b></span><button class="flagbtn" id="mnf" type="button" aria-label="Toggle flag mode">Flag: Off</button></div><div class="mn" id="mnb"></div>`;
  ctx.board.appendChild(wrap);
  const bEl = wrap.querySelector("#mnb"), mEl = wrap.querySelector("#mnm"), fBtn = wrap.querySelector("#mnf");
  ctx.setScore(N + "x" + N);
  const idx = (x, y) => y * N + x, xy = (i) => [i % N, (i / N) | 0];
  const near = (i) => { const [x, y] = xy(i), out = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const nx = x + dx, ny = y + dy; if (nx >= 0 && nx < N && ny >= 0 && ny < N) out.push(idx(nx, ny)); } return out; };
  function layMines(safe) {
    mine = Array(N * N).fill(false);
    const banned = new Set([safe, ...near(safe)]);
    let placed = 0;
    while (placed < M) { const i = (Math.random() * N * N) | 0; if (mine[i] || banned.has(i)) continue; mine[i] = true; placed++; }
    count = Array(N * N).fill(0);
    for (let i = 0; i < N * N; i++) if (!mine[i]) count[i] = near(i).filter((j) => mine[j]).length;
  }
  function minesLeft() { mEl.textContent = M - flag.filter(Boolean).length; }
  function build() {
    bEl.style.gridTemplateColumns = `repeat(${N},1fr)`;
    
    bEl.style.width = "min(100%,calc(100dvh - 300px))";
    bEl.innerHTML = "";
    for (let i = 0; i < N * N; i++) {
      const c = document.createElement("div"); c.className = "cl"; c.dataset.i = i;
      c.style.fontSize = `clamp(11px, ${(38 / N) * 10}px, 22px)`;
      let lp;
      c.addEventListener("pointerdown", (e) => { e.preventDefault(); lp = setTimeout(() => { lp = null; toggleFlag(i); }, 380); });
      c.addEventListener("pointerup", () => { if (lp) { clearTimeout(lp); lp = null; flagMode ? toggleFlag(i) : reveal(i); } });
      c.addEventListener("pointerleave", () => { if (lp) { clearTimeout(lp); lp = null; } });
      bEl.appendChild(c);
    }
  }
  function cell(i) { return bEl.children[i]; }
  function toggleFlag(i) {
    if (over || open[i]) return;
    flag[i] = !flag[i]; cell(i).classList.toggle("flag", flag[i]); cell(i).textContent = flag[i] ? "\u2691" : "";
    ctx.sfx(flag[i] ? "pop" : "tap"); ctx.hx("tap"); minesLeft();
  }
  function reveal(i, depth) {
    if (over || open[i] || flag[i]) return;
    if (first) { first = false; layMines(i); t0 = Date.now(); timerIv = setInterval(tick, 1000); }
    if (mine[i]) return lose(i);
    const wave = depth == null ? 0 : depth;
    const q = [[i, wave]], seen = new Set();
    let openedAny = 0;
    while (q.length) {
      const [c, d] = q.shift();
      if (open[c] || flag[c] || seen.has(c)) continue;
      seen.add(c); open[c] = true; openedAny++;
      const e = cell(c);
      timers.push(setTimeout(() => {
        e.classList.add("open");
        if (count[c] > 0) { e.textContent = count[c]; e.classList.add("n" + count[c]); }
      }, d * 34));
      if (count[c] === 0) near(c).forEach((n) => { if (!open[n] && !seen.has(n)) q.push([n, d + 1]); });
    }
    if (openedAny) { ctx.sfx("tap"); ctx.hx("tap"); }
    timers.push(setTimeout(checkWin, seen.size * 34 + 60));
  }
  function checkWin() {
    if (over) return;
    if (open.filter(Boolean).length === N * N - M) win();
  }
  function win() {
    over = true; clearInterval(timerIv);
    const secs = Math.round((Date.now() - t0) / 1000);
    ctx.store.set("clear" + N, best + 1);
    ctx.sfx("win"); ctx.hx("success");
    const r = ctx.fx.rectOf(bEl); ctx.fx.burst(r.x, r.y, null, 26, 140);
    const nl = Math.min(12, level + 1), nc = CFG(nl);
    timers.push(setTimeout(() => {
      ctx.actions("Board clear in " + (secs / 60 | 0) + ":" + String(secs % 60).padStart(2, "0") + "!",
        level >= 12 ? "You swept the biggest board." : "Level " + nl + ": " + nc.n + "x" + nc.n + " with " + nc.m + " mines",
        [{ label: level >= 12 ? "Play again" : "Next level", fn: () => { if (level < 12) ctx.setLevel(level + 1); ctx.restart(); } }]);
    }, 500));
  }
  function lose(i) {
    over = true; clearInterval(timerIv);
    ctx.sfx("boom"); ctx.hx("error");
    cell(i).classList.add("boom"); cell(i).textContent = "\u2738";
    for (let j = 0; j < N * N; j++) if (mine[j] && j !== i) { const e = cell(j); timers.push(setTimeout(() => { e.classList.add("open"); e.textContent = "\u2738"; }, 200 + Math.random() * 500)); }
    timers.push(setTimeout(() => {
      ctx.actions("Boom! Hit a mine.", "Level " + level + " again - fresh board",
        [{ label: "Try again", fn: () => ctx.restart() }]);
    }, 900));
  }
  function tick() { const s = Math.round((Date.now() - t0) / 1000); wrap.querySelector("#mnt").textContent = (s / 60 | 0) + ":" + String(s % 60).padStart(2, "0"); }
  fBtn.onclick = () => { flagMode = !flagMode; fBtn.classList.toggle("on", flagMode); fBtn.textContent = "Flag: " + (flagMode ? "On" : "Off"); ctx.sfx("tap"); ctx.hx("tap"); };
  open = Array(N * N).fill(false); flag = Array(N * N).fill(false); over = false; first = true;
  build(); minesLeft();
  ctx.say("Clear every safe tile", "Tap to reveal. Long-press or Flag mode to mark mines. First tap is always safe.");
  return { destroy() { clearInterval(timerIv); timers.forEach(clearTimeout); } };
});
