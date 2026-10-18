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

## Pending P1 verification
- [x] Actual isolated Obsidian 1.13.7 / Electron 43.3.0: default theme, public Theme 0.3.0 integration, save/reload, unload and popout.
- [x] Full process restart preserves saved palette, selection angle and pinned paths.
- [ ] Real BRAT UI source switch/update (installer rehearsal already passes).

After explicit CDP authorization, both generated profiles produced passed runtime reports. Every connection verifies the generated Vault path before mutation. No personal Vault was connected.

## Later verification
- [ ] Large-vault latency/memory, Chinese IME and long-term table/Canvas/cursor coexistence.
- [ ] Keyboard/screen-reader/high-contrast, DPI and multi-monitor matrix.

No personal-vault deployment or note organization was performed.
