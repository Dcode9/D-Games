ARCADE.define("snakes", (ctx) => {
  const N = 15; let level = ctx.level, snake, prev, dir, queue, food, foodT, score, alive, started, last = 0, raf, stepMs, px = 300, flash = 0, shake = 0, parts = [], tongue = 0, paused = false, best = ctx.store.get("best", 0);
  const wrap = document.createElement("div"); wrap.style.cssText = "position:relative;display:grid;place-items:center;width:100%;height:100%";
  const cv = document.createElement("canvas"); cv.style.cssText = "background:#eef5dc;border:3px solid #cfd9b4;border-radius:22px;touch-action:none;box-shadow:0 6px 0 #cfd9b4;transition:transform .1s"; wrap.appendChild(cv); ctx.board.appendChild(wrap);
  const g = cv.getContext("2d"); let dpr = 1;
  function size() { const s = Math.min(ctx.board.clientWidth - 24, ctx.board.clientHeight - 24); px = Math.max(180, Math.floor(s / N) * N); cv.style.width = cv.style.height = px + "px"; dpr = devicePixelRatio || 1; cv.width = cv.height = px * dpr; }
  size(); addEventListener("resize", size);
  const pad = document.createElement("div"); pad.style.cssText = "display:grid;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(2,50px);gap:6px;justify-content:center;width:100%";
  [["\u2191", 2, 1, 0, -1], ["\u2190", 1, 2, -1, 0], ["\u2193", 2, 2, 0, 1], ["\u2192", 3, 2, 1, 0]].forEach(([t, c, r, x, y]) => { const b = document.createElement("button"); b.type = "button"; b.className = "btn"; b.setAttribute("aria-label", "Turn"); b.style.cssText = `grid-column:${c};grid-row:${r};padding:0;min-height:0;font-size:24px`; b.textContent = t; b.onpointerdown = (e) => { e.preventDefault(); turn(x, y); }; pad.appendChild(b); });
  function turn(x, y) { if (!alive) return; const ref = queue.length ? queue[queue.length - 1] : dir; if ((x === ref.x && y === ref.y) || (x === -ref.x && y === -ref.y)) { if (!started) started = true; return; } if (queue.length < 2) queue.push({ x, y }); if (!started) { started = true; last = performance.now(); } ctx.hx("tap"); }
  let sx, sy; cv.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; });
  cv.addEventListener("pointermove", (e) => { if (sx == null) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) > 22) { Math.abs(dx) > Math.abs(dy) ? turn(Math.sign(dx), 0) : turn(0, Math.sign(dy)); sx = e.clientX; sy = e.clientY; } });
  cv.addEventListener("pointerup", () => (sx = null));
  const keys = (e) => { const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] }[e.key]; if (m) { e.preventDefault(); turn(...m); } };
  addEventListener("keydown", keys); const vis = () => { if (document.hidden && started && alive) paused = true; }; document.addEventListener("visibilitychange", vis);
  cv.addEventListener("pointerdown", () => { if (paused) { paused = false; last = performance.now(); } });
  const spd = () => Math.max(78, 200 - level * 14);
  function spawn() { do { food = { x: (Math.random() * N) | 0, y: (Math.random() * N) | 0 }; } while (snake.some((s) => s.x === food.x && s.y === food.y)); foodT = performance.now(); }
  function reset() { snake = [{ x: 6, y: 7 }, { x: 5, y: 7 }, { x: 4, y: 7 }]; prev = snake.map((s) => ({ ...s })); dir = { x: 1, y: 0 }; queue = []; score = 0; alive = true; started = false; paused = false; parts = []; stepMs = spd(); spawn(); ctx.setScore(0); ctx.dock.innerHTML = ""; ctx.dock.appendChild(pad); last = performance.now(); }
  function tick() {
    if (queue.length) dir = queue.shift(); prev = snake.map((s) => ({ ...s })); const h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || snake.slice(0, -1).some((s) => s.x === h.x && s.y === h.y)) return die(h);
    snake.unshift(h);
    if (h.x === food.x && h.y === food.y) { score++; ctx.setScore(score); ctx.sfx("eat"); ctx.hx("select"); const r = cv.getBoundingClientRect(), k = r.width / N; ctx.fx.burst(r.left + (h.x + 0.5) * k, r.top + (h.y + 0.5) * k, ["#d4755d", "#f2a38f", "#c1ee81"], 12, 50); ctx.fx.floatText("+1", r.left + (h.x + 0.5) * k, r.top + h.y * k - 4, "#b0405a"); prev.push({ ...prev[prev.length - 1] }); spawn();
      if (score % 5 === 0) { level++; ctx.setLevel(level); stepMs = spd(); flash = 1; ctx.fx.floatText("Level " + level, cv.getBoundingClientRect().left + px / 2, cv.getBoundingClientRect().top + px / 2, "#3f6b2a"); ctx.sfx("good"); } }
    else snake.pop();
  }
  function die(h) { alive = false; ctx.hx("error"); ctx.sfx("die"); shake = 1; cv.style.transform = "translateX(-7px)"; setTimeout(() => (cv.style.transform = "translateX(6px)"), 70); setTimeout(() => (cv.style.transform = ""), 140);
    const nb = score > best; if (nb) { best = score; ctx.store.set("best", score); }
    setTimeout(() => ctx.actions(nb && score > 0 ? "New best: " + score + " berries!" : "Crash! " + score + " berries.", "Best: " + best, [{ label: "Play again", fn: () => { reset(); } }]), 520); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function frame(now) { raf = requestAnimationFrame(frame);
    if (alive && started && !paused) { while (now - last >= stepMs && alive) { last += stepMs; tick(); } }
    const t = alive && started && !paused ? Math.min(1, (now - last) / stepMs) : 1, k = px / N; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, px, px);
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if ((i + j) % 2) { g.fillStyle = "#e6efcd"; g.fillRect(i * k, j * k, k, k); }
    if (flash > 0) { g.fillStyle = `rgba(193,238,129,${flash * 0.35})`; g.fillRect(0, 0, px, px); flash -= 0.04; }
    // berry
    const age = Math.min(1, (now - foodT) / 260), pulse = 1 + Math.sin(now / 180) * 0.06, bs = (0.36 * k) * pulse * (0.4 + 0.6 * (1 - Math.pow(1 - age, 3)));
    g.fillStyle = "rgba(40,45,38,.12)"; g.beginPath(); g.ellipse((food.x + .5) * k, (food.y + .82) * k, bs * .9, bs * .3, 0, 0, 7); g.fill();
    g.fillStyle = "#d4755d"; g.beginPath(); g.arc((food.x + .5) * k, (food.y + .52) * k, bs, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.arc((food.x + .4) * k, (food.y + .42) * k, bs * .26, 0, 7); g.fill();
    g.fillStyle = "#5f9a3a"; g.beginPath(); g.ellipse((food.x + .56) * k, (food.y + .5 - 0.36 * pulse) * k, k * .14, k * .07, -.5, 0, 7); g.fill();
    // snake body (smooth)
    const pts = snake.map((s, i) => { const p = prev[i] || s; return { x: (lerp(p.x, s.x, t) + 0.5) * k, y: (lerp(p.y, s.y, t) + 0.5) * k }; });
    g.lineCap = "round"; g.lineJoin = "round";
    for (let i = pts.length - 1; i > 0; i--) { const f = 1 - i / pts.length; g.strokeStyle = i % 2 ? "#7fb24a" : "#8fc24a"; g.lineWidth = k * (0.5 + 0.34 * f); g.beginPath(); g.moveTo(pts[i].x, pts[i].y); g.lineTo(pts[i - 1].x, pts[i - 1].y); g.stroke(); }
    const hd = pts[0], d = dir; g.fillStyle = "#3f6b2a"; g.beginPath(); g.arc(hd.x, hd.y, k * 0.44, 0, 7); g.fill();
    tongue = (Math.sin(now / 420) > 0.86) ? 1 : 0; if (tongue && alive) { g.strokeStyle = "#d4755d"; g.lineWidth = k * 0.07; g.beginPath(); g.moveTo(hd.x + d.x * k * 0.4, hd.y + d.y * k * 0.4); g.lineTo(hd.x + d.x * k * 0.75, hd.y + d.y * k * 0.75); g.stroke(); }
    const px2 = -d.y, py2 = d.x; [-1, 1].forEach((s) => { const ex = hd.x + d.x * k * 0.12 + px2 * s * k * 0.2, ey = hd.y + d.y * k * 0.12 + py2 * s * k * 0.2; g.fillStyle = "#fffdf8"; g.beginPath(); g.arc(ex, ey, k * 0.13, 0, 7); g.fill(); g.fillStyle = "#282d26"; g.beginPath(); g.arc(ex + d.x * k * 0.04, ey + d.y * k * 0.04, alive ? k * 0.065 : k * 0.03, 0, 7); g.fill(); });
    if (!started && alive) { g.fillStyle = "rgba(40,45,38,.6)"; g.font = `800 ${k * 0.8}px system-ui`; g.textAlign = "center"; g.fillText("Swipe to start", px / 2, px / 2 + k * 3); const a = 0.5 + Math.sin(now / 250) * 0.3; g.strokeStyle = `rgba(63,107,42,${a})`; g.lineWidth = k * 0.12; g.beginPath(); const hx = pts[0].x + k * 1.2, hy = pts[0].y; g.moveTo(hx, hy); g.lineTo(hx + k * 1.4, hy); g.moveTo(hx + k * 1.0, hy - k * 0.3); g.lineTo(hx + k * 1.4, hy); g.lineTo(hx + k * 1.0, hy + k * 0.3); g.stroke(); }
    if (paused) { g.fillStyle = "rgba(246,243,236,.7)"; g.fillRect(0, 0, px, px); g.fillStyle = "#282d26"; g.font = `800 ${k * 0.9}px system-ui`; g.textAlign = "center"; g.fillText("Paused - tap to resume", px / 2, px / 2); }
  }
  reset(); raf = requestAnimationFrame(frame);
  return { destroy() { cancelAnimationFrame(raf); removeEventListener("keydown", keys); removeEventListener("resize", size); document.removeEventListener("visibilitychange", vis); } };
});
