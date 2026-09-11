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

  // Show the five most recent entries in a list and leave the rest behind a
  // scroll. The sixth entry's position sets the height, so the cap adapts to
  // wrapping and to the viewport; a sliver of it stays visible as the cue that
  // more follows. With this script absent, no cap applies and both lists show
  // in full.
  const VISIBLE_ENTRIES = 5;
  const MAX_PEEK = 40;
  const scrollRegions = [
    ['.news-scroll', '.news-list > li'],
    ['.papers-scroll', '.recent-papers > .paper'],
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

  let capTimer;
  addEventListener('resize', () => {
    clearTimeout(capTimer);
    capTimer = setTimeout(capScrollRegions, 150);
  });

  document.querySelector('.footer [data-year]').textContent = new Date().getFullYear();
})();
