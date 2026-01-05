// Dashboard Initialization
let performanceChart = null;
let usageChart = null;

function initializeDashboard() {
    // Initialize WebSocket connection for real-time updates
    const ws = new WebSocket('ws://' + window.location.host + '/ws');
    
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        updateDashboardWithRealtimeData(data);
    };
    
    // Setup sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
    });
    
    // Setup quick automation button
    document.getElementById('quickAutomationBtn').addEventListener('click', function() {
        showQuickAutomationModal();
    });
    
    // Initialize charts
    initializeCharts();
    
    // Load initial data
    loadDashboardData();
    
    // Update data every 30 seconds
    setInterval(loadDashboardData, 30000);
}

function initializeCharts() {
    // Performance Chart
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    performanceChart = new Chart(performanceCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Successful Automations',
                data: [12, 19, 8, 15, 22, 18, 25],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }, {
                label: 'Failed Automations',
                data: [2, 3, 1, 4, 2, 1, 3],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#94a3b8'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
    
    // Usage Chart
    const usageCtx = document.getElementById('usageChart').getContext('2d');
    usageChart = new Chart(usageCtx, {
        type: 'doughnut',
        data: {
            labels: ['File Organizer', 'AI Automation', 'Desktop Recorder', 'Marketplace', 'Analytics'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: [
                    '#6366f1',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6',
                    '#3b82f6'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#94a3b8',
                        padding: 20
                    }
                }
            }
        }
    });
}

async function loadDashboardData() {
    try {
        // Load system stats
        const statsResponse = await fetch('/api/system-stats');
        const stats = await statsResponse.json();
        updateStatsCards(stats);
        
        // Load recent activity
        const activityResponse = await fetch('/api/logs?limit=5');
        const activity = await activityResponse.json();
        updateRecentActivity(activity);
        
        // Load marketplace templates
        const templatesResponse = await fetch('/api/marketplace/templates?limit=4');
        const templates = await templatesResponse.json();
        updateTemplatesGrid(templates);
        
        // Update AI model status
        updateAIModelStatus();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

function updateStatsCards(stats) {
    document.getElementById('totalAutomations').textContent = stats.total_automations || '0';
    document.getElementById('timeSaved').textContent = stats.time_saved_hours ? stats.time_saved_hours + 'h' : '0h';
    document.getElementById('filesOrganized').textContent = stats.files_organized || '0';
    
    // Update trend indicators
    updateTrendIndicators(stats);
}

function updateRecentActivity(activity) {
    const activityContainer = document.getElementById('recentActivity');
    activityContainer.innerHTML = '';
    
    if (!activity.logs || activity.logs.length === 0) {
        activityContainer.innerHTML = '<p class="no-activity">No recent activity</p>';
        return;
    }
    
    activity.logs.forEach(log => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item fade-in';
        
        let iconClass = 'info';
        let icon = 'fa-info-circle';
        
        if (log.type === 'success') {
            iconClass = 'success';
            icon = 'fa-check-circle';
        } else if (log.type === 'error') {
            iconClass = 'error';
            icon = 'fa-exclamation-circle';
        } else if (log.type === 'warning') {
            iconClass = 'warning';
            icon = 'fa-exclamation-triangle';
        }
        
        activityItem.innerHTML = `
            <div class="activity-icon ${iconClass}">
                <i class="fas ${icon}"></i>
            </div>
            <div class="activity-content">
                <p>${log.message || 'Activity logged'}</p>
                <span class="activity-time">${formatTimeAgo(log.timestamp)}</span>
            </div>
        `;
        
        activityContainer.appendChild(activityItem);
    });
}

function updateTemplatesGrid(templates) {
    const templatesGrid = document.getElementById('templatesGrid');
    const templateCount = document.getElementById('templateCount');
    
    if (!templates || templates.length === 0) {
        templatesGrid.innerHTML = '<p class="no-templates">No templates available</p>';
        templateCount.textContent = '0';
        return;
    }
    
    templateCount.textContent = templates.length;
    templatesGrid.innerHTML = '';
    
    templates.forEach(template => {
        const templateCard = document.createElement('div');
        templateCard.className = 'template-card fade-in';
        
        // Calculate rating stars
        const ratingStars = getRatingStars(template.rating || 0);
        
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

function updateAIModelStatus() {
    // This would normally call an API endpoint
    const aiModels = 2; // Hardcoded for now - llama3.2:latest and llama3.2:3b
    document.getElementById('aiModels').textContent = aiModels;
}

function updateDashboardWithRealtimeData(data) {
    // Update based on WebSocket data
    if (data.type === 'automation_completed') {
        // Add to recent activity
        const activityContainer = document.getElementById('recentActivity');
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item fade-in';
        activityItem.innerHTML = `
            <div class="activity-icon success">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="activity-content">
                <p>${data.message || 'Automation completed'}</p>
                <span class="activity-time">Just now</span>
            </div>
        `;
        
        // Add to top and limit to 5 items
        activityContainer.insertBefore(activityItem, activityContainer.firstChild);
        if (activityContainer.children.length > 5) {
            activityContainer.removeChild(activityContainer.lastChild);
        }
        
        // Update stats
        const totalAutomations = document.getElementById('totalAutomations');
        totalAutomations.textContent = parseInt(totalAutomations.textContent) + 1;
        
        showNotification('New automation completed!', 'success');
    }
}

// Utility Functions
function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Recently';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return time.toLocaleDateString();
}

function getRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (halfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    
    return stars;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} fade-in`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function showQuickAutomationModal() {
    // Create and show quick automation modal
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

// Action Functions
function startFileOrganizer() {
    fetch('/api/file-organizer/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'organize', path: 'desktop' })
    })
    .then(response => response.json())
    .then(data => {
        showNotification('File organizer started successfully!', 'success');
    })
    .catch(error => {
        showNotification('Failed to start file organizer', 'error');
    });
}

function startRecording() {
    fetch('/api/desktop-recorder/start', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Desktop recording started', 'success');
    })
    .catch(error => {
        showNotification('Failed to start recording', 'error');
    });
}

function openAIChat() {
    window.location.href = '/ai-automation';
}

function runMarketplaceScan() {
    fetch('/api/marketplace/scan', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Marketplace scan completed', 'success');
        loadDashboardData(); // Refresh data
    })
    .catch(error => {
        showNotification('Marketplace scan failed', 'error');
    });
}

function openMobilePairing() {
    window.location.href = '/mobile';
}

function generateReport() {
    fetch('/api/analytics/report', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Report generated successfully', 'success');
    })
    .catch(error => {
        showNotification('Failed to generate report', 'error');
    });
}

function downloadTemplate(templateId) {
    fetch(`/api/marketplace/download/${templateId}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Template downloaded successfully', 'success');
    })
    .catch(error => {
        showNotification('Failed to download template', 'error');
    });
}

function showSystemStatus() {
    document.getElementById('statusModal').classList.add('active');
}

function closeModal() {
    document.getElementById('statusModal').classList.remove('active');
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
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
`;
document.head.appendChild(notificationStyles);

// Export for global access
window.initializeDashboard = initializeDashboard;
window.startFileOrganizer = startFileOrganizer;
window.startRecording = startRecording;
window.openAIChat = openAIChat;
window.runMarketplaceScan = runMarketplaceScan;
window.openMobilePairing = openMobilePairing;
window.generateReport = generateReport;
window.downloadTemplate = downloadTemplate;
window.showSystemStatus = showSystemStatus;
window.closeModal = closeModal;