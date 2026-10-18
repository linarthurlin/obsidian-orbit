Personal Glass Companion 0.3.2 prerelease.

- Preserve search results during IME composition; ignore candidate-selection keys until composition commits.
- Reveal results when searching in narrow layouts; keep Escape focus within Navigator.
- Serialize preview reads across renders and discard cancelled/stale results; release old-path cache entries on rename.
- Improve result accessible names, pagination focus/count, folder-toggle state and scoped forced-colors styling.
- 31 automated tests pass, including delayed-read cancellation and recovery.
- Isolated Obsidian 1.13.7 / Electron 43.3.0 checks pass for default theme (18) and public Theme 0.3.0 (19), including synthetic composition and keyboard focus.

Physical Windows IME candidate selection, screen-reader/forced-colors visual verification, large-vault performance and real BRAT UI updates remain pending. No personal vault changes.
