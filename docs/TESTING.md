# Companion split verification

Independent TypeScript/build validation, 22 tests, plugin-only packaging and offline CSS checks run with npm run check. Installer tests preserve existing notes, config, data.json, Theme CSS and Agent assets, and reject junctions. Package tests verify exactly LICENSE/main.js/manifest.json/styles.css inside the ZIP and preserve plugin ID personal-glass.

True Obsidian plugin-alone/default-theme, restart/unload/popout, BRAT migration, screen-reader and large-vault tests remain pending after the split. Historical monolith tests are archived separately; they do not certify this release. No personal vault was touched during this split.
