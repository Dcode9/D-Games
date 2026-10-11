ARCADE.define("dots-boxes", (ctx) => {
  const SIZES = [3, 3, 4, 4, 5, 5, 6]; let level = ctx.level, n, H, V, own, turn, over, me, cpuScore, cpuT;
  const NS = "http://www.w3.org/2000/svg"; const svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "fit"); ctx.board.appendChild(svg);
  const P = 100, M = 50;
  function build() { n = SIZES[Math.min(level, SIZES.length) - 1]; H = Array.from({ length: n + 1 }, () => Array(n).fill(0)); V = Array.from({ length: n }, () => Array(n + 1).fill(0)); own = Array.from({ length: n }, () => Array(n).fill(0)); me = 0; cpuScore = 0; over = false; turn = 1;
    const W = n * P + 2 * M; svg.setAttribute("viewBox", `0 0 ${W} ${W}`); ctx.setLevel(level); ctx.setScore("0 - 0"); draw(); ctx.say("Your turn", "Draw a line between two dots"); }
  const sides = (r, c) => (H[r][c] ? 1 : 0) + (H[r + 1][c] ? 1 : 0) + (V[r][c] ? 1 : 0) + (V[r][c + 1] ? 1 : 0);
  function move(t, r, c, who) { (t === "h" ? H : V)[r][c] = who; let got = 0;
    const chk = (rr, cc) => { if (rr >= 0 && cc >= 0 && rr < n && cc < n && !own[rr][cc] && sides(rr, cc) === 4) { own[rr][cc] = who; got++; } };
    if (t === "h") { chk(r - 1, c); chk(r, c); } else { chk(r, c - 1); chk(r, c); } if (got) { who === 1 ? (me += got) : (cpuScore += got); } return got; }
  function all() { const a = []; for (let r = 0; r <= n; r++) for (let c = 0; c < n; c++) if (!H[r][c]) a.push(["h", r, c]); for (let r = 0; r < n; r++) for (let c = 0; c <= n; c++) if (!V[r][c]) a.push(["v", r, c]); return a; }
  const adj = (t, r, c) => t === "h" ? [[r - 1, c], [r, c]] : [[r, c - 1], [r, c]];
  const sd = (rc) => (rc[0] >= 0 && rc[1] >= 0 && rc[0] < n && rc[1] < n ? sides(rc[0], rc[1]) : -1);
  function cpuMove() { const a = all(); const smart = Math.min(1, .35 + level * .13);
    const takes = a.filter((m) => adj(...m).some((x) => sd(x) === 3)); if (takes.length && Math.random() < smart + .2) return takes[(Math.random() * takes.length) | 0];
    const safe = a.filter((m) => adj(...m).every((x) => sd(x) < 2)); if (safe.length && Math.random() < smart) return safe[(Math.random() * safe.length) | 0];
    if (Math.random() < smart) { const cost = (m) => adj(...m).filter((x) => sd(x) === 2).length; a.sort((x, y) => cost(x) - cost(y)); return a[0]; } return a[(Math.random() * a.length) | 0]; }
  function after(got, who) { draw(); ctx.setScore(me + " - " + cpuScore); ctx.hx(got ? "select" : "tap");
    if (me + cpuScore === n * n) { over = true; return fin(); }
    if (got) { if (who === 2) return cpuGo(); ctx.say("Box! Go again", ""); return; } turn = who === 1 ? 2 : 1; if (turn === 2) cpuGo(); else ctx.say("Your turn", ""); }
  function cpuGo() { turn = 2; ctx.say("Computer is thinking...", ""); cpuT = setTimeout(() => { const m = cpuMove(); const g = move(m[0], m[1], m[2], 2); after(g, 2); if (!g && !over) { turn = 1; } }, 420); }
  function fin() { if (me > cpuScore) { ctx.hx("win"); level++; ctx.setLevel(level); ctx.actions("You win " + me + " to " + cpuScore + "!", "Bigger board next", [{ label: "Next level", fn: build }]); } else if (me < cpuScore) { ctx.hx("error"); ctx.actions("Computer wins " + cpuScore + " to " + me, "", [{ label: "Rematch", fn: build }]); } else ctx.actions("A tie, " + me + " each.", "", [{ label: "Play again", fn: build }]); }
  function tap(t, r, c) { if (over || turn !== 1 || (t === "h" ? H : V)[r][c]) return; const g = move(t, r, c, 1); if (g) after(g, 1); else { draw(); ctx.hx("tap"); turn = 2; cpuGo(); } }
  function el(tag, a) { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); return e; }
  function draw() { svg.innerHTML = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (own[r][c]) { svg.appendChild(el("rect", { x: M + c * P + 8, y: M + r * P + 8, width: P - 16, height: P - 16, rx: 14, fill: own[r][c] === 1 ? "#c1ee81" : "#f2a38f" })); }
    const line = (t, r, c) => { const x1 = M + c * P, y1 = M + r * P; const x2 = t === "h" ? x1 + P : x1, y2 = t === "h" ? y1 : y1 + P; const v = (t === "h" ? H : V)[r][c];
      svg.appendChild(el("line", { x1, y1, x2, y2, stroke: v === 1 ? "#3f6b2a" : v === 2 ? "#d4755d" : "#dfded3", "stroke-width": v ? 12 : 8, "stroke-linecap": "round" }));
      if (!v) { const hit = el("line", { x1, y1, x2, y2, stroke: "transparent", "stroke-width": 56, "stroke-linecap": "round" }); hit.style.cursor = "pointer"; hit.addEventListener("pointerdown", (e) => { e.preventDefault(); tap(t, r, c); }); svg.appendChild(hit); } };
    for (let r = 0; r <= n; r++) for (let c = 0; c < n; c++) line("h", r, c); for (let r = 0; r < n; r++) for (let c = 0; c <= n; c++) line("v", r, c);
    for (let r = 0; r <= n; r++) for (let c = 0; c <= n; c++) svg.appendChild(el("circle", { cx: M + c * P, cy: M + r * P, r: 11, fill: "#282d26" })); }
  build();
  return { destroy() { clearTimeout(cpuT); } };
});
