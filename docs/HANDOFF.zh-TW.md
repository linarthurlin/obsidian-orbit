# Personal Glass Companion 交接

此 repo 接收原本的 src/main.ts、Navigator、設定、命令、native lifecycle 與相關測試。plugin id 保持 personal-glass；不要改成第二份不同 id 的外掛，避免重複載入與設定遺失。

此 Chat 應維護互動與生命週期，不做 AI 整理或全域 Theme CSS。選取顏色控制只輸出既有 CSS 變數，選取表面的 CSS 由 Theme repo 擁有。Navigator 提供 Obsidian 預設主題 fallback。

下一步：在獨立測試庫確認 plugin-alone、default theme、Theme 整合、停用／重啟、popout 與 BRAT repo 遷移。不要直接動個人筆記。

## 共同規則

先讀 AGENTS.md、README.md、INTEGRATION-CONTRACT.md 與 REPOSITORY-SPLIT.md。各 repo 各自 npm ci / npm run check / npm run package、獨立版號與 Release。不要把拆開的元件重新綁在同一個 build 或安裝器。個人 Vault、密鑰、筆記、設定、計畫與交易紀錄不可上傳。此次拆分沒有寫入 Vault；新 Chat 不代表已授權部署或整理筆記。
