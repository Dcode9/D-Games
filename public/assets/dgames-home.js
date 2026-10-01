(() => {
  const GAMES = [
    {id:'echo-drift',title:'Echo Drift',category:'arcade',genre:'Arcade',tag:'Fast',desc:'Chain echoes, dodge pulse hazards, and keep the signal alive.',img:'/assets/covers/echo-drift.svg',url:'/echo-drift/',time:'2–5 min'},
    {id:'neon-tetris',title:'Neon Tetris',category:'puzzle',genre:'Puzzle',tag:'Classic',desc:'Drop, rotate, clear. Clean rules and endless score chasing.',img:'/assets/covers/neon-tetris.svg',url:'/neon-tetris/',time:'3–10 min'},
    {id:'neon-breakout',title:'Neon Breakout',category:'arcade',genre:'Arcade',tag:'Classic',desc:'Read the bounce, break the wall, build the combo.',img:'/assets/covers/neon-breakout.svg',url:'/neon-breakout/',time:'2–6 min'},
    {id:'cyber-road',title:'Cyber Road',category:'action',genre:'Racing',tag:'Run',desc:'Hold the line, thread the hazards, and push the distance.',img:'/assets/covers/cyber-road.svg',url:'/cyber-road/',time:'1–4 min'},
    {id:'neon-galaxy',title:'Neon Galaxy',category:'action',genre:'Shooter',tag:'Waves',desc:'Clear hostile waves and turn pressure into score.',img:'/assets/covers/neon-galaxy.svg',url:'/neon-galaxy/',time:'3–8 min'},
    {id:'tower-of-hue',title:'Tower of Hue',category:'puzzle',genre:'Puzzle',tag:'Precision',desc:'Place every block cleanly and build the tallest stack.',img:'/assets/covers/tower-of-hue.svg',url:'/tower-of-hue/',time:'2–5 min'},
    {id:'orbit-guard',title:'Orbit Guard',category:'action',genre:'Defense',tag:'Shield',desc:'Rotate your shield and keep the core safe under pressure.',img:'/assets/covers/orbit-guard.svg',url:'/orbit-guard/',time:'2–6 min'},
    {id:'ripple-reaction',title:'Ripple Reaction',category:'puzzle',genre:'Puzzle',tag:'Chain',desc:'Turn one ripple into a full-field cascade.',img:'/assets/covers/ripple-reaction.svg',url:'/ripple-reaction/',time:'1–4 min'},
    {id:'snake',title:'Neon Snake',category:'classic',genre:'Classic',tag:'Classic',desc:'Route the turns, grow the chain, beat your best.',img:'/assets/covers/neon-snake.svg',url:'/snake/',time:'2–7 min'},
    {id:'3xo',title:'3XO',category:'classic',genre:'Strategy',tag:'Table',desc:'A three-player board duel built for quick rematches.',img:'/assets/covers/3xo.svg',url:'/3xo.html',time:'3–8 min'}
  ];
  const ALBUMS=[
    {title:'Retro Vibes',count:'12 games',img:'/assets/albums/retro-vibes.svg'},
    {title:'Space Adventures',count:'8 games',img:'/assets/albums/space-adventures.svg'},
    {title:'Neon Nights',count:'10 games',img:'/assets/albums/neon-nights.svg'},
    {title:'Puzzle Masters',count:'7 games',img:'/assets/albums/puzzle-masters.svg'},
    {title:'Arcade Classics',count:'6 games',img:'/assets/albums/arcade-classics.svg'}
  ];
  const UPCOMING=[
    {title:'Mini Metro',status:'In development',desc:'Build routes. Balance capacity.'},
    {title:'Rise Up',status:'Prototype',desc:'One-finger defense and timing.'},
    {title:'Unknown Flight',status:'In progress',desc:'A new short-session experiment.'}
  ];

  const ICONS={
    star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m12 4 2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9L12 4Z"/></svg>',
    play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m9 6 9 6-9 6z"/></svg>',
    arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
    close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m7 7 10 10M17 7 7 17"/></svg>',
    fullscreen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4"/></svg>'
  };
  const icon=name=>ICONS[name]||'';
  const state={
    view:'home',
    category:'all',
    search:'',
    favorites:JSON.parse(localStorage.getItem('dgames-favorites')||'[]'),
    modalGame:null,
    lastFocus:null
  };
  const $=(sel,root=document)=>root.querySelector(sel);
  const $$=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
  const gameById=id=>GAMES.find(game=>game.id===id);
  const esc=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function saveFavorites(){localStorage.setItem('dgames-favorites',JSON.stringify(state.favorites));}
  function isFavorite(id){return state.favorites.includes(id);}
  function toast(message){
    const el=$('#toast');el.textContent=message;el.classList.add('is-visible');
    clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('is-visible'),1500);
  }
  function dailyGame(){return GAMES[Math.floor(Date.now()/86400000)%GAMES.length];}
  function filteredGames(){
    const query=state.search.toLowerCase();
    return GAMES.filter(game=>(state.category==='all'||game.category===state.category)&&(!query||[game.title,game.genre,game.desc,game.tag].some(value=>value.toLowerCase().includes(query))));
  }
  function createCard(game){
    return '<article class="dg-game-card" tabindex="0" role="button" data-game-id="'+esc(game.id)+'" aria-label="Play '+esc(game.title)+'">'+
      '<div class="dg-game-art"><img src="'+esc(game.img)+'" alt="" loading="lazy" decoding="async">'+
      '<div class="dg-game-hover" aria-hidden="true"><span>'+icon('play')+'</span></div>'+
      '<button class="dg-save-btn '+(isFavorite(game.id)?'is-on':'')+'" type="button" aria-label="'+(isFavorite(game.id)?'Remove ':'Save ')+esc(game.title)+'">'+icon('star')+'</button></div>'+
      '<div class="dg-game-copy"><h3>'+esc(game.title)+'</h3><div class="dg-game-meta"><span>'+esc(game.genre)+'</span><span aria-hidden="true">•</span><span>'+esc(game.time)+'</span></div></div></article>';
  }
  function emptyState(title,copy,showAction){
    return '<div class="dg-empty" style="grid-column:1/-1;"><div><strong>'+esc(title)+'</strong><p>'+esc(copy)+'</p>'+(showAction?'<button type="button" class="dg-empty-btn" data-clear-filters>Clear filters</button>':'')+'</div></div>';
  }
  function wireCards(root){
    $$('.dg-game-card',root).forEach(card=>{
      const id=card.dataset.gameId;
      card.addEventListener('click',event=>{if(!event.target.closest('.dg-save-btn'))openGame(id);});
      card.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&!event.target.closest('.dg-save-btn')){event.preventDefault();openGame(id);}});
      $('.dg-save-btn',card)?.addEventListener('click',event=>toggleFavorite(id,event));
    });
  }
  function renderGames(){
    const list=filteredGames();
    const limited=list.slice(0,6);
    $('#home-games-grid').innerHTML=limited.length?limited.map(createCard).join(''):emptyState('No games found','Try another search or genre.');
    $('#all-games-grid').innerHTML=list.length?list.map(createCard).join(''):emptyState('Nothing here yet','Try another search or genre.',true);
    wireCards($('#home-games-grid'));wireCards($('#all-games-grid'));
    $('#result-count').textContent=list.length+' '+(list.length===1?'game':'games');
    $('#plays-count').textContent=list.length;
    $('#saved-count').textContent=state.favorites.length;
  }
  function renderFavorites(){
    const list=state.favorites.map(gameById).filter(Boolean);
    $('#favorites-count').textContent=list.length+' saved';
    $('#saved-count').textContent=list.length;
    $('#favorites-grid').innerHTML=list.length?list.map(createCard).join(''):emptyState('Nothing saved','Tap the star on any game to keep it here.');
    wireCards($('#favorites-grid'));
  }
  function renderFeatured(){
    const game=dailyGame();
    $('#featured-image').src=game.img;
    $('#featured-image').alt=game.title+' artwork';
    $('#featured-title').textContent=game.title;
    $('#featured-desc').textContent=game.desc;
    $('#featured-genre').textContent=game.genre;
    $('#featured-time').textContent=game.time;
    $('#featured-tag').textContent=game.tag;
    $('#featured-play').dataset.gameId=game.id;
  }
  function renderAlbums(){
    $('#albums-grid').innerHTML=ALBUMS.map(album=>'<article class="dg-album"><img src="'+esc(album.img)+'" alt="" loading="lazy" decoding="async"><div><h3>'+esc(album.title)+'</h3><span>'+esc(album.count)+'</span></div></article>').join('');
  }
  function upcomingMarkup(limit){
    return UPCOMING.slice(0,limit).map(item=>'<article class="dg-upcoming-card"><div class="dg-upcoming-art"></div><div><span class="dg-upcoming-status">'+esc(item.status)+'</span><h3>'+esc(item.title)+'</h3><p>'+esc(item.desc)+'</p></div></article>').join('');
  }
  function renderUpcoming(){
    $('#upcoming-grid').innerHTML=upcomingMarkup(UPCOMING.length);
    $('#home-upcoming-grid').innerHTML=upcomingMarkup(2);
  }
  function setCategory(category){
    state.category=category;
    $$('[data-category]').forEach(button=>button.classList.toggle('is-active',button.dataset.category===category));
    renderGames();
    if(state.view!=='plays')setView('plays');
  }
  function setView(view){
    state.view=view;
    $$('.dg-view').forEach(panel=>panel.classList.toggle('is-active',panel.id==='view-'+view));
    $$('[data-view]').forEach(button=>button.classList.toggle('is-active',button.dataset.view===view));
    $('#page-title').textContent=view==='home'?'Home':view==='plays'?'Games':view==='favorites'?'Saved':'Upcoming';
    $('#content-scroll').scrollTop=0;
    if(view==='favorites')renderFavorites();
  }
  function toggleFavorite(id,event){
    event?.stopPropagation();
    state.favorites=isFavorite(id)?state.favorites.filter(value=>value!==id):[id,...state.favorites];
    saveFavorites();renderGames();renderFavorites();toast(isFavorite(id)?'Saved':'Removed');
  }
  function openGame(id){
    const game=gameById(id);if(!game)return;
    state.modalGame=game;state.lastFocus=document.activeElement;
    $('#modal-title').textContent=game.title;$('#modal-genre').textContent=game.genre+' · '+game.time;
    $('#game-iframe').src=game.url;$('#game-modal').classList.add('is-open');document.body.classList.add('modal-open');
    $('#modal-close').focus();
  }
  function closeGame(){
    $('#game-modal').classList.remove('is-open');$('#game-iframe').src='about:blank';document.body.classList.remove('modal-open');
    if(state.lastFocus&&state.lastFocus.focus)state.lastFocus.focus({preventScroll:true});
    state.lastFocus=null;state.modalGame=null;
  }
  function reloadGame(){
    const frame=$('#game-iframe'),current=frame.src;frame.src='about:blank';
    requestAnimationFrame(()=>{frame.src=current;});
  }
  function toggleFullscreen(){
    const modal=$('#game-modal');
    if(!document.fullscreenElement)modal.requestFullscreen?.().catch(()=>{});else document.exitFullscreen?.().catch(()=>{});
  }
  function bindSearch(){
    const input=$('#search-input'),shell=$('#search-shell');
    $('#search-toggle').addEventListener('click',()=>{
      const open=shell.classList.toggle('is-open');$('#search-toggle').setAttribute('aria-expanded',String(open));
      if(open)requestAnimationFrame(()=>input.focus());
    });
    $('#search-clear').addEventListener('click',()=>{
      input.value='';state.search='';$('#search-clear').hidden=true;renderGames();input.focus();
    });
    input.addEventListener('input',event=>{
      state.search=event.target.value.trim();$('#search-clear').hidden=!state.search;renderGames();
      if(state.search&&state.view!=='plays')setView('plays');
    });
  }
  function bindNavigation(){
    $$('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
    $$('[data-category]').forEach(button=>button.addEventListener('click',()=>setCategory(button.dataset.category)));
    $('[data-view-action="plays"]')?.addEventListener('click',()=>setView('plays'));
    $('[data-view-action="upcoming"]')?.addEventListener('click',()=>setView('upcoming'));
    $('#featured-play').addEventListener('click',()=>openGame($('#featured-play').dataset.gameId));
    $('#modal-close').addEventListener('click',closeGame);
    $('#modal-reload').addEventListener('click',reloadGame);
    $('#modal-fullscreen').addEventListener('click',toggleFullscreen);
    $('#game-modal').addEventListener('click',event=>{if(event.target===$('#game-modal'))closeGame();});
    document.addEventListener('click',event=>{
      if(event.target.closest('[data-clear-filters]')){
        state.search='';state.category='all';$('#search-input').value='';$('#search-clear').hidden=true;
        $$('[data-category]').forEach(button=>button.classList.toggle('is-active',button.dataset.category==='all'));renderGames();
      }
    });
  }
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      if($('#game-modal').classList.contains('is-open'))closeGame();
      else if($('#search-shell').classList.contains('is-open')){$('#search-shell').classList.remove('is-open');$('#search-toggle').setAttribute('aria-expanded','false');}
    }
  });
  document.addEventListener('fullscreenchange',()=>{
    const btn=$('#modal-fullscreen'),active=!!document.fullscreenElement;
    btn.innerHTML=active?icon('close'):'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4"/></svg>';
    btn.setAttribute('aria-label',active?'Exit fullscreen':'Enter fullscreen');
  });
  renderFeatured();renderGames();renderFavorites();renderAlbums();renderUpcoming();bindSearch();bindNavigation();
})();