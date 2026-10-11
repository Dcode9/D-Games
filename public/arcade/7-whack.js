ARCADE.define("whack", (ctx) => {
  let level = ctx.level, score, left, tick, spawn, running, holes = [];
  const wrap = document.createElement("div"); wrap.className = "fit"; wrap.style.cssText += ";display:grid;grid-template-columns:repeat(3,1fr);gap:12px";
  ctx.board.appendChild(wrap);
  for (let i = 0; i < 9; i++) { const h = document.createElement("button"); h.type = "button"; h.setAttribute("aria-label", "hole");
    h.style.cssText = "position:relative;border-radius:24px;background:#8a6a42;border:3px solid #6b4b2a;box-shadow:0 6px 0 #6b4b2a;overflow:hidden;padding:0";
    h.innerHTML = '<div class="m" style="position:absolute;left:12%;right:12%;bottom:-100%;height:80%;transition:bottom .1s;display:grid;place-items:center"></div><div style="position:absolute;left:0;right:0;bottom:0;height:26%;background:#6b4b2a;border-radius:50% 50% 0 0/100% 100% 0 0"></div>';
    h.onpointerdown = (e) => { e.preventDefault(); hit(i); }; wrap.appendChild(h); holes.push({ el: h, m: h.firstChild, up: null, t: 0 }); }
  const mole = '<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M16 100c0-46 14-74 34-74s34 28 34 74z" fill="#a6784a"/><circle cx="38" cy="58" r="5" fill="#282d26"/><circle cx="62" cy="58" r="5" fill="#282d26"/><ellipse cx="50" cy="72" rx="10" ry="7" fill="#f2a38f"/></svg>';
  const bomb = '<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="60" r="30" fill="#282d26"/><path d="M62 32l10-12" stroke="#d8b948" stroke-width="6" stroke-linecap="round"/><circle cx="74" cy="18" r="6" fill="#d4755d"/><circle cx="40" cy="52" r="6" fill="#fffdf8" opacity=".5"/></svg>';
  const target = () => 8 + level * 3, dur = () => Math.max(520, 1200 - level * 90), gap = () => Math.max(380, 850 - level * 60);
  function pop() { if (!running) return; const free = holes.filter((h) => !h.up); if (!free.length) return; const h = free[(Math.random() * free.length) | 0];
    const isBomb = level >= 3 && Math.random() < Math.min(.3, .08 + level * .03); h.up = isBomb ? "b" : "m"; h.m.innerHTML = isBomb ? bomb : mole; h.m.style.bottom = "10%";
    if (ctx.level === 1 && level === 1 && !ctx.store.get("done", false) && !h.el.classList.contains("g")) { h.el.classList.add("g", "guide"); }
    clearTimeout(h.t); h.t = setTimeout(() => down(h), dur()); }
  function down(h) { clearTimeout(h.t); h.up = null; h.m.style.bottom = "-100%"; h.el.classList.remove("guide", "g"); }
  function hit(i) { if (!running) return; const h = holes[i]; if (!h.up) return;
    if (h.up === "b") { score = Math.max(0, score - 2); ctx.hx("error"); wrap.classList.add("shake"); setTimeout(() => wrap.classList.remove("shake"), 260); }
    else { score++; ctx.hx("select"); ctx.store.set("done", true); } down(h); ctx.setScore(score + "/" + target()); }
  function round() { score = 0; left = 30; running = true; holes.forEach(down); ctx.setScore("0/" + target()); ctx.setLevel(level); ctx.say("Time 30", "Whack " + target() + " moles" + (level >= 3 ? ". Skip the bombs!" : ""));
    clearInterval(tick); clearInterval(spawn); tick = setInterval(() => { left--; ctx.say("Time " + left, "Whack " + target() + " moles" + (level >= 3 ? ". Skip the bombs!" : "")); if (left <= 0) finish(); }, 1000); spawn = setInterval(pop, gap()); }
  function finish() { running = false; clearInterval(tick); clearInterval(spawn); holes.forEach(down);
    if (score >= target()) { ctx.hx("win"); level++; ctx.setLevel(level); ctx.actions("Round cleared! " + score + " hits.", "Faster moles next level", [{ label: "Next level", fn: round }]); }
    else { ctx.hx("error"); ctx.actions("Time up: " + score + " of " + target(), "", [{ label: "Try again", fn: round }]); } }
  round();
  return { destroy() { running = false; clearInterval(tick); clearInterval(spawn); holes.forEach((h) => clearTimeout(h.t)); } };
});
