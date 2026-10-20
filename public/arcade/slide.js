ARCADE.define("slide", (ctx) => {
  if (!document.getElementById("css-slide")) { const s = document.createElement("style"); s.id = "css-slide"; s.textContent = `
  .slp{position:relative;width:min(100%,calc(100dvh - 290px));aspect-ratio:1;touch-action:manipulation;-webkit-user-select:none;user-select:none}
  .slp .tl{position:absolute;display:grid;place-items:center;border-radius:14px;background:var(--surface);border:3px solid var(--line);box-shadow:0 4px 0 var(--line);font-weight:900;color:var(--ink);transition:left .15s cubic-bezier(.25,.8,.3,1),top .15s cubic-bezier(.25,.8,.3,1),transform .06s,background .2s,border-color .2s;cursor:pointer}
  .slp .tl:active{transform:scale(.96)}
  .slp .tl.home{border-color:var(--lime-d);background:var(--lime)}
  .slp .tl.deal{animation:slpin .3s cubic-bezier(.3,1.5,.4,1) both}
  @keyframes slpin{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
  .slp .tl.winflip{animation:slpflip .5s cubic-bezier(.3,1.4,.4,1)}
  @keyframes slpflip{50%{transform:rotateY(90deg) scale(1.06)}}
  .slphud{display:flex;gap:8px;justify-content:center;width:100%;margin-bottom:6px}
  .slphud span{background:var(--bg);border:2px solid var(--line);border-radius:12px;padding:4px 12px;font-weight:800;font-size:14px}
  .slphud span b{color:var(--sun-d)}`; document.head.appendChild(s); }
  const CFG = (l) => l <= 2 ? { n: 3, sh: 8 + l * 6 } : l <= 4 ? { n: 3, sh: 22 + (l - 2) * 10 } : l <= 7 ? { n: 4, sh: 26 + (l - 4) * 12 } : l <= 9 ? { n: 4, sh: 62 + (l - 7) * 14 } : { n: 5, sh: 56 + (l - 9) * 16 };
  let level = ctx.level, cfg = CFG(level), N = cfg.n, tiles, blank, moves, t0, timerIv, over, timers = [];
  let best = ctx.store.get("best" + N, null);
  const els = {};
  const wrap = document.createElement("div");
  wrap.innerHTML = `<div class="slphud"><span>Moves <b id="slm">0</b></span><span>Time <b id="slt">0:00</b></span><span>Par <b id="slp2"></b></span>${best ? `<span>Best <b>${best}</b></span>` : ""}</div><div class="slp" id="slb"></div>`;
  ctx.board.appendChild(wrap);
  const boardEl = wrap.querySelector("#slb");
  const par = Math.round(cfg.sh * 1.35);
  wrap.querySelector("#slp2").textContent = par;
  ctx.setScore(N + "x" + N);
  function pos(i) { const gap = 7, w = (boardEl.clientWidth - gap * (N - 1)) / N; return { x: (i % N) * (w + gap), y: ((i / N) | 0) * (w + gap), w }; }
  function place(v, i) { const { x, y } = pos(i); const e = els[v]; e.style.left = x + "px"; e.style.top = y + "px"; e.classList.toggle("home", v === i + 1); }
  function build() {
    boardEl.innerHTML = "";
    tiles.forEach((v, i) => {
      if (v === 0) return;
      const { x, y, w } = pos(i);
      const e = document.createElement("div"); e.className = "tl deal";
      e.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${w}px;font-size:${w * 0.4}px;animation-delay:${i * 28}ms`;
      e.textContent = v;
      e.addEventListener("pointerdown", (ev) => { ev.preventDefault(); tapTile(v); });
      boardEl.appendChild(e); els[v] = e;
    });
    wrap.querySelector("#slm").textContent = moves;
  }
  function neighbors(i) { const x = i % N, y = (i / N) | 0, out = []; if (x > 0) out.push(i - 1); if (x < N - 1) out.push(i + 1); if (y > 0) out.push(i - N); if (y < N - 1) out.push(i + N); return out; }
  function shuffle() {
    tiles = Array.from({ length: N * N }, (_, i) => (i + 1) % (N * N)); blank = N * N - 1;
    let prev = -1;
    for (let k = 0; k < cfg.sh; k++) {
      const opts = neighbors(blank).filter((i) => i !== prev);
      const pick = opts[(Math.random() * opts.length) | 0];
      prev = blank; tiles[blank] = tiles[pick]; tiles[pick] = 0; blank = pick;
    }
    if (tiles.every((v, i) => v === (i + 1) % (N * N))) shuffle();
  }
  function tapTile(v) {
    if (over) return;
    const i = tiles.indexOf(v);
    if (!neighbors(blank).includes(i)) { ctx.sfx("tap"); return; }
    tiles[blank] = v; tiles[i] = 0; blank = i; moves++;
    wrap.querySelector("#slm").textContent = moves;
    ctx.sfx("place"); ctx.hx("tap");
    place(v, blank);
    if (tiles.every((x, idx) => x === (idx + 1) % (N * N))) win();
  }
  function win() {
    over = true; clearInterval(timerIv);
    const sc = moves <= par ? 3 : moves <= par * 1.5 ? 2 : 1;
    if (!best || moves < best) { best = moves; ctx.store.set("best" + N, best); }
    ctx.sfx("win"); ctx.hx("success");
    Object.values(els).forEach((e, i) => { e.style.animationDelay = i * 35 + "ms"; e.classList.add("winflip"); });
    const r = ctx.fx.rectOf(boardEl); ctx.fx.burst(r.x, r.y, null, 26, 130);
    const nl = Math.min(12, level + 1);
    const ncfg = CFG(nl);
    timers.push(setTimeout(() => {
      ctx.actions("Solved in " + moves + " moves - " + "★".repeat(sc) + "☆".repeat(3 - sc),
        level >= 12 ? "Top level cleared!" : "Level " + nl + ": " + ncfg.n + "x" + ncfg.n + ", shuffled deeper",
        [{ label: level >= 12 ? "Play again" : "Next level", fn: () => { if (level < 12) ctx.setLevel(level + 1); ctx.restart(); } }]);
    }, 650));
  }
  function tick() { const s = Math.round((Date.now() - t0) / 1000); wrap.querySelector("#slt").textContent = (s / 60 | 0) + ":" + String(s % 60).padStart(2, "0"); }
  shuffle(); moves = 0; over = false; build();
  ctx.say("Slide tiles into order, 1 to " + (N * N - 1), "Tap a tile next to the gap. Par: " + par + " moves");
  t0 = Date.now(); timerIv = setInterval(tick, 1000);
  return { destroy() { clearInterval(timerIv); timers.forEach(clearTimeout); } };
});
