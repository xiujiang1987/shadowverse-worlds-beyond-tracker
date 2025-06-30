# 🃏 Shadowverse: Worlds Beyond Tracker

<div align="center">

![Version](https://img.shields.io/badge/version-1.4.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

**專為《闇影詩章：凌越世界》設計的專業對戰記錄追蹤器**

[📥 直接下載使用](#快速開始) • [🎮 在線演示](#) • [📖 使用教學](#功能介紹) • [🔧 開發文檔](#開發指南)

</div>

## ✨ 核心功能

### 📊 先手後手統計分析
- **分別勝率統計**: 總勝率、先手勝率、後手勝率
- **對戰矩陣**: 7職業 vs 7職業完整矩陣（分先手/後手）
- **智能分析**: 自動統計各職業對戰勝率
- **視覺化展示**: 清晰的表格和圖表展示

### ⚔️ 對戰記錄管理
- **完整記錄**: 我的職業、對手職業、先手/後手、勝負、BP變化
- **即時編輯**: 點擊編輯按鈕修改現有記錄
- **快速刪除**: 一鍵刪除錯誤記錄
- **智能輸入**: BP變化支持多種格式（+5, -3, 10等）
- **Enter提交**: BP輸入框支持Enter鍵快速提交

### 📈 分組升降追蹤
- **分組標記**: 為對戰記錄標記分組變動
- **升降分析**: 詳細的分組變動分析報告
- **歷史追蹤**: 完整的分組變動歷史記錄
- **智能計算**: 自動計算升降級所需勝率

### 💾 數據管理
- **本地存儲**: 使用 localStorage 安全存儲數據
- **數據導出**: 支持統計數據和分組分析導出
- **數據清理**: 一鍵清理舊數據功能
- **備份還原**: 完整的數據備份和還原功能

## 🚀 快速開始

### 方法一：直接下載使用（推薦）
1. 下載 [`index_bundle.html`](https://github.com/xiujiang1987/shadowverse-worlds-beyond-tracker/raw/main/index_bundle.html)
2. 雙擊文件直接在瀏覽器中開啟
3. 開始記錄您的對戰數據！

### 方法二：完整下載
```bash
git clone https://github.com/xiujiang1987/shadowverse-worlds-beyond-tracker.git
cd shadowverse-worlds-beyond-tracker
# 雙擊 launcher.html 選擇版本
```

## 📱 系統需求

- **瀏覽器**: Chrome 80+、Firefox 75+、Safari 13+ 或其他現代瀏覽器
- **系統**: Windows、macOS、Linux
- **網路**: 僅首次載入需要，之後可完全離線使用
- **儲存**: 約 2MB 磁碟空間

## 🎮 功能介紹

<details>
<summary>📊 統計面板</summary>

- **總勝率**: 所有對戰的綜合勝率
- **先手勝率**: 先攻時的勝率統計
- **後手勝率**: 後攻時的勝率統計
- **連勝記錄**: 當前連勝/連敗狀態
- **階級追蹤**: 自動計算目前分組與進度

</details>

<details>
<summary>🏆 對戰矩陣</summary>

- **7x7 職業矩陣**: 完整的職業對戰統計
- **先手/後手切換**: 分別查看先攻/後攻數據
- **勝率百分比**: 精確到小數點的勝率計算
- **對戰數統計**: 顯示各職業對戰場次

</details>

<details>
<summary>📈 分組追蹤</summary>

- **升降標記**: 手動標記重要的分組變動
- **變動分析**: 生成詳細的升降級分析報告
- **歷史記錄**: 完整的分組變動時間線
- **數據導出**: 匯出分析報告供深度研究

</details>

## 🔄 版本歷史

### v1.4.2 (當前版本 - 2025-01-20) ✅
- **功能修復**: 修正編輯對戰記錄保存無反應問題
- **專案清理**: 移除所有臨時檔案和舊版本
- **最終穩定**: 確保所有功能完全可用
- **準備發布**: 清理專案結構，準備推送 GitHub

### v1.4.1 (修復版本) 🔧
- **重要修復**: 修復重複的 renderBattles 方法問題
- **功能完善**: 對戰記錄編輯、刪除、分組標記按鈕整合
- **UI優化**: 按鈕佈局更整齊，操作更直觀

### v1.4.0 (進階功能版) ✨
- **對戰矩陣**: 7x7 職業對戰矩陣（分先手/後手）
- **分組追蹤**: 完整的分組升降追蹤系統
- **記錄編輯**: 對戰記錄手動編輯和刪除功能
- **數據分析**: 分組變動分析報告

## 🛠️ 開發指南

### 檔案結構
```
shadowverse-worlds-beyond-tracker/
├── index.html              # 模組化版本（開發用）
├── index_bundle.html        # 單檔案版本（使用者用）⭐
├── launcher.html           # 檔案選擇器
├── src/                    # 原始碼模組
│   ├── css/styles.css      # 樣式表
│   └── js/                 # JavaScript 模組
│       ├── config.js       # 配置管理
│       ├── data-manager.js # 數據管理
│       ├── rank-manager.js # 分組邏輯
│       └── ui-controller.js # UI 控制
├── build.ps1              # Windows 建置腳本
├── build.py               # Python 建置腳本
└── docs/                  # 開發文檔
```

### 本地開發
```bash
# 1. 克隆倉庫
git clone https://github.com/xiujiang1987/shadowverse-worlds-beyond-tracker.git

# 2. 開發時直接編輯 src/ 中的檔案

# 3. 建置單檔案版本（Windows）
.\build.ps1

# 4. 建置單檔案版本（其他系統）
python build.py
```

### 技術棧
- **前端**: 純 HTML5 + CSS3 + Vanilla JavaScript
- **儲存**: LocalStorage
- **架構**: 模組化設計，可建置為單檔案
- **相容性**: 現代瀏覽器支援
- **部署**: 零依賴，可離線使用

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

1. Fork 這個倉庫
2. 創建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟一個 Pull Request

## 📄 授權

本專案採用 MIT 授權 - 查看 [LICENSE](LICENSE) 檔案了解詳情。

## 🙏 致謝

- [Shadowverse: Worlds Beyond](https://shadowverse.com/) - 精彩的卡牌遊戲
- 所有提供回饋和建議的玩家社群

---

<div align="center">

**如果這個工具對您有幫助，請給個 ⭐️ 支持一下！**

[回到頂部](#-shadowverse-worlds-beyond-tracker)

</div>
