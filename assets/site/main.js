// Theme preference, active section navigation, and the footer year.
(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme');

  function applyTheme(dark) {
    root.dataset.theme = dark ? 'dark' : 'light';
    themeButton.textContent = dark ? '☀' : '☾';
    themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeButton.setAttribute('aria-pressed', String(dark));
  }

  let savedTheme;
  try {
    savedTheme = localStorage.getItem('guo-theme');
  } catch {
    // The site also works when browser storage is unavailable.
  }
  applyTheme(savedTheme ? savedTheme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches);

  themeButton.addEventListener('click', () => {
    const dark = root.dataset.theme !== 'dark';
    applyTheme(dark);
    try {
      localStorage.setItem('guo-theme', dark ? 'dark' : 'light');
    } catch {
      // Keep the selected theme for this page even if it cannot be saved.
    }
  });

  const navigationLinks = [...document.querySelectorAll('nav a')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        navigationLinks.forEach((link) => {
          if (link.hash === '#' + entry.target.id) {
            link.setAttribute('aria-current', 'location');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      }
    }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
    document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
  }

  // Phone menu: the Menu button shows or hides the section list; choosing a
  // section or pressing Escape closes it again.
  const topbar = document.querySelector('.topbar');
  const menuButton = document.querySelector('.menu-btn');
  if (topbar && menuButton) {
    const setMenu = (open) => {
      topbar.classList.toggle('open', open);
      menuButton.setAttribute('aria-expanded', String(open));
    };
    menuButton.addEventListener('click', () => setMenu(!topbar.classList.contains('open')));
    navigationLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
    addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && topbar.classList.contains('open')) {
        setMenu(false);
        menuButton.focus();
      }
    });
  }

  // Show the five most recent News entries and leave the rest behind a
  // scroll. The sixth entry's position sets the height, so the cap adapts to
  // wrapping and to the viewport; a sliver of it stays visible as the cue that
  // more follows. With this script absent, no cap applies and the list shows
  // in full.
  const VISIBLE_ENTRIES = 5;
  const MAX_PEEK = 40;
  const scrollRegions = [
    ['.news-scroll', '.news-list > li'],
  ];

  function capScrollRegions() {
    for (const [container, entries] of scrollRegions) {
      const region = document.querySelector(container);
      if (!region) continue;
      region.style.maxHeight = '';
      const items = region.querySelectorAll(entries);
      if (items.length <= VISIBLE_ENTRIES) continue;
      const top = region.getBoundingClientRect().top;
      const next = items[VISIBLE_ENTRIES].getBoundingClientRect();
      // Never reveal the sixth entry in full, or it stops reading as a cue.
      const peek = Math.min(MAX_PEEK, next.height / 2);
      region.style.maxHeight = Math.round(next.top - top + peek) + 'px';
    }
  }

  capScrollRegions();

  // Some browsers (notably Safari and Mac trackpads) keep a scroll gesture
  // locked inside a list even after it reaches its end. When a list can't
  // scroll any further in the wheel's direction, scroll the page instead.
  const LINE_HEIGHT = 16;
  for (const [container] of scrollRegions) {
    const region = document.querySelector(container);
    if (!region) continue;
    region.addEventListener('wheel', (event) => {
      if (event.ctrlKey || event.deltaY === 0) return; // pinch-zoom or sideways
      const atTop = region.scrollTop <= 0;
      const atBottom = region.scrollTop + region.clientHeight >= region.scrollHeight - 1;
      if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) {
        event.preventDefault();
        const scale = event.deltaMode === 1 ? LINE_HEIGHT : event.deltaMode === 2 ? innerHeight : 1;
        scrollBy({ top: event.deltaY * scale, behavior: 'instant' });
      }
    }, { passive: false });
  }

  let capTimer;
  addEventListener('resize', () => {
    clearTimeout(capTimer);
    capTimer = setTimeout(capScrollRegions, 150);
  });

  document.querySelector('.footer [data-year]').textContent = new Date().getFullYear();
})();
