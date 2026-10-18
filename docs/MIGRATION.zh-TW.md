# 從合併版遷移 Companion

目標 repo：linarthurlin/obsidian-personal-glass-companion。
plugin ID 與安裝路徑維持 personal-glass／.obsidian/plugins/personal-glass。Theme 是另一個專案，不能再從舊 repo 的新版 root main.js 更新 Companion。

## 手動 ZIP 更新

1. 在測試 Vault 演練，保留現有 data.json 的私人備份。
2. 暫停 Companion，將新 ZIP 的 main.js、manifest.json、styles.css 覆蓋到相同資料夾，不刪除資料夾或 data.json。
3. 重新啟用；檢查釘選、最近、閱讀寬度、自訂明暗顏色與版面。
4. 回復時停用外掛、還原備份程式檔；只有在確有設定問題時才還原私人 data.json 備份。

安裝器會保留 data.json 原始位元組；載入後仍會正規化設定。被移除的玻璃參數會保持關閉，舊預設深色端點依既有規則轉成平面配色。此相容承諾針對已支援欄位，不宣稱永遠保留未知欄位。

## BRAT 來源遷移

依 [BRAT 官方指南](https://tfthacker.com/brat-quick-guide)，從 BRAT 停止追蹤更新與從 Obsidian 解除安裝是兩件事。先在 BRAT 中移除舊 repo 的更新追蹤；不要在 Community plugins 解除安裝 Companion，也不要刪除 personal-glass 資料夾。再以 BRAT 的 Add a beta plugin for testing 指定新 repo，依該版本介面的提示確認既有外掛更新。

若 BRAT 拒絕以相同 ID 新增，先採手動 ZIP 更新，保留設定；不要為繞過檢查另改 ID 或刪除設定。不同 BRAT 版本的實際 UI 更新流程仍需要合成 Vault 手測。本專案不會自動修改 BRAT metadata。

## 已驗證與界線

migration.test.ts 使用合成舊版資料，確認重複安裝保留原始 data.json 與 BRAT metadata、plugin ID 不變、支援的自訂顏色／釘選／版面欄位可載入。這是就地更新演練，不等於 BRAT 外掛本身已完成實際下載／更新驗證。
