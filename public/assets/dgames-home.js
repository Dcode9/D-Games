
(() => {
  const GAMES = [
    { id:'echo-drift', title:'Echo Drift', category:'arcade', genre:'Arcade · High-Speed', tag:'SPOTLIGHT', desc:'A fast, tactile drift through a luminous signal field. Chain echoes, dodge pulse hazards, and keep the channel alive.', img:'assets/covers/echo-drift.svg', url:'/echo-drift/', pace:'FAST', players:'1P', time:'2–5 MIN' },
    { id:'neon-tetris', title:'Neon Tetris', category:'puzzle', genre:'Classic · Puzzle', tag:'CLASSIC', desc:'Falling blocks, clean rotations, rising pressure. Built for short sessions and long score chases.', img:'assets/covers/neon-tetris.svg', url:'/neon-tetris/', pace:'FOCUS', players:'1P', time:'3–10 MIN' },
    { id:'neon-breakout', title:'Neon Breakout', category:'arcade', genre:'Classic · Arcade', tag:'ARCADE', desc:'Read the bounce, break the wall, and stack up combos with a tight paddle and punchy feedback.', img:'assets/covers/neon-breakout.svg', url:'/neon-breakout/', pace:'FAST', players:'1P', time:'2–6 MIN' },
    { id:'cyber-road', title:'Cyber Road', category:'action', genre:'Racing · Retro', tag:'RUN', desc:'A synth-road endurance run. Thread the hazards, hold the line, and push the score without losing the rhythm.', img:'assets/covers/cyber-road.svg', url:'/cyber-road/', pace:'FAST', players:'1P', time:'1–4 MIN' },
    { id:'neon-galaxy', title:'Neon Galaxy', category:'action', genre:'Arcade · Shooter', tag:'WAVES', desc:'Clear hostile waves, keep the screen readable, and survive long enough to turn pressure into score.', img:'assets/covers/neon-galaxy.svg', url:'/neon-galaxy/', pace:'FAST', players:'1P', time:'3–8 MIN' },
    { id:'tower-of-hue', title:'Tower of Hue', category:'puzzle', genre:'Puzzle · Physics', tag:'PRECISION', desc:'Stack color blocks with controlled timing. Every clean placement buys you another layer.', img:'assets/covers/tower-of-hue.svg', url:'/tower-of-hue/', pace:'STEADY', players:'1P', time:'2–5 MIN' },
    { id:'orbit-guard', title:'Orbit Guard', category:'action', genre:'Action · Defense', tag:'DEFENSE', desc:'Rotate your shield and keep the core safe. Timing is everything when the field starts closing in.', img:'assets/covers/orbit-guard.svg', url:'/orbit-guard/', pace:'FAST', players:'1P', time:'2–6 MIN' },
    { id:'ripple-reaction', title:'Ripple Reaction', category:'puzzle', genre:'Casual · Chain Reaction', tag:'CHAIN', desc:'Place the right ripple at the right moment and turn a single click into a cascading field reaction.', img:'assets/covers/ripple-reaction.svg', url:'/ripple-reaction/', pace:'CALM', players:'1P', time:'1–4 MIN' },
    { id:'snake', title:'Neon Snake', category:'classic', genre:'Classic · Arcade', tag:'CLASSIC', desc:'The old rulebook with a cleaner control loop. Grow the chain, route the turns, beat your best.', img:'assets/covers/neon-snake.svg', url:'/snake/', pace:'STEADY', players:'1P', time:'2–7 MIN' },
    { id:'3xo', title:'3XO', category:'classic', genre:'Strategy · 3-Player', tag:'TABLE', desc:'A five-by-five three-player strategy duel. First to four in a row takes the board.', img:'assets/covers/3xo.svg', url:'/3xo.html', pace:'THINK', players:'3P', time:'3–8 MIN' }
  ];
  const ALBUMS=[{title:'Retro Vibes',count:'12 games',img:'assets/albums/retro-vibes.svg',copy:'Fast classics, familiar rules, fresh runs.'},{title:'Space Adventures',count:'8 games',img:'assets/albums/space-adventures.svg',copy:'Orbit, survive and push deeper.'},{title:'Neon Nights',count:'10 games',img:'assets/albums/neon-nights.svg',copy:'Electric arcade sessions after dark.'},{title:'Puzzle Masters',count:'7 games',img:'assets/albums/puzzle-masters.svg',copy:'Think clean. Move once. Repeat.'},{title:'Arcade Classics',count:'6 games',img:'assets/albums/arcade-classics.svg',copy:'Short loops built for high scores.'}];
  const UPCOMING = [
    { code:'01', title:'Mini Metro', status:'IN DEVELOPMENT', desc:'A tactile network-planning session built around routes, capacity, and clean decisions.' },
    { code:'02', title:'Rise Up', status:'PROTOTYPE', desc:'A reflex shield game designed around one-finger control and readable timing.' },
    { code:'03', title:'UNKNOWN FLIGHT', status:'CLASSIFIED', desc:'A new daily-scale experiment is being prepared for the hangar.' }
  ];

  const state = {
    view: 'home',
    category: 'all',
    search: '',
    favorites: JSON.parse(localStorage.getItem('dgames-favorites') || '[]'),
    recent: JSON.parse(localStorage.getItem('dgames-recent') || '[]'),
    modalGame: null,
    lastFocus: null
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const gameById = id => GAMES.find(g => g.id === id);

  function esc(value) {
    return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function icon(name) {
    const icons = {
      play:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="m9 6 9 6-9 6z"/></svg>',
      star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z"/></svg>'
    };
    return icons[name] || '';
  }

  function saveFavorites() { localStorage.setItem('dgames-favorites', JSON.stringify(state.favorites)); }
  function saveRecent() { localStorage.setItem('dgames-recent', JSON.stringify(state.recent.slice(0,6))); }
  function isFavorite(id) { return state.favorites.includes(id); }

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('is-visible'), 1800);
  }

  function toggleFavorite(id, event) {
    event?.stopPropagation();
    state.favorites = isFavorite(id) ? state.favorites.filter(v => v !== id) : [id].concat(state.favorites);
    saveFavorites();
    renderGames();
    toast(isFavorite(id) ? 'Pinned to the flight deck' : 'Removed from pinned');
  }

  function dailyGame() {
    const day = Math.floor(new Date().getTime() / 86400000);
    return GAMES[day % GAMES.length];
  }

  function filteredGames() {
    const query = state.search.toLowerCase();
    return GAMES.filter(g => {
      const categoryMatch = state.category === 'all' || g.category === state.category;
      const queryMatch = !query || [g.title,g.genre,g.desc,g.tag].some(v => v.toLowerCase().includes(query));
      return categoryMatch && queryMatch;
    });
  }

  function createCard(game, index) {
    return '<article class="dg-card" tabindex="0" role="button" data-game-id="' + esc(game.id) + '" aria-label="Play ' + esc(game.title) + '">' +
      '<div class="dg-card-media">' +
        '<img src="' + esc(game.img) + '" alt="" loading="lazy" decoding="async">' +
        '<span class="dg-card-plate">DG-' + String(index + 1).padStart(2,'0') + ' · ' + esc(game.tag) + '</span>' +
        '<button class="dg-fav ' + (isFavorite(game.id) ? 'is-on' : '') + '" type="button" aria-label="' + (isFavorite(game.id) ? 'Remove ' : 'Pin ') + esc(game.title) + '">' + icon('star') + '</button>' +
        '<div class="dg-card-overlay"><button class="dg-card-play" type="button">Launch</button></div>' +
      '</div>' +
      '<div class="dg-card-body">' +
        '<div class="dg-card-topline"><span class="dg-card-code">' + esc(game.genre) + '</span><span class="dg-status-dot"></span></div>' +
        '<h3 class="dg-card-title">' + esc(game.title) + '</h3>' +
        '<div class="dg-card-genre">' + esc(game.desc) + '</div>' +
        '<div class="dg-card-footer"><span class="dg-card-meta">' + esc(game.players) + ' · ' + esc(game.time) + '</span><span class="dg-card-meta">' + esc(game.pace) + '</span></div>' +
      '</div>' +
    '</article>';
  }

  function wireCardEvents(root) {
    $$('.dg-card', root).forEach(card => {
      const id = card.getAttribute('data-game-id');
      card.addEventListener('click', e => {
        if (e.target.closest('.dg-fav')) return;
        openGame(id);
      });
      card.addEventListener('keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.dg-fav')) {
          e.preventDefault();
          openGame(id);
        }
      });
      const fav = $('.dg-fav', card);
      fav?.addEventListener('click', e => toggleFavorite(id, e));
    });
  }

  function renderGames() {
    const list = filteredGames();
    const html = list.length ? list.map((g,i) => createCard(g,i)).join('') :
      '<div class="dg-empty" style="grid-column:1/-1;"><div><strong>No missions found</strong><p>Try a different search term or category.</p></div></div>';
    $('#home-games-grid').innerHTML = html;
    $('#all-games-grid').innerHTML = html;
    wireCardEvents($('#home-games-grid'));
    wireCardEvents($('#all-games-grid'));
    $('#result-count').textContent = list.length + ' OF ' + GAMES.length;
    $('#plays-count').textContent = list.length;
  }

  function renderFeatured() {
    const featured = dailyGame();
    $('#featured-image').src = featured.img;
    $('#featured-image').alt = featured.title;
    $('#featured-title').textContent = featured.title;
    $('#featured-desc').textContent = featured.desc;
    $('#featured-genre').textContent = featured.genre;
    $('#featured-tag').textContent = featured.tag;
    $('#featured-pace').textContent = featured.pace;
    $('#featured-time').textContent = featured.time;
    $('#featured-players').textContent = featured.players;
    $('#featured-play').dataset.gameId = featured.id;
    $('#featured-popout').href = featured.url;
    $('#daily-game-name').textContent = featured.title;
    $('#daily-game-copy').textContent = featured.desc;
  }

  function renderRecent() {
    const recentGames = state.recent.map(gameById).filter(Boolean);
    const section = $('#recent-section');
    if (!recentGames.length) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    $('#recent-grid').innerHTML = recentGames.map(game =>
      '<article class="dg-recent-card">' +
        '<img src="' + esc(game.img) + '" alt="" loading="lazy" decoding="async">' +
        '<div><h3 class="dg-recent-title">' + esc(game.title) + '</h3><div class="dg-recent-meta">' + esc(game.genre) + '<br>LAST PLAYED</div></div>' +
        '<button class="dg-mini-play" type="button" data-recent-id="' + esc(game.id) + '" aria-label="Resume ' + esc(game.title) + '">' + icon('play') + '</button>' +
      '</article>'
    ).join('');
    $$('.dg-mini-play').forEach(btn => btn.addEventListener('click', () => openGame(btn.dataset.recentId)));
  }

  function renderAlbums(){const el=document.getElementById('albums-grid');if(!el)return;el.innerHTML=ALBUMS.map((a,i)=>'<article class="dg-album" tabindex="0"><div class="dg-album-art"><img src="'+esc(a.img)+'" alt="" loading="lazy" decoding="async"><span>COLLECTION '+String(i+1).padStart(2,'0')+'</span></div><div class="dg-album-body"><h3>'+esc(a.title)+'</h3><p>'+esc(a.copy)+'</p><small>'+esc(a.count)+'</small></div></article>').join('');}

  function renderUpcoming() {
    $('#upcoming-grid').innerHTML = UPCOMING.map(u =>
      '<article class="dg-upcoming">' +
        '<div class="dg-upcoming-code">FLIGHT NOTE ' + esc(u.code) + '</div>' +
        '<div class="dg-upcoming-title">' + esc(u.title) + '</div>' +
        '<span class="dg-upcoming-status">' + esc(u.status) + '</span>' +
        '<p>' + esc(u.desc) + '</p>' +
      '</article>'
    ).join('');
  }

  function setView(view) {
    state.view = view;
    $$('.dg-view').forEach(v => v.classList.toggle('is-active', v.id === 'view-' + view));
    $$('.dg-nav [data-view], .dg-mobile-nav [data-view]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.view === view));
    const labels = {home:'Home', plays:'Instant Plays', upcoming:'Upcoming'};
    $('#page-title').firstChild.textContent = labels[view] + ' ';
    $('#page-sub').textContent = view === 'home' ? 'FIELD CONSOLE / DAILY PLAY' : view === 'plays' ? 'HANGAR / ALL TITLES' : 'FLIGHT PLAN / IN DEVELOPMENT';
    $('#content-scroll').scrollTop = 0;
  }

  function setCategory(category) {
    state.category = category;
    $$('.dg-category').forEach(btn => btn.classList.toggle('is-active', btn.dataset.category === category));
    renderGames();
    if (state.view !== 'plays') setView('plays');
  }

  function openGame(id) {
    const game = gameById(id);
    if (!game) return;
    state.modalGame = game;
    state.lastFocus = document.activeElement;
    state.recent = [game.id].concat(state.recent.filter(v => v !== game.id)).slice(0,6);
    saveRecent();
    renderRecent();
    $('#modal-title').textContent = game.title;
    $('#modal-genre').textContent = game.genre + ' · ' + game.players;
    $('#game-iframe').src = game.url;
    $('#game-modal').classList.add('is-open');
    document.body.style.overflow = 'hidden';
    $('#modal-close').focus();
  }

  function closeGame() {
    $('#game-modal').classList.remove('is-open');
    $('#game-iframe').src = 'about:blank';
    document.body.style.overflow = '';
    if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus({preventScroll:true});
    state.lastFocus = null;
    state.modalGame = null;
  }

  function reloadGame() {
    const frame = $('#game-iframe');
    const current = frame.src;
    frame.src = 'about:blank';
    requestAnimationFrame(() => { frame.src = current; });
  }

  function toggleFullscreen() {
    const modal = $('#game-modal');
    if (!document.fullscreenElement) modal.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  }

  function checkAuth() {
    fetch('https://authfordev.dverse.fun/api/user', {credentials:'include'})
      .then(res => res.ok ? res.json() : null)
      .then(user => {
        if (!user) return;
        $('#btn-signin').hidden = true;
        $('#btn-signout').hidden = false;
        $('#user-profile').classList.add('is-visible');
        $('#user-name').textContent = user.name || 'Player';
        $('#user-credits').textContent = String(user.credits || 0) + ' Credits';
        if (user.avatarUrl) $('#user-avatar').src = user.avatarUrl;
      })
      .catch(() => {});
  }

  function bindNavigation() {
    $$('.dg-nav [data-view], .dg-mobile-nav [data-view]').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));
    $$('.dg-category').forEach(btn => btn.addEventListener('click', () => setCategory(btn.dataset.category)));

    $('[data-view-action="plays"]')?.addEventListener('click', () => setView('plays'));

    $('#search-input').addEventListener('input', e => {
      state.search = e.target.value.trim();
      renderGames();
      if (state.search && state.view !== 'plays') setView('plays');
    });
    $('#search-focus').addEventListener('click', () => $('#search-input').focus());

    $('#featured-play').addEventListener('click', () => openGame($('#featured-play').dataset.gameId));
    $('#modal-close').addEventListener('click', closeGame);
    $('#modal-home').addEventListener('click', closeGame);
    $('#modal-reload').addEventListener('click', reloadGame);
    $('#modal-popout').addEventListener('click', () => { if (state.modalGame) window.open(state.modalGame.url, '_blank', 'noopener,noreferrer'); });
    $('#modal-fullscreen').addEventListener('click', toggleFullscreen);
    $('#game-modal').addEventListener('click', e => { if (e.target === $('#game-modal')) closeGame(); });

    $('#btn-signin').addEventListener('click', () => { location.href = 'https://authfordev.dverse.fun/login?redirect_url=' + encodeURIComponent(location.href.split('?')[0]); });
    $('#btn-signout').addEventListener('click', () => { location.href = 'https://authfordev.dverse.fun/logout?redirect_url=' + encodeURIComponent(location.href); });
  }

  function bindKeyboard() {
    document.addEventListener('keydown', e => {
      const modalOpen = $('#game-modal').classList.contains('is-open');
      if (e.key === '/' && !modalOpen && document.activeElement !== $('#search-input')) {
        e.preventDefault(); $('#search-input').focus(); return;
      }
      if (e.key === 'Escape' && modalOpen) { e.preventDefault(); closeGame(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); $('#search-input').focus(); return;
      }
      if (!modalOpen && ['1','2','3'].includes(e.key)) {
        setView(e.key === '1' ? 'home' : e.key === '2' ? 'plays' : 'upcoming');
      }
    });
  }

  window.addEventListener('message', e => {
    if (e?.data?.type === 'dgames:home') closeGame();
  });

  document.addEventListener('fullscreenchange', () => {
    const btn = $('#modal-fullscreen');
    const active = !!document.fullscreenElement;
    btn.textContent = active ? 'EXIT FULLSCREEN' : 'FULLSCREEN';
    btn.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
  });

  renderFeatured();
  renderGames();
  renderRecent();
  renderAlbums();
  renderUpcoming();
  bindNavigation();
  bindKeyboard();
  checkAuth();
})();
