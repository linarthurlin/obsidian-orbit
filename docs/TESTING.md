# Companion verification · 0.4.0

npm run check passes TypeScript/build/CSS validation and 35 tests. This includes plugin-only package boundaries; installer preservation of notes, configuration, Theme and Agent assets; legacy settings migration rehearsal; immutable queued saves; recovery after a failed write; unload during delayed load; main/popout attribute/CSS restoration; and early release of closed native-window handles.

Lifecycle tests use a mocked Obsidian host and lightweight document/style objects. They prove plugin-owned logic, not actual Electron rendering or Obsidian lifecycle behavior. The runtime harness is separately type-checked and never bundled into the released plugin.

Actual isolated desktop verification passed on Obsidian 1.13.7 / Electron 43.3.0 for the default theme (14 checks) and public Personal Glass Theme 0.3.0 (15 checks, including Theme tokens). Checks cover 17 commands, legacy settings, callout insertion/undo, alias/tag filtering, saved settings, popout propagation, unload cleanup, navigator detachment, reload, and unchanged fixture note hashes. A separate full process restart preserved palette, selection angle and pins. CDP was explicitly authorized and guarded by exact generated Vault paths. This verifies behavior and token integration, not pixel-level appearance or native OS blur. BRAT UI updates, Chinese IME, accessibility and long-term performance remain pending.

Migration tests preserve the original data.json bytes during installation. They then verify supported legacy settings normalize correctly; removed glass parameters intentionally stay disabled. This is not certification of BRAT's own update UI.

No personal vault is used as a fixture or changed during these checks.

0.3.2 adds three preview-queue regression tests: replacement during a delayed read stays single-flight, close cancels stale application and pending work, and unreadable files do not stop the queue. Desktop default/Theme runs pass 18/19 checks, adding synthetic composition preservation, ArrowDown result focus, Escape return focus and accessible result names. OS IME candidate windows and actual screen-reader/high-contrast appearance remain unverified. The full process restart test above was recorded for 0.3.1.

0.4.0 adds a Traditional Chinese slash menu for all 14 existing Markdown templates. `npm run check` passes TypeScript, build, validation and 35 automated tests. A fresh isolated Obsidian 1.13.7 / Electron 43.3.0 default-theme run passed 19 lifecycle checks, including slash suggestion registration, and nine real-editor CDP checks: 14 visible choices, full-width slash and pinyin filtering, inline/fenced-code suppression, heading insertion with placeholder selection, setting toggle, and exact restoration of the generated Welcome note. CDP text insertion is not a physical Chinese IME test; real IME candidate selection and longer-term editor/plugin coexistence remain pending.
