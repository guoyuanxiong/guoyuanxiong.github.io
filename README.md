# Yuanxiong Guo — personal website

Source for <https://guoyuanxiong.github.io>.

## Updating the site

- Edit files in `src/`, never `index.html` directly.
- News: `src/sections/news.html`
- Selected publications (hand-picked, newest first): `src/publications/recent.html`
- Other sections: `src/sections/`
- Rebuild: `python3 scripts/build_site.py`
- Commit the source change together with the regenerated `index.html`, then push.

The year files in `src/publications/` are an archive of past papers and are not shown on the site.
