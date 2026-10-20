ARCADE.define("reaction", (ctx) => {
  if (!document.getElementById("css-rxn")) { const s = document.createElement("style"); s.id = "css-rxn"; s.textContent = `
  .rxn{display:flex;flex-direction:column;align-items:center;gap:14px;width:100%;touch-action:manipulation}
  .rxn .orb{width:min(64vw,250px,calc(100dvh - 340px));aspect-ratio:1;border-radius:50%;display:grid;place-items:center;background:var(--surface);border:4px solid var(--line);box-shadow:0 8px 0 var(--line);transition:background .08s,border-color .08s,transform .08s;cursor:pointer;position:relative}
  .rxn .orb:active{transform:translateY(4px);box-shadow:0 4px 0 var(--line)}
  .rxn .orb.wait{animation:rxnbreathe 1.4s ease-in-out infinite}
  .rxn .orb.go{background:var(--lime);border-color:var(--lime-d);box-shadow:0 8px 0 var(--lime-d);animation:rxnpop .18s cubic-bezier(.3,1.6,.4,1)}
  .rxn .orb.fake{background:var(--sun);border-color:var(--sun-d)}
  .rxn .orb.early{background:var(--coral);border-color:var(--coral-d);animation:shake .25s}
  .rxn .orb span{font-weight:900;font-size:clamp(17px,5vw,22px);text-align:center;padding:0 20px;color:var(--ink);pointer-events:none}
  @keyframes rxnbreathe{50%{transform:scale(1.05)}}
  @keyframes rxnpop{from{transform:scale(.85)}to{transform:scale(1)}}
  .rxn .dots5{display:flex;gap:8px}
  .rxn .dots5 i{width:12px;height:12px;border-radius:50%;background:var(--line);transition:background .2s,transform .2s}
  .rxn .dots5 i.done{background:var(--lime-d);transform:scale(1.15)}
  .rxn .dots5 i.now{background:var(--sun-d);animation:rxnbreathe 1s infinite}
  .rxn .hist{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;max-width:320px}
  .rxn .hist b{background:var(--bg);border:2px solid var(--line);border-radius:10px;padding:2px 9px;font-size:13px;font-weight:800}
  .rxn .hist b.hot{border-color:var(--lime-d);background:var(--lime)}`; document.head.appendChild(s); }
  const THRESH = [450, 420, 390, 360, 335, 310, 290, 270, 250, 230, 210, 190];
  const GRADE = (ms) => (ms < 210 ? "Lightning!" : ms < 280 ? "Quick!" : ms < 360 ? "Nice" : ms < 460 ? "Steady" : "Slow");
  let level = ctx.level, target = THRESH[level - 1] || 190, attempt, times, falseStarts, state, t1, t2, goAt, best = ctx.store.get("best", null), dead = false;
  const wrap = document.createElement("div"); wrap.className = "rxn";
  wrap.innerHTML = `<div class="dots5" id="rxd"></div><div class="orb" id="rxo"><span id="rxs"></span></div><div class="hist" id="rxh"></div>`;
  ctx.board.appendChild(wrap);
  const orb = wrap.querySelector("#rxo"), label = wrap.querySelector("#rxs"), dots = wrap.querySelector("#rxd"), hist = wrap.querySelector("#rxh");
  ctx.setScore("Lv " + level + " · " + target + "ms");
  function drawDots() { dots.innerHTML = ""; for (let i = 0; i < 5; i++) { const d = document.createElement("i"); if (i < times.length) d.className = "done"; else if (i === times.length) d.className = "now"; dots.appendChild(d); } }
  function drawHist() { hist.innerHTML = times.map((t) => `<b class="${t < target * 0.75 ? "hot" : ""}">${t}</b>`).join("") + (times.length ? `<b>avg ${Math.round(times.reduce((a, b) => a + b, 0) / times.length)}</b>` : ""); }
  function arm() {
    if (dead) return;
    state = "wait"; orb.className = "orb wait"; label.textContent = "Wait for lime...";
    const delay = 900 + Math.random() * 2600;
    const fakes = level >= 5 ? (Math.random() < Math.min(0.75, 0.2 + level * 0.05) ? 1 : 0) : 0;
    let at = delay * 0.45;
    t1 = setTimeout(function step() {
      if (dead) return;
      if (fakes && at < delay) {
        state = "fake"; orb.className = "orb fake"; label.textContent = "...";
        ctx.sfx("tap");
        t2 = setTimeout(() => { if (dead) return; state = "wait"; orb.className = "orb wait"; label.textContent = "Wait for lime..."; }, 260);
      }
    }, at);
    t2 = setTimeout(() => { if (dead) return; state = "go"; goAt = performance.now(); orb.className = "orb go"; label.textContent = "TAP!"; ctx.sfx("pop"); }, fakes ? delay + 420 : delay);
  }
  function tap() {
    if (dead) return;
    if (state === "go") {
      const ms = Math.round(performance.now() - goAt);
      times.push(ms); state = "idle";
      if (!best || ms < best) { best = ms; ctx.store.set("best", best); }
      ctx.sfx("good"); ctx.hx("success");
      const r = ctx.fx.rectOf(orb); ctx.fx.floatText(ms + "ms", r.x, r.y - 30, ms < target * 0.75 ? "#8fc24a" : "#282d26");
      if (ms < target * 0.75) ctx.fx.burst(r.x, r.y, null, 10, 70);
      drawDots(); drawHist();
      if (times.length >= 5) return finish();
      label.textContent = GRADE(ms); orb.className = "orb";
      t1 = setTimeout(arm, 850);
    } else if (state === "wait" || state === "fake") {
      clearTimeout(t1); clearTimeout(t2);
      falseStarts++; state = "idle";
      ctx.sfx("bad"); ctx.hx("error");
      orb.className = "orb early"; label.textContent = state === "fake" ? "Not that one!" : "Too soon!";
      t1 = setTimeout(arm, 1100);
    }
  }
  orb.addEventListener("pointerdown", (e) => { e.preventDefault(); tap(); });
  function finish() {
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const pass = avg <= target;
    if (pass) {
      const nl = Math.min(12, level + 1);
      ctx.sfx("win"); ctx.hx("success");
      const r = ctx.fx.rectOf(orb); ctx.fx.burst(r.x, r.y, null, 26, 130);
      const stars = avg < target * 0.7 ? "★★★" : avg < target * 0.87 ? "★★☆" : "★☆☆";
      ctx.actions("Average " + avg + "ms - " + stars, level >= 12 ? "You beat the top level. Reflexes of a cat." : "Level " + nl + ": average " + THRESH[nl - 1] + "ms or better",
        [{ label: level >= 12 ? "Go again" : "Next level", fn: () => { if (level < 12) ctx.setLevel(level + 1); ctx.restart(); } }]);
    } else {
      ctx.sfx("bad"); ctx.hx("error");
      ctx.actions("Average " + avg + "ms", "Need " + target + "ms or better. " + (falseStarts ? falseStarts + " false start" + (falseStarts > 1 ? "s" : "") + ". " : "") + "Once more!",
        [{ label: "Retry level " + level, fn: () => ctx.restart() }]);
    }
  }
  attempt = 0; times = []; falseStarts = 0; state = "idle";
  drawDots(); drawHist();
  ctx.say("5 taps, average " + target + "ms or better", (best ? "Your best ever: " + best + "ms. " : "") + (level >= 5 ? "Watch out for fake flashes!" : "Tap the moment the orb turns lime"));
  arm();
  return { destroy() { dead = true; clearTimeout(t1); clearTimeout(t2); } };
});
