Personal Glass Companion 0.3.1 prerelease.

- Fix immutable settings snapshots for rapid queued edits; a failed save no longer blocks later attempts.
- Prevent view/command registration after a delayed load finishes on an unloaded instance.
- Release tracked popout native-window handles when closing their documents.
- Add lifecycle restoration and legacy in-place migration coverage; 28 automated tests.
- Sync Companion-only usage and BRAT/manual migration documentation.
- Add a guarded synthetic Obsidian fixture and type-checked development runtime harness, excluded from release assets.

Actual isolated desktop verification passed on Obsidian 1.13.7 / Electron 43.3.0 for the default theme (14 checks) and public Personal Glass Theme 0.3.0 (15 checks, including Theme tokens). Checks cover 17 commands, legacy settings, callout insertion/undo, alias/tag filtering, saved settings, popout propagation, unload cleanup, navigator detachment, reload, and unchanged fixture note hashes. A separate full process restart preserved palette, selection angle and pins. CDP was explicitly authorized and guarded by exact generated Vault paths. This verifies behavior and token integration, not pixel-level appearance or native OS blur. Real BRAT UI update verification remains pending. No personal-vault changes.
