#!/usr/bin/env python3
"""
Quick fix script for Agentic AI Platform
Run this to fix all common issues
"""
import os
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).parent

def fix_html_files():
    """Fix CSS/JS paths in HTML files"""
    templates_dir = BASE_DIR / "templates"
    
    if not templates_dir.exists():
        print("❌ Templates directory not found!")
        return
    
    for html_file in templates_dir.glob("*.html"):
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix CSS paths
        content = content.replace('href="/css/', 'href="/static/css/')
        content = content.replace("href='/css/", "href='/static/css/")
        
        # Fix JS paths
        content = content.replace('src="/js/', 'src="/static/js/')
        content = content.replace("src='/js/", "src='/static/js/")
        
        # Fix image paths if any
        content = content.replace('src="/img/', 'src="/static/img/')
        content = content.replace("src='/img/", "src='/static/img/")
        
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Fixed paths in {html_file.name}")

def create_static_structure():
    """Ensure static directory structure exists"""
    static_dir = BASE_DIR / "static"
    
    # Create directories
    (static_dir / "css").mkdir(parents=True, exist_ok=True)
    (static_dir / "js").mkdir(parents=True, exist_ok=True)
    (static_dir / "img").mkdir(parents=True, exist_ok=True)
    (static_dir / "uploads").mkdir(parents=True, exist_ok=True)
    
    print("✅ Created static directory structure")

def create_404_page():
    """Create 404 error page"""
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Page Not Found | Agentic AI</title>
    <link rel="stylesheet" href="/static/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 2rem;
        }
        
        .error-code {
            font-size: 8rem;
            font-weight: bold;
            margin-bottom: 1rem;
            text-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        
        .error-message {
            font-size: 1.8rem;
            margin-bottom: 2rem;
            max-width: 600px;
        }
        
        .error-actions {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .btn-error {
            padding: 12px 24px;
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-error:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .ai-robot {
            font-size: 6rem;
            margin-bottom: 2rem;
            animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="ai-robot">
            <i class="fas fa-robot"></i>
        </div>
        <div class="error-code">404</div>
        <div class="error-message">
            The page you're looking for seems to have wandered off into the digital void.
        </div>
        <div class="error-actions">
            <a href="/" class="btn-error">
                <i class="fas fa-home"></i> Back to Dashboard
            </a>
            <a href="/landing" class="btn-error">
                <i class="fas fa-rocket"></i> Landing Page
            </a>
            <a href="/help" class="btn-error">
                <i class="fas fa-question-circle"></i> Get Help
            </a>
        </div>
        <p style="margin-top: 3rem; opacity: 0.8;">
            Or use the navigation menu to find what you need.
        </p>
    </div>
</body>
</html>'''
    
    with open(BASE_DIR / "templates" / "404.html", 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print("✅ Created 404.html page")

def main():
    print("🛠️  Running Agentic AI Platform Quick Fix...")
    print("=" * 60)
    
    create_static_structure()
    fix_html_files()
    create_404_page()
    
    print("=" * 60)
    print("✅ All fixes applied!")
    print("\nNext steps:")
    print("1. Replace server.py with the corrected version")
    print("2. Add get_categories() method to marketplace_engine.py")
    print("3. Restart the server: python server.py")
    print("4. Visit: http://localhost:5000")

if __name__ == "__main__":
    main()