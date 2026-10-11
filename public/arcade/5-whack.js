ARCADE.define("whack", (ctx) => {
  if (!document.getElementById("css-wh")) { const s = document.createElement("style"); s.id = "css-wh"; s.textContent = `
.wh{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;position:relative;touch-action:manipulation}
.wh .h{position:relative;border-radius:26px;background:radial-gradient(ellipse at 50% 78%,#5b3d1f 0 34%,#8a6a42 36%);border:3px solid #6b4b2a;box-shadow:0 6px 0 #6b4b2a;overflow:hidden;padding:0;-webkit-tap-highlight-color:transparent}
.wh .h:active{transform:translateY(3px);box-shadow:0 3px 0 #6b4b2a}
.wh .m{position:absolute;left:14%;right:14%;bottom:-100%;height:78%;transform-origin:50% 100%;transition:bottom .13s cubic-bezier(.3,1.7,.5,1);pointer-events:none}
.wh .m.up{bottom:12%;animation:wsq .22s}
.wh .m.hit{animation:wsh .2s forwards}
.wh .rim{position:absolute;left:0;right:0;bottom:0;height:28%;background:linear-gradient(#7a5a34,#6b4b2a);border-radius:50% 50% 0 0/100% 100% 0 0}
@keyframes wsq{0%{transform:scale(.7,1.25)}60%{transform:scale(1.12,.9)}100%{transform:scale(1)}}
@keyframes wsh{0%{transform:scale(1.2,.6)}100%{transform:scale(1.3,.1);opacity:0}}
.wh .h.boom{animation:wbm .3s;background:#f2a38f}
@keyframes wbm{0%,100%{transform:none}30%{transform:translateX(-5px)}60%{transform:translateX(5px)}}
.wh .h.ring:after{content:"";position:absolute;inset:6px;border-radius:20px;border:4px solid #c1ee81;animation:wr .5s infinite alternate;pointer-events:none}
@keyframes wr{to{opacity:.2}}
.wtimer{position:relative;width:100%;height:12px;background:#dfded3;border-radius:8px;overflow:hidden;margin-bottom:12px}
.wtimer i{display:block;height:100%;background:#8fc24a;transition:width 1s linear}
.wcombo{position:absolute;top:-4px;right:6px;font-weight:900;color:#e08a3c;font-size:22px;opacity:0;transition:.15s}.wcombo.on{opacity:1;transform:scale(1.15)}`; document.head.appendChild(s); }
  let level = ctx.level, score, left, tick, spawn, running, holes = [], combo = 0, bestCombo = 0, tm = [];
  const outer = document.createElement("div"); outer.style.cssText = "width:min(420px,100%);position:relative";
  outer.innerHTML = '<div class="wtimer"><i style="width:100%"></i></div><div class="wcombo"></div>';
  const wrap = document.createElement("div"); wrap.className = "wh fit"; outer.appendChild(wrap); ctx.board.appendChild(outer);
  const tbar = outer.querySelector(".wtimer i"), cmb = outer.querySelector(".wcombo");
  const mole = (gold) => `<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M14 100c0-48 14-78 36-78s36 30 36 78z" fill="${gold ? "#e8c03a" : "#a6784a"}"/><path d="M14 100c0-48 14-78 36-78" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="4"/><circle cx="37" cy="56" r="6" fill="#fffdf8"/><circle cx="63" cy="56" r="6" fill="#fffdf8"/><circle cx="38" cy="57" r="3" fill="#282d26"/><circle cx="62" cy="57" r="3" fill="#282d26"/><ellipse cx="50" cy="70" rx="11" ry="8" fill="#f2a38f"/><path d="M45 78q5 4 10 0" stroke="#282d26" fill="none" stroke-width="2.5" stroke-linecap="round"/>${gold ? '<path d="M30 28l8 8 12-14 12 14 8-8-4 14H34z" fill="#fff3a8" stroke="#c9a02a" stroke-width="2"/>' : ""}</svg>`;
  const bomb = '<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="62" r="30" fill="#282d26"/><path d="M62 34l10-12" stroke="#d8b948" stroke-width="6" stroke-linecap="round"/><circle cx="74" cy="18" r="6" fill="#d4755d"/><circle cx="40" cy="52" r="7" fill="#fffdf8" opacity=".5"/></svg>';
  for (let i = 0; i < 9; i++) { const h = document.createElement("button"); h.type = "button"; h.className = "h"; h.setAttribute("aria-label", "hole " + (i + 1));
    h.innerHTML = '<div class="m"></div><div class="rim"></div>'; h.onpointerdown = (e) => { e.preventDefault(); hit(i, e); }; wrap.appendChild(h); holes.push({ el: h, m: h.firstChild, up: null, t: 0 }); }
  const target = () => 8 + level * 3, dur = () => Math.max(520, 1200 - level * 90), gap = () => Math.max(380, 850 - level * 60);
  const hint = () => "Whack " + target() + " moles" + (level >= 3 ? ". Skip the bombs!" : "");
  function pop() { if (!running) return; const free = holes.filter((h) => !h.up); if (!free.length) return; const h = free[(Math.random() * free.length) | 0];
    const isBomb = level >= 3 && Math.random() < Math.min(.3, .08 + level * .03); const gold = !isBomb && level >= 2 && Math.random() < .09;
    h.up = isBomb ? "b" : gold ? "g" : "m"; h.m.innerHTML = isBomb ? bomb : mole(gold); h.m.className = "m"; void h.m.offsetWidth; h.m.classList.add("up"); ctx.sfx("pop");
    if (ctx.level === 1 && level === 1 && !ctx.store.get("done", false)) h.el.classList.add("ring");
    clearTimeout(h.t); h.t = setTimeout(() => { if (h.up === "m" || h.up === "g") { combo = 0; showCombo(); } down(h); }, dur()); }
  function down(h, keep) { clearTimeout(h.t); h.up = null; h.el.classList.remove("ring"); h.m.className = "m"; }
  function showCombo() { cmb.textContent = combo >= 3 ? "x" + Math.min(4, 1 + (combo / 3 | 0)) + " combo" : ""; cmb.classList.toggle("on", combo >= 3); }
  function hit(i, e) { if (!running) return; const h = holes[i]; const r = h.el.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height * .4;
    if (!h.up) { combo = 0; showCombo(); return; }
    if (h.up === "b") { const loss = Math.min(score, 2); score -= loss; combo = 0; showCombo(); ctx.hx("error"); ctx.sfx("boom"); h.el.classList.add("boom"); setTimeout(() => h.el.classList.remove("boom"), 300); ctx.fx.burst(x, y, ["#d4755d", "#d8b948", "#282d26"], 16, 70); ctx.fx.floatText("-" + loss, x, y, "#b0405a"); }
    else { const gold = h.up === "g"; combo++; const mult = Math.min(4, 1 + (combo / 3 | 0)); const pts = (gold ? 3 : 1) * mult; score += pts; bestCombo = Math.max(bestCombo, combo); ctx.hx("select"); ctx.sfx("whack"); ctx.store.set("done", true); ctx.fx.burst(x, y, gold ? ["#e8c03a", "#fff3a8"] : ["#c1ee81", "#8fc24a", "#fffdf8"], 11, 52); ctx.fx.floatText("+" + pts, x, y - 8, gold ? "#c9a02a" : "#3f6b2a"); showCombo();
      h.m.classList.remove("up"); h.m.classList.add("hit"); const hh = h; hh.up = null; clearTimeout(hh.t); hh.t = setTimeout(() => down(hh), 190); }
    ctx.setScore(score + "/" + target()); if (h.up === "b") down(h); }
  function round() { tm.forEach(clearTimeout); score = 0; left = 30; combo = 0; running = true; holes.forEach((h) => down(h)); showCombo(); ctx.setScore("0/" + target()); ctx.setLevel(level); ctx.say("Time 30", hint()); tbar.style.transition = "none"; tbar.style.width = "100%"; void tbar.offsetWidth; tbar.style.transition = "width 1s linear";
    clearInterval(tick); clearInterval(spawn); tick = setInterval(() => { left--; tbar.style.width = (left / 30 * 100) + "%"; tbar.style.background = left <= 8 ? "#d4755d" : "#8fc24a"; ctx.say("Time " + left, hint()); if (left <= 0) finish(); }, 1000); spawn = setInterval(pop, gap()); }
  function finish() { running = false; clearInterval(tick); clearInterval(spawn); holes.forEach((h) => down(h));
    const best = ctx.store.get("best", 0); if (score > best) ctx.store.set("best", score);
    if (score >= target()) { ctx.hx("win"); ctx.sfx("win"); level++; ctx.setLevel(level); ctx.actions("Round cleared! " + score + " pts.", "Best combo " + bestCombo + ". Faster moles next", [{ label: "Next level", fn: round }]); }
    else { ctx.hx("error"); ctx.actions("Time up: " + score + " of " + target(), "So close. Best combo " + bestCombo, [{ label: "Try again", fn: round }]); } bestCombo = 0; }
  round();
  return { destroy() { running = false; clearInterval(tick); clearInterval(spawn); holes.forEach((h) => clearTimeout(h.t)); } };
});
