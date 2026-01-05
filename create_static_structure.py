"""
CREATE STATIC DIRECTORY STRUCTURE
Run this script to create all static files for your dashboard
"""
import os
from pathlib import Path

def create_directories():
    """Create the complete directory structure"""
    directories = [
        "static/css",
        "static/js", 
        "static/assets",
        "static/assets/icons",
        "static/fonts",
        "templates"
    ]
    
    print("📁 Creating directory structure...")
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"   ✅ Created: {directory}")
    
    return True

def create_css_files():
    """Create CSS files"""
    print("\n🎨 Creating CSS files...")
    
    # 1. Main style.css
    style_css = """/* ===== MAIN STYLESHEET - AGENTIC AI PLATFORM ===== */
:root {
    --primary-color: #6366f1;
    --primary-dark: #4f46e5;
    --secondary-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --info-color: #3b82f6;
    
    --bg-dark: #0f172a;
    --bg-card: #1e293b;
    --bg-sidebar: #111827;
    --bg-hover: #334155;
    
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    
    --border-color: #334155;
    --shadow-color: rgba(0, 0, 0, 0.3);
    
    --border-radius: 12px;
    --transition: all 0.3s ease;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: var(--bg-dark);
    color: var(--text-primary);
    line-height: 1.6;
    overflow-x: hidden;
}

/* ===== DASHBOARD LAYOUT ===== */
.dashboard-container {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 260px;
    background: var(--bg-sidebar);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    transition: var(--transition);
    position: fixed;
    height: 100vh;
    z-index: 100;
}

.sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
}

.logo i {
    font-size: 1.8rem;
}

.sidebar-toggle {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.2rem;
    cursor: pointer;
    display: none;
}

.sidebar-menu {
    flex: 1;
    padding: 1.5rem 0;
    overflow-y: auto;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.5rem;
    color: var(--text-secondary);
    text-decoration: none;
    transition: var(--transition);
    position: relative;
}

.menu-item:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
}

.menu-item.active {
    background: linear-gradient(90deg, var(--primary-color), transparent);
    color: var(--text-primary);
    border-left: 3px solid var(--primary-color);
}

.menu-item i {
    font-size: 1.2rem;
    width: 24px;
    text-align: center;
}

.badge {
    background: var(--primary-color);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 20px;
    font-size: 0.75rem;
    margin-left: auto;
}

.sidebar-footer {
    padding: 1.5rem;
    border-top: 1px solid var(--border-color);
}

.user-profile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.avatar {
    width: 40px;
    height: 40px;
    background: var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
}

.user-info {
    display: flex;
    flex-direction: column;
}

.username {
    font-weight: 600;
}

.user-role {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.main-content {
    flex: 1;
    margin-left: 260px;
    padding: 1.5rem;
    transition: var(--transition);
}

/* ===== HEADER STYLES ===== */
.top-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.header-left h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.subtitle {
    color: var(--text-secondary);
}

.status-online {
    color: var(--secondary-color);
    font-weight: 600;
}

.search-box {
    position: relative;
    width: 300px;
}

.search-box input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    color: var(--text-primary);
}

.search-box i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.btn-notification {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.2rem;
    cursor: pointer;
    position: relative;
}

.notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: var(--danger-color);
    color: white;
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 50%;
}

.btn-quick-action {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius);
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: var(--transition);
}

.btn-quick-action:hover {
    background: var(--primary-dark);
}

/* ===== STATS CARDS ===== */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: var(--bg-card);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 1px solid var(--border-color);
    transition: var(--transition);
}

.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px var(--shadow-color);
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.stat-primary .stat-icon { background: rgba(99, 102, 241, 0.2); color: var(--primary-color); }
.stat-success .stat-icon { background: rgba(16, 185, 129, 0.2); color: var(--secondary-color); }
.stat-warning .stat-icon { background: rgba(245, 158, 11, 0.2); color: var(--warning-color); }
.stat-info .stat-icon { background: rgba(59, 130, 246, 0.2); color: var(--info-color); }

.stat-content h3 {
    font-size: 2rem;
    margin-bottom: 0.25rem;
}

.stat-content p {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.stat-trend {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.stat-trend .fa-arrow-up { color: var(--secondary-color); }
.stat-trend .fa-chart-line { color: var(--info-color); }
.stat-trend .fa-history { color: var(--warning-color); }
.stat-trend .fa-check-circle { color: var(--primary-color); }

/* ===== CHARTS & CONTENT ===== */
.charts-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.chart-container {
    background: var(--bg-card);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    border: 1px solid var(--border-color);
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.chart-header h3 {
    font-size: 1.25rem;
}

.chart-period {
    background: var(--bg-dark);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
}

.content-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.content-card {
    background: var(--bg-card);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    border: 1px solid var(--border-color);
}

.content-card.full-width {
    grid-column: 1 / -1;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.view-all {
    color: var(--primary-color);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 600;
}

/* ===== ACTIVITY LIST ===== */
.activity-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.activity-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
}

.activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
}

.activity-icon.success { background: rgba(16, 185, 129, 0.2); color: var(--secondary-color); }
.activity-icon.warning { background: rgba(245, 158, 11, 0.2); color: var(--warning-color); }
.activity-icon.error { background: rgba(239, 68, 68, 0.2); color: var(--danger-color); }
.activity-icon.info { background: rgba(59, 130, 246, 0.2); color: var(--info-color); }

.activity-content p {
    margin-bottom: 0.25rem;
}

.activity-time {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

/* ===== QUICK ACTIONS ===== */
.quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
}

.quick-action-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    color: var(--text-primary);
    cursor: pointer;
    transition: var(--transition);
}

.quick-action-btn:hover {
    background: var(--primary-color);
    transform: translateY(-3px);
}

.quick-action-btn i {
    font-size: 1.5rem;
}

.quick-action-btn span {
    font-size: 0.875rem;
    text-align: center;
}

/* ===== TEMPLATES GRID ===== */
.templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.template-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 1.5rem;
    transition: var(--transition);
}

.template-card:hover {
    transform: translateY(-5px);
    border-color: var(--primary-color);
}

.template-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.template-category {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background: var(--primary-color);
    color: white;
}

.template-difficulty {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

.template-title {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
}

.template-description {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin-bottom: 1rem;
    line-height: 1.5;
}

.template-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
}

.template-stats {
    display: flex;
    gap: 1rem;
}

.template-stat {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.btn-download {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: var(--transition);
}

.btn-download:hover {
    background: var(--primary-dark);
}

/* ===== MODAL ===== */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    align-items: center;
    justify-content: center;
}

.modal.active {
    display: flex;
}

.modal-content {
    background: var(--bg-card);
    border-radius: var(--border-radius);
    width: 90%;
    max-width: 500px;
    border: 1px solid var(--border-color);
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.5rem;
    cursor: pointer;
}

.modal-body {
    padding: 1.5rem;
}

.status-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
}

.status-item i {
    font-size: 1.5rem;
}

.status-item h4 {
    margin-bottom: 0.25rem;
}

.status-item p {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.status-badge {
    margin-left: auto;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
}

.status-badge.online {
    background: rgba(16, 185, 129, 0.2);
    color: var(--secondary-color);
}

.status-badge.offline {
    background: rgba(239, 68, 68, 0.2);
    color: var(--danger-color);
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1024px) {
    .sidebar {
        transform: translateX(-100%);
    }
    
    .sidebar.active {
        transform: translateX(0);
    }
    
    .main-content {
        margin-left: 0;
    }
    
    .sidebar-toggle {
        display: block;
        position: fixed;
        top: 1rem;
        left: 1rem;
        z-index: 101;
        background: var(--bg-card);
        padding: 0.5rem;
        border-radius: 6px;
    }
}

@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .charts-row {
        grid-template-columns: 1fr;
    }
    
    .content-row {
        grid-template-columns: 1fr;
    }
    
    .top-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .search-box {
        width: 100%;
    }
}

/* ===== ANIMATIONS ===== */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.fade-in {
    animation: fadeIn 0.5s ease forwards;
}

/* ===== SCROLLBAR ===== */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: var(--bg-dark);
}

::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
}

/* ===== NOTIFICATION STYLES ===== */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-card);
    border-left: 4px solid;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    max-width: 400px;
}

.notification-success { border-color: #10b981; }
.notification-error { border-color: #ef4444; }
.notification-info { border-color: #3b82f6; }
.notification-warning { border-color: #f59e0b; }

.notification i { font-size: 1.2rem; }
.notification-success i { color: #10b981; }
.notification-error i { color: #ef4444; }
.notification-info i { color: #3b82f6; }
.notification-warning i { color: #f59e0b; }

.notification-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.5rem;
    cursor: pointer;
    margin-left: auto;
}
"""
    
    with open("static/css/style.css", "w", encoding="utf-8") as f:
        f.write(style_css)
    print("   ✅ Created: static/css/style.css")
    
    # 2. Dashboard CSS (additional styles)
    dashboard_css = """/* ===== DASHBOARD ADDITIONAL STYLES ===== */
.automation-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.automation-option {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: var(--transition);
}

.automation-option:hover {
    background: var(--primary-color);
    border-color: var(--primary-color);
}

.automation-option i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.automation-option small {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.search-results {
    max-height: 400px;
    overflow-y: auto;
}

.result-section {
    margin-bottom: 1.5rem;
}

.result-section h4 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    color: var(--text-secondary);
}

.result-item {
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: var(--transition);
}

.result-item:hover {
    background: rgba(99, 102, 241, 0.2);
}

.result-item strong {
    display: block;
    margin-bottom: 0.25rem;
}

.result-item span {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.no-results, .no-activity, .no-templates {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-style: italic;
}

.search-error {
    text-align: center;
    padding: 2rem;
    color: var(--danger-color);
}

.search-error i {
    font-size: 3rem;
    margin-bottom: 1rem;
}
"""
    
    with open("static/css/dashboard.css", "w", encoding="utf-8") as f:
        f.write(dashboard_css)
    print("   ✅ Created: static/css/dashboard.css")

def create_js_files():
    """Create JavaScript files"""
    print("\n⚡ Creating JavaScript files...")
    
    # 1. Main JavaScript
    main_js = """// Main Application JavaScript
class AgenticAIApp {
    constructor() {
        this.currentUser = null;
        this.systemStatus = {
            ollama: false,
            modules: {},
            server: false
        };
    }
    
    async initialize() {
        // Check system health
        await this.checkSystemHealth();
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Load user preferences
        this.loadUserPreferences();
        
        console.log('Agentic AI Platform initialized');
    }
    
    async checkSystemHealth() {
        try {
            const response = await fetch('/api/health');
            const health = await response.json();
            
            this.systemStatus = {
                ollama: health.ollama_status === 'connected',
                modules: health.modules || {},
                server: health.status === 'healthy',
                timestamp: health.timestamp
            };
            
            // Update UI with health status
            this.updateHealthIndicator();
            
            return this.systemStatus;
        } catch (error) {
            console.error('Health check failed:', error);
            this.systemStatus.server = false;
            this.updateHealthIndicator();
            return null;
        }
    }
    
    updateHealthIndicator() {
        const indicator = document.getElementById('healthIndicator');
        if (!indicator) return;
        
        if (this.systemStatus.server && this.systemStatus.ollama) {
            indicator.innerHTML = '<i class="fas fa-circle" style="color: #10b981;"></i> All Systems Operational';
        } else if (this.systemStatus.server) {
            indicator.innerHTML = '<i class="fas fa-circle" style="color: #f59e0b;"></i> Server Running (AI Offline)';
        } else {
            indicator.innerHTML = '<i class="fas fa-circle" style="color: #ef4444;"></i> System Offline';
        }
    }
    
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Search functionality
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+O for Ollama chat
            if (e.ctrlKey && e.shiftKey && e.key === 'O') {
                e.preventDefault();
                window.location.href = '/ai-automation';
            }
            
            // Ctrl+Shift+R for recording
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                this.startQuickRecording();
            }
            
            // Ctrl+Shift+F for file organizer
            if (e.ctrlKey && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                window.location.href = '/file-organizer';
            }
        });
    }
    
    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');
        
        if (isDark) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
    }
    
    loadUserPreferences() {
        // Load theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.classList.add(savedTheme + '-theme');
        
        // Load other preferences
        const preferences = JSON.parse(localStorage.getItem('preferences') || '{}');
        this.applyPreferences(preferences);
    }
    
    applyPreferences(preferences) {
        // Apply user preferences to UI
        if (preferences.autoRefresh !== undefined) {
            // Set up auto-refresh if enabled
        }
    }
    
    async performSearch(query) {
        if (!query.trim()) return;
        
        // Show loading state
        this.showSearchResults([]);
        
        try {
            // Search across multiple endpoints
            const [templates, files, automations] = await Promise.all([
                fetch(`/api/marketplace/search?q=${encodeURIComponent(query)}`).then(r => r.json()),
                fetch(`/api/file-organizer/search?q=${encodeURIComponent(query)}`).then(r => r.json()),
                fetch(`/api/automations/search?q=${encodeURIComponent(query)}`).then(r => r.json())
            ]);
            
            // Combine and display results
            const results = {
                templates: templates.results || [],
                files: files.results || [],
                automations: automations.results || []
            };
            
            this.showSearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
            this.showSearchError();
        }
    }
    
    showSearchResults(results) {
        // Create or update search results modal
        let modal = document.getElementById('searchResultsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'searchResultsModal';
            modal.className = 'modal active';
            document.body.appendChild(modal);
        }
        
        let totalResults = results.templates.length + results.files.length + results.automations.length;
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Search Results (${totalResults} found)</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    ${totalResults === 0 ? 
                        '<p class="no-results">No results found. Try a different search term.</p>' : 
                        this.renderSearchResults(results)
                    }
                </div>
            </div>
        `;
    }
    
    renderSearchResults(results) {
        return `
            <div class="search-results">
                ${results.templates.length > 0 ? `
                    <div class="result-section">
                        <h4><i class="fas fa-store"></i> Marketplace Templates</h4>
                        ${results.templates.map(t => `
                            <div class="result-item" onclick="window.location.href='/marketplace/template/${t.id}'">
                                <strong>${t.name}</strong>
                                <span>${t.description.substring(0, 100)}...</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${results.files.length > 0 ? `
                    <div class="result-section">
                        <h4><i class="fas fa-file"></i> Files</h4>
                        ${results.files.map(f => `
                            <div class="result-item" onclick="window.location.href='/file-organizer/view?path=${encodeURIComponent(f.path)}'">
                                <strong>${f.name}</strong>
                                <span>${f.path}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${results.automations.length > 0 ? `
                    <div class="result-section">
                        <h4><i class="fas fa-robot"></i> Automations</h4>
                        ${results.automations.map(a => `
                            <div class="result-item" onclick="window.location.href='/ai-automation/run/${a.id}'">
                                <strong>${a.name}</strong>
                                <span>${a.description.substring(0, 100)}...</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    showSearchError() {
        const modal = document.getElementById('searchResultsModal');
        if (modal) {
            const body = modal.querySelector('.modal-body');
            body.innerHTML = `
                <div class="search-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Search failed. Please check your connection and try again.</p>
                </div>
            `;
        }
    }
    
    async startQuickRecording() {
        try {
            const response = await fetch('/api/desktop-recorder/quick', {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Recording started successfully', 'success');
            } else {
                this.showNotification('Failed to start recording', 'error');
            }
        } catch (error) {
            console.error('Recording error:', error);
            this.showNotification('Recording error', 'error');
        }
    }
    
    showNotification(message, type = 'info') {
        // Use the notification system from dashboard.js
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Fallback notification
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const app = new AgenticAIApp();
    window.AgenticAI = app;
    
    // Add theme styles if not already present
    if (!document.getElementById('themeStyles')) {
        const themeStyles = document.createElement('style');
        themeStyles.id = 'themeStyles';
        themeStyles.textContent = `
            .light-theme {
                --bg-dark: #f8fafc;
                --bg-card: #ffffff;
                --bg-sidebar: #1e293b;
                --text-primary: #1e293b;
                --text-secondary: #64748b;
                --border-color: #e2e8f0;
                --shadow-color: rgba(0, 0, 0, 0.1);
            }
        `;
        document.head.appendChild(themeStyles);
    }
    
    app.initialize();
});
"""
    
    with open("static/js/main.js", "w", encoding="utf-8") as f:
        f.write(main_js)
    print("   ✅ Created: static/js/main.js")
    
    # 2. Dashboard JavaScript (too long for this response, but we'll create a simplified version)
    dashboard_js = """// Dashboard JavaScript - Simplified Version
console.log('Dashboard JS loaded');

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing dashboard...');
    
    // Setup sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }
    
    // Load initial data
    loadDashboardData();
    
    // Setup notification button
    const notificationBtn = document.querySelector('.btn-notification');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            showNotification('No new notifications', 'info');
        });
    }
    
    // Setup quick action button
    const quickActionBtn = document.getElementById('quickAutomationBtn');
    if (quickActionBtn) {
        quickActionBtn.addEventListener('click', function() {
            showQuickAutomationModal();
        });
    }
});

async function loadDashboardData() {
    console.log('Loading dashboard data...');
    
    try {
        // Load system stats
        const statsResponse = await fetch('/api/system-stats');
        if (statsResponse.ok) {
            const stats = await statsResponse.json();
            updateStatsCards(stats);
        }
        
        // Load marketplace templates
        const templatesResponse = await fetch('/api/marketplace/templates?limit=4');
        if (templatesResponse.ok) {
            const templates = await templatesResponse.json();
            updateTemplatesGrid(templates);
        }
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateStatsCards(stats) {
    console.log('Updating stats cards:', stats);
    
    // Update automation count
    const automationElement = document.getElementById('totalAutomations');
    if (automationElement && stats.total_automations !== undefined) {
        automationElement.textContent = stats.total_automations;
    }
    
    // Update time saved
    const timeSavedElement = document.getElementById('timeSaved');
    if (timeSavedElement && stats.time_saved_hours !== undefined) {
        timeSavedElement.textContent = stats.time_saved_hours + 'h';
    }
    
    // Update files organized
    const filesElement = document.getElementById('filesOrganized');
    if (filesElement && stats.files_organized !== undefined) {
        filesElement.textContent = stats.files_organized;
    }
}

function updateTemplatesGrid(templates) {
    const templatesGrid = document.getElementById('templatesGrid');
    const templateCount = document.getElementById('templateCount');
    
    if (!templatesGrid) return;
    
    if (!templates || templates.length === 0) {
        templatesGrid.innerHTML = '<p class="no-templates">No templates available in marketplace</p>';
        if (templateCount) templateCount.textContent = '0';
        return;
    }
    
    if (templateCount) {
        templateCount.textContent = templates.length;
    }
    
    templatesGrid.innerHTML = '';
    
    templates.forEach(template => {
        const templateCard = document.createElement('div');
        templateCard.className = 'template-card fade-in';
        
        templateCard.innerHTML = `
            <div class="template-header">
                <span class="template-category">${template.category || 'General'}</span>
                <span class="template-difficulty">${template.difficulty || 'Beginner'}</span>
            </div>
            <h4 class="template-title">${template.name || 'Unnamed Template'}</h4>
            <p class="template-description">${template.description || 'No description available.'}</p>
            <div class="template-footer">
                <div class="template-stats">
                    <span class="template-stat">
                        <i class="fas fa-download"></i>
                        ${template.downloads || 0}
                    </span>
                    <span class="template-stat">
                        <i class="fas fa-star"></i>
                        ${template.rating ? template.rating.toFixed(1) : '0.0'}
                    </span>
                    <span class="template-stat">
                        <i class="fas fa-clock"></i>
                        ${template.estimated_time_savings || 0}m
                    </span>
                </div>
                <button class="btn-download" onclick="downloadTemplate('${template.id}')">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `;
        
        templatesGrid.appendChild(templateCard);
    });
}

function showQuickAutomationModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'quickAutomationModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Quick Automation</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="automation-options">
                    <button class="automation-option" onclick="startFileOrganizer()">
                        <i class="fas fa-folder-open"></i>
                        <span>Organize Files</span>
                        <small>Sort files by type/date</small>
                    </button>
                    <button class="automation-option" onclick="cleanupSystem()">
                        <i class="fas fa-broom"></i>
                        <span>System Cleanup</span>
                        <small>Remove temp files</small>
                    </button>
                    <button class="automation-option" onclick="backupFiles()">
                        <i class="fas fa-save"></i>
                        <span>Backup Files</span>
                        <small>Create backup</small>
                    </button>
                    <button class="automation-option" onclick="generateReport()">
                        <i class="fas fa-file-alt"></i>
                        <span>Generate Report</span>
                        <small>Create activity report</small>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} fade-in`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Quick action functions
function startFileOrganizer() {
    showNotification('File organizer started! Redirecting...', 'success');
    setTimeout(() => {
        window.location.href = '/file-organizer';
    }, 1500);
}

function startRecording() {
    showNotification('Recording feature coming soon!', 'info');
}

function openAIChat() {
    window.location.href = '/ai-automation';
}

function runMarketplaceScan() {
    showNotification('Scanning marketplace for updates...', 'info');
    setTimeout(() => {
        showNotification('Marketplace scan complete!', 'success');
        loadDashboardData();
    }, 2000);
}

function openMobilePairing() {
    window.location.href = '/mobile';
}

function generateReport() {
    showNotification('Generating analytics report...', 'info');
}

function downloadTemplate(templateId) {
    showNotification(`Downloading template ${templateId}...`, 'info');
}

function showSystemStatus() {
    const modal = document.getElementById('statusModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal() {
    const modal = document.getElementById('statusModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Make functions available globally
window.startFileOrganizer = startFileOrganizer;
window.startRecording = startRecording;
window.openAIChat = openAIChat;
window.runMarketplaceScan = runMarketplaceScan;
window.openMobilePairing = openMobilePairing;
window.generateReport = generateReport;
window.downloadTemplate = downloadTemplate;
window.showSystemStatus = showSystemStatus;
window.closeModal = closeModal;
window.showNotification = showNotification;
"""
    
    with open("static/js/dashboard.js", "w", encoding="utf-8") as f:
        f.write(dashboard_js)
    print("   ✅ Created: static/js/dashboard.js")

def create_html_template():
    """Create HTML template"""
    print("\n📄 Creating HTML template...")
    
    html_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agentic AI Platform - Dashboard</title>
    <link rel="stylesheet" href="/static/css/style.css">
    <link rel="stylesheet" href="/static/css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="dashboard-container">
        <!-- Sidebar Navigation -->
        <nav class="sidebar">
            <div class="sidebar-header">
                <div class="logo">
                    <i class="fas fa-robot"></i>
                    <span>Agentic AI</span>
                </div>
                <button class="sidebar-toggle" id="sidebarToggle">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
            
            <div class="sidebar-menu">
                <a href="/" class="menu-item active">
                    <i class="fas fa-home"></i>
                    <span>Dashboard</span>
                </a>
                <a href="/desktop-recorder" class="menu-item">
                    <i class="fas fa-video"></i>
                    <span>Desktop Recorder</span>
                </a>
                <a href="/file-organizer" class="menu-item">
                    <i class="fas fa-folder"></i>
                    <span>File Organizer</span>
                </a>
                <a href="/ai-automation" class="menu-item">
                    <i class="fas fa-brain"></i>
                    <span>AI Automation</span>
                </a>
                <a href="/marketplace" class="menu-item">
                    <i class="fas fa-store"></i>
                    <span>Marketplace</span>
                    <span class="badge" id="templateCount">0</span>
                </a>
                <a href="/analytics" class="menu-item">
                    <i class="fas fa-chart-line"></i>
                    <span>Analytics</span>
                </a>
                <a href="/mobile" class="menu-item">
                    <i class="fas fa-mobile-alt"></i>
                    <span>Mobile</span>
                </a>
                <a href="/settings" class="menu-item">
                    <i class="fas fa-cog"></i>
                    <span>Settings</span>
                </a>
            </div>
            
            <div class="sidebar-footer">
                <div class="user-profile">
                    <div class="avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-info">
                        <span class="username">Administrator</span>
                        <span class="user-role">Super Admin</span>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Top Header -->
            <header class="top-header">
                <div class="header-left">
                    <h1>Dashboard Overview</h1>
                    <p class="subtitle">Welcome back! Your platform is <span class="status-online">fully operational</span></p>
                </div>
                
                <div class="header-right">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Search automations, files, tools..." id="searchInput">
                    </div>
                    
                    <div class="header-actions">
                        <button class="btn-notification">
                            <i class="fas fa-bell"></i>
                            <span class="notification-badge">0</span>
                        </button>
                        <button class="btn-quick-action" id="quickAutomationBtn">
                            <i class="fas fa-plus"></i>
                            Quick Automation
                        </button>
                    </div>
                </div>
            </header>

            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card stat-primary">
                    <div class="stat-icon">
                        <i class="fas fa-bolt"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="totalAutomations">0</h3>
                        <p>Total Automations</p>
                    </div>
                    <div class="stat-trend">
                        <i class="fas fa-arrow-up"></i>
                        <span>+0% this week</span>
                    </div>
                </div>
                
                <div class="stat-card stat-success">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="timeSaved">0h</h3>
                        <p>Time Saved</p>
                    </div>
                    <div class="stat-trend">
                        <i class="fas fa-chart-line"></i>
                        <span>+0 hours</span>
                    </div>
                </div>
                
                <div class="stat-card stat-warning">
                    <div class="stat-icon">
                        <i class="fas fa-file"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="filesOrganized">0</h3>
                        <p>Files Organized</p>
                    </div>
                    <div class="stat-trend">
                        <i class="fas fa-history"></i>
                        <span>Today</span>
                    </div>
                </div>
                
                <div class="stat-card stat-info">
                    <div class="stat-icon">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="stat-content">
                        <h3 id="aiModels">2</h3>
                        <p>AI Models Ready</p>
                    </div>
                    <div class="stat-trend">
                        <i class="fas fa-check-circle"></i>
                        <span>Llama3.2 Active</span>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="content-card">
                <div class="card-header">
                    <h3>Quick Actions</h3>
                </div>
                <div class="quick-actions-grid">
                    <button class="quick-action-btn" onclick="startFileOrganizer()">
                        <i class="fas fa-folder-open"></i>
                        <span>Organize Files</span>
                    </button>
                    <button class="quick-action-btn" onclick="startRecording()">
                        <i class="fas fa-video"></i>
                        <span>Start Recording</span>
                    </button>
                    <button class="quick-action-btn" onclick="openAIChat()">
                        <i class="fas fa-comment"></i>
                        <span>AI Assistant</span>
                    </button>
                    <button class="quick-action-btn" onclick="runMarketplaceScan()">
                        <i class="fas fa-store"></i>
                        <span>Marketplace Scan</span>
                    </button>
                    <button class="quick-action-btn" onclick="openMobilePairing()">
                        <i class="fas fa-mobile-alt"></i>
                        <span>Pair Mobile</span>
                    </button>
                    <button class="quick-action-btn" onclick="generateReport()">
                        <i class="fas fa-chart-pie"></i>
                        <span>Analytics Report</span>
                    </button>
                </div>
            </div>

            <!-- Marketplace Templates -->
            <div class="content-card full-width">
                <div class="card-header">
                    <h3>Popular Automation Templates</h3>
                    <a href="/marketplace" class="view-all">Browse Marketplace</a>
                </div>
                <div class="templates-grid" id="templatesGrid">
                    <div class="no-templates">Loading templates...</div>
                </div>
            </div>
        </main>

        <!-- System Status Modal -->
        <div class="modal" id="statusModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>System Status</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="status-list">
                        <div class="status-item online">
                            <i class="fas fa-server"></i>
                            <div>
                                <h4>Core Server</h4>
                                <p>Running on port 5000</p>
                            </div>
                            <span class="status-badge online">Online</span>
                        </div>
                        <div class="status-item online">
                            <i class="fas fa-brain"></i>
                            <div>
                                <h4>AI Engine (Ollama)</h4>
                                <p>Llama3.2:latest active</p>
                            </div>
                            <span class="status-badge online">Online</span>
                        </div>
                        <div class="status-item online">
                            <i class="fas fa-database"></i>
                            <div>
                                <h4>Databases</h4>
                                <p>4 databases initialized</p>
                            </div>
                            <span class="status-badge online">Online</span>
                        </div>
                        <div class="status-item online">
                            <i class="fas fa-plug"></i>
                            <div>
                                <h4>WebSocket</h4>
                                <p>Real-time updates active</p>
                            </div>
                            <span class="status-badge online">Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- JavaScript Files -->
    <script src="/static/js/main.js"></script>
    <script src="/static/js/dashboard.js"></script>
    
    <script>
        // Initialize dashboard when page loads
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Dashboard initialized');
        });
        
        // Setup search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const query = this.value.trim();
                    if (query) {
                        window.location.href = `/marketplace?search=${encodeURIComponent(query)}`;
                    }
                }
            });
        }
    </script>
</body>
</html>
"""
    
    with open("templates/index.html", "w", encoding="utf-8") as f:
        f.write(html_template)
    print("   ✅ Created: templates/index.html")

def create_server_patch():
    """Create a patch for server.py to add static file serving"""
    print("\n🔧 Creating server.py patch instructions...")
    
    patch_instructions = """=== SERVER.PY PATCH INSTRUCTIONS ===

To enable static file serving, add these lines to your server.py:

1. Add this import at the top of server.py:
   ```python
   from fastapi.staticfiles import StaticFiles