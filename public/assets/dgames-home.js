(() => {
  const GAMES = [
    {
      id: "tic-tac-toe",
      title: "Tic Tac Toe",
      category: "classic",
      genre: "Strategy",
      tag: "Mini",
      desc: "Beat a computer that gets sharper every time you win.",
      img: "/assets/covers/arcade-tic-tac-toe.svg",
      url: "/arcade/?embed=1#tic-tac-toe",
      time: "1-3 min",
      players: "1",
      mini: true,
    },
    {
      id: "snakes",
      title: "Snakes",
      category: "arcade",
      genre: "Classic",
      tag: "Mini",
      desc: "Swipe to steer, eat berries, outgrow your own tail. Speeds up as you go.",
      img: "/assets/covers/arcade-snakes.svg",
      url: "/arcade/?embed=1#snakes",
      time: "2-5 min",
      players: "1",
      mini: true,
    },
    {
      id: "memory",
      title: "Memory",
      category: "puzzle",
      genre: "Memory",
      tag: "Mini",
      desc: "Flip cards and find the pairs. Every cleared board is bigger.",
      img: "/assets/covers/arcade-memory.svg",
      url: "/arcade/?embed=1#memory",
      time: "2-5 min",
      players: "1",
      mini: true,
    },
    {
      id: "whack",
      title: "Whack-a-Mole",
      category: "action",
      genre: "Reflex",
      tag: "Mini",
      desc: "Tap the moles, skip the bombs. Faster every level.",
      img: "/assets/covers/arcade-whack.svg",
      url: "/arcade/?embed=1#whack",
      time: "1-3 min",
      players: "1",
      mini: true,
    },
    {
      id: "math",
      title: "Math Quiz",
      category: "puzzle",
      genre: "Brain",
      tag: "Mini",
      desc: "Beat the timer bar. Sums get harder as you climb.",
      img: "/assets/covers/arcade-math.svg",
      url: "/arcade/?embed=1#math",
      time: "2-4 min",
      players: "1",
      mini: true,
    },
    {
      id: "dots-boxes",
      title: "Dots and Boxes",
      category: "puzzle",
      genre: "Strategy",
      tag: "Mini",
      desc: "Close boxes against the computer on bigger and bigger boards.",
      img: "/assets/covers/arcade-dots-boxes.svg",
      url: "/arcade/?embed=1#dots-boxes",
      time: "3-8 min",
      players: "1",
      mini: true,
    },
    {
      id: "2048",
      title: "2048",
      category: "puzzle",
      genre: "Numbers",
      tag: "Mini",
      desc: "Swipe, merge, chase the target tile. Bigger boards up top.",
      img: "/assets/covers/arcade-2048.svg",
      url: "/arcade/?embed=1#2048",
      time: "3-8 min",
      players: "1",
      mini: true,
    },
    {
      id: "reaction",
      title: "Reaction Time",
      category: "action",
      genre: "Reflex",
      tag: "Mini",
      desc: "Tap the instant the orb turns lime. Dodge the fake flashes.",
      img: "/assets/covers/arcade-reaction.svg",
      url: "/arcade/?embed=1#reaction",
      time: "1-3 min",
      players: "1",
      mini: true,
    },
    {
      id: "hangman",
      title: "Hangman",
      category: "classic",
      genre: "Words",
      tag: "Mini",
      desc: "Guess the word before the drawing finishes. Words get rarer.",
      img: "/assets/covers/arcade-hangman.svg",
      url: "/arcade/?embed=1#hangman",
      time: "2-4 min",
      players: "1",
      mini: true,
    },
    {
      id: "slide",
      title: "Slide Puzzle",
      category: "puzzle",
      genre: "Brain",
      tag: "Mini",
      desc: "Slide the numbers home. Bigger grids, deeper shuffles.",
      img: "/assets/covers/arcade-slide.svg",
      url: "/arcade/?embed=1#slide",
      time: "2-6 min",
      players: "1",
      mini: true,
    },
    {
      id: "mines",
      title: "Minesweeper",
      category: "puzzle",
      genre: "Strategy",
      tag: "Mini",
      desc: "Read the numbers, dodge the mines, clear the board.",
      img: "/assets/covers/arcade-mines.svg",
      url: "/arcade/?embed=1#mines",
      time: "2-6 min",
      players: "1",
      mini: true,
    },
    {
      id: "simon",
      title: "Simon",
      category: "puzzle",
      genre: "Memory",
      tag: "Mini",
      desc: "Watch, listen, repeat. Chains grow longer and faster.",
      img: "/assets/covers/arcade-simon.svg",
      url: "/arcade/?embed=1#simon",
      time: "2-5 min",
      players: "1",
      mini: true,
    },
    {
      id: "imposter",
      title: "Imposter",
      category: "classic",
      genre: "Party",
      tag: "Social",
      desc: "Pass the phone, trade clues, and catch the one player who doesn't know the secret word.",
      img: "/assets/covers/imposter.svg",
      url: "/imposter/",
      players: "party",
      time: "5–12 min",
    },
    {
      id: "kite-run",
      title: "Kite Run",
      category: "arcade",
      genre: "Skill",
      tag: "Wind",
      desc: "Ride the gusts, steer your kite through gates, and stretch every flight.",
      img: "/assets/covers/kite-run.svg",
      url: "/kite-run/",
      time: "2–6 min",
    },
    {
      id: "letter-loom",
      title: "Letter Loom",
      category: "classic",
      genre: "Typing",
      tag: "Words",
      desc: "Weave each target word before the thread snaps; longer words arrive as your streak grows.",
      img: "/assets/covers/letter-loom.svg",
      url: "/letter-loom/",
      time: "2–5 min",
    },
    {
      id: "flockkeeper",
      title: "Flockkeeper",
      category: "arcade",
      genre: "Herding",
      tag: "Strategy",
      desc: "Guide a flock through the meadow gate while a fox and gusting wind disrupt your route.",
      img: "/assets/covers/flockkeeper.svg",
      url: "/flockkeeper/",
      time: "3–7 min",
    },
    {
      id: "pulse-memory",
      title: "Pulse Memory",
      category: "classic",
      genre: "Memory",
      tag: "Recall",
      desc: "Watch the pulse, then repeat the pattern as the grid grows and your streak gets longer.",
      img: "/assets/covers/pulse-memory.svg",
      url: "/pulse-memory/",
      time: "2–6 min",
    },
    {
      id: "circuit-stitch",
      title: "Circuit Stitch",
      category: "puzzle",
      genre: "Logic",
      tag: "Rotate",
      desc: "Rotate the wire tiles until power travels from the source to the target in as few moves as possible.",
      img: "/assets/covers/circuit-stitch.svg",
      url: "/circuit-stitch/",
      time: "2–7 min",
    },
    {
      id: "parcel-sort",
      title: "Parcel Sort",
      category: "arcade",
      genre: "Sorting",
      tag: "Streak",
      desc: "Read each parcel and route it to the matching bay before the belt carries it away.",
      img: "/assets/covers/parcel-sort.svg",
      url: "/parcel-sort/",
      time: "2–6 min",
    },
    {
      id: "echo-drift",
      title: "Echo Drift",
      category: "arcade",
      genre: "Arcade",
      tag: "Fast",
      desc: "Chain echoes, dodge pulse hazards, and keep the signal alive.",
      img: "/assets/covers/echo-drift.svg",
      url: "/echo-drift/",
      time: "2–5 min",
    },
    {
      id: "neon-tetris",
      title: "Neon Tetris",
      category: "puzzle",
      genre: "Puzzle",
      tag: "Classic",
      desc: "Drop, rotate, clear. Clean rules and endless score chasing.",
      img: "/assets/covers/neon-tetris.svg",
      url: "/neon-tetris/",
      time: "3–10 min",
    },
    {
      id: "neon-breakout",
      title: "Neon Breakout",
      category: "arcade",
      genre: "Arcade",
      tag: "Classic",
      desc: "Read the bounce, break the wall, build the combo.",
      img: "/assets/covers/neon-breakout.svg",
      url: "/neon-breakout/",
      time: "2–6 min",
    },
    {
      id: "cyber-road",
      title: "Cyber Road",
      category: "action",
      genre: "Racing",
      tag: "Run",
      desc: "Hold the line, thread the hazards, and push the distance.",
      img: "/assets/covers/cyber-road.svg",
      url: "/cyber-road/",
      time: "1–4 min",
    },
    {
      id: "neon-galaxy",
      title: "Neon Galaxy",
      category: "action",
      genre: "Shooter",
      tag: "Waves",
      desc: "Clear hostile waves and turn pressure into score.",
      img: "/assets/covers/neon-galaxy.svg",
      url: "/neon-galaxy/",
      time: "3–8 min",
    },
    {
      id: "tower-of-hue",
      title: "Tower of Hue",
      category: "puzzle",
      genre: "Puzzle",
      tag: "Precision",
      desc: "Place every block cleanly and build the tallest stack.",
      img: "/assets/covers/tower-of-hue.svg",
      url: "/tower-of-hue/",
      time: "2–5 min",
    },
    {
      id: "orbit-guard",
      title: "Orbit Guard",
      category: "action",
      genre: "Defense",
      tag: "Shield",
      desc: "Rotate your shield and keep the core safe under pressure.",
      img: "/assets/covers/orbit-guard.svg",
      url: "/orbit-guard/",
      time: "2–6 min",
    },
    {
      id: "ripple-reaction",
      title: "Ripple Reaction",
      category: "puzzle",
      genre: "Puzzle",
      tag: "Chain",
      desc: "Turn one ripple into a full-field cascade.",
      img: "/assets/covers/ripple-reaction.svg",
      url: "/ripple-reaction/",
      time: "1–4 min",
    },
    {
      id: "snake",
      title: "Neon Snake",
      category: "classic",
      genre: "Classic",
      tag: "Classic",
      desc: "Route the turns, grow the chain, beat your best.",
      img: "/assets/covers/neon-snake.svg",
      url: "/snake/",
      time: "2–7 min",
    },
    {
      id: "3xo",
      title: "3XO",
      category: "classic",
      genre: "Strategy",
      tag: "Table",
      desc: "A three-player board duel built for quick rematches.",
      img: "/assets/covers/3xo.svg",
      url: "/3xo.html",
      players: "3",
      time: "3–8 min",
    },
  ];
  const ALBUMS = [
    {
      title: "One more round",
      category: "arcade",
      glyph: "↻",
      desc: "Quick reflexes. Big little wins.",
    },
    {
      title: "Find your focus",
      category: "puzzle",
      glyph: "✳",
      desc: "Slow down. Think it through.",
    },
    {
      title: "Chase the rush",
      category: "action",
      glyph: "↗",
      desc: "Space battles & close calls.",
    },
  ];
  const UPCOMING = [
    {
      title: "Mini Metro",
      status: "Design notes",
      desc: "Route-building concept. Not playable yet.",
    },
    {
      title: "Rise Up",
      status: "Empty prototype",
      desc: "A work-in-progress slot. Not playable yet.",
    },
  ];
  function readFavorites() {
    try {
      const value = JSON.parse(
        localStorage.getItem("dgames-favorites") || "[]",
      );
      return Array.isArray(value)
        ? [...new Set(value)].filter((id) => GAMES.some((g) => g.id === id))
        : [];
    } catch {
      return [];
    }
  }

  function readRecent() {
    try {
      const v = JSON.parse(localStorage.getItem("dgames-recent") || "[]");
      return Array.isArray(v) ? v.filter((id) => GAMES.some((g) => g.id === id)).slice(0, 6) : [];
    } catch {
      return [];
    }
  }
  const playersOf = (g) => g.players || "1";
  const PLAYER_WORDS = (g) =>
    playersOf(g) === "1" ? "1 player solo single" : "multiplayer party friends " + playersOf(g) + " players";
  function levelOf(g) {
    if (!g.mini) return 0;
    try {
      return Number(JSON.parse(localStorage.getItem("dg1p:" + g.id + ":max")) || JSON.parse(localStorage.getItem("dg1p:" + g.id + ":level")) || 0);
    } catch {
      return 0;
    }
  }
  const ICONS = {
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 4 2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9L12 4Z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m9 6 9 6-9 6z"/></svg>',
    arrow:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m7 7 10 10M17 7 7 17"/></svg>',
    fullscreen:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4"/></svg>',
  };
  const icon = (name) => ICONS[name] || "";
  const state = {
    view: "home",
    category: "all",
    players: "all",
    search: "",
    featuredIndex: 0,
    recent: readRecent(),
    favorites: readFavorites(),
    modalGame: null,
    lastFocus: null,
  };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const gameById = (id) => GAMES.find((game) => game.id === id);
  const esc = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (ch) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[ch],
    );

  function saveFavorites() {
    try {
      localStorage.setItem("dgames-favorites", JSON.stringify(state.favorites));
    } catch {
      toast("Saving is unavailable in this browser.");
    }
  }
  function isFavorite(id) {
    return state.favorites.includes(id);
  }
  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("is-visible"), 1500);
  }
  function dailyGame() {
    return GAMES[0];
  }
  function filteredGames() {
    const query = state.search.toLowerCase();
    return GAMES.filter(
      (game) =>
        (state.category === "all" || game.category === state.category) &&
        (state.players === "all" ||
          (state.players === "1" ? playersOf(game) === "1" : playersOf(game) !== "1")) &&
        (!query ||
          [game.title, game.genre, game.desc, game.tag, game.category, PLAYER_WORDS(game)].some(
            (value) => value.toLowerCase().includes(query),
          )),
    );
  }
  const SECTIONS = [
    ["Solo mini-games", "Quick one-player rounds that get harder as you climb.", (g) => playersOf(g) === "1" && g.mini],
    ["Arcade & action", "Reflexes, rhythm and high scores.", (g) => playersOf(g) === "1" && !g.mini && ["arcade", "action"].includes(g.category)],
    ["Puzzle & brain", "Slow down and think it through.", (g) => playersOf(g) === "1" && !g.mini && g.category === "puzzle"],
    ["Classics", "Old favourites, freshly painted.", (g) => playersOf(g) === "1" && !g.mini && g.category === "classic"],
    ["Multiplayer & party", "Pass the phone or gather the table.", (g) => playersOf(g) !== "1"],
  ];
  function createCard(game, i) {
    const lv = levelOf(game);
    return (
      '<article class="dg-game-card" style="--i:' +
      ((i || 0) % 12) +
      '" data-game-id="' +
      esc(game.id) +
      '"><button class="dg-game-launch" type="button" aria-label="Play ' +
      esc(game.title) +
      '">' +
      '<div class="dg-game-art"><img src="' +
      esc(game.img) +
      '" alt="" width="640" height="420" loading="lazy" decoding="async">' +
      (lv > 1 ? '<span class="dg-lv">Lv ' + lv + "</span>" : "") +
      '<span class="dg-players">' +
      (playersOf(game) === "1" ? "1P" : playersOf(game) === "party" ? "Party" : playersOf(game) + "P") +
      "</span>" +
      '<div class="dg-game-hover" aria-hidden="true"><span>' +
      icon("play") +
      "</span></div></div>" +
      '<div class="dg-game-copy"><h3>' +
      esc(game.title) +
      '</h3><div class="dg-game-meta"><span>' +
      esc(game.genre) +
      '</span><span aria-hidden="true">·</span><span>' +
      esc(game.time) +
      '</span><span class="dg-game-tag">' +
      esc(game.tag) +
      "</span></div></div></button>" +
      '<button class="dg-save-btn ' +
      (isFavorite(game.id) ? "is-on" : "") +
      '" type="button" aria-pressed="' +
      isFavorite(game.id) +
      '" aria-label="' +
      (isFavorite(game.id) ? "Remove saved " : "Save ") +
      esc(game.title) +
      '">' +
      icon("star") +
      "</button></article>"
    );
  }
  function emptyState(title, copy, showAction) {
    return (
      '<div class="dg-empty" style="grid-column:1/-1;"><div><strong>' +
      esc(title) +
      "</strong><p>" +
      esc(copy) +
      "</p>" +
      (showAction
        ? '<button type="button" class="dg-empty-btn" data-clear-filters>Clear filters</button>'
        : "") +
      "</div></div>"
    );
  }
  function wireCards(root) {
    $$(".dg-game-card", root).forEach((card) => {
      const id = card.dataset.gameId;
      $(".dg-game-launch", card).addEventListener("click", () => openGame(id));
      $(".dg-save-btn", card).addEventListener("click", (event) =>
        toggleFavorite(id, event),
      );
    });
  }
  function renderGames() {
    const list = filteredGames();
    const solo = GAMES.filter((g) => playersOf(g) === "1" && g.mini);
    $("#home-solo-grid").innerHTML = solo.map(createCard).join("");
    $("#home-games-grid").innerHTML = GAMES.filter((g) => !g.mini).slice(0, 6).map(createCard).join("");
    const recent = state.recent.map(gameById).filter(Boolean);
    $("#recent-section").hidden = !recent.length;
    $("#home-recent-grid").innerHTML = recent.map(createCard).join("");
    const filtered = state.category !== "all" || state.players !== "all" || state.search;
    const sec = $("#all-games-sections"), flat = $("#all-games-grid");
    if (!filtered) {
      flat.hidden = true;
      sec.hidden = false;
      let n = 0;
      sec.innerHTML = SECTIONS.map(([title, desc, test]) => {
        const items = list.filter(test);
        if (!items.length) return "";
        return (
          '<section class="dg-section dg-group"><div class="dg-section-header"><div><h2>' + esc(title) + '</h2><p class="dg-group-desc">' + esc(desc) + '</p></div><span class="dg-result-count">' + items.length + '</span></div><div class="dg-game-grid">' +
          items.map((g) => createCard(g, n++)).join("") + "</div></section>"
        );
      }).join("");
    } else {
      sec.hidden = true;
      sec.innerHTML = "";
      flat.hidden = false;
      flat.innerHTML = list.length
        ? list.map(createCard).join("")
        : emptyState("Nothing here yet", "Try another search, genre or player count.", true);
    }
    ["#home-recent-grid", "#home-solo-grid", "#home-games-grid", "#all-games-sections", "#all-games-grid"].forEach((q) => wireCards($(q)));
    $("#result-count").textContent = list.length + " " + (list.length === 1 ? "game" : "games");
    $("#plays-count").textContent = GAMES.length;
    $("#saved-count").textContent = state.favorites.length;
  }
  function renderFavorites() {
    const list = state.favorites.map(gameById).filter(Boolean);
    $("#favorites-count").textContent = list.length + " saved";
    $("#saved-count").textContent = list.length;
    $("#favorites-grid").innerHTML = list.length
      ? list.map(createCard).join("")
      : emptyState(
          "Nothing saved",
          "Tap the star on any game to keep it here.",
        );
    wireCards($("#favorites-grid"));
  }
  function renderFeatured() {
    const game = GAMES[state.featuredIndex % GAMES.length];
    const art = $(".dg-featured-art"), copy = $(".dg-featured-copy");
    const apply = () => {
      $("#featured-image").src = game.img;
      $("#featured-image").alt = game.title + " artwork";
      $("#featured-title").textContent = game.title;
      $("#featured-desc").textContent = game.desc;
      $("#featured-genre").textContent = game.genre + " \u2022 " + (playersOf(game) === "1" ? "1 player" : "Multiplayer");
      $("#featured-time").textContent = game.time;
      $("#featured-tag").textContent = game.mini ? "Mini" : game.tag;
      $("#featured-play").dataset.gameId = game.id;
      art.classList.remove("is-swap");
      copy.classList.remove("is-swap");
    };
    if (renderFeatured.started) {
      art.classList.add("is-swap");
      copy.classList.add("is-swap");
      setTimeout(apply, 180);
    } else apply();
    renderFeatured.started = true;
  }
  function startRotation() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let paused = false;
    const f = $(".dg-featured");
    f.addEventListener("pointerenter", () => (paused = true));
    f.addEventListener("pointerleave", () => (paused = false));
    setInterval(() => {
      if (paused || state.view !== "home" || state.modalGame || document.hidden) return;
      state.featuredIndex = (state.featuredIndex + 1) % GAMES.length;
      renderFeatured();
    }, 6500);
  }
  function setPlayers(value) {
    state.players = value;
    $$("[data-players]").forEach((b) => b.classList.toggle("is-active", b.dataset.players === value));
    renderGames();
    if (state.view !== "plays") setView("plays");
  }
  function renderAlbums() {
    $("#albums-grid").innerHTML = ALBUMS.map(
      (album) =>
        '<button type="button" class="dg-album" data-collection="' +
        album.category +
        '"><div class="dg-album-icon" aria-hidden="true">' +
        album.glyph +
        "</div><h3>" +
        esc(album.title) +
        "</h3><span>" +
        GAMES.filter((g) => g.category === album.category).length +
        " games · " +
        esc(album.desc) +
        "</span></button>",
    ).join("");
    $$("[data-collection]").forEach((button) =>
      button.addEventListener("click", () => {
        clearSearch();
        setCategory(button.dataset.collection);
      }),
    );
  }
  function clearSearch() {
    state.search = "";
    $("#search-input").value = "";
    $("#search-clear").hidden = true;
  }
  function upcomingMarkup(limit) {
    return UPCOMING.slice(0, limit)
      .map(
        (item) =>
          '<article class="dg-upcoming-card"><div class="dg-upcoming-art"></div><div><span class="dg-upcoming-status">' +
          esc(item.status) +
          "</span><h3>" +
          esc(item.title) +
          "</h3><p>" +
          esc(item.desc) +
          "</p></div></article>",
      )
      .join("");
  }
  function renderUpcoming() {
    $("#upcoming-grid").innerHTML = upcomingMarkup(UPCOMING.length);
    $("#home-upcoming-grid").innerHTML = upcomingMarkup(2);
  }
  function setCategory(category) {
    state.category = category;
    $$("[data-category]").forEach((button) =>
      button.classList.toggle(
        "is-active",
        button.dataset.category === category,
      ),
    );
    renderGames();
    if (state.view !== "plays") setView("plays");
  }
  function setView(view) {
    state.view = view;
    $$(".dg-view").forEach((panel) =>
      panel.classList.toggle("is-active", panel.id === "view-" + view),
    );
    $$("[data-view]").forEach((button) =>
      button.classList.toggle("is-active", button.dataset.view === view),
    );
    $("#page-title").textContent =
      view === "home"
        ? "Home"
        : view === "plays"
          ? "Games"
          : view === "favorites"
            ? "Saved"
            : "Upcoming";
    window.scrollTo({ top: 0, behavior: "instant" });
    if (view === "favorites") renderFavorites();
  }
  function toggleFavorite(id, event) {
    event?.stopPropagation();
    state.favorites = isFavorite(id)
      ? state.favorites.filter((value) => value !== id)
      : [id, ...state.favorites];
    saveFavorites();
    renderGames();
    renderFavorites();
    $(
      '[data-game-id="' + id + '"] .dg-save-btn',
      $("#view-" + state.view),
    )?.focus({ preventScroll: true });
    toast(isFavorite(id) ? "Saved" : "Removed");
  }
  function openGame(id) {
    const game = gameById(id);
    if (!game) return;
    state.recent = [id, ...state.recent.filter((v) => v !== id)].slice(0, 6);
    try {
      localStorage.setItem("dgames-recent", JSON.stringify(state.recent));
    } catch {}
    state.modalGame = game;
    state.lastFocus = document.activeElement;
    $("#modal-title").textContent = game.title;
    $("#modal-genre").textContent = game.genre + " · " + game.time;
    $("#player-status").hidden = false;
    $("#game-iframe").title = game.title;
    $("#game-iframe").src = game.url;
    $("#game-modal").classList.add("is-open");
    document.body.classList.add("modal-open");
    $(".dg-app").inert = true;
    $("#modal-close").focus();
    clearTimeout(loadTimer);
    loadTimer = setTimeout(() => {
      if (state.modalGame) {
        $("#player-status").textContent =
          "Still loading? Use Restart above to try again.";
        $("#player-status").hidden = false;
      }
    }, 15000);
  }
  function closeGame() {
    $(".dg-app").inert = false;
    clearTimeout(loadTimer);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    $("#game-modal").classList.remove("is-open");
    $("#game-iframe").src = "about:blank";
    document.body.classList.remove("modal-open");
    if (state.lastFocus && state.lastFocus.focus)
      state.lastFocus.focus({ preventScroll: true });
    state.lastFocus = null;
    state.modalGame = null;
    renderGames();
  }
  function reloadGame() {
    const frame = $("#game-iframe"),
      current = frame.src;
    frame.src = "about:blank";
    requestAnimationFrame(() => {
      if (state.modalGame) frame.src = current;
    });
  }
  function toggleFullscreen() {
    const modal = $("#game-modal");
    if (!document.fullscreenElement)
      modal.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  }
  function bindSearch() {
    const input = $("#search-input"),
      shell = $("#search-shell");
    $("#search-toggle").addEventListener("click", () => {
      const open = shell.classList.toggle("is-open");
      $("#search-toggle").setAttribute("aria-expanded", String(open));
      if (open) requestAnimationFrame(() => input.focus());
    });
    $("#search-clear").addEventListener("click", () => {
      input.value = "";
      state.search = "";
      $("#search-clear").hidden = true;
      renderGames();
      input.focus();
    });
    input.addEventListener("input", (event) => {
      state.search = event.target.value.trim();
      $("#search-clear").hidden = !state.search;
      renderGames();
      if (state.search && state.view !== "plays") setView("plays");
    });
  }
  function bindNavigation() {
    $$("[data-view]").forEach((button) =>
      button.addEventListener("click", () => setView(button.dataset.view)),
    );
    $$("[data-category]").forEach((button) =>
      button.addEventListener("click", () =>
        setCategory(button.dataset.category),
      ),
    );
    $$("[data-players]").forEach((b) => b.addEventListener("click", () => setPlayers(b.dataset.players)));
    $$("[data-players-action]").forEach((b) => b.addEventListener("click", () => setPlayers(b.dataset.playersAction)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && !/input|textarea/i.test(document.activeElement.tagName) && !state.modalGame) {
        e.preventDefault();
        $("#search-shell").classList.add("is-open");
        $("#search-input").focus();
      }
    });
    $('[data-view-action="plays"]')?.addEventListener("click", () =>
      setView("plays"),
    );
    $('[data-view-action="upcoming"]')?.addEventListener("click", () =>
      setView("upcoming"),
    );
    $("#surprise-play").addEventListener("click", () =>
      openGame(GAMES[Math.floor(Math.random() * GAMES.length)].id),
    );
    $("#featured-play").addEventListener("click", () =>
      openGame($("#featured-play").dataset.gameId),
    );
    $("#modal-close").addEventListener("click", closeGame);
    $("#modal-reload").addEventListener("click", reloadGame);
    $("#modal-fullscreen").addEventListener("click", toggleFullscreen);
    $("#game-modal").addEventListener("click", (event) => {
      if (event.target === $("#game-modal")) closeGame();
    });
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-clear-filters]")) {
        state.search = "";
        state.category = "all";
        state.players = "all";
        $$("[data-players]").forEach((b) => b.classList.toggle("is-active", b.dataset.players === "all"));
        $("#search-input").value = "";
        $("#search-clear").hidden = true;
        $$("[data-category]").forEach((button) =>
          button.classList.toggle(
            "is-active",
            button.dataset.category === "all",
          ),
        );
        renderGames();
      }
    });
  }
  let loadTimer;
  const frame = $("#game-iframe");
  frame.addEventListener("load", () => {
    if (!state.modalGame) return;
    clearTimeout(loadTimer);
    $("#player-status").hidden = true;
    frame.contentWindow?.focus();
    try {
      frame.contentDocument.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeGame();
      });
    } catch {}
  });
  window.addEventListener("message", (event) => {
    if (
      event.source === frame.contentWindow &&
      event.origin === location.origin &&
      event.data?.type === "dgames:home"
    )
      closeGame();
  });
  document.addEventListener("keydown", (event) => {
    if (state.modalGame && event.key === "Tab") {
      const buttons = $$("button", $("#game-modal"));
      if (event.shiftKey && document.activeElement === buttons[0]) {
        event.preventDefault();
        buttons.at(-1).focus();
      } else if (!event.shiftKey && document.activeElement === frame) {
        event.preventDefault();
        buttons[0].focus();
      }
    }

    if (event.key === "Escape") {
      if ($("#game-modal").classList.contains("is-open")) closeGame();
      else if ($("#search-shell").classList.contains("is-open")) {
        $("#search-shell").classList.remove("is-open");
        $("#search-toggle").setAttribute("aria-expanded", "false");
      }
    }
  });
  document.addEventListener("fullscreenchange", () => {
    const btn = $("#modal-fullscreen"),
      active = !!document.fullscreenElement;
    btn.innerHTML = active
      ? icon("close")
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4"/></svg>';
    btn.setAttribute(
      "aria-label",
      active ? "Exit fullscreen" : "Enter fullscreen",
    );
  });
  renderFeatured();
  renderGames();
  renderFavorites();
  renderAlbums();
  renderUpcoming();
  bindSearch();
  bindNavigation();
  startRotation();
  const section = new URLSearchParams(location.search).get("section");
  if (section === "1p") setPlayers("1");
})();
