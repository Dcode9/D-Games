ARCADE.define("math", (ctx) => {
  let level = ctx.level, lives, q, solved, t, raf, deadline, locked;
  const wrap = document.createElement("div"); wrap.style.cssText = "width:min(440px,100%);display:flex;flex-direction:column;gap:14px;align-items:stretch";
  wrap.innerHTML = '<div id="bar" style="height:14px;border-radius:9px;background:#dfded3;overflow:hidden"><i style="display:block;height:100%;width:100%;background:#8fc24a"></i></div><div id="q" style="text-align:center;font-size:clamp(44px,14vw,72px);font-weight:900;letter-spacing:-.04em;padding:14px 0">&nbsp;</div><div id="ans" style="display:grid;grid-template-columns:1fr 1fr;gap:12px"></div><div id="lv" style="text-align:center;font-size:20px;letter-spacing:6px"></div>';
  ctx.board.appendChild(wrap); const bar = wrap.querySelector("#bar i"), Q = wrap.querySelector("#q"), A = wrap.querySelector("#ans"), LV = wrap.querySelector("#lv");
  const R = (a, b) => a + ((Math.random() * (b - a + 1)) | 0);
  function make() { const l = level; let a, b, op, v;
    const ops = l < 3 ? ["+"] : l < 5 ? ["+", "-"] : l < 8 ? ["+", "-", "×"] : ["+", "-", "×", "×"]; op = ops[R(0, ops.length - 1)]; const m = 6 + l * 4;
    if (op === "+") { a = R(2, m); b = R(2, m); v = a + b; } else if (op === "-") { a = R(m / 2, m + 5); b = R(1, a); v = a - b; } else { a = R(2, 4 + Math.min(l, 8)); b = R(2, 4 + Math.min(l, 8)); v = a * b; }
    const set = new Set([v]); while (set.size < 4) { const d = R(1, 4 + (l >> 1)) * (Math.random() < .5 ? -1 : 1); const w = v + d; if (w >= 0) set.add(w); }
    return { text: `${a} ${op} ${b}`, v, opts: [...set].sort(() => Math.random() - .5) }; }
  const time = () => Math.max(3500, 9000 - level * 450);
  function next() { locked = false; q = make(); Q.textContent = q.text; A.innerHTML = ""; q.opts.forEach((o) => { const b = document.createElement("button"); b.type = "button"; b.className = "btn"; b.textContent = o; b.style.cssText += ";font-size:30px;min-height:76px;background:#fffdf8;border-color:#dfded3;box-shadow:0 6px 0 #dfded3"; b.onclick = () => pick(b, o); if (level === 1 && solved === 0 && o === q.v) b.classList.add("guide"); A.appendChild(b); });
    deadline = performance.now() + time(); cancelAnimationFrame(raf); const f = () => { const p = (deadline - performance.now()) / time(); bar.style.width = Math.max(0, p * 100) + "%"; bar.style.background = p < .3 ? "#d4755d" : "#8fc24a"; if (p <= 0) return miss(null); raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); }
  function hearts() { LV.textContent = "♥".repeat(lives) + "♡".repeat(3 - lives); LV.style.color = "#d4755d"; }
  function pick(b, o) { if (locked) return; if (o === q.v) { locked = true; cancelAnimationFrame(raf); b.style.background = "#c1ee81"; b.style.borderColor = "#8fc24a"; ctx.hx("select"); solved++; ctx.setScore(solved + "/10");
      if (solved >= 10) return win(); setTimeout(next, 260); } else { b.style.background = "#f2a38f"; b.disabled = true; miss(b); } }
  function miss(b) { if (!b) { locked = true; cancelAnimationFrame(raf); } lives--; hearts(); ctx.hx("error"); A.classList.add("shake"); setTimeout(() => A.classList.remove("shake"), 260);
    if (lives <= 0) { cancelAnimationFrame(raf); locked = true; return ctx.actions("Out of lives. " + solved + " of 10.", "", [{ label: "Try again", fn: round }]); }
    if (!b) setTimeout(next, 500); }
  function win() { ctx.hx("win"); level++; ctx.setLevel(level); ctx.actions("Level cleared! 10 of 10.", "Harder sums ahead", [{ label: "Next level", fn: round }]); }
  function round() { lives = 3; solved = 0; ctx.setScore("0/10"); ctx.setLevel(level); hearts(); ctx.say("Pick the right answer", "Quick, the bar is draining"); next(); }
  round();
  return { destroy() { cancelAnimationFrame(raf); } };
});
