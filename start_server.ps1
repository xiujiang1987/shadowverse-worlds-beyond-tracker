# 本地伺服器啟動腳本
# 使用 Python 內建的 HTTP 伺服器來執行模組化版本

Write-Host "🚀 啟動本地伺服器..." -ForegroundColor Green
Write-Host "📁 工作目錄: $(Get-Location)" -ForegroundColor Yellow

# 檢查 Python 是否可用
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCmd = "py"
}

if ($pythonCmd) {
    Write-Host "✅ 找到 Python: $pythonCmd" -ForegroundColor Green
    Write-Host "🌐 啟動伺服器於 http://localhost:8000" -ForegroundColor Cyan
    Write-Host "📝 模組化版本將在: http://localhost:8000/index.html" -ForegroundColor Cyan
    Write-Host "📝 單檔案版本將在: http://localhost:8000/index_bundle.html" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "按 Ctrl+C 停止伺服器" -ForegroundColor Yellow
    Write-Host "================================" -ForegroundColor Magenta
    
    # 嘗試自動開啟瀏覽器
    try {
        Start-Process "http://localhost:8000/index.html"
    } catch {
        Write-Host "⚠️ 無法自動開啟瀏覽器，請手動前往 http://localhost:8000/index.html" -ForegroundColor Yellow
    }
    
    # 啟動 Python HTTP 伺服器
    & $pythonCmd -m http.server 8000
} else {
    Write-Host "❌ 未找到 Python，無法啟動本地伺服器" -ForegroundColor Red
    Write-Host "💡 建議方案：" -ForegroundColor Yellow
    Write-Host "   1. 使用 index_bundle.html (單檔案版本)" -ForegroundColor Cyan
    Write-Host "   2. 安裝 Python 後再試" -ForegroundColor Cyan
    Write-Host "   3. 使用 VS Code Live Server 擴充功能" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "按任意鍵繼續..." -ForegroundColor Gray
    Read-Host
}
