// ============================================
// SHARED UTILITY FUNCTIONS - Campus Connect
// ============================================

// Format date to readable string
function formatDate(date) {
    if (!date) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Format date with time
function formatDateTime(date) {
    if (!date) return 'N/A';
    const options = { 
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Format currency (FCFA)
function formatCurrency(amount) {
    return amount.toLocaleString('en-US') + ' FCFA';
}

// Get current semester
function getCurrentSemester() {
    const month = new Date().getMonth();
    return month < 6 ? 'Spring' : 'Fall';
}

// Get current academic year
function getAcademicYear() {
    const year = new Date().getFullYear();
    return `${year}-${year + 1}`;
}

// Show notification toast
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const icons = {
        success: 'check-circle',
        error: 'times-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${icons[type] || icons.info}"></i>
        <span>${message}</span>
        <button class="close-notification" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Confirm dialog
function confirmAction(message) {
    return confirm(message || 'Are you sure?');
}

// Toggle sidebar
function toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('open');
}

function toggleLecturerSidebar() {
    toggleSidebar();
}

function toggleAdminSidebar() {
    toggleSidebar();
}

// Toggle notification panel
function toggleNotificationPanel() {
    document.getElementById('notificationPanel')?.classList.toggle('open');
}

function toggleAdminNotifications() {
    toggleNotificationPanel();
}

// Handle logout
function handleLogout() {
    if (confirmAction('Are you sure you want to logout?')) {
        auth.signOut().then(() => {
            localStorage.clear();
            window.location.href = '../index.html';
        });
    }
}

function handleLecturerLogout() {
    handleLogout();
}

function handleAdminLogout() {
    handleLogout();
}

// Calculate letter grade
function calculateLetterGrade(total) {
    if (total >= 80) return 'A';
    if (total >= 75) return 'A-';
    if (total >= 70) return 'B+';
    if (total >= 65) return 'B';
    if (total >= 60) return 'B-';
    if (total >= 55) return 'C+';
    if (total >= 50) return 'C';
    if (total >= 45) return 'D';
    return 'F';
}

// Export to PDF (generic)
function exportToPDF(title, content) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; color: #2c3e50; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #f2f2f2; }
                .footer { text-align: center; margin-top: 30px; color: #666; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
            ${content}
            <div class="footer">Campus Connect - University Management System</div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Format student ID
function formatStudentId(id) {
    return id ? id.toString().toUpperCase() : 'N/A';
}

// Get course color for timetable
function getCourseColor(code) {
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#2980b9'];
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
        hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number (Cameroon)
function isValidPhone(phone) {
    const re = /^(\+237|00237)?[6][0-9]{8}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Generate random ID
function generateId(prefix = '') {
    return prefix + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Truncate text
function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Get time ago string
function timeAgo(date) {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return 'just now';
}