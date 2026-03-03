# setup_directories.py
import os

def setup_directories():
    print("📁 Setting up required directories...")
    
    directories = [
        "database",
        "static/css",
        "static/js",
        "static/images",
        "templates",
        "receipts",
        "uploads",
        "logs"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✅ Created: {directory}/")
    
    # Create required files
    print("\n📄 Creating required files...")
    
    # Create login template if missing
    login_template = '''<!DOCTYPE html>
<html>
<head>
    <title>Agentic AI Platform - Login</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .login-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            width: 300px;
        }
        h2 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .input-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            color: #666;
        }
        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        }
        button:hover {
            background: #5a6fd8;
        }
        .demo-credentials {
            margin-top: 20px;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 5px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h2>Agentic AI Platform</h2>
        <div class="input-group">
            <label>Email</label>
            <input type="email" id="email" value="admin@agenticai.com">
        </div>
        <div class="input-group">
            <label>Password</label>
            <input type="password" id="password" value="Admin123!">
        </div>
        <button onclick="login()">Login</button>
        
        <div class="demo-credentials">
            <strong>Demo Credentials:</strong><br>
            Email: admin@agenticai.com<br>
            Password: Admin123!
        </div>
    </div>
    
    <script>
        function login() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // For demo, just redirect to dashboard
            if (email === 'admin@agenticai.com' && password === 'Admin123!') {
                window.location.href = '/dashboard';
            } else {
                alert('Invalid credentials. Using demo credentials...');
                window.location.href = '/dashboard';
            }
        }
        
        // Auto-login for demo
        setTimeout(() => {
            login();
        }, 1000);
    </script>
</body>
</html>'''
    
    with open('templates/login.html', 'w', encoding='utf-8') as f:
        f.write(login_template)
    print("✅ Created: templates/login.html")
    
    return True

if __name__ == "__main__":
    setup_directories()