# Shadowverse: Worlds Beyond Tracker - PowerShell 建置腳本
# 自動將模組化的 HTML、CSS、JS 檔案組合成單一入口檔案

Write-Host "🃏 Shadowverse: Worlds Beyond Tracker - 模組化建置工具" -ForegroundColor Cyan
Write-Host "=" * 60

$projectRoot = Get-Location
$outputFile = Join-Path $projectRoot "index_bundle.html"

function Read-FileContent($filePath) {
    $fullPath = Join-Path $projectRoot $filePath
    if (Test-Path $fullPath) {
        try {
            return Get-Content $fullPath -Raw -Encoding UTF8
        }
        catch {
            Write-Host "❌ 讀取檔案失敗 $filePath : $_" -ForegroundColor Red
            return ""
        }
    }
    else {
        Write-Host "⚠️  檔案不存在: $filePath" -ForegroundColor Yellow
        return ""
    }
}

Write-Host "🔧 開始建置模組化單檔案..." -ForegroundColor Green

# 讀取主要 HTML 結構
$htmlContent = Read-FileContent "index.html"
if (-not $htmlContent) {
    Write-Host "❌ 無法讀取主要 HTML 檔案" -ForegroundColor Red
    exit 1
}

# 讀取 CSS
$cssContent = Read-FileContent "src/css/styles.css"

# 讀取 JavaScript 模組（依載入順序）
$jsModules = @(
    "src/js/config.js",
    "src/js/data-manager.js", 
    "src/js/rank-manager.js",
    "src/js/ui-controller.js"
)

$jsContent = ""
foreach ($module in $jsModules) {
    $moduleContent = Read-FileContent $module
    if ($moduleContent) {
        $jsContent += "`n        // === $module ===`n"
        $jsContent += "        $moduleContent`n"
    }
}

# 替換 CSS 連結
if ($cssContent) {
    $cssReplacement = "<style>`n$cssContent`n    </style>"
    $htmlContent = $htmlContent -replace '<link rel="stylesheet" href="src/css/styles.css">', $cssReplacement
}

# 替換 JavaScript 模組載入
$jsReplacement = @"
<script>
$jsContent
    </script>
"@

# 找到並替換 JavaScript 模組載入區域
$pattern = '(?s)<!-- JavaScript 模組 -->.*?</script>'
$htmlContent = $htmlContent -replace $pattern, $jsReplacement

# 寫入輸出檔案
try {
    $htmlContent | Out-File -FilePath $outputFile -Encoding UTF8
    Write-Host "✅ 建置完成: $outputFile" -ForegroundColor Green
}
catch {
    Write-Host "❌ 寫入檔案失敗: $_" -ForegroundColor Red
    exit 1
}

# 建立開發啟動器
$launcherContent = @'
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shadowverse: Worlds Beyond - 開發模式</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: #1a1a2e; 
            color: white; 
            margin: 0; 
            padding: 20px;
            text-align: center;
        }
        .launcher { 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 30px; 
            background: rgba(255,255,255,0.1); 
            border-radius: 15px; 
        }
        .btn { 
            display: inline-block; 
            padding: 15px 30px; 
            margin: 10px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            text-decoration: none; 
            border-radius: 8px; 
            transition: transform 0.3s;
        }
        .btn:hover { transform: translateY(-2px); }
        .note { color: #ccc; margin-top: 20px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="launcher">
        <h1>🃏 Shadowverse: Worlds Beyond</h1>
        <h2>開發工具選擇</h2>
        
        <a href="index.html" class="btn">🔧 模組化版本 (需伺服器)</a>
        <a href="index_bundle.html" class="btn">🚀 單檔案版本 (可直接開啟)</a>
        <a href="#" class="btn" onclick="buildBundle()">⚙️ 重新建置</a>
        
        <div class="note">
            <p><strong>模組化版本</strong>：適用於開發，需要本地伺服器</p>
            <p><strong>單檔案版本</strong>：適用於分享，可直接雙擊開啟</p>
        </div>
    </div>
    
    <script>
        function buildBundle() {
            alert('請執行: .\build.ps1\n或手動執行建置腳本');
        }
    </script>
</body>
</html>
'@

$launcherFile = Join-Path $projectRoot "launcher.html"
try {
    $launcherContent | Out-File -FilePath $launcherFile -Encoding UTF8
    Write-Host "✅ 開發啟動器已建立: $launcherFile" -ForegroundColor Green
}
catch {
    Write-Host "❌ 建立啟動器失敗: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 建置完成！" -ForegroundColor Green
Write-Host "📁 產生的檔案:" -ForegroundColor Yellow
Write-Host "   • index_bundle.html (單檔案版本)"
Write-Host "   • launcher.html (開發啟動器)"
Write-Host ""
Write-Host "💡 使用建議:" -ForegroundColor Cyan
Write-Host "   • 開發時使用原始模組化檔案"
Write-Host "   • 分享時使用 index_bundle.html"
Write-Host "   • 使用 launcher.html 快速選擇版本"
