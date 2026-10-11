ARCADE.define("snakes", (ctx) => {
  const N = 16; let level = ctx.level, snake, dir, nd, food, score, alive, timer, started;
  const cv = document.createElement("canvas"); cv.className = "fit"; cv.style.cssText += ";background:#fffdf8;border:3px solid #dfded3;border-radius:20px;touch-action:none";
  ctx.board.appendChild(cv);
  const g = cv.getContext("2d");
  function size() { const s = Math.min(ctx.board.clientWidth - 24, ctx.board.clientHeight - 24); const px = Math.max(160, Math.floor(s / N) * N); cv.style.width = cv.style.height = px + "px"; cv.style.maxHeight = "none";
    const r = devicePixelRatio || 1; cv.width = cv.height = px * r; g.setTransform(r * px / N, 0, 0, r * px / N, 0, 0); }
  size(); addEventListener("resize", size);
  ctx.dock.innerHTML = "";
  const pad = document.createElement("div"); pad.style.cssText = "display:grid;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(2,52px);gap:6px;justify-content:center;width:100%";
  [["↑", 2, 1, 0, -1], ["←", 1, 2, -1, 0], ["↓", 2, 2, 0, 1], ["→", 3, 2, 1, 0]].forEach(([t, c, r, x, y]) => { const b = document.createElement("button"); b.type = "button"; b.className = "btn"; b.style.cssText = `grid-column:${c};grid-row:${r};padding:0;min-height:0;font-size:24px`; b.textContent = t; b.onpointerdown = (e) => { e.preventDefault(); turn(x, y); }; pad.appendChild(b); });
  function turn(x, y) { if (!alive) return; if (x === -dir.x && y === -dir.y) return; nd = { x, y }; if (!started) { started = true; ctx.hx("tap"); } }
  let sx, sy; cv.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; });
  cv.addEventListener("pointerup", (e) => { const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return; Math.abs(dx) > Math.abs(dy) ? turn(Math.sign(dx), 0) : turn(0, Math.sign(dy)); });
  const keys = (e) => { const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key]; if (m) { e.preventDefault(); turn(...m); } };
  addEventListener("keydown", keys);
  const speed = () => Math.max(70, 190 - level * 16);
  function spawn() { do { food = { x: (Math.random() * N) | 0, y: (Math.random() * N) | 0 }; } while (snake.some((s) => s.x === food.x && s.y === food.y)); }
  function reset() { snake = [{ x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }]; dir = { x: 1, y: 0 }; nd = dir; score = 0; alive = true; started = false; spawn(); ctx.setScore(0); clearInterval(timer); timer = setInterval(tick, speed());
    dock(); draw(); }
  function dock() { ctx.dock.innerHTML = ""; ctx.dock.appendChild(pad); }
  function tick() {
    if (!started) return draw(); dir = nd; const h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || snake.some((s) => s.x === h.x && s.y === h.y)) return die();
    snake.unshift(h);
    if (h.x === food.x && h.y === food.y) { score++; ctx.setScore(score); ctx.hx("select"); spawn();
      if (score % 5 === 0) { level++; ctx.setLevel(level); clearInterval(timer); timer = setInterval(tick, speed()); } } else snake.pop();
    draw();
  }
  function die() { alive = false; clearInterval(timer); ctx.hx("error"); const b = ctx.store.get("best", 0); if (score > b) ctx.store.set("best", score);
    ctx.actions("Crash! You ate " + score + ".", "Best: " + Math.max(b, score), [{ label: "Play again", fn: reset }]); draw(); }
  function draw() {
    g.clearRect(0, 0, N, N);
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if ((i + j) % 2) { g.fillStyle = "#f6f3ec"; g.fillRect(i, j, 1, 1); }
    g.fillStyle = "#d4755d"; g.beginPath(); g.arc(food.x + .5, food.y + .5, .38, 0, 7); g.fill();
    snake.forEach((s, i) => { g.fillStyle = i ? (i % 2 ? "#8fc24a" : "#a6d664") : "#3f6b2a"; g.beginPath(); g.roundRect(s.x + .06, s.y + .06, .88, .88, .3); g.fill(); });
    const h = snake[0]; g.fillStyle = "#fffdf8"; g.fillRect(h.x + .25, h.y + .25, .16, .16); g.fillRect(h.x + .6, h.y + .25, .16, .16);
    if (!started && alive) { g.fillStyle = "rgba(40,45,38,.55)"; g.font = "bold .8px system-ui"; g.textAlign = "center"; g.fillText("Swipe to start", N / 2, N / 2 + 3); }
  }
  reset();
  return { destroy() { clearInterval(timer); removeEventListener("keydown", keys); removeEventListener("resize", size); } };
});
