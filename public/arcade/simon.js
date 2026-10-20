ARCADE.define("simon", (ctx) => {
  if (!document.getElementById("css-simon")) { const s = document.createElement("style"); s.id = "css-simon"; s.textContent = `
  .sim{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;touch-action:manipulation;-webkit-user-select:none;user-select:none}
  .sim .ring{position:relative;width:min(78vw,300px,calc(100dvh - 300px));aspect-ratio:1}
  .sim .pad{position:absolute;width:48%;height:48%;border:4px solid rgba(0,0,0,.12);cursor:pointer;transition:filter .12s,transform .12s;opacity:.55}
  .sim .pad.p0{top:0;left:0;border-radius:100% 14px 14px 14px;background:var(--lime-d)}
  .sim .pad.p1{top:0;right:0;border-radius:14px 100% 14px 14px;background:var(--coral-d)}
  .sim .pad.p2{bottom:0;left:0;border-radius:14px 14px 14px 100%;background:var(--sky-d)}
  .sim .pad.p3{bottom:0;right:0;border-radius:14px 14px 100% 14px;background:var(--sun-d)}
  .sim .pad.lit{opacity:1;filter:brightness(1.3) saturate(1.2);transform:scale(1.05)}
  .sim .pad.tapok{opacity:1;transform:scale(.95)}
  .sim .core{position:absolute;inset:27%;border-radius:50%;background:var(--surface);border:4px solid var(--line);display:grid;place-items:center;pointer-events:none;box-shadow:0 6px 0 var(--line)}
  .sim .core b{font-size:clamp(26px,8vw,38px);font-weight:900}
  .sim .core small{font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}
  .sim .core .stack{display:flex;flex-direction:column;align-items:center;line-height:1.1}
  .sim.err .pad{animation:shake .3s}
  .sim .pad.locked{cursor:default}`; document.head.appendChild(s); }
  const FREQ = [329.6, 261.6, 392.0, 493.9];
  const SPEED = (l) => Math.max(200, 520 - l * 26);
  let level = ctx.level, seq, pos, accepting, alive = true, best = ctx.store.get("bestchain", 0), timers = [];
  const wrap = document.createElement("div"); wrap.className = "sim";
  wrap.innerHTML = `<div class="ring" id="sring">
    <div class="pad p0" data-p="0" role="button" aria-label="Green pad"></div>
    <div class="pad p1" data-p="1" role="button" aria-label="Red pad"></div>
    <div class="pad p2" data-p="2" role="button" aria-label="Blue pad"></div>
    <div class="pad p3" data-p="3" role="button" aria-label="Yellow pad"></div>
    <div class="core"><div class="stack"><small>chain</small><b id="scn">0</b></div></div>
  </div>`;
  ctx.board.appendChild(wrap);
  const pads = [...wrap.querySelectorAll(".pad")];
  ctx.setScore("Best " + best);
  const later = (fn, ms) => timers.push(setTimeout(() => { if (alive) fn(); }, ms));
  function lit(p, dur) {
    const e = pads[p]; e.classList.add("lit");
    ctx.fx.tone(FREQ[p], Math.max(0.14, (dur || 300) / 1000 - 0.05), "triangle", 0.13);
    later(() => e.classList.remove("lit"), dur || 300);
  }
  function playback() {
    accepting = false;
    ctx.say("Watch...", "Chain of " + seq.length);
    const gap = SPEED(level);
    seq.forEach((p, k) => later(() => lit(p, gap * 0.62), 500 + k * gap));
    later(() => { accepting = true; pos = 0; ctx.say("Your turn", "Repeat the chain"); }, 500 + seq.length * gap + 120);
  }
  function press(p) {
    if (!accepting) return;
    const e = pads[p]; e.classList.add("tapok"); later(() => e.classList.remove("tapok"), 140);
    ctx.fx.tone(FREQ[p], 0.22, "triangle", 0.13); ctx.hx("tap");
    if (seq[pos] === p) {
      pos++;
      if (pos >= seq.length) {
        accepting = false;
        if (seq.length > best) { best = seq.length; ctx.store.set("bestchain", best); ctx.setScore("Best " + best); }
        ctx.sfx("good");
        const r = ctx.fx.rectOf(wrap); ctx.fx.floatText("Chain " + seq.length + "!", r.x, r.y - 20, "#8fc24a");
        const target = level + 2;
        if (seq.length >= target + 1) {
          const nl = Math.min(12, level + 1);
          ctx.sfx("win"); ctx.fx.burst(r.x, r.y, null, 22, 120);
          later(() => ctx.actions("Chain of " + seq.length + "!", level >= 12 ? "You run this board." : "Level " + nl + ": longer chains, faster playback",
            [{ label: level >= 12 ? "Keep going" : "Next level", fn: () => { if (level < 12) ctx.setLevel(level + 1); ctx.restart(); } }]), 500);
        } else {
          later(() => { seq.push((Math.random() * 4) | 0); playback(); }, 700);
        }
      }
    } else {
      accepting = false;
      ctx.sfx("bad"); ctx.hx("error");
      wrap.classList.add("err"); later(() => wrap.classList.remove("err"), 350);
      const retryFree = level <= 4;
      if (retryFree) {
        later(() => { ctx.say("Not quite - watch again", "Levels 1-4 give a free re-watch"); }, 380);
        later(playback, 1500);
      } else {
        later(() => ctx.actions("Broken at " + pos + " of " + seq.length, "Level " + level + " again - new chain",
          [{ label: "Try again", fn: () => ctx.restart() }]), 600);
      }
    }
  }
  pads.forEach((e) => e.addEventListener("pointerdown", (ev) => { ev.preventDefault(); press(+e.dataset.p); }));
  seq = [(Math.random() * 4) | 0, (Math.random() * 4) | 0];
  pos = 0; accepting = false;
  playback();
  return { destroy() { alive = false; timers.forEach(clearTimeout); } };
});
