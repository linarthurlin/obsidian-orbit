# Personal Glass Companion

[![CI](https://github.com/linarthurlin/obsidian-personal-glass-companion/actions/workflows/ci.yml/badge.svg)](https://github.com/linarthurlin/obsidian-personal-glass-companion/actions/workflows/ci.yml)

Independent Obsidian companion plugin, preserving plugin ID `personal-glass` and existing settings. Owns read-only Navigator, Markdown insertion commands, appearance controls and optional Windows native-material lifecycle. No AI or automatic note organization.

## Separate components

- [Theme](https://github.com/linarthurlin/obsidian-personal-glass) — visual CSS, tokens and adapters.
- [Companion](https://github.com/linarthurlin/obsidian-personal-glass-companion) — UI behavior and appearance controls.
- [Knowledge Agent](https://github.com/linarthurlin/obsidian-knowledge-agent) — knowledge review and future model orchestration.

Each has its own manifest, build, version, installer, CI and releases. No runtime imports or build dependencies on the other repositories. See [integration contract](docs/INTEGRATION-CONTRACT.md), [split/migration](docs/REPOSITORY-SPLIT.md) and [handoff](docs/HANDOFF.zh-TW.md).

## Install

Download `personal-glass-companion-<version>.zip` from [Releases](https://github.com/linarthurlin/obsidian-personal-glass-companion/releases). Extract into `<vault>/.obsidian/plugins/personal-glass/`. Reload Obsidian and enable this plugin manually. The installer does not activate anything or modify notes/configuration/data.json.

Navigator, Markdown templates and the searchable slash menu work with Obsidian’s default theme. Type `/` or `／` in a Markdown note to insert or transform document blocks: text, headings, lists, callouts, links, images, code, math and tables. Search supports Traditional Chinese, English and pinyin. The slash menu edits only the active Markdown document; it never runs Obsidian or other plugin commands. Obsidian’s Core Slash Commands provider can take over `/` on blank blocks; use the full-width `／` for Companion, or disable the core provider yourself. Companion never changes that setting. Palette/surface/selection appearance controls require the separate Personal Glass theme. Optional Notebook Navigator must be installed separately; its GPL implementation is not bundled.

[Navigator usage](docs/NAVIGATOR.zh-TW.md).

[Markdown slash menu behavior and compatibility](docs/SLASH-MENU.zh-TW.md).

## Develop

Node.js 22.12+ and npm. Run independently in this repo:

```sh
npm ci
npm run check
npm run package
```

Installable output: `dist/plugin`. Release output: `release/current`. CI validates on Linux and Windows; matching `x.y.z` tags publish prereleases with SHA-256 checksums.

The split does not deploy anything into a personal vault. The 0.5.0 Markdown slash menu is verified in an isolated Obsidian 1.13.7 runtime; physical Windows IME behavior and ASCII slash coexistence with Obsidian Core Slash Commands remain separately tracked. See [testing](docs/TESTING.md) for current evidence and limits.

## Regression and migration checks

See [migration guide](docs/MIGRATION.zh-TW.md), [isolated runtime tests](docs/RUNTIME-TESTING.zh-TW.md), and [verification limits](docs/TESTING.md). The 0.3.1 automated suite covers lifecycle logic and in-place settings preservation; actual app/BRAT UI checks remain separately tracked.
