#!/usr/bin/env python3
"""Assemble src/layout.html into index.html. Uses Python's standard library only."""
import argparse
import base64
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'src'
INCLUDE = re.compile(r'{{\s*include\s+"([^"\n]+)"\s*}}')


def render(relative_path, stack=()):
    """Expand includes relative to src/; reject missing files and cycles."""
    path = (SOURCE / relative_path).resolve()
    if SOURCE.resolve() not in path.parents:
        raise ValueError(f'Include is outside src/: {relative_path}')
    if path in stack:
        raise ValueError(f'Circular include: {relative_path}')
    text = path.read_text(encoding='utf-8')
    return INCLUDE.sub(lambda match: render(match.group(1), stack + (path,)), text)


class PageInspector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.links = []
        self.assets = []
        self.paper_count = 0

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get('id'):
            self.ids.append(attrs['id'])
        if tag == 'a' and attrs.get('href'):
            self.links.append(attrs['href'])
        if tag in ('img', 'script') and attrs.get('src'):
            self.assets.append(attrs['src'])
        if tag == 'link' and attrs.get('rel') == 'stylesheet':
            self.assets.append(attrs.get('href', ''))
        if tag == 'article' and 'paper' in attrs.get('class', '').split():
            self.paper_count += 1


SITE_HOST = 'guoyuanxiong.github.io'
ANCHOR = re.compile(r'<a\s+([^>]*?)href="(https?://[^"]+)"([^>]*?)>', re.IGNORECASE)


def open_external_links_in_new_tab(page):
    """Safety net: give any off-site link target="_blank" and rel="noopener".

    The source files already carry these attributes; this catches links added
    later without them. Links to this site, in-page anchors, relative paths and
    mailto: addresses stay in the same tab, as does any anchor that sets its
    own target.
    """
    def rewrite(match):
        before, href, after = match.groups()
        if 'target=' in (before + after).lower():
            return match.group(0)
        if urlsplit(href).hostname in (SITE_HOST, None):
            return match.group(0)
        return f'<a {before}href="{href}"{after} target="_blank" rel="noopener">'

    return ANCHOR.sub(rewrite, page)


MONTH_TIME = re.compile(r'<time>(\s*)(\d{2})/(\d{4})(\s*)</time>')


def add_machine_dates(page):
    """Safety net: give <time>MM/YYYY</time> a datetime="YYYY-MM" attribute."""
    return MONTH_TIME.sub(lambda m: f'<time datetime="{m[3]}-{m[2]}">{m[1]}{m[2]}/{m[3]}{m[4]}</time>', page)


def validate(page):
    if INCLUDE.search(page):
        raise ValueError('The output contains unexpanded includes.')
    parser = PageInspector()
    parser.feed(page)
    duplicates = [name for name, count in Counter(parser.ids).items() if count > 1]
    if duplicates:
        raise ValueError('Duplicate IDs: ' + ', '.join(duplicates))
    for link in parser.links:
        if link.startswith('#') and unquote(link[1:]) not in parser.ids:
            raise ValueError(f'Broken section link: {link}')
    for asset in parser.assets:
        parsed = urlsplit(asset)
        if parsed.scheme or parsed.netloc:
            continue
        local = ROOT / unquote(parsed.path.lstrip('/'))
        if not local.is_file():
            raise ValueError(f'Missing local asset: {asset}')
    return parser.paper_count


def standalone(page):
    """Produce an optional self-contained HTML preview for easy sharing."""
    css = (ROOT / 'assets/site/styles.css').read_text(encoding='utf-8')
    js = (ROOT / 'assets/site/main.js').read_text(encoding='utf-8')
    photo = base64.b64encode((ROOT / 'assets/site/portrait.webp').read_bytes()).decode('ascii')
    page, css_count = re.subn(r'<link\b[^>]*href="assets/site/styles\.css"[^>]*/?>', lambda _: '<style>\n' + css + '\n</style>', page)
    page, js_count = re.subn(r'<script\b[^>]*src="assets/site/main\.js"[^>]*>\s*</script>', lambda _: '<script>\n' + js + '\n</script>', page)
    page, image_count = re.subn(r'src="assets/site/portrait\.webp"', lambda _: 'src="data:image/webp;base64,' + photo + '"', page)
    if (css_count, js_count, image_count) != (1, 1, 1):
        raise ValueError('Preview asset references changed; update standalone() accordingly.')
    return page


def main():
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument('--check', action='store_true', help='Validate and check that index.html matches its source, without writing.')
    args.add_argument('--standalone', type=Path, help='Also save a self-contained HTML preview at this path.')
    options = args.parse_args()
    if options.check and options.standalone:
        args.error('--check cannot be combined with --standalone')
    try:
        page = render('layout.html').rstrip() + '\n'
        page = page.replace('<html', '<!-- Generated by scripts/build_site.py. Edit src/ instead. -->\n<html', 1)
        page = open_external_links_in_new_tab(page)
        page = add_machine_dates(page)
        papers = validate(page)
        output = ROOT / 'index.html'
        if options.check:
            if not output.exists() or output.read_text(encoding='utf-8') != page:
                raise ValueError('index.html is out of date. Run python3 scripts/build_site.py.')
            print(f'OK: source, section links, local assets, and {papers} publication entries.')
            return 0
        preview = standalone(page) if options.standalone else None
        if options.standalone and options.standalone.resolve() == output.resolve():
            raise ValueError('Choose a standalone path other than index.html.')
        output.write_text(page, encoding='utf-8')
        if options.standalone:
            options.standalone.parent.mkdir(parents=True, exist_ok=True)
            options.standalone.write_text(preview, encoding='utf-8')
        print(f'Built index.html with {papers} publication entries.')
        return 0
    except (OSError, ValueError) as error:
        print(f'Build failed: {error}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
