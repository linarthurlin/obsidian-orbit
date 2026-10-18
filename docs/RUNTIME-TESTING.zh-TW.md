# 隔離 Obsidian 執行測試

npm run runtime:prepare -- default 只會建立 repo 內新的 .local/runtime-runs/<唯一名稱>/vault 與 profile，不接受既有 Vault 路徑。資料全為合成筆記。runtime-harness.ts 是開發用外掛，不會包含在發行 ZIP 中。

將 Obsidian.exe 以 --user-data-dir=<輸出的 profile> 啟動。確認目前 Vault 正是輸出的合成 vault，再在該測試庫完成首次啟動／Community plugins 啟用流程。工具未能操作原生應用時，需使用者在該隔離實例啟用測試外掛；不得改用個人 Vault 代替。

測試外掛會確認精確 Vault 絕對路徑，再檢查命令、舊設定、合成筆記插入／undo、Navigator、設定保存、popout、停用清理與重新載入。它只向輸出的 result.json 寫入測試報告。必須看到 status: passed 並檢查各項結果，才能宣稱 runtime 通過；缺少報告不是通過。

Theme 情境：先從 Theme 的公開 release 取得 theme.css、manifest.json，執行 npm run runtime:prepare -- theme <資產目錄>。不讀取或建置 Theme Chat 的工作目錄，也不啟用 Agent 或模型。

CI 只執行單元／合成檔案系統測試與 harness 的型別檢查，不啟動桌面 Obsidian。真正重新啟動程序、BRAT 更新操作、中文 IME、螢幕閱讀器與長期效能需另外記錄；plugin reload 不等於程序 restart。

## 本次結果

已明確授權使用 CDP，連接前核對合成 Vault 絕對路徑。Obsidian 1.13.7 / Electron 43.3.0：預設主題 14 項、公開 Theme 0.3.0 整合 15 項均通過；完整程序重啟也保留色盤、選取角度及釘選。尚未驗證 BRAT 實際更新 UI、中文 IME、無障礙及原生模糊視覺。

開發連線使用 --remote-debugging-port=9239 --remote-debugging-address=127.0.0.1；node scripts/runtime-control.mjs inspect/run/restart 分別檢查、執行 harness、核對重啟設定。僅適用 runtime:prepare 產生的實例。程序重啟前將合成 community-plugins.json 保留 personal-glass，避免 harness 自動重跑。

0.3.2：預設主題 18 項、Theme 19 項通過，新增 CompositionEvent／InputEvent 組字保護與鍵盤焦點測試。這些是合成事件，不代表已實測 Windows 輸入法候選視窗。

0.5.0：新建的合成 Vault 停用 Obsidian Core Slash Commands，以隔離驗證 Companion 的文件選單；runtime harness 19 項、slash UI 12 項通過。包含 19 個選項、全形斜線與拼音、程式碼區塊抑制、段落轉標題／待辦、空白行插入與 placeholder、下方新增段落、停用設定及 Welcome.md 還原。另以 core slash provider 開啟做衝突確認：它會在空白行接管 ASCII `/`；全形 `／` 仍進 Companion。Companion 不修改 Obsidian core plugin 設定。這些是合成文字輸入，不是實體 Windows 中文輸入法測試；報告寫入該次執行的 `result.json`。
