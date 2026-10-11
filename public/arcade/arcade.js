(() => {
  const $ = (s) => document.querySelector(s);
  const hx = (n) => { try { window.haptic && window.haptic(n); } catch (e) {} };
  const S = (inner) => `<svg viewBox="0 0 120 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${inner}</svg>`;
  const CATALOG = [
    { id: "tic-tac-toe", title: "Tic Tac Toe", c: "#dfd3fc", d: "#a794dd", file: "ttt.js",
      steps: ["Tap a square to place your X.", "Get three in a row before the computer does.", "Each win makes the computer smarter."],
      art: S('<g stroke="#fffdf8" stroke-width="5" stroke-linecap="round"><path d="M45 25v85M80 25v85M15 52h90M15 82h90"/></g><g stroke="#4a3b86" stroke-width="9" stroke-linecap="round" fill="none"><path d="M20 28l16 16M36 28L20 44"/><path d="M52 58l16 16M68 58L52 74"/></g><circle cx="92" cy="36" r="9" fill="none" stroke="#d4755d" stroke-width="8"/><circle cx="26" cy="96" r="9" fill="none" stroke="#d4755d" stroke-width="8"/>') },
    { id: "snakes", title: "Snakes", c: "#c1ee81", d: "#8fc24a", file: "snakes.js",
      steps: ["Swipe on the board, or use the big arrows below.", "Eat the berries to grow.", "Do not hit the walls or yourself. Speed builds each level."],
      art: S('<path d="M15 120c30 10 50-20 40-40s-30-20-30-40 30-20 50-5" fill="none" stroke="#3f6b2a" stroke-width="20" stroke-linecap="round"/><circle cx="92" cy="40" r="14" fill="#3f6b2a"/><circle cx="88" cy="36" r="4" fill="#fffdf8"/><circle cx="98" cy="36" r="4" fill="#fffdf8"/><circle cx="96" cy="125" r="10" fill="#d4755d"/>') },
    { id: "memory", title: "Memory", c: "#bfe3f2", d: "#7fb7d1", file: "memory.js",
      steps: ["Tap two cards to flip them.", "Matching pairs stay open.", "Clear the board with fewest moves. Boards grow each level."],
      art: S('<g stroke="#2f6f8f" stroke-width="3"><rect x="14" y="22" width="40" height="52" rx="9" fill="#fffdf8"/><rect x="66" y="22" width="40" height="52" rx="9" fill="#2f6f8f"/><rect x="14" y="86" width="40" height="52" rx="9" fill="#2f6f8f"/><rect x="66" y="86" width="40" height="52" rx="9" fill="#fffdf8"/></g><circle cx="34" cy="48" r="11" fill="#d4755d"/><path d="M86 100l12 24H74z" fill="#8fc24a"/>') },
    { id: "whack", title: "Whack-a-Mole", c: "#f7de8a", d: "#d8b948", file: "whack.js",
      steps: ["Moles pop up from the holes. Tap them fast.", "Do not tap the bombs.", "Hit the target score before time runs out."],
      art: S('<ellipse cx="60" cy="118" rx="42" ry="14" fill="#6b4b2a"/><path d="M30 118c0-40 12-62 30-62s30 22 30 62z" fill="#a6784a"/><circle cx="48" cy="82" r="5" fill="#282d26"/><circle cx="72" cy="82" r="5" fill="#282d26"/><ellipse cx="60" cy="96" rx="9" ry="6" fill="#f2a38f"/><path d="M24 30l12 10M96 24L84 36M60 14v14" stroke="#fffdf8" stroke-width="5" stroke-linecap="round"/>') },
    { id: "math", title: "Math Quiz", c: "#f2a38f", d: "#d4755d", file: "math.js",
      steps: ["Solve the sum, tap the right answer.", "The timer bar drains, so be quick.", "Three misses end the round. Sums get harder each level."],
      art: S('<g fill="#fffdf8" font-family="ui-sans-serif,system-ui" font-weight="900" font-size="34" text-anchor="middle"><text x="22" y="50">7</text><text x="52" y="50">×</text><text x="86" y="50">6</text><text x="40" y="100" font-size="40">=</text><text x="80" y="100" font-size="44" fill="#7a2f1d">?</text></g>') },
    { id: "dots-boxes", title: "Dots and Boxes", c: "#d9ecb8", d: "#9cc05a", file: "dots.js",
      steps: ["Tap a gap between two dots to draw a line.", "Close the fourth side of a box to claim it and go again.", "Own more boxes than the computer to win."],
      art: S('<g fill="#3f6b2a"><circle cx="25" cy="40" r="7"/><circle cx="60" cy="40" r="7"/><circle cx="95" cy="40" r="7"/><circle cx="25" cy="80" r="7"/><circle cx="60" cy="80" r="7"/><circle cx="95" cy="80" r="7"/><circle cx="25" cy="120" r="7"/><circle cx="60" cy="120" r="7"/><circle cx="95" cy="120" r="7"/></g><path d="M25 40h35v40H25z" fill="#d4755d" opacity=".85"/><path d="M60 80h35M60 40h35M95 40v40" stroke="#3f6b2a" stroke-width="5" stroke-linecap="round"/>') },
  ];
  const reg = {};
  window.ARCADE = { define(id, fn) { reg[id] = fn; }, hx };
  const K = (id, k) => `dg1p:${id}:${k}`;
  const get = (id, k, d) => { try { const v = localStorage.getItem(K(id, k)); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const set = (id, k, v) => { try { localStorage.setItem(K(id, k), JSON.stringify(v)); } catch (e) {} };

  const grid = $("#grid");
  function renderLobby() {
    grid.innerHTML = "";
    CATALOG.forEach((g, i) => {
      const b = document.createElement("button");
      b.className = "card"; b.type = "button"; b.style.setProperty("--c", g.c); b.style.setProperty("--d", g.d);
      b.style.animationDelay = i * 40 + "ms";
      const lv = get(g.id, "level", 1);
      b.innerHTML = `${g.art}<span class="best">Lv ${lv}</span><span class="name">${g.title}</span>`;
      b.onclick = () => { hx("tap"); location.hash = g.id; };
      grid.appendChild(b);
    });
  }

  let cur = null, curDef = null, token = 0;
  const board = $("#board"), dock = $("#dock");
  function show(which) { $("#lobby").classList.toggle("is-active", which === "lobby"); $("#play").classList.toggle("is-active", which === "play"); }
  function stop() { if (curDef && curDef.destroy) { try { curDef.destroy(); } catch (e) {} } curDef = null; board.innerHTML = ""; dock.innerHTML = ""; }
  function progress(p) { const lb = $("#loadbar"); lb.hidden = p >= 1; lb.firstElementChild.style.width = p * 100 + "%"; }
  function loadScript(file) {
    return new Promise((res, rej) => {
      const s = document.createElement("script"); s.src = "/arcade/" + file; s.onload = res; s.onerror = () => rej(new Error("load"));
      document.head.appendChild(s);
    });
  }
  function ctxFor(g) {
    const ctx = {
      id: g.id, board, dock, hx,
      level: get(g.id, "level", 1),
      setLevel(n) { ctx.level = n; set(g.id, "level", Math.max(n, get(g.id, "level", 1))); $("#g-level").textContent = "Lv " + n; },
      setScore(t) { $("#g-score").textContent = t; },
      store: { get: (k, d) => get(g.id, k, d), set: (k, v) => set(g.id, k, v) },
      say(msg, sub) { dock.innerHTML = `<div class="msg">${msg}</div>${sub ? `<div class="sub">${sub}</div>` : ""}`; },
      actions(msg, sub, btns) {
        ctx.say(msg, sub);
        btns.forEach((b) => { const e = document.createElement("button"); e.type = "button"; e.className = "btn" + (b.alt ? " alt" : ""); e.textContent = b.label; e.onclick = () => { hx("tap"); b.fn(); }; dock.appendChild(e); });
      },
      restart: () => start(g, false),
    };
    return ctx;
  }
  async function start(g, firstTime) {
    const my = ++token;
    stop();
    $("#g-title").textContent = g.title; $("#g-score").textContent = "0";
    $("#g-level").textContent = "Lv " + get(g.id, "level", 1);
    progress(0.15);
    try {
      if (!reg[g.id]) await loadScript(g.file);
      if (my !== token) return;
      progress(0.7);
      await new Promise((r) => requestAnimationFrame(r));
      if (my !== token) return;
      curDef = reg[g.id](ctxFor(g)) || {};
      progress(1);
    } catch (e) {
      progress(1); dock.innerHTML = '<div class="msg">Could not load this game.</div>';
      const b = document.createElement("button"); b.className = "btn"; b.textContent = "Try again"; b.onclick = () => start(g); dock.appendChild(b);
    }
  }
  function intro(g, then) {
    const el = $("#intro"); $("#intro-art").style.setProperty("--c", g.c); $("#intro-art").style.setProperty("--d", g.d);
    $("#intro-art").innerHTML = g.art; $("#intro-title").textContent = g.title;
    $("#intro-steps").innerHTML = g.steps.map((s) => `<li>${s}</li>`).join("");
    el.hidden = false;
    $("#intro-go").onclick = () => { el.hidden = true; hx("tap"); then(); };
  }
  function route() {
    const id = location.hash.slice(1), g = CATALOG.find((x) => x.id === id);
    $("#intro").hidden = true;
    if (!g) { token++; stop(); cur = null; show("lobby"); renderLobby(); return; }
    cur = g; show("play"); stop();
    $("#g-title").textContent = g.title;
    if (!get(g.id, "seen", false)) { set(g.id, "seen", true); intro(g, () => start(g)); } else start(g);
  }
  $("#back").onclick = () => { if (history.length > 1 && cur) history.back(); else location.hash = ""; };
  $("#g-restart").onclick = () => cur && start(cur);
  $("#g-help").onclick = () => { if (!cur) return; token++; stop(); intro(cur, () => start(cur)); };
  window.addEventListener("hashchange", route);
  route();
})();
