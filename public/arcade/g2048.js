ARCADE.define("2048", (ctx) => {
  if (!document.getElementById("css-g2048")) { const s = document.createElement("style"); s.id = "css-g2048"; s.textContent = `
  .g48{position:relative;width:min(100%,calc(100dvh - 280px));aspect-ratio:1;touch-action:none;-webkit-user-select:none;user-select:none}
  .g48 .cells{position:absolute;inset:0;display:grid;gap:8px}
  .g48 .cells i{background:rgba(167,148,221,.18);border-radius:12px}
  .g48 .tl{position:absolute;display:grid;place-items:center;border-radius:12px;font-weight:900;background:#fffdf8;border:3px solid #dfded3;transition:left .12s cubic-bezier(.3,.7,.3,1),top .12s cubic-bezier(.3,.7,.3,1)}
  .g48 .tl.new{animation:g48in .18s cubic-bezier(.3,1.6,.4,1) .1s both}
  .g48 .tl.mg{animation:g48pop .22s cubic-bezier(.3,1.6,.4,1)}
  @keyframes g48in{from{transform:scale(.2)}to{transform:scale(1)}}
  @keyframes g48pop{40%{transform:scale(1.18)}}
  .g48 .tl.v2{background:#fffdf8}.g48 .tl.v4{background:#f4efe3}
  .g48 .tl.v8{background:#f7de8a;border-color:#d8b948}.g48 .tl.v16{background:#f2c14e;border-color:#d8b948}
  .g48 .tl.v32{background:#f2a38f;border-color:#d4755d;color:#7a2f1d}.g48 .tl.v64{background:#e88b72;border-color:#d4755d;color:#fffdf8}
  .g48 .tl.v128{background:#bfe3f2;border-color:#7fb7d1}.g48 .tl.v256{background:#93cde6;border-color:#7fb7d1}
  .g48 .tl.v512{background:#c1ee81;border-color:#8fc24a}.g48 .tl.v1024{background:#8fc24a;border-color:#6ba032;color:#fffdf8}
  .g48 .tl.v2048{background:#a794dd;border-color:#4a3b86;color:#fffdf8}
  .g48 .tl.vbig{background:#4a3b86;border-color:#282d26;color:#fffdf8}
  .g48hud{display:flex;gap:8px;justify-content:center;width:100%;margin-bottom:6px}
  .g48hud span{background:var(--bg);border:2px solid var(--line);border-radius:12px;padding:4px 12px;font-weight:800;font-size:14px}
  .g48hud span b{color:var(--lav-d)}`; document.head.appendChild(s); }
  const SIZES = (l) => (l >= 9 ? 5 : 4);
  const TARGETS = [64, 128, 256, 512, 1024, 2048, 4096, 8192, 1024, 2048, 4096, 8192];
  let level = ctx.level, N = SIZES(level), target = TARGETS[level - 1] || 8192;
  let grid, score, over, won, moves, best = ctx.store.get("best", 0), undoStack = [], uid = 0, timers = [];
  const wrap = document.createElement("div");
  wrap.innerHTML = `<div class="g48hud"><span>Target <b id="g48t"></b></span><span>Best <b id="g48b">${best}</b></span><span>Moves <b id="g48m">0</b></span></div><div class="g48" id="g48b2"><div class="cells"></div></div>`;
  ctx.board.appendChild(wrap);
  const holder = wrap.querySelector(".g48"), cells = wrap.querySelector(".cells");
  ctx.setScore("0");
  function layout() { cells.style.gridTemplateColumns = `repeat(${N},1fr)`; cells.innerHTML = ""; for (let i = 0; i < N * N; i++) cells.appendChild(document.createElement("i")); }
  function pos(i) { const gap = 8, w = (holder.clientWidth - gap * (N - 1)) / N; const x = (i % N) * (w + gap), y = ((i / N) | 0) * (w + gap); return { x, y, w }; }
  function renderTile(t) {
    let e = holder.querySelector(`[data-t="${t.id}"]`);
    const { x, y, w } = pos(t.i);
    if (!e) { e = document.createElement("div"); e.dataset.t = t.id; e.className = "tl new" + (t.merged ? " mg" : ""); holder.appendChild(e); }
    e.classList.toggle("mg", !!t.merged);
    const vcls = t.v <= 2048 ? "v" + t.v : "vbig";
    e.className = `tl ${vcls}` + (t.merged ? " mg" : "") + (t.fresh ? " new" : "");
    e.style.width = e.style.height = w + "px"; e.style.left = x + "px"; e.style.top = y + "px";
    e.style.fontSize = (t.v < 100 ? w * 0.42 : t.v < 1000 ? w * 0.34 : t.v < 10000 ? w * 0.27 : w * 0.21) + "px";
    e.textContent = t.v;
  }
  function tiles() { const out = []; grid.forEach((v, i) => { if (v) out.push({ id: v.id, i, v: v.v, merged: v.merged, fresh: v.fresh }); }); return out; }
  function draw() { tiles().forEach(renderTile); grid.forEach((v) => { if (v) { v.merged = false; v.fresh = false; } });
    wrap.querySelector("#g48m").textContent = moves; }
  function spawn() { const free = grid.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0); if (!free.length) return;
    const i = free[(Math.random() * free.length) | 0]; grid[i] = { id: ++uid, v: Math.random() < 0.9 ? 2 : 4, fresh: true }; }
  function snapshot() { return { g: grid.map((v) => (v ? { id: v.id, v: v.v } : null)), score, moves }; }
  function restore(s) { grid = s.g.map((v) => (v ? { id: v.id, v: v.v } : null)); score = s.score; moves = s.moves; ctx.setScore(score); holder.querySelectorAll(".tl").forEach((e) => e.remove()); draw(); }
  function canMove() { for (let i = 0; i < N * N; i++) { if (!grid[i]) return true; const v = grid[i].v, x = i % N, y = (i / N) | 0;
    if (x < N - 1 && grid[i + 1] && grid[i + 1].v === v) return true; if (y < N - 1 && grid[i + N] && grid[i + N].v === v) return true; } return false; }
  function slide(dx, dy) {
    if (over) return;
    let moved = false; const snap = snapshot();
    const lines = [];
    for (let a = 0; a < N; a++) { const idx = [];
      for (let b = 0; b < N; b++) idx.push(dx !== 0 ? a * N + (dx > 0 ? N - 1 - b : b) : (dy > 0 ? N - 1 - b : b) * N + a);
      lines.push(idx); }
    const keep = {};
    for (const line of lines) {
      const vals = line.map((i) => grid[i]).filter(Boolean); let wi = 0;
      const merged = [];
      for (let k = 0; k < vals.length; k++) {
        if (k + 1 < vals.length && vals[k].v === vals[k + 1].v && !merged.includes(k)) {
          vals[k] = { id: vals[k].id, v: vals[k].v * 2, merged: true }; score += vals[k].v;
          if (vals[k].v > best) { best = vals[k].v; ctx.store.set("best", best); wrap.querySelector("#g48b").textContent = best; }
          vals.splice(k + 1, 1); merged.push(k);
        }
      }
      line.forEach((cell, k) => {
        const nv = k < vals.length ? vals[k] : null;
        if ((grid[cell] ? grid[cell].v : 0) !== (nv ? nv.v : 0) || (nv && grid[cell] && grid[cell].id !== nv.id)) moved = true;
        if (nv) keep[nv.id] = cell;
        grid[cell] = nv;
      });
    }
    if (!moved) return;
    undoStack.push(snap); if (undoStack.length > 1) undoStack.shift();
    moves++; ctx.setScore(score); ctx.sfx("place"); ctx.hx("tap");
    spawn();
    draw();
    const wint = grid.some((v) => v && v.v >= target);
    if (wint && !won) { won = true; over = true;
      timers.push(setTimeout(() => { ctx.sfx("win"); ctx.hx("success"); const r = ctx.fx.rectOf(holder); ctx.fx.burst(r.x, r.y, null, 30, 140);
        const nl = Math.min(12, level + 1);
        ctx.actions("You made " + target + "!", level >= 12 ? "Top level cleared. Incredible." : "Level " + nl + " next: make " + (TARGETS[nl - 1]),
          [{ label: level >= 12 ? "Play again" : "Next level", fn: () => { if (level < 12) ctx.setLevel(level + 1); ctx.restart(); } },
           { label: "Keep merging", alt: true, fn: () => { over = false; dockPlay(); } }]); }, 400));
    } else if (!canMove()) { over = true;
      timers.push(setTimeout(() => { ctx.sfx("die"); ctx.hx("error"); holder.classList.add("shake"); timers.push(setTimeout(() => holder.classList.remove("shake"), 300));
        ctx.actions("Board is full!", "You reached " + Math.max(...grid.map((v) => (v ? v.v : 0))) + ". Level " + level + " again?",
          [{ label: "Try again", fn: () => ctx.restart() }]); }, 400)); }
  }
  function dockPlay() {
    ctx.dock.innerHTML = "";
    ctx.say("Merge tiles to make " + target, "Swipe or use arrow keys");
    const u = document.createElement("button"); u.type = "button"; u.className = "btn alt small"; u.textContent = "Undo";
    u.setAttribute("aria-label", "Undo last move");
    u.onclick = () => { if (undoStack.length) { ctx.sfx("tap"); ctx.hx("tap"); restore(undoStack.pop()); if (!over) {} over = false; } };
    ctx.dock.appendChild(u);
  }
  let sx, sy, st;
  holder.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; st = Date.now(); });
  holder.addEventListener("pointerup", (e) => { if (sx == null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) slide(dx > 0 ? 1 : -1, 0); else slide(0, dy > 0 ? 1 : -1); });
  const key = (e) => { const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (m) { e.preventDefault(); slide(m[0], m[1]); } };
  window.addEventListener("keydown", key);
  wrap.querySelector("#g48t").textContent = target;
  layout(); grid = Array(N * N).fill(null); score = 0; moves = 0; over = false; won = false; undoStack = [];
  spawn(); spawn(); draw(); dockPlay();
  return { destroy() { window.removeEventListener("keydown", key); timers.forEach(clearTimeout); } };
});
