ARCADE.define("math", (ctx) => {
  if (!document.getElementById("css-mt")) { const s = document.createElement("style"); s.id = "css-mt"; s.textContent = `
.mt{width:min(440px,100%);display:flex;flex-direction:column;gap:14px;align-items:stretch;position:relative}
.mt .mbar{height:16px;border-radius:9px;background:#dfded3;overflow:hidden}.mt .mbar i{display:block;height:100%;width:100%;background:#8fc24a;border-radius:9px}
.mt .row{display:flex;justify-content:space-between;align-items:center;min-height:30px}
.mt .hr{font-size:22px;color:#d4755d;letter-spacing:3px}.mt .hr b{display:inline-block}.mt .hr .lost{animation:mtl .4s}
.mt .fl{font-weight:900;color:#e08a3c;font-size:18px;transition:.15s;opacity:0}.mt .fl.on{opacity:1}
.mt .q{text-align:center;font-size:clamp(44px,14vw,72px);font-weight:900;letter-spacing:-.04em;padding:10px 0}
.mt .q.in{animation:mti .24s cubic-bezier(.3,1.4,.5,1)}.mt .q.out{animation:mto .14s forwards}
.mt .ans{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.mt .ans .btn{font-size:30px;min-height:78px;background:#fffdf8;border-color:#dfded3;box-shadow:0 6px 0 #dfded3;animation:mta .22s backwards}
.mt .ans .btn.ok{background:#c1ee81;border-color:#8fc24a;box-shadow:0 6px 0 #8fc24a;transform:scale(1.05)}
.mt .ans .btn.no{background:#f2a38f;border-color:#d4755d;box-shadow:0 6px 0 #d4755d;animation:mtk .3s}
.mt .ans .btn.rv{background:#e8f6cf;border-color:#8fc24a}
.mt .dots{display:flex;gap:6px;justify-content:center}.mt .dots i{width:14px;height:14px;border-radius:50%;background:#dfded3;transition:.2s}.mt .dots i.on{background:#8fc24a;transform:scale(1.2)}
@keyframes mti{from{transform:translateY(18px) scale(.9);opacity:0}}@keyframes mto{to{transform:translateY(-14px);opacity:0}}
@keyframes mta{from{transform:translateY(12px);opacity:0}}@keyframes mtk{25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}@keyframes mtl{40%{transform:scale(1.8)}}`; document.head.appendChild(s); }
  let level = ctx.level, lives, q, solved, raf, deadline, locked, streak, tm = [];
  const wrap = document.createElement("div"); wrap.className = "mt";
  wrap.innerHTML = '<div class="row"><span class="hr"></span><span class="fl"></span></div><div class="mbar"><i></i></div><div class="q">&nbsp;</div><div class="ans"></div><div class="dots"></div>';
  ctx.board.appendChild(wrap); const bar = wrap.querySelector(".mbar i"), Q = wrap.querySelector(".q"), A = wrap.querySelector(".ans"), HR = wrap.querySelector(".hr"), FL = wrap.querySelector(".fl"), DT = wrap.querySelector(".dots");
  const later = (f, ms) => { const t = setTimeout(f, ms); tm.push(t); };
  const R = (a, b) => a + ((Math.random() * (b - a + 1)) | 0);
  function make() { const l = level; let a, b, op, v;
    const ops = l < 3 ? ["+"] : l < 5 ? ["+", "-"] : l < 8 ? ["+", "-", "\u00d7"] : ["+", "-", "\u00d7", "\u00d7"]; op = ops[R(0, ops.length - 1)]; const m = 6 + l * 4;
    if (op === "+") { a = R(2, m); b = R(2, m); v = a + b; } else if (op === "-") { a = R(m / 2 | 0, m + 5); b = R(1, a); v = a - b; } else { a = R(2, 4 + Math.min(l, 8)); b = R(2, 4 + Math.min(l, 8)); v = a * b; }
    const set = new Set([v]); while (set.size < 4) { const d = R(1, 4 + (l >> 1)) * (Math.random() < .5 ? -1 : 1); const w = v + d; if (w >= 0) set.add(w); }
    return { text: `${a} ${op} ${b}`, v, opts: [...set].sort(() => Math.random() - .5) }; }
  const time = () => Math.max(3500, 9000 - level * 450);
  function dots() { DT.innerHTML = ""; for (let i = 0; i < 10; i++) { const d = document.createElement("i"); if (i < solved) d.className = "on"; DT.appendChild(d); } }
  function next() { locked = false; q = make(); Q.className = "q"; void Q.offsetWidth; Q.classList.add("in"); Q.textContent = q.text; A.innerHTML = "";
    q.opts.forEach((o, i) => { const b = document.createElement("button"); b.type = "button"; b.className = "btn"; b.textContent = o; b.style.animationDelay = i * 30 + "ms"; b.onclick = () => pick(b, o); if (level === 1 && solved === 0 && !ctx.store.get("done", false) && o === q.v) b.classList.add("guide"); A.appendChild(b); });
    deadline = performance.now() + time(); cancelAnimationFrame(raf);
    const f = () => { const p = (deadline - performance.now()) / time(); bar.style.width = Math.max(0, p * 100) + "%"; bar.style.background = p < .3 ? "#d4755d" : p < .55 ? "#d8b948" : "#8fc24a"; if (p <= 0) return miss(null); raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); }
  function hearts() { HR.innerHTML = [0, 1, 2].map((i) => `<b${i === lives ? ' class="lost"' : ""}>${i < lives ? "\u2665" : "\u2661"}</b>`).join(""); }
  function streakUI() { FL.textContent = streak >= 3 ? "Streak x" + streak : ""; FL.classList.toggle("on", streak >= 3); }
  function pick(b, o) { if (locked) return; ctx.store.set("done", true);
    if (o === q.v) { locked = true; cancelAnimationFrame(raf); const fast = (deadline - performance.now()) / time() > .6; streak++; b.classList.remove("guide"); b.classList.add("ok"); ctx.hx("select"); ctx.sfx("good"); solved++; ctx.setScore(solved + "/10"); streakUI(); dots();
      const r = b.getBoundingClientRect(); ctx.fx.burst(r.left + r.width / 2, r.top + r.height / 2, ["#8fc24a", "#c1ee81", "#d8b948"], 9, 44); if (fast) ctx.fx.floatText("Quick!", r.left + r.width / 2, r.top - 6, "#e08a3c");
      if (solved >= 10) return later(win, 350); later(() => { Q.classList.remove("in"); Q.classList.add("out"); }, 200); later(next, 360); }
    else { b.classList.add("no"); b.disabled = true; miss(b); } }
  function miss(b) { streak = 0; streakUI(); if (!b) { locked = true; cancelAnimationFrame(raf); [...A.children].forEach((x) => x.textContent == q.v && x.classList.add("rv")); } lives--; hearts(); ctx.hx("error"); ctx.sfx("bad");
    if (lives <= 0) { cancelAnimationFrame(raf); locked = true; return later(() => ctx.actions("Out of lives. " + solved + " of 10.", "Practice makes quick", [{ label: "Try again", fn: round }]), 350); }
    if (!b) later(next, 900); }
  function win() { ctx.hx("win"); ctx.sfx("win"); const r = wrap.getBoundingClientRect(); for (let i = 0; i < 5; i++) later(() => ctx.fx.burst(r.left + Math.random() * r.width, r.top + 60 + Math.random() * 120, ["#c1ee81", "#8fc24a", "#d8b948", "#f2a38f", "#7fb7d1"], 16, 90), i * 90);
    level++; ctx.setLevel(level); ctx.actions("Level cleared! 10 of 10.", "Harder sums ahead", [{ label: "Next level", fn: round }]); }
  function round() { tm.forEach(clearTimeout); lives = 3; solved = 0; streak = 0; ctx.setScore("0/10"); ctx.setLevel(level); hearts(); streakUI(); dots(); ctx.say("Pick the right answer", "Quick, the bar is draining"); next(); }
  round();
  return { destroy() { cancelAnimationFrame(raf); tm.forEach(clearTimeout); } };
});
