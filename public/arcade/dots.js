ARCADE.define("dots-boxes", (ctx) => {
  if (!document.getElementById("css-db")) { const s = document.createElement("style"); s.id = "css-db"; s.textContent = `
.db{width:100%;height:100%;max-height:100%;touch-action:manipulation}
.db .ln{stroke:#dfded3;stroke-width:8;stroke-linecap:round;transition:stroke .12s,stroke-width .12s}
.db .hv{stroke:#b9d98a;stroke-width:12}
.db .p1{stroke:#3f6b2a;stroke-width:12;stroke-dasharray:100;stroke-dashoffset:0;animation:dbd .22s ease-out}
.db .p2{stroke:#d4755d;stroke-width:12;stroke-dasharray:100;animation:dbd .22s ease-out}
.db .cp{stroke:#f2a38f;stroke-width:14;animation:dbp .18s infinite alternate}
.db .bx{transform-box:fill-box;transform-origin:center;animation:dbb .45s cubic-bezier(.3,1.6,.5,1)}
.db .dot{fill:#282d26;transition:r .15s}
.db text{font-weight:900;pointer-events:none;transform-box:fill-box;transform-origin:center;animation:dbb .45s cubic-bezier(.3,1.6,.5,1)}
.dbbar{display:flex;gap:8px;width:min(420px,100%);margin-bottom:10px}
.dbbar span{flex:1;text-align:center;padding:8px 6px;border-radius:14px;background:#fffdf8;border:2px solid #dfded3;font-weight:800;font-size:14px;transition:.2s}
.dbbar span.on{background:#c1ee81;border-color:#8fc24a;transform:translateY(-2px)}.dbbar span.cpu.on{background:#f8d2c6;border-color:#d4755d}
@keyframes dbd{from{stroke-dashoffset:100;stroke-dasharray:100}to{stroke-dashoffset:0;stroke-dasharray:100}}
@keyframes dbp{to{stroke-width:18}}@keyframes dbb{0%{transform:scale(0)}100%{transform:scale(1)}}`; document.head.appendChild(s); }
  const SIZES = [3, 3, 4, 4, 5, 5, 6]; let level = ctx.level, n, H, V, own, turn, over, me, cpuScore, tm = [];
  const NS = "http://www.w3.org/2000/svg";
  const holder = document.createElement("div"); holder.style.cssText = "display:flex;flex-direction:column;align-items:center;width:100%;height:100%";
  holder.innerHTML = '<div class="dbbar"><span class="you on">You 0</span><span class="cpu">Computer 0</span></div>';
  const svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "db fit"); svg.style.flex = "1 1 0"; svg.style.minHeight = "0"; holder.appendChild(svg); ctx.board.appendChild(holder);
  const sY = holder.querySelector(".you"), sC = holder.querySelector(".cpu");
  const P = 100, M = 50; const later = (f, ms) => { const t = setTimeout(f, ms); tm.push(t); };
  const el = (tag, a, par) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); (par || svg).appendChild(e); return e; };
  let L = {};
  function build() { tm.forEach(clearTimeout); tm = []; n = SIZES[Math.min(level, SIZES.length) - 1]; H = Array.from({ length: n + 1 }, () => Array(n).fill(0)); V = Array.from({ length: n }, () => Array(n + 1).fill(0)); own = Array.from({ length: n }, () => Array(n).fill(0)); me = 0; cpuScore = 0; over = false; turn = 1; L = {};
    const W = n * P + 2 * M; svg.setAttribute("viewBox", `0 0 ${W} ${W}`); svg.innerHTML = ""; ctx.setLevel(level); ctx.setScore("0 - 0");
    const gB = el("g"), gL = el("g"), gD = el("g"), gH = el("g"); svg._b = gB;
    const mk = (t, r, c) => { const x1 = M + c * P, y1 = M + r * P, x2 = t === "h" ? x1 + P : x1, y2 = t === "h" ? y1 : y1 + P;
      const ln = el("line", { x1, y1, x2, y2, class: "ln" }, gL); L[t + r + "_" + c] = ln;
      const hit = el("line", { x1, y1, x2, y2, stroke: "transparent", "stroke-width": 56, "stroke-linecap": "round" }, gH); hit.style.cursor = "pointer";
      hit.addEventListener("pointerenter", () => { if (turn === 1 && !over && !(t === "h" ? H : V)[r][c]) ln.classList.add("hv"); }); hit.addEventListener("pointerleave", () => ln.classList.remove("hv"));
      hit.addEventListener("pointerdown", (e) => { e.preventDefault(); tap(t, r, c); }); ln._hit = hit; };
    for (let r = 0; r <= n; r++) for (let c = 0; c < n; c++) mk("h", r, c); for (let r = 0; r < n; r++) for (let c = 0; c <= n; c++) mk("v", r, c);
    for (let r = 0; r <= n; r++) for (let c = 0; c <= n; c++) el("circle", { cx: M + c * P, cy: M + r * P, r: 11, class: "dot" }, gD);
    svg._l = gL; svg._d = gD; svg._h = gH; svg._bx = gB; ui(); ctx.say("Your turn", "Tap between two dots to draw a line");
    if (level === 1 && !ctx.store.get("done", false)) { const g = L["h1_1"]; g && g.classList.add("hv"); } }
  function ui() { sY.textContent = "You " + me; sC.textContent = "Computer " + cpuScore; sY.classList.toggle("on", turn === 1 && !over); sC.classList.toggle("on", turn === 2 && !over); }
  const sides = (r, c) => (H[r][c] ? 1 : 0) + (H[r + 1][c] ? 1 : 0) + (V[r][c] ? 1 : 0) + (V[r][c + 1] ? 1 : 0);
  function move(t, r, c, who) { (t === "h" ? H : V)[r][c] = who; const ln = L[t + r + "_" + c]; ln.setAttribute("class", "ln p" + who); ln._hit.remove(); let got = 0;
    const chk = (rr, cc) => { if (rr >= 0 && cc >= 0 && rr < n && cc < n && !own[rr][cc] && sides(rr, cc) === 4) { own[rr][cc] = who; got++; const x = M + cc * P, y = M + rr * P; const g = el("g", {}, svg._bx);
      later(() => { const rc = el("rect", { x: x + 8, y: y + 8, width: P - 16, height: P - 16, rx: 14, fill: who === 1 ? "#c1ee81" : "#f2a38f", class: "bx" }, g); el("text", { x: x + P / 2, y: y + P / 2 + 12, "text-anchor": "middle", "font-size": 34, fill: who === 1 ? "#3f6b2a" : "#b0405a" }, g).textContent = who === 1 ? "Y" : "C"; const b = svg.getBoundingClientRect(), k = b.width / (n * P + 2 * M); ctx.fx.burst(b.left + (x + P / 2) * k, b.top + (y + P / 2) * k, who === 1 ? ["#8fc24a", "#c1ee81", "#d8b948"] : ["#d4755d", "#f2a38f"], 9, 40); ctx.sfx("box"); }, 160); } };
    if (t === "h") { chk(r - 1, c); chk(r, c); } else { chk(r, c - 1); chk(r, c); } if (got) { who === 1 ? (me += got) : (cpuScore += got); } return got; }
  function all() { const a = []; for (let r = 0; r <= n; r++) for (let c = 0; c < n; c++) if (!H[r][c]) a.push(["h", r, c]); for (let r = 0; r < n; r++) for (let c = 0; c <= n; c++) if (!V[r][c]) a.push(["v", r, c]); return a; }
  const adj = (t, r, c) => t === "h" ? [[r - 1, c], [r, c]] : [[r, c - 1], [r, c]];
  const sd = (rc) => (rc[0] >= 0 && rc[1] >= 0 && rc[0] < n && rc[1] < n ? sides(rc[0], rc[1]) : -1);
  function cpuMove() { const a = all(); const smart = Math.min(1, .35 + level * .13);
    const takes = a.filter((m) => adj(...m).some((x) => sd(x) === 3)); if (takes.length && Math.random() < smart + .2) return takes[(Math.random() * takes.length) | 0];
    const safe = a.filter((m) => adj(...m).every((x) => sd(x) < 2)); if (safe.length && Math.random() < smart) return safe[(Math.random() * safe.length) | 0];
    if (Math.random() < smart) { const cost = (m) => adj(...m).filter((x) => sd(x) === 2).length; a.sort((x, y) => cost(x) - cost(y)); return a[0]; } return a[(Math.random() * a.length) | 0]; }
  function after(got, who) { ctx.setScore(me + " - " + cpuScore); ctx.hx(got ? "select" : "tap"); ctx.sfx(got ? "good" : "line");
    if (me + cpuScore === n * n) { over = true; ui(); return later(fin, 700); }
    if (got) { if (who === 2) { ui(); return cpuGo(); } turn = 1; ui(); ctx.say("Box! Go again", "You earned another line"); return; } turn = who === 1 ? 2 : 1; ui(); if (turn === 2) cpuGo(); else ctx.say("Your turn", ""); }
  function cpuGo() { turn = 2; ui(); ctx.say("Computer is thinking...", ""); later(() => { const m = cpuMove(); const ln = L[m[0] + m[1] + "_" + m[2]]; ln.classList.add("cp"); later(() => { const g = move(m[0], m[1], m[2], 2); after(g, 2); }, 330); }, 420); }
  function fin() { if (me > cpuScore) { ctx.hx("win"); ctx.sfx("win"); level++; ctx.setLevel(level); ctx.actions("You win " + me + " to " + cpuScore + "!", "Bigger board next", [{ label: "Next level", fn: build }]); } else if (me < cpuScore) { ctx.hx("error"); ctx.actions("Computer wins " + cpuScore + " to " + me, "Close the corners first next time", [{ label: "Rematch", fn: build }]); } else ctx.actions("A tie, " + me + " each.", "", [{ label: "Rematch", fn: build }]); }
  function tap(t, r, c) { if (over || turn !== 1 || (t === "h" ? H : V)[r][c]) return; ctx.store.set("done", true); const g0 = svg.querySelector(".hv"); if (g0) g0.classList.remove("hv"); const g = move(t, r, c, 1); after(g, 1); }
  build();
  return { destroy() { tm.forEach(clearTimeout); } };
});
