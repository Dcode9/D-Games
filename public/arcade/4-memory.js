ARCADE.define("memory", (ctx) => {
  if (!document.getElementById("css-mem")) { const s = document.createElement("style"); s.id = "css-mem"; s.textContent = `
.mem{display:grid;gap:9px;perspective:900px}
.mc{position:relative;padding:0;border:0;background:none;transform-style:preserve-3d;transition:transform .42s cubic-bezier(.3,1.4,.5,1);cursor:pointer;-webkit-tap-highlight-color:transparent}
.mc:active:not(.o):not(.d){transform:scale(.94)}
.mc.o,.mc.pk{transform:rotateY(180deg)}
.mc .f{position:absolute;inset:0;border-radius:18px;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:grid;place-items:center}
.mc .b{background:#bfe3f2;border:3px solid #7fb7d1;box-shadow:0 5px 0 #7fb7d1;background-image:radial-gradient(circle at 30% 30%,#d9f0fa 0 18%,transparent 19%),radial-gradient(circle at 70% 68%,#a6d3e6 0 14%,transparent 15%)}
.mc .b:after{content:"?";font-weight:900;font-size:clamp(18px,5vw,30px);color:#7fb7d1}
.mc .a{transform:rotateY(180deg);background:#fffdf8;border:3px solid #dfded3;box-shadow:0 5px 0 #dfded3}
.mc.d .a{background:#c1ee81;border-color:#8fc24a;box-shadow:0 5px 0 #8fc24a;animation:mm .5s cubic-bezier(.3,1.6,.5,1)}
.mc.d{pointer-events:none}
.mc.x{animation:mx .36s}
@keyframes mm{0%{transform:rotateY(180deg) scale(1)}45%{transform:rotateY(180deg) scale(1.18)}100%{transform:rotateY(180deg) scale(1)}}
@keyframes mx{0%,100%{margin-left:0}25%{margin-left:-6px}75%{margin-left:6px}}
.mstars{font-size:26px;letter-spacing:4px;color:#d8b948}
.mem.pk .mc{pointer-events:none}`; document.head.appendChild(s); }
  const COL = ["#d4755d", "#8fc24a", "#7fb7d1", "#a794dd", "#d8b948", "#3f6b2a", "#2f6f8f", "#c45a8a", "#6b4b2a", "#e08a3c", "#4a3b86", "#5aa88a", "#b0405a", "#8a8a2a", "#3a6ea5"];
  const SH = [(c) => `<circle cx="50" cy="50" r="30" fill="${c}"/>`, (c) => `<rect x="22" y="22" width="56" height="56" rx="8" fill="${c}"/>`, (c) => `<path d="M50 16 86 80H14z" fill="${c}"/>`, (c) => `<path d="M50 14l10 26 28 2-22 17 8 27-24-15-24 15 8-27-22-17 28-2z" fill="${c}"/>`, (c) => `<path d="M50 84C12 58 14 24 36 24c9 0 14 6 14 6s5-6 14-6c22 0 24 34-14 60z" fill="${c}"/>`];
  const sym = (i) => `<svg viewBox="0 0 100 100" width="70%" height="70%">${SH[(i + (i / 5 | 0)) % 5](COL[i % COL.length])}<circle cx="42" cy="46" r="3.2" fill="#fff" opacity=".8"/></svg>`;
  const LV = [[2, 2], [3, 2], [4, 3], [4, 4], [5, 4], [6, 5], [6, 6]];
  let level = Math.min(ctx.level, LV.length), moves, open, lock, t0, streak, pairs, found, tm = [];
  const wrap = document.createElement("div"); wrap.className = "mem"; ctx.board.appendChild(wrap);
  const later = (f, ms) => { const t = setTimeout(f, ms); tm.push(t); return t; };
  const par = (n) => Math.ceil(n * 1.6);
  function build() {
    tm.forEach(clearTimeout); tm = [];
    const [c, r] = LV[level - 1]; pairs = c * r / 2; const ids = [...Array(pairs).keys()]; const deck = ids.concat(ids).sort(() => Math.random() - .5);
    moves = 0; open = []; found = 0; streak = 0; lock = true; ctx.setScore("0 moves"); ctx.setLevel(level);
    const maxH = ctx.board.clientHeight - 24, maxW = ctx.board.clientWidth - 24; const cell = Math.floor(Math.min((maxW - (c - 1) * 9) / c, (maxH - (r - 1) * 9) / r, 120));
    wrap.style.cssText = `grid-template-columns:repeat(${c},${cell}px);grid-auto-rows:${cell}px`; wrap.innerHTML = "";
    deck.forEach((v, i) => { const b = document.createElement("button"); b.type = "button"; b.className = "mc"; b.dataset.v = v; b.setAttribute("aria-label", "card " + (i + 1));
      b.innerHTML = `<span class="f b"></span><span class="f a">${sym(v)}</span>`; b.onclick = () => flip(b); wrap.appendChild(b); });
    const peek = level >= 3; if (peek) { wrap.classList.add("pk"); const ms = 900 + pairs * 110; ctx.say("Memorize!", "Cards flip back in a moment"); [...wrap.children].forEach((b, i) => later(() => b.classList.add("pk"), i * 25));
      later(() => { wrap.classList.remove("pk"); [...wrap.children].forEach((b) => b.classList.remove("pk")); ctx.say("Level " + level, "Par " + par(pairs) + " moves for 3 stars"); lock = false; t0 = performance.now(); }, ms + 400); }
    else { lock = false; ctx.say("Level " + level, "Find all " + pairs + " pairs. Par " + par(pairs)); t0 = performance.now(); }
    if (level === 1 && !ctx.store.get("done", false)) wrap.firstChild.classList.add("guide");
  }
  function flip(b) {
    if (lock || b.classList.contains("o") || b.classList.contains("d")) return; wrap.querySelectorAll(".guide").forEach((e) => e.classList.remove("guide"));
    b.classList.add("o"); ctx.hx("tap"); ctx.sfx("flip"); open.push(b); if (open.length < 2) return;
    moves++; ctx.setScore(moves + " moves"); lock = true; const [x, y] = open;
    if (x.dataset.v === y.dataset.v) { streak++; later(() => { [x, y].forEach((e) => { e.classList.remove("o"); e.classList.add("d", "o"); });
        ctx.sfx("match"); ctx.hx("select"); const r = y.getBoundingClientRect(); ctx.fx.burst(r.left + r.width / 2, r.top + r.height / 2, ["#8fc24a", "#c1ee81", "#d8b948"], 10, 46);
        if (streak >= 2) ctx.fx.floatText("x" + streak + " streak", r.left + r.width / 2, r.top, "#3f6b2a");
        open = []; found++; ctx.store.set("done", true); lock = false; if (found === pairs) later(win, 500); }, 360); }
    else { streak = 0; later(() => { [x, y].forEach((e) => e.classList.add("x")); ctx.sfx("bad"); ctx.hx("error"); }, 380); later(() => { [x, y].forEach((e) => e.classList.remove("o", "x")); open = []; lock = false; }, 820); }
  }
  function win() { ctx.hx("win"); ctx.sfx("win"); const p = par(pairs), st = moves <= p ? 3 : moves <= p * 1.5 ? 2 : 1, sec = Math.round((performance.now() - t0) / 1000);
    const best = ctx.store.get("best:" + level, 99999), nb = moves < best; if (nb) ctx.store.set("best:" + level, moves);
    const last = level >= LV.length; if (!last) level++; ctx.setLevel(level);
    ctx.actions(`<span class="mstars">${"\u2605".repeat(st)}${"\u2606".repeat(3 - st)}</span><br>${moves} moves in ${sec}s`, (nb ? "New best! " : "") + (last ? "Top board reached" : "Next board is bigger"), [{ label: last ? "Play again" : "Next level", fn: build }]); }
  build();
  return { destroy() { tm.forEach(clearTimeout); } };
});
