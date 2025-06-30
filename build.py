#!/usr/bin/env python3
"""
Shadowverse: Worlds Beyond Tracker - 模組化建置腳本
自動將模組化的 HTML、CSS、JS 檔案組合成單一入口檔案
"""

import os
import json
from pathlib import Path

class ModularBuilder:
    def __init__(self, project_root="."):
        self.project_root = Path(project_root)
        self.output_file = self.project_root / "index_bundle.html"
        
    def read_file(self, file_path):
        """讀取檔案內容"""
        try:
            with open(self.project_root / file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            print(f"⚠️  檔案不存在: {file_path}")
            return ""
        except Exception as e:
            print(f"❌ 讀取檔案失敗 {file_path}: {e}")
            return ""
    
    def build_single_file(self):
        """建置單檔案版本"""
        print("🔧 開始建置模組化單檔案...")
        
        # 讀取主要 HTML 結構
        html_content = self.read_file("index.html")
        if not html_content:
            print("❌ 無法讀取主要 HTML 檔案")
            return False
        
        # 讀取 CSS
        css_content = self.read_file("src/css/styles.css")
        
        # 讀取 JavaScript 模組（依載入順序）
        js_modules = [
            "src/js/config.js",
            "src/js/data-manager.js", 
            "src/js/rank-manager.js",
            "src/js/ui-controller.js"
        ]
        
        js_content = ""
        for module in js_modules:
            module_content = self.read_file(module)
            if module_content:
                js_content += f"\n        // === {module} ===\n"
                js_content += f"        {module_content}\n"
        
        # 替換 CSS 連結
        if css_content:
            css_replacement = f"<style>\n{css_content}\n    </style>"
            html_content = html_content.replace(
                '<link rel="stylesheet" href="src/css/styles.css">',
                css_replacement
            )
        
        # 替換 JavaScript 模組載入
        js_replacement = f"""<script>
{js_content}
    </script>"""
        
        # 找到並替換 JavaScript 模組載入區域
        import re
        js_pattern = r'<!-- JavaScript 模組 -->.*?</script>'
        html_content = re.sub(
            js_pattern, 
            js_replacement,
            html_content, 
            flags=re.DOTALL
        )
        
        # 寫入輸出檔案
        try:
            with open(self.output_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
            print(f"✅ 建置完成: {self.output_file}")
            return True
        except Exception as e:
            print(f"❌ 寫入檔案失敗: {e}")
            return False
    
    def create_dev_launcher(self):
        """建立開發用啟動器（模組化）"""
        launcher_content = '''<!DOCTYPE html>
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
            alert('請執行: python build.py\\n或手動執行建置腳本');
        }
    </script>
</body>
</html>'''
        
        launcher_file = self.project_root / "launcher.html"
        try:
            with open(launcher_file, 'w', encoding='utf-8') as f:
                f.write(launcher_content)
            print(f"✅ 開發啟動器已建立: {launcher_file}")
        except Exception as e:
            print(f"❌ 建立啟動器失敗: {e}")

def main():
    """主要執行函數"""
    print("🃏 Shadowverse: Worlds Beyond Tracker - 模組化建置工具")
    print("=" * 60)
    
    builder = ModularBuilder()
    
    # 建置單檔案版本
    success = builder.build_single_file()
    
    # 建立開發啟動器
    builder.create_dev_launcher()
    
    if success:
        print("\n🎉 建置完成！")
        print("📁 產生的檔案:")
        print(f"   • index_bundle.html (單檔案版本)")
        print(f"   • launcher.html (開發啟動器)")
        print("\n💡 使用建議:")
        print("   • 開發時使用原始模組化檔案")
        print("   • 分享時使用 index_bundle.html")
        print("   • 使用 launcher.html 快速選擇版本")
    else:
        print("❌ 建置失敗")

if __name__ == "__main__":
    main()
