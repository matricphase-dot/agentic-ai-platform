# create_all_templates.py
import os

base_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agentic AI - {title}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <style>
        :root {{
            --primary-color: #4a6fa5;
            --secondary-color: #166088;
            --accent-color: #4fc3a1;
            --dark-bg: #1a1d29;
            --card-bg: #2d3343;
            --text-color: #e4e6eb;
            --sidebar-width: 260px;
        }}
        
        body {{
            background-color: var(--dark-bg);
            color: var(--text-color);
            font-family: 'Segoe UI', system-ui, sans-serif;
            margin: 0;
            padding: 0;
        }}
        
        .dashboard-container {{
            display: flex;
            min-height: 100vh;
        }}
        
        .sidebar {{
            width: var(--sidebar-width);
            background: linear-gradient(180deg, #1e2332 0%, #151824 100%);
            padding: 20px 0;
            position: fixed;
            height: 100vh;
            border-right: 1px solid rgba(255,255,255,0.1);
        }}
        
        .logo {{
            padding: 0 20px 30px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            margin-bottom: 20px;
        }}
        
        .logo i {{
            font-size: 28px;
            color: var(--accent-color);
        }}
        
        .logo h2 {{
            margin: 0;
            font-weight: 700;
            font-size: 24px;
            background: linear-gradient(90deg, #4fc3a1, #4a6fa5);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        
        .nav-links {{
            list-style: none;
            padding: 0 15px;
        }}
        
        .nav-links li {{
            margin-bottom: 8px;
        }}
        
        .nav-links a {{
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 20px;
            color: #b0b3b8;
            text-decoration: none;
            border-radius: 10px;
            transition: all 0.3s ease;
            font-weight: 500;
        }}
        
        .nav-links a:hover {{
            background: rgba(79, 195, 161, 0.1);
            color: var(--text-color);
            transform: translateX(5px);
        }}
        
        .nav-links a.active {{
            background: linear-gradient(90deg, rgba(79, 195, 161, 0.2), rgba(74, 111, 165, 0.2));
            color: var(--accent-color);
            border-left: 4px solid var(--accent-color);
        }}
        
        .main-content {{
            flex: 1;
            margin-left: var(--sidebar-width);
            padding: 20px;
            background: var(--dark-bg);
        }}
        
        .top-bar {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding: 20px;
            background: var(--card-bg);
            border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }}
        
        .top-bar h1 {{
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 12px;
        }}
        
        .top-bar h1 i {{
            color: var(--accent-color);
        }}
        
        .content-area {{
            padding: 20px 0;
        }}
        
        .card {{
            background: var(--card-bg);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 25px;
            border: none;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }}
        
        .btn {{
            padding: 12px 24px;
            border-radius: 10px;
            border: none;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }}
        
        .btn-primary {{
            background: linear-gradient(90deg, var(--accent-color), var(--primary-color));
            color: white;
        }}
    </style>
</head>
<body>
    <div class="dashboard-container">
        <nav class="sidebar">
            <div class="logo">
                <i class="fas fa-robot"></i>
                <h2>Agentic AI</h2>
            </div>
            <ul class="nav-links">
                <li><a href="/"><i class="fas fa-home"></i> <span>Dashboard</span></a></li>
                <li><a href="/desktop-recorder"><i class="fas fa-desktop"></i> <span>Desktop Recorder</span></a></li>
                <li><a href="/file-organizer"><i class="fas fa-folder"></i> <span>File Organizer</span></a></li>
                <li><a href="/ai-automation"><i class="fas fa-magic"></i> <span>AI Automation</span></a></li>
                <li><a href="/marketplace"><i class="fas fa-store"></i> <span>Marketplace</span></a></li>
                <li><a href="/analytics"><i class="fas fa-chart-bar"></i> <span>Analytics</span></a></li>
                <li><a href="/mobile"><i class="fas fa-mobile-alt"></i> <span>Mobile</span></a></li>
                <li><a href="/settings"><i class="fas fa-cog"></i> <span>Settings</span></a></li>
                <li><a href="/profile"><i class="fas fa-user"></i> <span>Profile</span></a></li>
                <li><a href="/help"><i class="fas fa-question-circle"></i> <span>Help</span></a></li>
            </ul>
        </nav>

        <main class="main-content">
            <div class="top-bar">
                <h1><i class="{icon}"></i> {title}</h1>
                <div class="user-info">
                    <div class="status-indicator">
                        <span class="status-dot active"></span>
                        <span>Feature Active</span>
                    </div>
                </div>
            </div>

            <div class="content-area">
                {content}
            </div>
        </main>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {{
            // Feature-specific JavaScript will go here
        }});
    </script>
</body>
</html>"""

pages = {
    "ai-automation.html": {
        "title": "AI Automation",
        "icon": "fas fa-magic",
        "content": """
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-robot"></i> Chat with AI</h3>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <textarea class="form-control" id="aiPrompt" rows="4" placeholder="Ask the AI anything..."></textarea>
                        </div>
                        <div class="mb-3">
                            <select class="form-control" id="aiModel">
                                <option value="llama3.2">Llama 3.2 (Recommended)</option>
                                <option value="llama3.2:3b">Llama 3.2 3B (Faster)</option>
                                <option value="mistral">Mistral (Creative)</option>
                            </select>
                        </div>
                        <button class="btn btn-primary" onclick="sendAIMessage()">
                            <i class="fas fa-paper-plane"></i> Send to AI
                        </button>
                        <div id="aiResponse" class="mt-4 p-3 bg-dark rounded" style="min-height: 200px;">
                            <p class="text-muted">AI response will appear here...</p>
                        </div>
                    </div>
                </div>
        """
    },
    "marketplace.html": {
        "title": "Marketplace",
        "icon": "fas fa-store",
        "content": """
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-box-open"></i> Automation Templates</h3>
                    </div>
                    <div class="card-body">
                        <div class="row" id="templatesList">
                            <div class="col-md-4 mb-4">
                                <div class="card h-100">
                                    <div class="card-body text-center">
                                        <i class="fas fa-folder fa-3x mb-3 text-primary"></i>
                                        <h5>File Organizer Pro</h5>
                                        <p>Advanced file organization templates</p>
                                        <button class="btn btn-primary btn-sm">Download</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        """
    },
    "analytics.html": {
        "title": "Analytics",
        "icon": "fas fa-chart-bar",
        "content": """
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-chart-line"></i> Usage Statistics</h3>
                    </div>
                    <div class="card-body">
                        <canvas id="usageChart" height="100"></canvas>
                    </div>
                </div>
        """
    }
}

for filename, data in pages.items():
    with open(f"templates/{filename}", "w") as f:
        content = base_template.format(
            title=data["title"],
            icon=data["icon"],
            content=data["content"]
        )
        f.write(content)
    print(f"Created: {filename}")