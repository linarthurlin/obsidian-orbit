# 文件 Markdown 斜線選單

Companion 的斜線選單是目前 Markdown 文件的編輯工具。它只插入或轉換文件文字，不執行 Obsidian 命令、社群插件命令，不操作其他檔案或設定。插入使用 Obsidian 公開 `Editor` API，與一般編輯一樣可復原。

選項分為文字（空白段落、純文字、標題一至三）、清單（項目、編號、待辦）、區塊（引用、四種 Callout、分隔線），以及媒體與程式碼（連結、圖片語法、程式碼、數學公式、表格）。搜尋支援繁體中文、英文與拼音。項目會顯示分類、用途與 Markdown 預覽。

空白行選取項目時，選單會插入 Markdown 範本並選取可編輯的 placeholder。若在段落文字後輸入斜線，標題、清單、引用與 Callout 會轉換目前行並保留文字；程式碼、數學、表格等區塊則插入到該段落後。選取「新增空白段落」會在目前區塊下方放置游標。

選單在 inline code 與 fenced code 內不顯示。ASCII `/` 與全形 `／` 均可觸發；全形符號適合中文輸入情境。

## 與 Obsidian Core Slash Commands 的相容性

Obsidian 核心的 Slash Commands 也使用 ASCII `/`。兩個建議提供者可能競爭：實測顯示核心提供者可在空白行接管 `/`，因此 Companion 的 ASCII 選單未必會出現。輸入全形 `／` 可避開這個競爭；使用者也可以自行停用核心 Slash Commands。Companion 不會讀寫或改變核心插件設定。此限制已列入 roadmap，待找到公開 API 支援的優先順序或共存方式後再處理。

驗證是在新建 synthetic Vault 的 Obsidian 1.13.7 / Electron 43.3.0 執行，測試庫內停用核心 Slash Commands，以獨立檢查 Companion 的 19 個文件選項、轉換、placeholder、鍵盤選取與還原。另有 Core Slash Commands 開啟時的隔離衝突確認。這不等於 Windows 實體輸入法、螢幕閱讀器或所有編輯模式的認證。
