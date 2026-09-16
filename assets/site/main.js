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

  document.querySelector('.footer [data-year]').textContent = new Date().getFullYear();
})();
