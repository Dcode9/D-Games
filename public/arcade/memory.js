ARCADE.define("memory", (ctx) => {
  const COL = ["#d4755d", "#8fc24a", "#7fb7d1", "#a794dd", "#d8b948", "#3f6b2a", "#2f6f8f", "#c45a8a", "#6b4b2a", "#e08a3c", "#4a3b86", "#5aa88a", "#b0405a", "#8a8a2a", "#3a6ea5"];
  const SH = [(c) => `<circle cx="50" cy="50" r="30" fill="${c}"/>`, (c) => `<rect x="22" y="22" width="56" height="56" rx="8" fill="${c}"/>`, (c) => `<path d="M50 16 86 80H14z" fill="${c}"/>`, (c) => `<path d="M50 14 62 38l26 4-19 18 5 26-24-13-24 13 5-26-19-18 26-4z" fill="${c}"/>`, (c) => `<path d="M50 84C10 56 18 20 40 24c6 1 9 5 10 9 1-4 4-8 10-9 22-4 30 32-10 60z" fill="${c}"/>`];
  const sym = (i) => `<svg viewBox="0 0 100 100" width="70%" height="70%">${SH[(i + (i / 5 | 0)) % 5](COL[i % COL.length])}</svg>`;
  const LV = [[2, 2], [3, 2], [4, 3], [4, 4], [5, 4], [6, 5], [6, 6]];
  let level = Math.min(ctx.level, LV.length), moves, open, matched, lock, t0;
  const wrap = document.createElement("div"); ctx.board.appendChild(wrap);
  function build() {
    const [c, r] = LV[level - 1]; const n = c * r / 2; const ids = [...Array(n).keys()]; const deck = ids.concat(ids).sort(() => Math.random() - .5);
    moves = 0; open = []; matched = 0; lock = false; ctx.setScore("0 moves"); ctx.setLevel(level);
    const maxH = ctx.board.clientHeight - 24, maxW = ctx.board.clientWidth - 24; const cell = Math.floor(Math.min((maxW - (c - 1) * 8) / c, (maxH - (r - 1) * 8) / r, 120));
    wrap.style.cssText = `display:grid;grid-template-columns:repeat(${c},${cell}px);grid-auto-rows:${cell}px;gap:8px`; wrap.innerHTML = "";
    deck.forEach((v) => { const b = document.createElement("button"); b.type = "button"; b.dataset.v = v; b.setAttribute("aria-label", "card");
      b.style.cssText = "border-radius:18px;border:3px solid #7fb7d1;background:#bfe3f2;box-shadow:0 5px 0 #7fb7d1;display:grid;place-items:center;transition:transform .08s,background .12s";
      b.onclick = () => flip(b); wrap.appendChild(b); });
    ctx.say("Level " + level, "Find all " + n + " pairs"); wrap.firstChild.classList.toggle("guide", level === 1 && !ctx.store.get("done", false));
  }
  function flip(b) {
    if (lock || b.dataset.open || b.dataset.done) return; b.classList.remove("guide"); wrap.querySelectorAll(".guide").forEach((e) => e.classList.remove("guide"));
    b.dataset.open = 1; b.innerHTML = sym(+b.dataset.v); b.style.background = "#fffdf8"; ctx.hx("tap"); open.push(b);
    if (open.length < 2) return; moves++; ctx.setScore(moves + " moves"); lock = true;
    const [x, y] = open;
    if (x.dataset.v === y.dataset.v) { setTimeout(() => { [x, y].forEach((e) => { e.dataset.done = 1; delete e.dataset.open; e.style.background = "#c1ee81"; e.style.borderColor = "#8fc24a"; e.style.boxShadow = "0 5px 0 #8fc24a"; }); open = []; lock = false; ctx.hx("select"); matched++;
      if (wrap.querySelectorAll("[data-done]").length === wrap.children.length) win(); }, 250); }
    else setTimeout(() => { [x, y].forEach((e) => { delete e.dataset.open; e.innerHTML = ""; e.style.background = "#bfe3f2"; }); open = []; lock = false; }, 650);
  }
  function win() { ctx.store.set("done", true); ctx.hx("win"); const last = level >= LV.length; if (!last) level++; ctx.setLevel(level);
    ctx.actions("Cleared in " + moves + " moves!", last ? "Top level reached" : "Next board is bigger", [{ label: last ? "Play again" : "Next level", fn: build }]); }
  build();
  return { destroy() {} };
});
