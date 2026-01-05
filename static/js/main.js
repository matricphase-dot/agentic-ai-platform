// Main Application JavaScript
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