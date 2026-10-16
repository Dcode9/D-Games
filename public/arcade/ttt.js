ARCADE.define("tic-tac-toe", (ctx) => {
  const NS = "http://www.w3.org/2000/svg", L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const NAMES = ["Rookie", "Sneaky", "Clever", "Sharp", "Mastermind"];
  if (!document.getElementById("css-ttt")) { const s = document.createElement("style"); s.id = "css-ttt"; s.textContent = `
  .ttt{width:min(100%,calc(100dvh - 270px));aspect-ratio:1;touch-action:manipulation}
  .ttt svg{width:100%;height:100%;overflow:visible}
  .ttt .gl{stroke:#b8b6a4;stroke-width:5;stroke-linecap:round;fill:none;stroke-dasharray:1;stroke-dashoffset:1;animation:tdraw .55s cubic-bezier(.3,.7,.2,1) forwards}
  .ttt .mk{fill:none;stroke-linecap:round;stroke-width:13;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .22s ease-out}
  .ttt .mk.in{stroke-dashoffset:0}.ttt .x{stroke:#4a3b86}.ttt .o{stroke:#d4755d}
  .ttt .cell{fill:transparent;cursor:pointer}.ttt .cell.free:hover{fill:rgba(193,238,129,.28)}
  .ttt .ghost{opacity:0;stroke:#4a3b86;stroke-width:11;stroke-linecap:round;pointer-events:none;transition:opacity .12s}
  .ttt .cell.free:hover + .ghost{opacity:.2}
  .ttt .dim{opacity:.28;transition:opacity .3s}.ttt .pop{animation:tpop .45s cubic-bezier(.3,1.6,.4,1)}
  .ttt .wl{stroke:#8fc24a;stroke-width:18;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;animation:tdraw .4s .1s ease-out forwards;opacity:.9}
  .ttt .gd{animation:tguide 1s ease-in-out infinite;fill:rgba(193,238,129,.45)}
  .tscore{display:flex;gap:8px;justify-content:center;width:100%}
  .tscore span{background:var(--bg);border:2px solid var(--line);border-radius:12px;padding:4px 12px;font-weight:800;font-size:14px;transition:transform .2s,background .2s}
  .tscore span.on{background:var(--lime);border-color:var(--lime-d);transform:translateY(-2px)}
  .dots i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#74776b;margin:0 2px;animation:tdot 1s infinite}.dots i:nth-child(2){animation-delay:.15s}.dots i:nth-child(3){animation-delay:.3s}
  @keyframes tdraw{to{stroke-dashoffset:0}}@keyframes tpop{0%{transform:scale(.6)}100%{transform:scale(1)}}
  @keyframes tdot{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-4px);opacity:1}}
  @keyframes tguide{50%{fill:rgba(193,238,129,.1)}}`; document.head.appendChild(s); }
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; };
  const wrap = document.createElement("div"); wrap.className = "ttt"; const svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 300 300"); wrap.appendChild(svg); ctx.board.appendChild(wrap);
  let b, over, lock, level = ctx.level, tally = { w: 0, d: 0, l: 0 }, first = !ctx.store.get("done", false), marks = [], t1, t2;
  const j = () => (Math.random() - 0.5) * 4, C = (i) => [50 + (i % 3) * 100, 50 + ((i / 3) | 0) * 100];
  const win = (p, s) => L.find((l) => l.every((i) => s[i] === p)), free = (s) => s.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  function best(s) { function mm(s, o) { if (win("O", s)) return 1; if (win("X", s)) return -1; const f = free(s); if (!f.length) return 0; let r = o ? -2 : 2; for (const i of f) { s[i] = o ? "O" : "X"; const v = mm(s, !o); s[i] = null; r = o ? Math.max(r, v) : Math.min(r, v); } return r; }
    let bi = -1, bv = -2; for (const i of free(s)) { s[i] = "O"; const v = mm(s, false); s[i] = null; if (v > bv) { bv = v; bi = i; } } return bi; }
  function tactic(p, s) { for (const i of free(s)) { s[i] = p; const w = win(p, s); s[i] = null; if (w) return i; } return -1; }
  function cpu() { const f = free(b), smart = Math.min(0.96, 0.12 + level * 0.17);
    if (Math.random() < smart) return b.filter(Boolean).length <= 1 && Math.random() < 0.5 ? f[(Math.random() * f.length) | 0] : best(b.slice());
    const w = tactic("O", b); if (w >= 0 && level > 1) return w; return f[(Math.random() * f.length) | 0]; }
  function score() { ctx.dock.innerHTML = `<div class="tscore"><span id="s1">You ${tally.w}</span><span id="s2">Draws ${tally.d}</span><span id="s3">${NAMES[Math.min(level - 1, 4)]} ${tally.l}</span></div><div class="msg" id="tm"></div><div class="sub" id="ts"></div>`; }
  const say = (m, s, dots) => { const a = ctx.dock.querySelector("#tm"); if (!a) return; a.innerHTML = m + (dots ? ' <span class="dots"><i></i><i></i><i></i></span>' : ""); ctx.dock.querySelector("#ts").textContent = s || ""; };
  function draw() { svg.innerHTML = ""; marks = [];
    [[100, 22, 100, 278], [200, 22, 200, 278], [22, 100, 278, 100], [22, 200, 278, 200]].forEach(([x1, y1, x2, y2], k) => { const p = el("path", { d: `M${x1 + j()} ${y1 + j()} L${x2 + j()} ${y2 + j()}`, pathLength: 1, class: "gl" }); p.style.animationDelay = k * 70 + "ms"; });
    for (let i = 0; i < 9; i++) { const [cx, cy] = C(i); const g = el("g", { "data-i": i }); const r = el("rect", { x: cx - 48, y: cy - 48, width: 96, height: 96, rx: 14, class: "cell free" }, g); r.addEventListener("pointerdown", (e) => { e.preventDefault(); play(i); });
      const gh = el("g", { class: "ghost" }, g); el("path", { d: `M${cx - 22} ${cy - 22}L${cx + 22} ${cy + 22}M${cx + 22} ${cy - 22}L${cx - 22} ${cy + 22}`, fill: "none" }, gh); marks[i] = { g, r }; } }
  function mark(i, p) { const [cx, cy] = C(i), g = marks[i].g; marks[i].r.classList.remove("free"); const grp = el("g", { class: "pop", style: `transform-origin:${cx}px ${cy}px` }, g); marks[i].m = grp;
    if (p === "X") { const a = el("path", { d: `M${cx - 24 + j()} ${cy - 24 + j()} L${cx + 24 + j()} ${cy + 24 + j()}`, pathLength: 1, class: "mk x" }, grp), c = el("path", { d: `M${cx + 24 + j()} ${cy - 24 + j()} L${cx - 24 + j()} ${cy + 24 + j()}`, pathLength: 1, class: "mk x" }, grp); c.style.transitionDelay = ".16s"; requestAnimationFrame(() => requestAnimationFrame(() => { a.classList.add("in"); c.classList.add("in"); })); }
    else { const o = el("circle", { cx: cx + j() / 2, cy: cy + j() / 2, r: 27, pathLength: 1, class: "mk o", transform: `rotate(-90 ${cx} ${cy})` }, grp); o.style.transitionDuration = ".32s"; requestAnimationFrame(() => requestAnimationFrame(() => o.classList.add("in"))); } }
  function end() { over = true; const w = win("X", b) || win("O", b);
    if (w) { const [a, , c] = w, [x1, y1] = C(a), [x2, y2] = C(c); const wl = el("path", { d: `M${x1} ${y1} L${x2} ${y2}`, pathLength: 1, class: "wl" }); svg.insertBefore(wl, svg.children[4]); marks.forEach((m, i) => m.m && !w.includes(i) && m.m.classList.add("dim")); w.forEach((i) => marks[i].m.classList.add("pop")); }
    const sel = (n) => ctx.dock.querySelector(n);
    if (win("X", b)) { tally.w++; level++; ctx.setLevel(level); ctx.setScore(tally.w + " wins"); ctx.sfx("win"); const r = ctx.fx.rectOf(wrap); ctx.fx.burst(r.x, r.y, null, 26, 120);
      t1 = setTimeout(() => { score(); sel("#s1").classList.add("on"); ctx.actions("You win! " + NAMES[Math.min(level - 1, 4)] + " is next.", "Level " + level, [{ label: "Next round", fn: reset }]); }, 650);
    } else if (win("O", b)) { tally.l++; ctx.hx("error"); ctx.sfx("bad"); t1 = setTimeout(() => { score(); ctx.actions("Close, but they got you.", "Same level. You can do this.", [{ label: "Rematch", fn: reset }]); }, 650);
    } else { tally.d++; ctx.sfx("tap"); t1 = setTimeout(() => { score(); ctx.actions("A draw. Evenly matched!", "", [{ label: "Play again", fn: reset }]); }, 450); } }
  function play(i) { if (over || lock || b[i]) return; b[i] = "X"; first = false; ctx.store.set("done", true); ctx.hx("tap"); ctx.sfx("place"); mark(i, "X"); svg.querySelectorAll(".gd").forEach((e) => e.remove());
    if (win("X", b) || !free(b).length) return end(); lock = true; say("", "", false); ctx.dock.querySelector("#s3").classList.add("on"); ctx.dock.querySelector("#s1").classList.remove("on"); say(NAMES[Math.min(level - 1, 4)] + " is thinking", "", true);
    t2 = setTimeout(() => { const m = cpu(); b[m] = "O"; ctx.sfx("cpu"); mark(m, "O"); lock = false; if (win("O", b) || !free(b).length) return end(); ctx.dock.querySelector("#s3").classList.remove("on"); ctx.dock.querySelector("#s1").classList.add("on"); say("Your move", "You are X"); }, 380 + Math.random() * 260); }
  function reset() { clearTimeout(t1); clearTimeout(t2); b = Array(9).fill(null); over = false; lock = false; draw(); score(); ctx.dock.querySelector("#s1").classList.add("on"); say("Your move", "You are X. Tap a square.");
    if (first && level <= 1) { const [cx, cy] = C(4); el("rect", { x: cx - 44, y: cy - 44, width: 88, height: 88, rx: 14, class: "gd", "pointer-events": "none" }); } }
  ctx.setScore("0 wins"); reset();
  return { destroy() { clearTimeout(t1); clearTimeout(t2); } };
});
