ARCADE.define("hangman", (ctx) => {
  if (!document.getElementById("css-hang")) { const s = document.createElement("style"); s.id = "css-hang"; s.textContent = `
  .hang{display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;max-width:430px;touch-action:manipulation}
  .hang .stage{width:min(44vw,170px);flex:none}
  .hang .stage svg{width:100%;height:auto;overflow:visible}
  .hang .part{fill:none;stroke:#282d26;stroke-width:6;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .3s ease-out}
  .hang .part.on{stroke-dashoffset:0}
  .hang .part.rope{stroke:#a6784a}.hang .part.body{stroke:#4a3b86}
  .hang .word{display:flex;gap:7px;flex-wrap:wrap;justify-content:center;margin:4px 0}
  .hang .slot{width:34px;height:44px;border-bottom:5px solid var(--line);display:grid;place-items:center;font-weight:900;font-size:24px}
  .hang .slot.got{border-color:var(--lime-d);animation:hangpop .3s cubic-bezier(.3,1.6,.4,1)}
  @keyframes hangpop{40%{transform:scale(1.2)}}
  .hang .cat{font-weight:800;color:var(--muted);font-size:13px;text-transform:uppercase;letter-spacing:.08em}
  .hang .kb{display:flex;flex-direction:column;gap:6px;align-items:center;margin-top:6px}
  .hang .kb .row{display:flex;gap:5px}
  .hang .kb button{width:32px;height:44px;border-radius:10px;background:var(--surface);border:2px solid var(--line);box-shadow:0 3px 0 var(--line);font-weight:900;font-size:16px;transition:transform .05s,box-shadow .05s,opacity .2s}
  .hang .kb button:active{transform:translateY(2px);box-shadow:0 1px 0 var(--line)}
  .hang .kb button.hit{background:var(--lime);border-color:var(--lime-d);box-shadow:0 2px 0 var(--lime-d);opacity:1}
  .hang .kb button.miss{background:var(--bg);opacity:.32;box-shadow:none}
  .hang .kb button[disabled]{pointer-events:none}
  @media(max-height:640px){.hang .stage{width:110px}.hang .slot{width:28px;height:38px;font-size:20px}.hang .kb button{width:29px;height:40px}}`; document.head.appendChild(s); }
  const BANK = [
    { c: "Animals", w: ["CAT", "DOG", "LION", "BEAR", "FROG", "DUCK", "GOAT", "WOLF"] },
    { c: "Food", w: ["CAKE", "RICE", "TACO", "SOUP", "PLUM", "CORN"] },
    { c: "Nature", w: ["TREE", "RAIN", "LEAF", "STAR", "MOON"] },
    { c: "Animals", w: ["TIGER", "ZEBRA", "PANDA", "EAGLE", "SHARK", "CAMEL", "KOALA"] },
    { c: "Food", w: ["PIZZA", "PASTA", "MANGO", "BREAD", "HONEY", "CHEESE"] },
    { c: "Space", w: ["COMET", "ORBIT", "LUNAR", "VENUS", "PLUTO"] },
    { c: "Nature", w: ["RIVER", "CLOUD", "STONE", "STORM", "CORAL", "MEADOW"] },
    { c: "Tech", w: ["ROBOT", "LASER", "PIXEL", "CIRCUIT", "ROCKET", "SCREEN"] },
    { c: "Sports", w: ["SOCCER", "TENNIS", "BOXING", "SKATE", "SPRINT"] },
    { c: "Words", w: ["PUZZLE", "JUNGLE", "WIZARD", "PLANET", "BANJO", "VOYAGE"] },
    { c: "Words", w: ["MYSTERY", "JOURNEY", "PYRAMID", "LANTERN", "COMPASS"] },
    { c: "Tricky", w: ["RHYTHM", "GYPSY", "LYNX", "ONYX", "JAZZ", "QUIZ", "FJORD"] },
    { c: "Tricky", w: ["XYLOPHONE", "JUXTAPOSE", "ZEPHYR", "QUARTZ", "KRYPTON"] },
  ];
  const PARTS = ["g1", "g2", "g3", "g4", "p1", "p2", "p3", "p4", "p5", "p6"];
  const MAXMISS = 6;
  let level = ctx.level, misses, guessed, word, cat, over, timers = [];
  const wrap = document.createElement("div"); wrap.className = "hang";
  wrap.innerHTML = `
  <div class="stage"><svg viewBox="0 0 120 140">
    <path class="part g1" data-p="0" pathLength="1" d="M14 136h44"/>
    <path class="part g2" data-p="1" pathLength="1" d="M30 136V14"/>
    <path class="part g3" data-p="2" pathLength="1" d="M30 14h56"/>
    <path class="part g4" data-p="3" pathLength="1" d="M86 14v22"/>
    <circle class="part body" data-p="4" pathLength="1" cx="86" cy="44" r="10"/>
    <path class="part body" data-p="5" pathLength="1" d="M86 54v34"/>
    <path class="part body" data-p="6" pathLength="1" d="M86 62l-16 12"/>
    <path class="part body" data-p="7" pathLength="1" d="M86 62l16 12"/>
    <path class="part body" data-p="8" pathLength="1" d="M86 88l-14 22"/>
    <path class="part body" data-p="9" pathLength="1" d="M86 88l14 22"/>
  </svg></div>
  <div class="cat" id="hcat"></div>
  <div class="word" id="hword"></div>
  <div class="kb" id="hkb"></div>`;
  ctx.board.appendChild(wrap);
  const stage = wrap.querySelector(".stage");
  function pickWord() {
    const tier = BANK[Math.min(level - 1, BANK.length - 1)];
    const recent = ctx.store.get("recent", []);
    let pool = tier.w.filter((w) => !recent.includes(w));
    if (!pool.length) pool = tier.w;
    const w = pool[(Math.random() * pool.length) | 0];
    const nr = [...recent, w].slice(-8); ctx.store.set("recent", nr);
    return { w, c: tier.c };
  }
  function drawWord() {
    const hw = wrap.querySelector("#hword"); hw.innerHTML = "";
    [...word].forEach((ch) => { const s = document.createElement("div"); s.className = "slot" + (guessed.has(ch) ? " got" : ""); s.textContent = guessed.has(ch) ? ch : ""; hw.appendChild(s); });
  }
  function drawKb() {
    const kb = wrap.querySelector("#hkb"); kb.innerHTML = "";
    ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].forEach((row) => {
      const r = document.createElement("div"); r.className = "row";
      [...row].forEach((ch) => {
        const b = document.createElement("button"); b.type = "button"; b.textContent = ch;
        b.onclick = () => guess(ch, b); r.appendChild(b);
      });
      kb.appendChild(r);
    });
  }
  function updateStage() {
    stage.querySelectorAll(".part").forEach((p) => {
      const i = +p.dataset.p;
      p.classList.toggle("on", i < 4 || i - 4 < misses);
    });
  }
  function scorePill() { ctx.setScore("Won " + ctx.store.get("wins", 0)); }
  function guess(ch, btn) {
    if (over || guessed.has(ch)) return;
    guessed.add(ch); btn.disabled = true;
    if (word.includes(ch)) {
      btn.classList.add("hit"); ctx.sfx("match"); ctx.hx("tap");
      drawWord();
      if ([...word].every((c) => guessed.has(c))) return win();
    } else {
      btn.classList.add("miss"); misses++;
      ctx.sfx("bad"); ctx.hx("error");
      updateStage();
      if (misses >= MAXMISS) return lose();
    }
  }
  function win() {
    over = true; ctx.sfx("win"); ctx.hx("success");
    ctx.store.set("wins", ctx.store.get("wins", 0) + 1); scorePill();
    const r = ctx.fx.rectOf(wrap); ctx.fx.burst(r.x, r.y, null, 24, 120);
    const nl = Math.min(12, level + 1);
    timers.push(setTimeout(() => {
      ctx.actions("You got it: " + word + "!", level >= 12 ? "You beat every word tier." : "Level " + nl + " has trickier words",
        [{ label: level >= 12 ? "Keep playing" : "Next word", fn: () => { if (level < 12) ctx.setLevel(level + 1); ctx.restart(); } }]);
    }, 500));
  }
  function lose() {
    over = true; ctx.sfx("die"); ctx.hx("error");
    stage.classList.add("shake"); timers.push(setTimeout(() => stage.classList.remove("shake"), 300));
    [...word].forEach((ch) => guessed.add(ch)); drawWord();
    timers.push(setTimeout(() => {
      ctx.actions("It was " + word, "Level " + level + " again - new word, same tier",
        [{ label: "Try again", fn: () => ctx.restart() }]);
    }, 500));
  }
  const key = (e) => { const ch = e.key.toUpperCase(); if (/^[A-Z]$/.test(ch) && !over) { const btns = [...wrap.querySelectorAll(".kb button")]; const b = btns.find((x) => x.textContent === ch); if (b && !b.disabled) guess(ch, b); } };
  window.addEventListener("keydown", key);
  const pw = pickWord(); word = pw.w; cat = pw.c;
  misses = 0; guessed = new Set(); over = false;
  wrap.querySelector("#hcat").textContent = cat + " · " + word.length + " letters";
  drawWord(); drawKb(); updateStage(); scorePill();
  ctx.say("Guess the word, 6 misses allowed", "Tap letters or type");
  return { destroy() { window.removeEventListener("keydown", key); timers.forEach(clearTimeout); } };
});
