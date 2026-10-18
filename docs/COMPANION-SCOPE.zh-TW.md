# Companion 工作邊界與交接

正式目錄：D:\Tools\My-Obsidian-Companion
正式 repo：https://github.com/linarthurlin/obsidian-personal-glass-companion
本 Chat 只維護此專案。Theme 位於 My-Obsidian-Theme；Agent 位於 My-Obsidian-Knowledge-Agent，由其他 Chat 維護。不要在原 Theme 資料夾重新建立 Companion。

保留 personal-glass plugin ID 與 data.json。命令、唯讀 Navigator、設定、原生材質生命週期仍在本 repo；沒有 Theme source、AI model、知識整理 CLI 或 SVG Skill。
樣式只包含 Companion 自身 UI 的最小 fallback，使用 INTEGRATION-CONTRACT.md 的共用 tokens；全域／第三方樣式由 Theme 管理。

npm ci → npm run check → npm run package。installer 只複製 main.js、manifest.json、styles.css 三檔；不寫 Theme、Agent、筆記或啟用清單。此次調整不部署到個人 Vault。

BRAT 使用者需將 repo 改為 linarthurlin/obsidian-personal-glass-companion，維持 .obsidian/plugins/personal-glass 路徑及既有設定。不可安裝另一個 ID 造成兩份 Companion 同時載入。

拆分後的真實 Obsidian 重啟／停用／popout、default theme 與 Theme+Agent 整合驗證尚未完成；單元測試與打包通過不代表已完成視覺驗證。
