# Yuanxiong Guo — personal academic website

A modular, single-page website for GitHub Pages. The source is plain HTML, CSS, and JavaScript. A small Python script combines the section files into the root `index.html`; all page content is available without JavaScript.

## What to edit

| Content | Source file |
| --- | --- |
| Name, title, affiliation, contact links | `src/sections/profile.html` |
| Biography and research support | `src/sections/about.html` |
| Research interests | `src/sections/research.html` |
| Recent news | `src/sections/news.html` |
| Education and appointments | `src/sections/education-experience.html` |
| Publication introduction and year order | `src/sections/publications.html` |
| The five papers shown on the page | `src/publications/recent.html` |
| Full year-by-year archive (kept, not published) | `src/publications/2022.html` and the other year files |
| Current students, graduates, earlier advising, mentoring | `src/sections/students.html` |
| Tutorials, posters, and extended abstracts | `src/sections/presentations.html` |
| Courses taught | `src/sections/teaching.html` |
| Awards and honors | `src/sections/awards.html` |
| Editorial roles, memberships, reviewing | `src/sections/service.html` |
| Top navigation | `src/partials/navigation.html` |
| Footer | `src/partials/footer.html` |
| Page metadata and section order | `src/layout.html` |
| Colors, typography, spacing, mobile layout | `assets/site/styles.css` |
| Theme switch and active navigation | `assets/site/main.js` |
| Profile photograph | `assets/site/portrait.webp` |

## Everyday update workflow

1. Edit the relevant source file above.
2. From the repository folder, run:

   ```sh
   python3 scripts/build_site.py
   ```

3. Open the generated `index.html` in your browser to preview the result.
4. Commit and push both your source changes and the generated `index.html`. Keep `assets/site/` committed as well.

Python 3.8 or newer is sufficient. No pip, npm, or Jekyll installation is needed. **Editing source files alone does not update the published page; run the build and commit its output.** GitHub Pages should continue publishing from the same branch and folder as before.

Avoid editing `index.html` directly: the next build replaces it. Every off-site link in `src/` carries `target="_blank" rel="noopener"` so it opens in a new tab, and `open_external_links_in_new_tab()` in `scripts/build_site.py` adds them to any link that is missing them at build time. Links to this site, `#` anchors, relative paths and `mailto:` addresses stay in the same tab. The browser loads the complete generated page, so the layout and reading experience do not depend on client-side HTML includes.

## Add a news item

In `src/sections/news.html`, copy an existing `<li>` inside the news list, change its date and paragraph, and place it first. Then rebuild.

The section shows the five most recent items and puts the rest behind a scroll. `capScrollRegions()` in `assets/site/main.js` handles this for both News and Recent Publications: it measures where the sixth entry starts and caps the `.news-scroll` / `.papers-scroll` container there, leaving a sliver of it visible as the cue that more follows, and re-measures on resize. Change `VISIBLE_ENTRIES` in that file to show a different number, or add a `[container, entries]` pair to `scrollRegions` to give another list the same treatment. Without JavaScript no cap is applied and both lists render in full, so nothing is hidden from readers or crawlers.

## Add a publication

The Publications section shows only the five most recent papers; everything else is reached through the Google Scholar link in the section introduction.

To add a paper, open `src/publications/recent.html`, copy an existing `<article class="paper">` block to the top, and update its title, authors, venue and link. Keep it inside the `.recent-papers` wrapper, then rebuild. The file currently holds the 13 papers dated 2026 and later; five show at a time and the rest are reached by scrolling inside the section, so there is no need to prune it.

Each published entry is exactly three lines: the title, the author list, then the venue in italics. Where a copy of the paper is online, the title itself is the link — there is no separate link row. Write it as `<h3><a href="URL" target="_blank" rel="noopener">Title</a></h3>`; leave the title as plain text otherwise. Linked titles keep the body colour and carry a faint underline, turning accent-coloured on hover. The type label, the status word, the BibTeX disclosure and the old "Find paper" links (which were only Google Scholar title searches, not links to the paper) are all absent from the published list. The year files under `src/publications/` keep the older, fuller block shape, so copying an entry across from one of them means trimming it to these three lines.

Keep each `id="publication-XX"` unique. The `src/publications/YYYY.html` year files are the full archive from the 2026 CV; nothing includes them any more, so they are a place to copy older entries from rather than a part of the page. When you want the complete list back on the site, add `{{ include "publications/YYYY.html" }}` lines to `src/sections/publications.html` in place of the `recent.html` line.

## Reorder or add a section

Reorder the include lines in `src/layout.html`. For a new section, create its HTML file, add an include line, give the section a unique `id`, and add a matching anchor in `src/partials/navigation.html`. Include paths are always relative to `src/`.

## Change the appearance

Edit the variables in `:root` at the beginning of `assets/site/styles.css` for the light theme.

Headings follow one rule: a **proper name** (a university, in Teaching) is bold and set in body colour, while a **category label** ("Journal Editorship", "Education", "Appointments") is small grey uppercase with a hairline rule — the `.column-title` treatment, which `.service-grid h3` now shares. Apply the same split to anything you add later. The `[data-theme="dark"]` block controls dark mode. Responsive layout adjustments are in the media queries near the end. CSS and JavaScript are served directly; their edits do not require rebuilding `index.html`, but they must be committed and pushed.

## Checks and sharing

Check that the generated page is current and all section anchors and local assets exist:

```sh
python3 scripts/build_site.py --check
```

Create a standalone preview with the portrait, CSS, and JavaScript embedded:

```sh
python3 scripts/build_site.py --standalone website-preview.html
```

The standalone preview is a shareable output, not the editing source. The build validates missing includes, circular includes, duplicate IDs, section targets, and local assets. External links and browser appearance are not tested by this command.

## Install this update in the existing repository

Extract the supplied ZIP and copy its contents into the repository root, merging directories. Keep the existing publication PDFs and older page folders. The ZIP contains the modular source, builder, new assets, and generated homepage; it is an update package rather than a backup of every old repository file.

Upload/commit the new `src/`, `scripts/`, and `assets/site/` folders along with `README.md` and `index.html`. Keep your existing GitHub Pages publishing settings. No deployment has been performed by this refactor.

## Content notes

The September 2026 revision uses the supplied CV for appointments, education, teaching, honors, professional service, and Ph.D. advising. In particular, the GLOBECOM Best Paper Award is dated 2011. Student groups distinguish current primary advisees, UTSA graduates, earlier Ph.D. advising at Oklahoma State, and additional mentoring. Job placements for UTSA graduates are explicitly described as first positions. The profile retains only a labeled Email link, using the contact address from the CV; no address is printed directly. The optional legacy Google Analytics snippet is not included in the current design.

## Publication provenance and updates

`src/publications/cv-source-records.json` preserves the imported CV entries and their reference IDs for auditing. The website is built from the editable HTML files, not this JSON; changing only the JSON will not change the page. Keep the HTML as the editing source.

BibTeX blocks are generated from the CV entries by `scripts/` tooling and are typed correctly: journal articles as `@article` with `journal`, conference papers as `@inproceedings` with `booktitle` and `address`, plus `volume`, `number`, `pages`, `month` and `year` where the CV records them. Titles are double-braced so styles do not lowercase acronyms, keys follow `lastnameYEARword`, and every character is ASCII so the entries compile without `inputenc`. What the CV does not carry — DOIs, publisher URLs, and page ranges for recent papers — is absent; for camera-ready references use the publisher export.

The CV is the authority for publication years in this draft, even where online-first and final-volume years differ across public databases. No additional search-result-only papers or preprints were inserted after the CV was supplied. The uploaded CV itself is not included in the public website package.

After adding students, edit the appropriate list in `src/sections/students.html` and rebuild. Do not mix committee service or informal mentoring into the primary-advisor lists.

Teaching and Awards & Honors are two separate sections, each with its own navigation anchor (`#teaching` and `#awards`), and both use two columns to save vertical space.

In Teaching, each institution keeps a full-width heading and its course list carries `class="courses two-columns"`, so only the course codes are split into columns. Add a course by adding an `<li>`; the balance between the columns is handled for you.

In Awards & Honors, the `.award-grid` list fills row by row, which keeps the entries in date order when read left to right, and the year sits above the award name so a long range such as 2020 – 2022; 2024 – 2025 stays on one line. Add an award by inserting an `<li>` in the right chronological position.

Both layouts collapse to a single column below 780px.
