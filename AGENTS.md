# Personal Glass Companion scope

This repository owns only the companion plugin: appearance controls, native-material lifecycle, Markdown commands and read-only Navigator.
Do not implement AI orchestration, model providers or vault reorganization here. See docs/INTEGRATION-CONTRACT.md and docs/HANDOFF.zh-TW.md.

Never use personal vault notes as fixtures or commit credentials, local config, private plans, receipts or third-party binaries. Do not deploy or activate plugins unless the user asks. Existing vault notes must remain untouched. Run npm run check and npm run package before publishing. Do not claim runtime/visual verification from unit tests alone. Preserve the repository split and independent releases.
