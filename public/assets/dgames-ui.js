
(() => {
  if (window.__DGAMES_CHROME__) return;
  window.__DGAMES_CHROME__ = true;

  const rawTitle = document.title.replace(/\s*[—-]\s*D['’]Games.*$/i, '').trim();
  const title = rawTitle || 'D’GAME';
  const root = document.createElement('div');
  root.className = 'dg-chrome';
  root.innerHTML = [
    '<span class="dg-corner a" aria-hidden="true"></span>',
    '<span class="dg-corner b" aria-hidden="true"></span>',
    '<span class="dg-corner c" aria-hidden="true"></span>',
    '<span class="dg-corner d" aria-hidden="true"></span>',
    '<div class="dg-top">',
      '<div class="dg-brand">',
        '<span class="dg-mark" aria-hidden="true">D</span>',
        '<span class="dg-title-wrap"><span class="dg-title" data-title></span><span class="dg-live">D\\'GAMES · FIELD CONSOLE</span></span>',
      '</div>',
      '<div class="dg-actions">',
        '<button class="dg-btn" type="button" data-action="home" aria-label="Back to D\\'Games" aria-keyshortcuts="Alt+ArrowLeft"><span class="dg-btn-label"><span class="dg-btn-glyph">⌂</span><span>DECK</span></span></button>',
        '<button class="dg-btn" type="button" data-action="restart" aria-label="Restart game" aria-keyshortcuts="r"><span class="dg-btn-label"><span class="dg-btn-glyph">↻</span><span>RESET</span></span></button>',
        '<button class="dg-btn" type="button" data-action="fullscreen" aria-label="Enter fullscreen" aria-keyshortcuts="f"><span class="dg-btn-label"><span class="dg-btn-glyph">⛶</span><span>FULL</span></span></button>',
      '</div>',
    '</div>',
    '<div class="dg-hud-tag" aria-hidden="true">D\\'GAMES / INPUT LINK / READY</div>',
    '<div class="dg-bottom">',
      '<div class="dg-status" role="status" aria-live="polite">',
        '<span class="dg-led" aria-hidden="true"></span>',
        '<span class="dg-status-copy"><span class="dg-status-main" data-status>LIVE INPUT</span><span class="dg-status-sub" data-sub>TOUCH / KEYBOARD · F1 HELP</span></span>',
      '</div>',
      '<div class="dg-meter" aria-hidden="true">',
        '<div class="dg-meter-head"><span>SYSTEM LOAD</span><span data-meter-label>READY</span></div>',
        '<div class="dg-meter-track"><div class="dg-meter-fill"></div></div>',
      '</div>',
    '</div>'
  ].join('');

  root.querySelector('[data-title]').textContent = title;
  document.body.appendChild(root);

  const home = () => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({type:'dgames:home'}, '*');
    } else {
      window.location.href = '/';
    }
  };

  const restart = () => window.location.reload();

  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };

  root.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      if (action === 'home') home();
      if (action === 'restart') restart();
      if (action === 'fullscreen') fullscreen();
    });
  });

  document.addEventListener('fullscreenchange', () => {
    const btn = root.querySelector('[data-action="fullscreen"]');
    const active = !!document.fullscreenElement;
    btn.querySelector('.dg-btn-glyph').textContent = active ? '×' : '⛶';
    btn.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
  });

  document.addEventListener('keydown', event => {
    if ((event.key === 'r' || event.key === 'R') && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const tag = document.activeElement?.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'BUTTON') restart();
    }
    if ((event.key === 'f' || event.key === 'F') && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const tag = document.activeElement?.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'BUTTON') fullscreen();
    }
    if (event.altKey && event.key === 'ArrowLeft') home();
  });

  // A lightweight meter keeps the shared console useful across different games
  // without requiring game-specific APIs.
  const fill = root.querySelector('.dg-meter-fill');
  const meterLabel = root.querySelector('[data-meter-label]');
  let lastWidth = 68;

  const readNumber = selectors => {
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      if (!node) continue;
      const value = Number.parseFloat((node.textContent || '').replace(/[^0-9.\\-]/g, ''));
      if (Number.isFinite(value)) return value;
    }
    return null;
  };

  const updateMeter = () => {
    const energyNode = document.querySelector('#energy');
    if (energyNode) {
      const match = (energyNode.style.width || '').match(/([0-9.]+)/);
      if (match) lastWidth = Math.max(4, Math.min(100, Number(match[1])));
      meterLabel.textContent = 'ENERGY';
    } else {
      const health = readNumber(['#health', '#hud-health']);
      if (health !== null && health <= 100) {
        lastWidth = Math.max(4, Math.min(100, health));
        meterLabel.textContent = 'SHIELD';
      } else {
        const score = readNumber(['#score', '#hud-score', '#s']);
        lastWidth = score === null ? 68 : 45 + (Math.abs(score) % 55);
        meterLabel.textContent = 'RUN';
      }
    }
    fill.style.width = lastWidth + '%';
  };

  updateMeter();
  const observer = new MutationObserver(updateMeter);
  observer.observe(document.body, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['style','class']});
  setInterval(updateMeter, 750);

  const status = root.querySelector('[data-status]');
  const sub = root.querySelector('[data-sub]');
  let lastPointer = performance.now();

  const setActive = () => {
    lastPointer = performance.now();
    status.textContent = 'LIVE INPUT';
    sub.textContent = 'TOUCH / KEYBOARD · SIGNAL GOOD';
    root.querySelector('.dg-led').style.background = 'var(--dg-olive)';
  };
  window.addEventListener('pointerdown', setActive, {passive:true});
  window.addEventListener('keydown', setActive);

  setInterval(() => {
    if (performance.now() - lastPointer > 4500) {
      status.textContent = document.hidden ? 'STANDBY' : 'READY';
      sub.textContent = document.hidden ? 'TAB HIDDEN · INPUT PAUSED' : 'TOUCH / KEYBOARD · AWAITING INPUT';
    }
  }, 1200);

  window.addEventListener('blur', () => {
    status.textContent = 'STANDBY';
    sub.textContent = 'WINDOW UNFOCUSED · RESUME INPUT';
  });
})();
