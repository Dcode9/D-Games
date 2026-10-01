(() => {
  if (window.__DGAMES_CHROME__) return;
  window.__DGAMES_CHROME__ = true;

  const title = document.title.replace(/\s*[—-]\s*D['’]Games.*$/i, '').trim() || 'D’GAME';
  const root = document.createElement('div');
  root.className = 'dg-chrome';
  root.innerHTML = `
    <div class="dg-top">
      <div class="dg-brand">
        <span class="dg-mark" aria-hidden="true">D</span>
        <span><span class="dg-title"></span><span class="dg-live">D'GAMES · LIVE INPUT</span></span>
      </div>
      <div class="dg-actions">
        <button class="dg-btn" type="button" data-action="home" aria-label="Back to D'Games">⌂</button>
        <button class="dg-btn" type="button" data-action="restart" aria-label="Restart game">↻</button>
        <button class="dg-btn" type="button" data-action="fullscreen" aria-label="Enter fullscreen">⛶</button>
      </div>
    </div>
    <div class="dg-bottom">
      <div class="dg-status">
        <span class="dg-led" aria-hidden="true"></span>
        <span class="dg-status-copy"><span class="dg-status-main">LIVE INPUT</span><span class="dg-status-sub">TOUCH / KEYBOARD</span></span>
      </div>
      <div class="dg-meter" aria-hidden="true"><div class="dg-meter-track"><div class="dg-meter-fill"></div></div></div>
    </div>`;
  root.querySelector('.dg-title').textContent = title;
  document.body.appendChild(root);

  const action = (name) => {
    if (name === 'home') location.href = '/';
    if (name === 'restart') location.reload();
    if (name === 'fullscreen') {
      if (document.fullscreenElement) document.exitFullscreen?.();
      else document.documentElement.requestFullscreen?.().catch(() => {});
    }
  };
  root.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => action(btn.dataset.action)));
  document.addEventListener('fullscreenchange', () => {
    const btn = root.querySelector('[data-action="fullscreen"]');
    const active = !!document.fullscreenElement;
    btn.textContent = active ? '×' : '⛶';
    btn.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
  });

  // Keep the shared chrome out of the game pointer path except for its buttons.
  root.querySelectorAll('button').forEach(btn => btn.style.pointerEvents = 'auto');
})();