ARCADE.define("tic-tac-toe", (ctx) => {
  const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  let b, over, lock, wins = 0, level = ctx.level, first = true;
  const wrap = document.createElement("div"); wrap.className = "fit";
  wrap.style.cssText += ";display:grid;grid-template-columns:repeat(3,1fr);gap:10px";
  ctx.board.appendChild(wrap);
  const cells = [...Array(9)].map((_, i) => { const c = document.createElement("button"); c.type = "button"; c.setAttribute("aria-label", "square " + (i + 1));
    c.style.cssText = "background:#fffdf8;border:3px solid #dfded3;border-radius:22px;box-shadow:0 6px 0 #dfded3;font-size:min(16vw,80px);font-weight:900;line-height:1;transition:transform .06s";
    c.onclick = () => play(i); wrap.appendChild(c); return c; });
  const win = (p, s) => L.find((l) => l.every((i) => s[i] === p));
  const free = (s) => s.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  function best(s) { // minimax for O
    function mm(s, o) { if (win("O", s)) return 1; if (win("X", s)) return -1; const f = free(s); if (!f.length) return 0;
      let r = o ? -2 : 2; for (const i of f) { s[i] = o ? "O" : "X"; const v = mm(s, !o); s[i] = null; r = o ? Math.max(r, v) : Math.min(r, v); } return r; }
    let bi = -1, bv = -2; for (const i of free(s)) { s[i] = "O"; const v = mm(s, false); s[i] = null; if (v > bv) { bv = v; bi = i; } } return bi; }
  function tactic(p, s) { for (const i of free(s)) { s[i] = p; const w = win(p, s); s[i] = null; if (w) return i; } return -1; }
  function cpu() {
    const f = free(b); const smart = Math.min(0.95, 0.15 + level * 0.18);
    if (Math.random() < smart) return b.filter(Boolean).length <= 1 && Math.random() < .5 ? f[(Math.random() * f.length) | 0] : best(b.slice());
    const w = tactic("O", b); if (w >= 0 && level > 1) return w;
    return f[(Math.random() * f.length) | 0];
  }
  function draw() { cells.forEach((c, i) => { c.textContent = b[i] || ""; c.style.color = b[i] === "X" ? "#4a3b86" : "#d4755d"; c.classList.remove("guide"); }); }
  function guide() { if (level <= 1 && first && !b.some(Boolean)) cells[4].classList.add("guide"); }
  function end() {
    const l = win("X", b) || win("O", b);
    if (l) l.forEach((i) => (cells[i].style.background = "#c1ee81")); over = true;
    if (win("X", b)) { wins++; ctx.hx("win"); ctx.setScore(wins + " wins"); level++; ctx.setLevel(level);
      ctx.actions("You win! The computer gets sharper.", "Level " + level, [{ label: "Next round", fn: reset }]);
    } else if (win("O", b)) { ctx.hx("error"); ctx.actions("Computer wins this one.", "Try again at the same level", [{ label: "Rematch", fn: reset }]);
    } else { ctx.actions("A draw. Close one!", "", [{ label: "Play again", fn: reset }]); }
  }
  function play(i) {
    if (over || lock || b[i]) return; b[i] = "X"; ctx.hx("tap"); first = false; draw();
    if (win("X", b) || !free(b).length) return end();
    lock = true; ctx.say("Computer is thinking...");
    setTimeout(() => { b[cpu()] = "O"; lock = false; draw(); if (win("O", b) || !free(b).length) return end(); ctx.say("Your turn", "You are X"); }, 260);
  }
  function reset() { b = Array(9).fill(null); over = false; lock = false; cells.forEach((c) => (c.style.background = "#fffdf8")); draw(); guide(); ctx.say("Your turn", "You are X. Tap a square."); }
  ctx.setScore("0 wins"); reset();
  return { destroy() {} };
});
