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

Navigator and Markdown commands work with Obsidian’s default theme. Palette/surface/selection appearance controls require the separate Personal Glass theme. Optional Notebook Navigator must be installed separately; its GPL implementation is not bundled.

[Navigator usage](docs/NAVIGATOR.zh-TW.md).

## Develop

Node.js 22.12+ and npm. Run independently in this repo:

```sh
npm ci
npm run check
npm run package
```

Installable output: `dist/plugin`. Release output: `release/current`. CI validates on Linux and Windows; matching `x.y.z` tags publish prereleases with SHA-256 checksums.

The split does not deploy anything into a personal vault. Runtime verification of the independent components remains pending; historical combined-app evidence is clearly separated in [testing](docs/TESTING.md).
