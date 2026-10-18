# Personal Glass Companion roadmap

## Completed
- [x] Independent repository, build, installer, package and CI/CD; stable personal-glass ID.
- [x] Navigator, Markdown commands, appearance controls and optional native lifecycle extracted.
- [x] 0.3.1 immutable queued settings snapshots and recovery after a failed save.
- [x] Guard against late load registration after unload; release tracked closed-popout native handles.
- [x] Mock-host document restoration tests, including existing CSS values and priorities.
- [x] In-place legacy settings upgrade rehearsal, preserving data.json and BRAT metadata during installation.
- [x] Companion-only Navigator documentation and BRAT/manual migration guide.
- [x] Guarded synthetic runtime fixture and development test plugin; harness is type-checked and excluded from releases.

- [x] 0.3.2 IME composition guard; narrow-column search reveals results; Escape keeps keyboard focus inside Navigator.
- [x] One preview read in flight across renders, stale-result cancellation, bounded cache and rename invalidation.
- [x] Result accessible names, pagination focus/count and scoped forced-colors styles.
- [x] Traditional Chinese slash menu for the existing Markdown templates: ASCII/full-width slash, pinyin and bilingual search, code-span/fence suppression, keyboard insertion and placeholder selection. Verified with unit tests and real editor input in an isolated Obsidian runtime.
- [x] 0.5.0 document-first slash menu: 19 Markdown blocks with descriptions, blank-paragraph insertion, placeholder selection and paragraph transforms; no Obsidian/plugin commands are invoked.
- [x] Expand the document-only menu to 42 fixed Markdown templates plus sized tables: inline formatting/math, Mermaid, Wikilinks, callouts, embeds, comments, paired footnotes, static TOC, date and emoji. Add synthetic editor regression coverage; no Obsidian/plugin commands are invoked.

## Pending P1 verification
- [x] Actual isolated Obsidian 1.13.7 / Electron 43.3.0: default theme, public Theme 0.3.0 integration, save/reload, unload and popout.
- [x] Full process restart preserves saved palette, selection angle and pinned paths.
- [ ] Real BRAT UI source switch/update (installer rehearsal already passes).

After explicit CDP authorization, both generated profiles produced passed runtime reports. Every connection verifies the generated Vault path before mutation. No personal Vault was connected.

## Later verification
- [ ] Run the expanded slash-menu flows in an isolated Obsidian runtime; current CDP report covers the earlier 19-item menu only.
- [ ] Verify ASCII slash coexistence with Obsidian Core Slash Commands. On blank blocks the core provider can take precedence; full-width `／` bypasses it. Companion must not alter core plugin settings.
- [ ] Large-vault latency/memory, physical Windows Chinese IME candidate selection and long-term table/Canvas/cursor coexistence. Synthetic composition events pass; this is not a physical IME certification.
- [ ] Keyboard/screen-reader/high-contrast, DPI and multi-monitor matrix.

No personal-vault deployment or note organization was performed.
