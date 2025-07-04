# Shadowverse: Worlds Beyond Tracker - 變更日誌

## 版本 1.5.8 (2025-01-03) - 矩陣切換顯示修復

### 🐛 關鍵修復
- **後手矩陣顯示**: 修復後手矩陣數據無法顯示的重大問題
- **顯示控制統一**: 統一使用CSS類別控制，移除JavaScript style衝突
- **數據渲染完整**: 確保先手和後手矩陣都被正確渲染

### 🔧 技術修復
- **混合顯示機制問題**: 修復CSS類別與JavaScript style.display混用導致的顯示衝突
- **面板初始化優化**: 改進 `showPanel('matrix')` 邏輯，確保兩個矩陣都被渲染
- **渲染邏輯重構**: `renderMatrix()` 現在一次性渲染所有矩陣數據，僅控制顯示/隱藏

### 🛠️ 具體改進
- 修改 `renderMatrix()` 使用純CSS類別控制（`.matrix-table-container.active`）
- 移除衝突的 `element.style.display` 直接控制
- 優化面板切換時的矩陣數據載入邏輯
- 確保後手矩陣內容在切換時正確顯示

### 🧪 測試工具
- **新增診斷工具**: `matrix_debug.html` 用於矩陣切換功能測試
- **數據驗證**: 使用真實用戶數據驗證修復效果（31場後手對戰）

### 📋 解決的問題
- ✅ 後手矩陣按鈕可點擊但無數據顯示
- ✅ 先手/後手切換視覺反饋正常但內容不切換
- ✅ 矩陣容器顯示控制機制衝突
- ✅ 面板初始化時矩陣數據不完整

## 版本 1.5.7 (2025-01-22) - 匯出與矩陣功能修復

### 🔥 重大修復
- **匯出功能錯誤修復**: 修復 `this.calculateCurrentBP is not a function` 錯誤
- **矩陣切換修復**: 修復後手矩陣無法正確切換的問題
- **功能完整性**: 確保所有核心功能正常運作

### ✨ 新增功能
- **BP計算方法**: 實作 `calculateCurrentBP()` 方法
- **智能矩陣切換**: 改進矩陣顯示邏輯，支援先手/後手切換

### 🛠️ 技術改進
- 實作 `calculateCurrentBP()` 方法，調用 DataManager 的統計功能
- 重構 `renderMatrix(activeType)` 支援類型參數
- 改進矩陣顯示控制，確保正確的先手/後手切換
- 優化視覺反饋和用戶體驗

### 📋 修復的錯誤
- ✅ 修復匯出數據時的 `calculateCurrentBP` 錯誤
- ✅ 修復矩陣無法切換到後手的問題
- ✅ 修復矩陣顯示控制邏輯
- ✅ 確保所有統計功能正常運作

## 版本 1.5.6 (2025-01-22) - 矩陣功能完整恢復hadowverse: Worlds Beyond Tracker - 變更日誌

## 版本 1.5.6 (2025-01-22) - 矩陣功能完全恢復

### 🔥 重大修復
- **矩陣顯示功能**: 完全恢復對戰矩陣顯示功能
- **renderMatrix 方法**: 重新實作完整的矩陣渲染系統
- **統計分析**: 恢復先手/後手矩陣統計與分析

### ✨ 功能恢復
- **對戰矩陣表格**: 7x7 職業對戰勝率矩陣
- **先手後手切換**: 完整的先手/後手矩陣切換功能
- **矩陣統計**: 優勢/劣勢對戰分析
- **視覺化顯示**: 勝率顏色編碼與統計資訊

### 🛠️ 技術恢復
- 重新實作 `renderMatrix()` - 主矩陣渲染方法
- 重新實作 `renderMatrixTable()` - 矩陣表格生成
- 重新實作 `renderMatrixStats()` - 矩陣統計分析
- 恢復 `showToast()` - 提示訊息系統
- 恢復 `showSaveStatus()` - 保存狀態顯示

### 📋 修復的問題
- ✅ 修復矩陣面板無法顯示的問題
- ✅ 修復先手/後手切換按鈕無效
- ✅ 修復統計數據無法計算
- ✅ 修復優勢/劣勢對戰分析

## 版本 1.5.5 (2025-01-22) - 方法完整性修復

### 🔥 重大修復
- **bindEvents 方法實作**: 修復 `this.bindEvents is not a function` 錯誤
- **事件綁定系統**: 完整實作所有 UI 事件處理器
- **缺失方法修復**: 新增所有被調用但不存在的方法

### ✨ 新增功能
- **檔案匯入**: 支援 JSON 格式的數據匯入功能
- **拖拽匯入**: 支援拖拽檔案直接匯入數據
- **數據清除**: 完整的數據清除功能
- **玩家資料編輯**: 所有玩家資料項目的編輯功能

### 🛠️ 技術改進
- 實作 `bindEvents()` - 綁定所有必要的事件處理器
- 實作 `importFromFile()` - 檔案匯入處理
- 實作 `clearAllData()` - 數據清除功能
- 實作 `showMatrixType()` - 矩陣類型切換
- 實作 `toggleRankChange()` - 分組變動標記
- 實作 `editBattle()` / `deleteBattle()` - 對戰記錄編輯
- 實作所有玩家資料編輯方法

### 📋 修復的錯誤
- ✅ 修復 `this.bindEvents is not a function`
- ✅ 修復 Enter 鍵提交功能
- ✅ 修復檔案匯入功能
- ✅ 修復矩陣切換按鈕
- ✅ 修復所有編輯功能

## 版本 1.5.4 (2025-01-22) - 重大初始化錯誤修復

### 🔥 緊急修復
- **修復 `this.updateElement is not a function` 錯誤**: 
  - 該方法在之前重構中遭到誤刪
  - 重新實作 `updateElement(elementId, value)` 方法
  - 修復應用程式無法正常初始化的問題
  - 確保所有統計數據可正常顯示

### ✅ 修復驗證
- ✅ 應用程式現在可以正常啟動
- ✅ 統計面板數據顯示正常
- ✅ BP、勝率、分組等資訊正確更新
- ✅ 不再出現 JavaScript 錯誤

### 🛠️ 技術細節
- 在 `UIController` 類別中添加了缺失的 `updateElement` 方法
- 該方法負責安全地更新 DOM 元素內容
- 包含錯誤處理，當元素不存在時會顯示警告
- 重新建置了 `index_bundle.html` 確保修復同步

## 版本 1.5.3 (2025-07-03) - 匯出功能重大修復

### 🔥 重大修復
- **匯出功能完全重寫**: 
  - 修復匯出按鈕有介面但無功能的問題
  - 實作完整的 `exportData()` 方法
  - **新增分組標記數據匯出** - 這是關鍵功能！
  - 新增專門的 `exportRankAnalysis()` 分組變動分析匯出

### ✨ 新增功能
- **完整數據匯出**: 包含所有對戰記錄、玩家資料、分組標記
- **分組變動分析**: 專門匯出標記區段的詳細分析
- **統計數據包含**: 匯出時自動計算勝率、BP變化等統計
- **區段分析**: 自動分析每個分組變動區段的表現

### 📊 匯出內容詳細
- ✅ 玩家基本資料
- ✅ 完整對戰記錄
- ✅ **分組變動標記** (rankChanges)
- ✅ 起始BP與當前分組
- ✅ 統計摘要（總勝率、先後手勝率等）
- ✅ 分組變動區段分析
- ✅ 改進建議

### 🛠️ 技術改進
- 新增 `downloadJSON()` 通用下載方法
- 實作 `generateRankAnalysis()` 分析生成
- 新增 `analyzeRankChangeSegment()` 區段分析
- 完善全域函數調用

### 💝 社群貢獻價值
- 用戶現在可以匯出真實的分組升級數據
- 分組標記數據可用於改進算法
- 標準化的數據格式便於分析

## 版本 1.5.2 (2025-07-03) - 真實支持資訊更新

### 💝 重要更新
- **更新真實捐款資訊**: 
  - 街口支付：`901539824` (Jno) - 已提供真實 QR Code
  - PayPal：`https://paypal.me/xiujiang1987?country.x=TW&locale.x=zh_TW`
  - 移除所有假的捐款資訊，改為開發者真實帳號
- **簡化支持方式**: 採用「台灣+國際」雙軌制，避免選擇困擾

### 📝 文檔更新
- **README.md**: 更新為真實捐款資訊與聯絡方式
- **launcher.html**: 更新支持開發者區段為真實資訊
- **index.html**: 主應用設定面板更新為真實捐款方式

### 🎨 UI 改進
- 簡化捐款選項：街口支付 + PayPal 雙軌制
- 保持美觀的漸層背景設計
- 明確標示開發者名稱與帳號資訊

## 版本 1.5.1 (2025-07-02) - 支持開發者資訊更新

### 💝 新增功能
- **支持開發者資訊**: 
  - 在 README.md 中新增完整的捐款支持區段
  - 在 launcher.html 中加入支持開發者資訊
  - 在主應用設定面板加入美觀的支持/回饋區段
  - 提供多種捐款方式：街口支付、LINE Pay、悠遊付、PayPal
  - 加入 GitHub Star、Issues 回報等其他支持方式

### 📝 文檔更新
- **README.md**: 新增捐款斗內資訊與明確的 CTA
- **launcher.html**: 加入開發者支持資訊
- **index.html**: 設定面板新增完整支持區段

### 🎨 UI 改進
- 支持區段採用漸層背景設計
- 使用網格佈局清晰展示捐款資訊
- 加入感謝訊息與社群價值說明

## 版本 1.5.0 (2025-07-02) - 緊急修復版

### 🚨 重要修復
- **修正初始化錯誤**:
  - 修復 `RankManager.autoAdjustRank is not a function` 錯誤
  - 修復 `RankManager.analyzeRankStatus is not a function` 錯誤
  - 移除重複且錯誤的方法定義

### 🔧 程式碼重構
- **概念統一**: 完成分組(Group)與階級(Rank)概念分離
  - 修正所有 `currentRank` 屬性為 `currentGroup`
  - 統一方法名稱：`autoAdjustRank` → `autoAdjustGroup`
  - 統一方法名稱：`analyzeRankStatus` → `analyzeGroupStatus`
- **代碼清理**: 移除重複的 `updateStats` 和 `updateRankCalculator` 方法
- **參數修正**: 修正 `generatePredictions` 方法參數名稱

### 📁 檔案變更
- `src/js/ui-controller.js` - 移除重複方法，修正方法調用
- `src/js/data-manager.js` - 修正分組屬性引用
- `src/js/rank-manager.js` - 修正方法參數名稱
- `assets/data/sample_data.json` - 更新配置屬性
- `index_bundle.html` - 重新建置同步更新

### ✅ 測試驗證
- 應用程式現在可正常初始化
- 所有基本功能正常運作
- 分組自動調整功能正常
- 統計分析功能正常

## 版本 1.4.5 (2025-01-20) - UI優化版

### 🎯 用戶體驗改進
- **移除問題按鈕**: 移除有問題的「新增對戰記錄」按鈕
- **強化 Enter 鍵提示**: 
  - 在 BP 輸入框標籤旁加入 Enter 鍵提示
  - 新增醒目的使用說明框
  - 加入鍵盤圖示和操作指引

### 🔧 技術優化
- **程式碼清理**: 移除調試日誌和臨時代碼
- **UI布局調整**: 優化表單布局和視覺提示
- **使用說明更新**: README.md 明確標示 Enter 鍵為推薦操作方式

### 💡 使用方式
- 填寫完所有欄位後，在 BP 輸入框按 **Enter 鍵**即可新增對戰記錄
- 移除容易出錯的按鈕點擊方式，統一使用鍵盤操作

## 版本 1.4.4 (2025-01-20) - BP 驗證修復版

### 🐛 重要修復
- **修正 BP 輸入驗證不一致問題**
  - 修正 `parseInt(bpValue) || 0` 導致 0 值被誤判為無效輸入的問題
  - 統一 Enter 鍵和按鈕提交的驗證邏輯
  - 現在允許 0 作為有效的 BP 變化值（練習賽等情況）
  - 改進輸入驗證：區分空值和有效的 0 值

### 🔧 程式碼優化
- **清理重複程式碼**
  - 移除 ui-controller.js 中重複的 `addBattle()` 方法定義
  - 確保只保留一個經過修正的方法版本
  - 提升程式碼可維護性

### 🎯 驗證邏輯改進
- **更精確的輸入驗證**
  - 空字符串、null、undefined 將顯示「請輸入BP變化值」
  - 無效數字（如字母）將顯示「BP變化值必須是有效數字」
  - 有效的 0 值可正常提交和記錄
  - 保持原有的大數值警告功能

## 版本 1.4.3 (2025-01-20) - 數據收集版

### 📊 數據收集功能
- **新增數據貢獻指南**
  - 創建詳細的數據貢獻說明文檔
  - 提供 GitHub Issue 模板方便數據提交
  - 建立貢獻者福利制度

### 🤝 社群參與
- **GitHub Issue 模板**
  - 數據貢獻專用模板
  - Bug 回報模板
  - 功能請求模板
  
- **文檔更新**
  - README.md 新增數據收集呼籲
  - 更新 KNOWN_ISSUES.md 說明數據需求
  - 創建完整的數據貢獻指南

### 🎯 改進目標
- **階段性目標**: 收集 100+ 真實分組變動記錄
- **社群建設**: 建立活躍的數據貢獻者社群
- **算法優化**: 基於真實數據完善分組升降規則

## 版本 1.4.2 (2025-01-20) - 最終穩定版

### 🔧 重要修復
- **修復對戰記錄編輯功能**
  - 修正編輯對戰記錄保存無反應的問題
  - 修正按鈕傳遞參數錯誤（battleIndex vs battle.id）
  - 加強錯誤處理與調試日誌
  - 確保編輯/刪除功能完全可用

### 📋 已知問題
- **分組升降變動規則未完善**
  - 自動分組升降判斷邏輯需要更多實際遊戲數據
  - 目前建議使用手動分組標記功能
  - 詳見 [`docs/KNOWN_ISSUES.md`](docs/KNOWN_ISSUES.md)

### 🧹 專案清理
- **移除臨時檔案**
  - 清理 fix_*.js 修復腳本
  - 移除 test_edit_functionality.html 測試檔案
  - 刪除舊版本檔案（index_modular.html, index_standalone.html）
  - 整理文檔資料夾

### 📁 最終檔案結構
```
shadowverse_worlds_beyond_tracker/
├── index.html              # 模組化版本（開發用）
├── index_bundle.html        # 單檔案版本（使用者用）
├── launcher.html           # 啟動器
├── src/                    # 原始碼模組
│   ├── css/styles.css
│   └── js/
│       ├── config.js
│       ├── data-manager.js
│       ├── rank-manager.js
│       └── ui-controller.js
├── build.ps1               # Windows 建置腳本
├── build.py               # Python 建置腳本
├── package.json           # 專案配置
├── README.md             # 使用說明
├── assets/               # 資源檔案
└── docs/                 # 文檔
    ├── CHANGELOG_v1.4.0.md
    ├── CHANGELOG_v1.4.1.md
    ├── BUG_FIX_REPORT_v1.4.2.md
    └── TESTING_CHECKLIST_v1.4.0.md
```

## 版本 1.4.1 (2025-01-19) - 修復版本

### 🔧 重要修復
- **修復重複的 renderBattles 方法**
  - 移除 ui-controller.js 中重複的方法定義
  - 確保只保留一個包含所有功能的版本
  - 修復功能衝突問題

### ✨ 功能完善
- **對戰記錄操作整合**
  - 編輯按鈕：修改現有對戰記錄
  - 刪除按鈕：移除對戰記錄
  - 分組標記按鈕：標記分組變動
  - 所有按鈕整合顯示

## 版本 1.4.0 (2025-01-18) - 重大功能更新

### 🎯 新增功能

#### 📊 對戰矩陣分析
- **7職業 vs 7職業對戰統計**
  - 分別統計先手/後手勝率
  - 動態切換先手/後手視圖
  - 詳細對戰數據與勝率百分比
  - 視覺化矩陣表格

#### 📈 分組升降追蹤
- **階級變動記錄系統**
  - 手動標記分組變動
  - 記錄變動原因與相關數據
  - 分組變動分析報告
  - 勝率變化追蹤

#### ✏️ 對戰記錄管理
- **手動編輯/刪除功能**
  - 彈窗式編輯介面
  - 完整數據修正支援
  - 安全刪除確認
  - 即時數據更新

#### 🏆 先手/後手統計
- **詳細先攻統計**
  - 分別記錄先手/後手對戰
  - 獨立勝率計算
  - 統計面板顯示
  - 導出功能包含

### 🎨 UI/UX 改進
- **BP變化輸入優化**
  - Enter 鍵快速提交
  - 即時數值驗證
  - 自動格式化與選中
  - Toast 成功提示

- **視覺元素強化**
  - 先手/後手標籤設計
  - 對戰矩陣響應式佈局
  - 統一按鈕樣式
  - 改善表格可讀性

### 🔨 技術架構
- **模組化重構**
  - 保持 index.html 模組化結構
  - 單檔案建置腳本（build.ps1, build.py）
  - 自動產生 index_bundle.html
  - 完整功能整合

## 完整功能列表

### 📊 核心統計
- [x] 總勝率統計
- [x] 先手勝率統計  
- [x] 後手勝率統計
- [x] 連勝/連敗追蹤
- [x] 階級進度追蹤
- [x] BP 變化記錄

### 🎯 對戰管理
- [x] 新增對戰記錄
- [x] 編輯對戰記錄
- [x] 刪除對戰記錄
- [x] 先手/後手選擇
- [x] 職業對戰統計
- [x] 對戰歷史瀏覽

### 📈 進階分析
- [x] 對戰矩陣（7x7職業）
- [x] 先手/後手矩陣切換
- [x] 分組升降追蹤
- [x] 分組變動分析
- [x] 數據導出功能

### 💾 數據管理
- [x] 本地數據儲存
- [x] 導入/導出功能
- [x] 數據備份
- [x] 玩家檔案管理

### 🎮 使用體驗
- [x] 響應式設計
- [x] 快捷鍵支援
- [x] Toast 通知系統
- [x] 單檔案部署

---

## 技術規格

- **前端**: 純 HTML5 + CSS3 + Vanilla JavaScript
- **儲存**: LocalStorage
- **架構**: 模組化設計，可建置為單檔案
- **相容性**: 現代瀏覽器支援
- **部署**: 零依賴，可離線使用

## 開發團隊

開發者: AI Assistant  
最後更新: 2025-01-20
