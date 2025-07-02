# 支持開發者資訊更新腳本模板
# 請填寫您的真實資訊後執行此腳本進行全域更新

param(
    [string]$LinePayInfo = "[請填寫LINE Pay資訊]",
    [string]$PayPalInfo = "[請填寫PayPal.me連結]", 
    [string]$GitHubUsername = "[請填寫GitHub用戶名]",
    [string]$DeveloperName = "[請填寫開發者顯示名稱]"
)

Write-Host "🃏 Shadowverse: Worlds Beyond Tracker - 支持開發者資訊更新工具" -ForegroundColor Yellow
Write-Host "=" * 60

# 檢查參數
if ($LinePayInfo -eq "[請填寫LINE Pay資訊]" -or 
    $PayPalInfo -eq "[請填寫PayPal.me連結]" -or 
    $GitHubUsername -eq "[請填寫GitHub用戶名]") {
    
    Write-Host "❌ 請先填寫必要資訊！" -ForegroundColor Red
    Write-Host ""
    Write-Host "使用方式："
    Write-Host '.\update_support_info.ps1 -LinePayInfo "your_linepay_id" -PayPalInfo "paypal.me/yourname" -GitHubUsername "yourusername" -DeveloperName "Your Name"'
    Write-Host ""
    Write-Host "範例："
    Write-Host '.\update_support_info.ps1 -LinePayInfo "901234567" -PayPalInfo "paypal.me/developer" -GitHubUsername "developer123" -DeveloperName "開發者"'
    exit 1
}

Write-Host "📝 將更新以下資訊：" -ForegroundColor Green
Write-Host "   LINE Pay: $LinePayInfo"
Write-Host "   PayPal: $PayPalInfo"
Write-Host "   GitHub: $GitHubUsername"
Write-Host "   開發者: $DeveloperName"
Write-Host ""

# 更新 README.md
Write-Host "🔧 更新 README.md..." -ForegroundColor Blue
$readmeContent = Get-Content "README.md" -Raw -Encoding UTF8

$readmeContent = $readmeContent -replace '\*\*LINE Pay\*\*: `\[待設定\]`', "**LINE Pay**: ``$LinePayInfo``"
$readmeContent = $readmeContent -replace '\*\*PayPal\*\*: `\[待設定\]`', "**PayPal**: [$PayPalInfo]($PayPalInfo)"
$readmeContent = $readmeContent -replace 'github\.com/\[待確認\]/', "github.com/$GitHubUsername/"
$readmeContent = $readmeContent -replace 'LINE Pay `\[待設定\]`', "LINE Pay ``$LinePayInfo``"
$readmeContent = $readmeContent -replace 'PayPal `\[待設定\]`', "PayPal ``$PayPalInfo``"

Set-Content "README.md" $readmeContent -Encoding UTF8

# 更新 launcher.html
Write-Host "🔧 更新 launcher.html..." -ForegroundColor Blue
$launcherContent = Get-Content "launcher.html" -Raw -Encoding UTF8

$launcherContent = $launcherContent -replace 'LINE Pay \[待設定\]', "LINE Pay $LinePayInfo"
$launcherContent = $launcherContent -replace 'PayPal \[待設定\]', "PayPal $PayPalInfo"
$launcherContent = $launcherContent -replace 'github\.com/\[待確認\]/', "github.com/$GitHubUsername/"

Set-Content "launcher.html" $launcherContent -Encoding UTF8

# 更新 index.html
Write-Host "🔧 更新 index.html..." -ForegroundColor Blue
$indexContent = Get-Content "index.html" -Raw -Encoding UTF8

$indexContent = $indexContent -replace 'LINE Pay: <strong>\[待設定\]</strong>', "LINE Pay: <strong>$LinePayInfo</strong>"
$indexContent = $indexContent -replace 'PayPal: <strong>\[待設定\]</strong>', "PayPal: <strong>$PayPalInfo</strong>"
$indexContent = $indexContent -replace 'github\.com/\[待確認\]/', "github.com/$GitHubUsername/"

Set-Content "index.html" $indexContent -Encoding UTF8

# 重新建置單檔案版本
Write-Host "🔨 重新建置單檔案版本..." -ForegroundColor Blue
& .\build.ps1

Write-Host ""
Write-Host "✅ 支持開發者資訊更新完成！" -ForegroundColor Green
Write-Host "📁 已更新檔案："
Write-Host "   • README.md"
Write-Host "   • launcher.html"
Write-Host "   • index.html"
Write-Host "   • index_bundle.html (重新建置)"
Write-Host ""
Write-Host "🚀 下一步建議："
Write-Host "   1. 測試所有連結是否正確"
Write-Host "   2. 提交變更: git add . && git commit -m 'feat: 更新支持開發者資訊'"
Write-Host "   3. 推送到 GitHub: git push"
