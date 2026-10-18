Personal Glass Companion · working tree (unreleased)

- Expand the document-only slash menu to 42 fixed Markdown templates, covering inline formatting/equations, Mermaid, Wikilinks, more callouts, embeds, footnotes, comments and a heading-derived static table of contents.
- Add dynamic Markdown table dimensions, selected placeholders, command-ID search and regression coverage; all actions edit only the active document.
- `npm run check` passes TypeScript/build/validation and 46 automated tests; `npm run package` creates the Companion-only bundle. The expanded menu has not yet received a new Obsidian runtime run.

Personal Glass Companion 0.5.0 prerelease.

- Expand the document-only slash menu to 19 Markdown blocks, including text, ordered lists, links, images and a blank paragraph below the current block.
- Insert blocks on empty lines; transform a current paragraph into headings, lists, quotes and callouts while preserving its text.
- Add categorized descriptions and Markdown syntax hints; preserve Traditional Chinese, English and pinyin search and ASCII/full-width slash triggers.
- The menu edits the active Markdown document only and never invokes Obsidian or another plugin command.
- 40 automated tests pass; isolated Obsidian 1.13.7 / Electron 43.3.0 lifecycle (19) and slash-menu runtime checks pass (12) in a generated synthetic Vault.
- Obsidian Core Slash Commands can claim ASCII `/` on empty blocks. The Companion does not change that core setting; full-width `／` bypasses the competing provider.

Physical Windows IME candidate selection, screen-reader/forced-colors visual verification, large-vault performance and real BRAT UI updates remain pending. No personal vault changes.
