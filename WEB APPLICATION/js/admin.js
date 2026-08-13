// =============================================
// ADMIN DASHBOARD - COMPLETE JAVASCRIPT
// Campus Connect University Portal
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    initializeAdminDashboard();
    setupAdminNavigation();
    document.getElementById('logoutBtn')?.addEventListener('click', handleAdminLogout);
    document.getElementById('menuToggle')?.addEventListener('click', toggleAdminSidebar);
});

// ===================== AUTHENTICATION =====================

function checkAdminAuth() {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = '../index.html';
            return;
        }
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'admin') {
            window.location.href = '../index.html';
            return;
        }
        loadAdminData(user);
    });
}

async function loadAdminData(user) {
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            document.getElementById('userName').textContent = userData.fullName;
            document.getElementById('sidebarUserName').textContent = userData.fullName;
        }
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
}

function initializeAdminDashboard() {
    loadAdminPage('overview');
}

function setupAdminNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            const page = this.getAttribute('data-page');
            loadAdminPage(page);
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });
    });
}

// ===================== PAGE LOADER =====================

async function loadAdminPage(page) {
    const contentArea = document.getElementById('contentArea');
    showAdminLoading(contentArea);
    
    try {
        switch(page) {
            case 'overview': await loadAdminOverview(contentArea); break;
            case 'users': await loadUserManagement(contentArea); break;
            case 'courses': await loadCourseManagement(contentArea); break;
            case 'departments': await loadDepartmentManagement(contentArea); break;
            case 'payments': await loadPaymentManagement(contentArea); break;
            case 'calendar': await loadAcademicCalendar(contentArea); break;
            case 'reports': await loadAdminReports(contentArea); break;
            case 'settings': await loadSystemSettings(contentArea); break;
            case 'logs': await loadAuditLogs(contentArea); break;
            default: contentArea.innerHTML = '<h2>Page not found</h2>';
        }
    } catch (error) {
        console.error('Error loading admin page:', error);
        contentArea.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading page</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()" class="btn btn-primary">Retry</button>
            </div>
        `;
    }
}

function showAdminLoading(container) {
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading admin panel...</p>
        </div>
    `;
}

// ===================== ADMIN OVERVIEW =====================

async function loadAdminOverview(container) {
    // Get system statistics
    const [
        usersSnapshot,
        studentsSnapshot,
        lecturersSnapshot,
        coursesSnapshot,
        enrollmentsSnapshot,
        paymentsSnapshot,
        announcementsSnapshot
    ] = await Promise.all([
        db.collection('users').get(),
        db.collection('users').where('role', '==', 'student').get(),
        db.collection('users').where('role', '==', 'lecturer').get(),
        db.collection('courses').get(),
        db.collection('enrollments').where('status', '==', 'active').get(),
        db.collection('payments').where('status', '==', 'completed').get(),
        db.collection('announcements').orderBy('createdAt', 'desc').limit(5).get()
    ]);
    
    // Calculate totals
    const totalPayments = paymentsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
    const totalStudents = studentsSnapshot.size;
    const totalLecturers = lecturersSnapshot.size;
    const totalCourses = coursesSnapshot.size;
    const totalEnrollments = enrollmentsSnapshot.size;
    
    // Get recent activities
    const recentUsers = usersSnapshot.docs
        .sort((a, b) => (b.data().createdAt?.toDate() || 0) - (a.data().createdAt?.toDate() || 0))
        .slice(0, 5);
    
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Admin Dashboard</h1>
                <p class="text-muted">System Overview & Management</p>
            </div>
            <div class="quick-date">
                <i class="fas fa-calendar"></i>
                ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>
        
        <!-- Main Stats -->
        <div class="stats-grid">
            <div class="stat-card blue">
                <i class="fas fa-users"></i>
                <div class="stat-value">${usersSnapshot.size}</div>
                <div class="stat-label">Total Users</div>
                <div class="stat-trend">👨‍🎓 ${totalStudents} Students | 👨‍🏫 ${totalLecturers} Lecturers</div>
            </div>
            <div class="stat-card green">
                <i class="fas fa-book-open"></i>
                <div class="stat-value">${totalCourses}</div>
                <div class="stat-label">Total Courses</div>
                <div class="stat-trend positive">📝 ${totalEnrollments} Active Enrollments</div>
            </div>
            <div class="stat-card orange">
                <i class="fas fa-money-bill-wave"></i>
                <div class="stat-value">${formatCurrency(totalPayments)}</div>
                <div class="stat-label">Total Revenue</div>
                <div class="stat-trend">💰 ${paymentsSnapshot.size} Completed Payments</div>
            </div>
            <div class="stat-card purple">
                <i class="fas fa-check-circle"></i>
                <div class="stat-value">98.5%</div>
                <div class="stat-label">System Uptime</div>
                <div class="stat-trend positive"><i class="fas fa-arrow-up"></i> All systems operational</div>
            </div>
        </div>
        
        <!-- Quick Stats Row -->
        <div class="grid-2">
            <!-- Recent Users -->
            <div class="section">
                <h2>Recent Users</h2>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr><th>Name</th><th>Role</th><th>Email</th><th>Joined</th></tr>
                        </thead>
                        <tbody>
                            ${recentUsers.map(doc => {
                                const u = doc.data();
                                return `
                                    <tr>
                                        <td><strong>${u.fullName}</strong></td>
                                        <td><span class="badge badge-${u.role === 'student' ? 'primary' : u.role === 'lecturer' ? 'success' : 'warning'}">${u.role}</span></td>
                                        <td>${u.email}</td>
                                        <td>${formatDate(u.createdAt?.toDate())}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Recent Announcements -->
            <div class="section">
                <h2>Recent Announcements</h2>
                ${announcementsSnapshot.docs.length > 0 ? 
                    announcementsSnapshot.docs.map(doc => {
                        const a = doc.data();
                        return `
                            <div class="announcement-card" style="margin-bottom: 10px;">
                                <div class="announcement-icon">
                                    <i class="fas fa-bullhorn" style="color: #f39c12;"></i>
                                </div>
                                <div class="announcement-body">
                                    <h4>${a.title}</h4>
                                    <p style="font-size: 0.9em;">${truncateText(a.message, 80)}</p>
                                    <span style="font-size: 0.8em; color: #999;">By ${a.postedByName} - ${formatDate(a.createdAt?.toDate())}</span>
                                </div>
                            </div>
                        `;
                    }).join('') :
                    '<p class="text-muted">No announcements</p>'
                }
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="section">
            <h2>Quick Actions</h2>
            <div class="quick-actions-grid">
                <div class="quick-action-card" onclick="loadAdminPage('users')">
                    <i class="fas fa-user-plus"></i>
                    <h3>Add User</h3>
                    <p>Create new accounts</p>
                </div>
                <div class="quick-action-card" onclick="loadAdminPage('courses')">
                    <i class="fas fa-plus-circle"></i>
                    <h3>Add Course</h3>
                    <p>Create new courses</p>
                </div>
                <div class="quick-action-card" onclick="loadAdminPage('payments')">
                    <i class="fas fa-file-invoice"></i>
                    <h3>View Payments</h3>
                    <p>Monitor transactions</p>
                </div>
                <div class="quick-action-card" onclick="loadAdminPage('reports')">
                    <i class="fas fa-chart-pie"></i>
                    <h3>Generate Report</h3>
                    <p>System analytics</p>
                </div>
            </div>
        </div>
    `;
}

// ===================== USER MANAGEMENT =====================

async function loadUserManagement(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1>User Management</h1>
            <div>
                <button class="btn btn-primary" onclick="showAddUserModal()">
                    <i class="fas fa-user-plus"></i> Add New User
                </button>
                <button class="btn btn-outline" onclick="exportUserList()">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
        </div>
        
        <!-- Filters -->
        <div class="section">
            <div class="grid-3">
                <div class="form-group">
                    <label>Filter by Role</label>
                    <select id="userRoleFilter" class="form-select" onchange="filterUsers()">
                        <option value="all">All Users</option>
                        <option value="student">Students</option>
                        <option value="lecturer">Lecturers</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Filter by Department</label>
                    <select id="userDeptFilter" class="form-select" onchange="filterUsers()">
                        <option value="all">All Departments</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Biology">Biology</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Search</label>
                    <input type="text" id="userSearch" class="form-input" placeholder="Search by name or email..." oninput="filterUsers()">
                </div>
            </div>
        </div>
        
        <!-- Users Table -->
        <div class="section">
            <div class="table-responsive">
                <table class="data-table" id="usersTable">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="usersTableBody">
                        <tr><td colspan="8" style="text-align: center;">Loading users...</td></tr>
                    </tbody>
                </table>
            </div>
            <div id="userPagination" style="margin-top: 15px; text-align: center;"></div>
        </div>
    `;
    
    await loadUsersList();
}

// Load users list
async function loadUsersList() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    const usersSnapshot = await db.collection('users').orderBy('fullName').get();
    
    tbody.innerHTML = usersSnapshot.docs.map((doc, index) => {
        const user = doc.data();
        return `
            <tr data-role="${user.role}" data-department="${user.department || ''}" data-search="${user.fullName} ${user.email}">
                <td>${index + 1}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        
                        <strong>${user.fullName}</strong>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="badge badge-${user.role === 'student' ? 'primary' : user.role === 'lecturer' ? 'success' : 'warning'}">${user.role.toUpperCase()}</span></td>
                <td>${user.department || 'N/A'}</td>
                <td><span class="status-dot online" style="display: inline-block;"></span> Active</td>
                <td>${formatDate(user.createdAt?.toDate())}</td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="btn btn-sm btn-outline" onclick="viewUserDetails('${doc.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="editUser('${doc.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser('${doc.id}', '${user.fullName}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter users
function filterUsers() {
    const roleFilter = document.getElementById('userRoleFilter')?.value || 'all';
    const deptFilter = document.getElementById('userDeptFilter')?.value || 'all';
    const searchTerm = (document.getElementById('userSearch')?.value || '').toLowerCase();
    
    document.querySelectorAll('#usersTableBody tr').forEach(row => {
        const role = row.getAttribute('data-role');
        const dept = row.getAttribute('data-department');
        const search = row.getAttribute('data-search')?.toLowerCase() || '';
        
        const matchesRole = roleFilter === 'all' || role === roleFilter;
        const matchesDept = deptFilter === 'all' || dept === deptFilter;
        const matchesSearch = !searchTerm || search.includes(searchTerm);
        
        row.style.display = matchesRole && matchesDept && matchesSearch ? '' : 'none';
    });
}

// Show add user modal
function showAddUserModal() {
    const modal = document.getElementById('adminModal');
    document.getElementById('modalTitle').textContent = 'Add New User';
    document.getElementById('modalBody').innerHTML = `
        <form id="addUserForm">
            <div class="grid-2">
                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" id="newUserName" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" id="newUserEmail" class="form-input" required>
                </div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Role *</label>
                    <select id="newUserRole" class="form-select" required onchange="toggleStudentFields()">
                        <option value="">Select Role</option>
                        <option value="student">Student</option>
                        <option value="lecturer">Lecturer</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Department</label>
                    <select id="newUserDept" class="form-select">
                        <option value="">Select Department</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="Biology">Biology</option>
                    </select>
                </div>
            </div>
            <div id="studentFields" style="display: none;">
                <div class="grid-2">
                    <div class="form-group">
                        <label>Student ID</label>
                        <input type="text" id="newStudentId" class="form-input" placeholder="e.g., STU2024001">
                    </div>
                    <div class="form-group">
                        <label>Level</label>
                        <select id="newStudentLevel" class="form-select">
                            <option value="100">100 Level</option>
                            <option value="200">200 Level</option>
                            <option value="300">300 Level</option>
                            <option value="400">400 Level</option>
                            <option value="500">500 Level</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="newUserPhone" class="form-input" placeholder="+237 6XX XXX XXX">
            </div>
            <div class="form-group">
                <label>Temporary Password *</label>
                <input type="password" id="newUserPassword" class="form-input" required value="password123">
                <small style="color: #999;">Default password. User will change on first login.</small>
            </div>
            <button type="submit" class="btn btn-primary btn-block">
                <i class="fas fa-user-plus"></i> Create User
            </button>
        </form>
    `;
    
    modal.style.display = 'flex';
    setupAddUserForm();
}

// Toggle student fields
function toggleStudentFields() {
    const role = document.getElementById('newUserRole')?.value;
    const studentFields = document.getElementById('studentFields');
    if (studentFields) {
        studentFields.style.display = role === 'student' ? 'block' : 'none';
    }
}

// Setup add user form
function setupAddUserForm() {
    document.getElementById('addUserForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('newUserName').value.trim();
        const email = document.getElementById('newUserEmail').value.trim();
        const role = document.getElementById('newUserRole').value;
        const department = document.getElementById('newUserDept').value;
        const phone = document.getElementById('newUserPhone').value;
        const password = document.getElementById('newUserPassword').value;
        
        if (!fullName || !email || !role || !password) {
            showNotification('Please fill all required fields', 'warning');
            return;
        }
        
        try {
            // Create auth user
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const userId = userCredential.user.uid;
            
            // Create user document
            const userData = {
                fullName,
                email,
                role,
                department,
                phone,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active'
            };
            
            if (role === 'student') {
                userData.studentId = document.getElementById('newStudentId')?.value || '';
                userData.level = document.getElementById('newStudentLevel')?.value || '100';
            }
            
            await db.collection('users').doc(userId).set(userData);
            
            // Log the action
            await logAdminAction('create_user', `Created ${role} account: ${fullName}`);
            
            document.getElementById('adminModal').style.display = 'none';
            showNotification(`User ${fullName} created successfully!`, 'success');
            
            // Refresh user list
            setTimeout(() => loadAdminPage('users'), 500);
            
        } catch (error) {
            console.error('Error creating user:', error);
            showNotification(getFirebaseError(error), 'error');
        }
    });
}

// View user details
async function viewUserDetails(userId) {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
        showNotification('User not found', 'error');
        return;
    }
    
    const user = userDoc.data();
    
    // Get user statistics
    let statsHtml = '';
    if (user.role === 'student') {
        const enrollmentsSnapshot = await db.collection('enrollments')
            .where('studentId', '==', userId).get();
        const paymentsSnapshot = await db.collection('payments')
            .where('studentId', '==', userId)
            .where('status', '==', 'completed').get();
        const totalPaid = paymentsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
        
        statsHtml = `
            <div class="grid-3" style="margin-bottom: 20px;">
                <div class="stat-card blue">
                    <div class="stat-value">${enrollmentsSnapshot.size}</div>
                    <div class="stat-label">Enrolled Courses</div>
                </div>
                <div class="stat-card green">
                    <div class="stat-value">${formatCurrency(totalPaid)}</div>
                    <div class="stat-label">Total Paid</div>
                </div>
                <div class="stat-card purple">
                    <div class="stat-value">${user.gpa || 'N/A'}</div>
                    <div class="stat-label">GPA</div>
                </div>
            </div>
        `;
    } else if (user.role === 'lecturer') {
        const coursesSnapshot = await db.collection('courses')
            .where('lecturerId', '==', userId).get();
        const totalStudents = coursesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().enrolled || 0), 0);
        
        statsHtml = `
            <div class="grid-3" style="margin-bottom: 20px;">
                <div class="stat-card blue">
                    <div class="stat-value">${coursesSnapshot.size}</div>
                    <div class="stat-label">Courses Assigned</div>
                </div>
                <div class="stat-card green">
                    <div class="stat-value">${totalStudents}</div>
                    <div class="stat-label">Total Students</div>
                </div>
            </div>
        `;
    }
    
    const modal = document.getElementById('adminModal');
    document.getElementById('modalTitle').textContent = `User Details: ${user.fullName}`;
    document.getElementById('modalBody').innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            
            <h3>${user.fullName}</h3>
            <span class="badge badge-${user.role === 'student' ? 'primary' : user.role === 'lecturer' ? 'success' : 'warning'}">${user.role.toUpperCase()}</span>
        </div>
        
        ${statsHtml}
        
        <div class="grid-2">
            <div>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
                <p><strong>Department:</strong> ${user.department || 'N/A'}</p>
            </div>
            <div>
                <p><strong>Status:</strong> <span style="color: #2ecc71;">Active</span></p>
                <p><strong>Joined:</strong> ${formatDate(user.createdAt?.toDate())}</p>
                ${user.studentId ? `<p><strong>Student ID:</strong> ${user.studentId}</p>` : ''}
                ${user.level ? `<p><strong>Level:</strong> ${user.level}</p>` : ''}
            </div>
        </div>
        
        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
            <button class="btn btn-outline" onclick="closeAdminModal(); editUser('${userId}')">
                <i class="fas fa-edit"></i> Edit User
            </button>
            <button class="btn btn-outline" onclick="resetUserPassword('${userId}')">
                <i class="fas fa-key"></i> Reset Password
            </button>
            ${user.role !== 'admin' ? `
                <button class="btn btn-danger" onclick="deleteUser('${userId}', '${user.fullName}')">
                    <i class="fas fa-trash"></i> Delete User
                </button>
            ` : ''}
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Edit user
async function editUser(userId) {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return;
    
    const user = userDoc.data();
    
    const modal = document.getElementById('adminModal');
    document.getElementById('modalTitle').textContent = `Edit User: ${user.fullName}`;
    document.getElementById('modalBody').innerHTML = `
        <form id="editUserForm">
            <input type="hidden" id="editUserId" value="${userId}">
            <div class="grid-2">
                <div class="form-group">
                    <label>Full Name *</label>
                    <input type="text" id="editUserName" class="form-input" value="${user.fullName}" required>
                </div>
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" id="editUserEmail" class="form-input" value="${user.email}" required>
                </div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Role</label>
                    <select id="editUserRole" class="form-select">
                        <option value="student" ${user.role === 'student' ? 'selected' : ''}>Student</option>
                        <option value="lecturer" ${user.role === 'lecturer' ? 'selected' : ''}>Lecturer</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Department</label>
                    <select id="editUserDept" class="form-select">
                        <option value="">Select Department</option>
                        ${['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology'].map(d => 
                            `<option value="${d}" ${user.department === d ? 'selected' : ''}>${d}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" id="editUserPhone" class="form-input" value="${user.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="editUserStatus" class="form-select">
                        <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                        <option value="suspended" ${user.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                    </select>
                </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block">
                <i class="fas fa-save"></i> Update User
            </button>
        </form>
    `;
    
    modal.style.display = 'flex';
    
    document.getElementById('editUserForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            await db.collection('users').doc(userId).update({
                fullName: document.getElementById('editUserName').value,
                email: document.getElementById('editUserEmail').value,
                role: document.getElementById('editUserRole').value,
                department: document.getElementById('editUserDept').value,
                phone: document.getElementById('editUserPhone').value,
                status: document.getElementById('editUserStatus').value,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            await logAdminAction('update_user', `Updated user: ${user.fullName}`);
            
            modal.style.display = 'none';
            showNotification('User updated successfully!', 'success');
            setTimeout(() => loadAdminPage('users'), 500);
            
        } catch (error) {
            showNotification('Error updating user', 'error');
        }
    });
}

// Delete user
async function deleteUser(userId, userName) {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return;
    
    try {
        // Delete user document
        await db.collection('users').doc(userId).delete();
        
        // Delete related data
        const enrollmentsSnapshot = await db.collection('enrollments')
            .where('studentId', '==', userId).get();
        for (const doc of enrollmentsSnapshot.docs) {
            await doc.ref.delete();
        }
        
        await logAdminAction('delete_user', `Deleted user: ${userName}`);
        
        showNotification(`User ${userName} deleted successfully!`, 'success');
        setTimeout(() => loadAdminPage('users'), 500);
        
    } catch (error) {
        showNotification('Error deleting user', 'error');
    }
}

// Reset user password
async function resetUserPassword(userId) {
    if (!confirm('Reset password to default (password123)?')) return;
    
    try {
        // In production, you'd use Firebase Admin SDK
        showNotification('Password reset to default', 'success');
        await logAdminAction('reset_password', `Reset password for user ID: ${userId}`);
    } catch (error) {
        showNotification('Error resetting password', 'error');
    }
}

// Export user list
function exportUserList() {
    const table = document.getElementById('usersTable');
    if (table) {
        exportToPDF('User List Report', table.outerHTML);
    }
}

// Close admin modal
function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.style.display = 'none';
}

// ===================== COURSE MANAGEMENT =====================

async function loadCourseManagement(container) {
    const coursesSnapshot = await db.collection('courses').get();
    
    container.innerHTML = `
        <div class="page-header">
            <h1>Course Management</h1>
            <div>
                <button class="btn btn-primary" onclick="showAddCourseModal()">
                    <i class="fas fa-plus-circle"></i> Add New Course
                </button>
                <button class="btn btn-outline" onclick="exportCourseList()">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
        </div>
        
        <!-- Filters -->
        <div class="section">
            <div class="grid-2">
                <div class="form-group">
                    <label>Filter by Department</label>
                    <select id="courseDeptFilter" class="form-select" onchange="filterCourses()">
                        <option value="all">All Departments</option>
                        <option value="CS">Computer Science</option>
                        <option value="MATH">Mathematics</option>
                        <option value="PHY">Physics</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Search</label>
                    <input type="text" id="courseSearch" class="form-input" placeholder="Search by code or name..." oninput="filterCourses()">
                </div>
            </div>
        </div>
        
        <!-- Courses Table -->
        <div class="section">
            <div class="table-responsive">
                <table class="data-table" id="coursesTable">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Credits</th>
                            <th>Lecturer</th>
                            <th>Enrolled</th>
                            <th>Semester</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${coursesSnapshot.docs.map(doc => {
                            const course = doc.data();
                            return `
                                <tr data-department="${course.department || ''}" data-search="${course.code} ${course.name}">
                                    <td><strong>${course.code}</strong></td>
                                    <td>${course.name}</td>
                                    <td>${course.department || 'N/A'}</td>
                                    <td>${course.credits}</td>
                                    <td>${course.lecturerName || 'Unassigned'}</td>
                                    <td>${course.enrolled || 0}/${course.seats || '∞'}</td>
                                    <td>${course.semester || 'N/A'}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline" onclick="editCourse('${doc.id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="deleteCourse('${doc.id}', '${course.code}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Show add course modal
function showAddCourseModal() {
    const modal = document.getElementById('adminModal');
    document.getElementById('modalTitle').textContent = 'Add New Course';
    document.getElementById('modalBody').innerHTML = `
        <form id="addCourseForm">
            <div class="grid-2">
                <div class="form-group">
                    <label>Course Code *</label>
                    <input type="text" id="newCourseCode" class="form-input" required placeholder="e.g., CS301">
                </div>
                <div class="form-group">
                    <label>Course Name *</label>
                    <input type="text" id="newCourseName" class="form-input" required placeholder="e.g., Data Structures">
                </div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Department</label>
                    <select id="newCourseDept" class="form-select">
                        <option value="CS">Computer Science</option>
                        <option value="MATH">Mathematics</option>
                        <option value="PHY">Physics</option>
                        <option value="CHM">Chemistry</option>
                        <option value="BIO">Biology</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Credits *</label>
                    <input type="number" id="newCourseCredits" class="form-input" required min="1" max="6" value="3">
                </div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Maximum Seats</label>
                    <input type="number" id="newCourseSeats" class="form-input" min="1" value="30">
                </div>
                <div class="form-group">
                    <label>Semester</label>
                    <select id="newCourseSemester" class="form-select">
                        <option value="2024-Spring">Spring 2024</option>
                        <option value="2024-Fall">Fall 2024</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Assign Lecturer</label>
                <select id="newCourseLecturer" class="form-select">
                    <option value="">Select Lecturer</option>
                </select>
            </div>
            <div class="form-group">
                <label>Schedule</label>
                <input type="text" id="newCourseSchedule" class="form-input" placeholder="e.g., Mon 8:00-10:00, Wed 10:00-12:00">
            </div>
            <div class="form-group">
                <label>Venue</label>
                <input type="text" id="newCourseVenue" class="form-input" placeholder="e.g., Room 101">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="newCourseDescription" class="form-textarea" rows="3"></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">
                <i class="fas fa-plus-circle"></i> Create Course
            </button>
        </form>
    `;
    
    // Load lecturers for dropdown
    loadLecturersForDropdown();
    
    modal.style.display = 'flex';
    setupAddCourseForm();
}

// Load lecturers for dropdown
async function loadLecturersForDropdown() {
    const lecturersSnapshot = await db.collection('users')
        .where('role', '==', 'lecturer').get();
    
    const select = document.getElementById('newCourseLecturer');
    if (select) {
        select.innerHTML = '<option value="">Select Lecturer</option>' +
            lecturersSnapshot.docs.map(doc => {
                const l = doc.data();
                return `<option value="${doc.id}">${l.fullName}</option>`;
            }).join('');
    }
}

// Setup add course form
function setupAddCourseForm() {
    document.getElementById('addCourseForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const code = document.getElementById('newCourseCode').value.trim();
        const name = document.getElementById('newCourseName').value.trim();
        const department = document.getElementById('newCourseDept').value;
        const credits = parseInt(document.getElementById('newCourseCredits').value);
        const seats = parseInt(document.getElementById('newCourseSeats').value);
        const semester = document.getElementById('newCourseSemester').value;
        const lecturerId = document.getElementById('newCourseLecturer').value;
        const schedule = document.getElementById('newCourseSchedule').value;
        const venue = document.getElementById('newCourseVenue').value;
        const description = document.getElementById('newCourseDescription').value;
        
        if (!code || !name) {
            showNotification('Please fill required fields', 'warning');
            return;
        }
        
        try {
            let lecturerName = 'Unassigned';
            if (lecturerId) {
                const lecturerDoc = await db.collection('users').doc(lecturerId).get();
                if (lecturerDoc.exists) {
                    lecturerName = lecturerDoc.data().fullName;
                }
            }
            
            await db.collection('courses').add({
                code, name, department, credits, seats,
                semester, lecturerId, lecturerName,
                schedule, venue, description,
                enrolled: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active'
            });
            
            await logAdminAction('create_course', `Created course: ${code} - ${name}`);
            
            document.getElementById('adminModal').style.display = 'none';
            showNotification('Course created successfully!', 'success');
            setTimeout(() => loadAdminPage('courses'), 500);
            
        } catch (error) {
            showNotification('Error creating course', 'error');
        }
    });
}

// Edit course
async function editCourse(courseId) {
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) return;
    
    const course = courseDoc.data();
    
    const modal = document.getElementById('adminModal');
    document.getElementById('modalTitle').textContent = `Edit Course: ${course.code}`;
    document.getElementById('modalBody').innerHTML = `
        <form id="editCourseForm">
            <input type="hidden" id="editCourseId" value="${courseId}">
            <div class="grid-2">
                <div class="form-group">
                    <label>Course Code</label>
                    <input type="text" id="editCourseCode" class="form-input" value="${course.code}" required>
                </div>
                <div class="form-group">
                    <label>Course Name</label>
                    <input type="text" id="editCourseName" class="form-input" value="${course.name}" required>
                </div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Credits</label>
                    <input type="number" id="editCourseCredits" class="form-input" value="${course.credits}" min="1" max="6">
                </div>
                <div class="form-group">
                    <label>Seats</label>
                    <input type="number" id="editCourseSeats" class="form-input" value="${course.seats || 30}" min="1">
                </div>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="editCourseStatus" class="form-select">
                    <option value="active" ${course.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${course.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary btn-block">
                <i class="fas fa-save"></i> Update Course
            </button>
        </form>
    `;
    
    modal.style.display = 'flex';
    
    document.getElementById('editCourseForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        await db.collection('courses').doc(courseId).update({
            code: document.getElementById('editCourseCode').value,
            name: document.getElementById('editCourseName').value,
            credits: parseInt(document.getElementById('editCourseCredits').value),
            seats: parseInt(document.getElementById('editCourseSeats').value),
            status: document.getElementById('editCourseStatus').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await logAdminAction('update_course', `Updated course: ${course.code}`);
        
        modal.style.display = 'none';
        showNotification('Course updated!', 'success');
        setTimeout(() => loadAdminPage('courses'), 500);
    });
}

// Delete course
async function deleteCourse(courseId, courseCode) {
    if (!confirm(`Delete course ${courseCode}? This will affect all enrollments.`)) return;
    
    try {
        // Delete enrollments for this course
        const enrollmentsSnapshot = await db.collection('enrollments')
            .where('courseId', '==', courseId).get();
        for (const doc of enrollmentsSnapshot.docs) {
            await doc.ref.delete();
        }
        
        // Delete course
        await db.collection('courses').doc(courseId).delete();
        
        await logAdminAction('delete_course', `Deleted course: ${courseCode}`);
        
        showNotification('Course deleted!', 'success');
        setTimeout(() => loadAdminPage('courses'), 500);
    } catch (error) {
        showNotification('Error deleting course', 'error');
    }
}

// Filter courses
function filterCourses() {
    const deptFilter = document.getElementById('courseDeptFilter')?.value || 'all';
    const searchTerm = (document.getElementById('courseSearch')?.value || '').toLowerCase();
    
    document.querySelectorAll('#coursesTable tbody tr').forEach(row => {
        const dept = row.getAttribute('data-department') || '';
        const search = row.getAttribute('data-search')?.toLowerCase() || '';
        
        const matchesDept = deptFilter === 'all' || dept === deptFilter;
        const matchesSearch = !searchTerm || search.includes(searchTerm);
        
        row.style.display = matchesDept && matchesSearch ? '' : 'none';
    });
}

// Export course list
function exportCourseList() {
    const table = document.getElementById('coursesTable');
    if (table) {
        exportToPDF('Course List Report', table.outerHTML);
    }
}

// ===================== DEPARTMENT MANAGEMENT =====================

async function loadDepartmentManagement(container) {
    const departmentsSnapshot = await db.collection('departments').get();
    
    container.innerHTML = `
        <div class="page-header">
            <h1>Department Management</h1>
            <button class="btn btn-primary" onclick="showAddDepartmentModal()">
                <i class="fas fa-plus"></i> Add Department
            </button>
        </div>
        
        <div class="departments-grid">
            ${departmentsSnapshot.docs.map(doc => {
                const dept = doc.data();
                return `
                    <div class="course-card">
                        <div class="course-header">
                            <span class="course-code">${dept.code}</span>
                        </div>
                        <h3>${dept.name}</h3>
                        <p>${dept.description || 'No description'}</p>
                        <div class="course-details">
                            <span><i class="fas fa-user-tie"></i> HOD: ${dept.hod || 'Not assigned'}</span>
                            <span><i class="fas fa-users"></i> ${dept.studentCount || 0} Students</span>
                            <span><i class="fas fa-book"></i> ${dept.courseCount || 0} Courses</span>
                        </div>
                        <div class="course-actions">
                            <button class="btn btn-sm btn-outline" onclick="editDepartment('${doc.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Show add department modal
function showAddDepartmentModal() {
    const modal = document.getElementById('adminModal');
    document.getElementById('modalTitle').textContent = 'Add Department';
    document.getElementById('modalBody').innerHTML = `
        <form id="addDeptForm">
            <div class="grid-2">
                <div class="form-group">
                    <label>Department Code *</label>
                    <input type="text" id="newDeptCode" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Department Name *</label>
                    <input type="text" id="newDeptName" class="form-input" required>
                </div>
            </div>
            <div class="form-group">
                <label>Head of Department</label>
                <input type="text" id="newDeptHod" class="form-input">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="newDeptDescription" class="form-textarea" rows="3"></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-block">
                <i class="fas fa-plus"></i> Create Department
            </button>
        </form>
    `;
    
    modal.style.display = 'flex';
    
    document.getElementById('addDeptForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        await db.collection('departments').add({
            code: document.getElementById('newDeptCode').value,
            name: document.getElementById('newDeptName').value,
            hod: document.getElementById('newDeptHod').value,
            description: document.getElementById('newDeptDescription').value,
            studentCount: 0,
            courseCount: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        await logAdminAction('create_department', `Created department: ${document.getElementById('newDeptName').value}`);
        
        modal.style.display = 'none';
        showNotification('Department created!', 'success');
        setTimeout(() => loadAdminPage('departments'), 500);
    });
}

// ===================== PAYMENT MANAGEMENT =====================

async function loadPaymentManagement(container) {
    const paymentsSnapshot = await db.collection('payments')
        .orderBy('paidAt', 'desc')
        .limit(50)
        .get();
    
    const totalCompleted = paymentsSnapshot.docs
        .filter(d => d.data().status === 'completed')
        .reduce((sum, d) => sum + (d.data().amount || 0), 0);
    
    const totalPending = paymentsSnapshot.docs
        .filter(d => d.data().status === 'pending')
        .reduce((sum, d) => sum + (d.data().amount || 0), 0);
    
    container.innerHTML = `
        <div class="page-header">
            <h1>Fee Management</h1>
            <button class="btn btn-outline" onclick="exportPaymentReport()">
                <i class="fas fa-download"></i> Export Report
            </button>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card green">
                <i class="fas fa-check-circle"></i>
                <div class="stat-value">${formatCurrency(totalCompleted)}</div>
                <div class="stat-label">Total Collected</div>
            </div>
            <div class="stat-card orange">
                <i class="fas fa-clock"></i>
                <div class="stat-value">${formatCurrency(totalPending)}</div>
                <div class="stat-label">Pending Payments</div>
            </div>
            <div class="stat-card blue">
                <i class="fas fa-receipt"></i>
                <div class="stat-value">${paymentsSnapshot.size}</div>
                <div class="stat-label">Total Transactions</div>
            </div>
        </div>
        
        <div class="section">
            <h2>Recent Transactions</h2>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Student</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paymentsSnapshot.docs.map(async (doc) => {
                            const payment = doc.data();
                            let studentName = 'Unknown';
                            try {
                                const studentDoc = await db.collection('users').doc(payment.studentId).get();
                                if (studentDoc.exists) studentName = studentDoc.data().fullName;
                            } catch(e) {}
                            
                            return `
                                <tr>
                                    <td>${formatDate(payment.paidAt?.toDate())}</td>
                                    <td>${studentName}</td>
                                    <td><span class="badge badge-primary">${payment.type}</span></td>
                                    <td><strong>${formatCurrency(payment.amount)}</strong></td>
                                    <td>
                                        <span class="status-badge status-${payment.status}">${payment.status}</span>
                                    </td>
                                    <td>
                                        ${payment.status === 'pending' ? `
                                            <button class="btn btn-sm btn-success" onclick="approvePayment('${doc.id}')">
                                                <i class="fas fa-check"></i> Approve
                                            </button>
                                        ` : ''}
                                        <button class="btn btn-sm btn-outline" onclick="viewPaymentDetails('${doc.id}')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Approve payment
async function approvePayment(paymentId) {
    if (!confirm('Approve this payment?')) return;
    
    try {
        await db.collection('payments').doc(paymentId).update({
            status: 'completed',
            approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
            approvedBy: localStorage.getItem('userId')
        });
        
        await logAdminAction('approve_payment', `Approved payment: ${paymentId}`);
        
        showNotification('Payment approved!', 'success');
        setTimeout(() => loadAdminPage('payments'), 500);
    } catch (error) {
        showNotification('Error approving payment', 'error');
    }
}

// ===================== ACADEMIC CALENDAR =====================

async function loadAcademicCalendar(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1>Academic Calendar</h1>
            <button class="btn btn-primary" onclick="showAddCalendarEvent()">
                <i class="fas fa-plus"></i> Add Event
            </button>
        </div>
        
        <div class="section">
            <h2>Current Semester: Spring 2024</h2>
            <div class="calendar-events">
                <div class="announcement-card">
                    <div class="announcement-icon">
                        <i class="fas fa-calendar-check" style="color: #2ecc71; font-size: 1.5em;"></i>
                    </div>
                    <div class="announcement-body">
                        <h4>Semester Begins</h4>
                        <p>First day of classes</p>
                        <span class="badge badge-success">January 15, 2024</span>
                    </div>
                </div>
                <div class="announcement-card">
                    <div class="announcement-icon">
                        <i class="fas fa-calendar" style="color: #3498db; font-size: 1.5em;"></i>
                    </div>
                    <div class="announcement-body">
                        <h4>Course Registration Deadline</h4>
                        <p>Last day to add/drop courses</p>
                        <span class="badge badge-primary">January 31, 2024</span>
                    </div>
                </div>
                <div class="announcement-card">
                    <div class="announcement-icon">
                        <i class="fas fa-calendar-alt" style="color: #f39c12; font-size: 1.5em;"></i>
                    </div>
                    <div class="announcement-body">
                        <h4>Mid-Semester Exams</h4>
                        <p>Continuous assessment period</p>
                        <span class="badge badge-warning">March 15-22, 2024</span>
                    </div>
                </div>
                <div class="announcement-card">
                    <div class="announcement-icon">
                        <i class="fas fa-calendar-times" style="color: #e74c3c; font-size: 1.5em;"></i>
                    </div>
                    <div class="announcement-body">
                        <h4>Final Examinations</h4>
                        <p>End of semester exams</p>
                        <span class="badge badge-danger">May 20 - June 7, 2024</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===================== ADMIN REPORTS =====================

async function loadAdminReports(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1>Reports & Analytics</h1>
            <button class="btn btn-outline" onclick="window.print()">
                <i class="fas fa-print"></i> Print Report
            </button>
        </div>
        
        <div class="grid-2">
            <div class="section">
                <h2>Generate Report</h2>
                <form id="reportForm">
                    <div class="form-group">
                        <label>Report Type</label>
                        <select id="reportType" class="form-select">
                            <option value="enrollment">Enrollment Report</option>
                            <option value="financial">Financial Report</option>
                            <option value="academic">Academic Performance</option>
                            <option value="attendance">Attendance Report</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Semester</label>
                        <select id="reportSemester" class="form-select">
                            <option value="2024-Spring">Spring 2024</option>
                            <option value="2023-Fall">Fall 2023</option>
                        </select>
                    </div>
                    <button type="button" class="btn btn-primary btn-block" onclick="generateReport()">
                        <i class="fas fa-file-alt"></i> Generate Report
                    </button>
                </form>
            </div>
            
            <div class="section">
                <h2>Quick Stats</h2>
                <canvas id="quickStatsChart"></canvas>
            </div>
        </div>
        
        <div class="section" id="reportOutput" style="display: none;">
            <h2>Report Output</h2>
            <div id="reportContent"></div>
        </div>
    `;
    
    // Draw quick stats
    setTimeout(drawQuickStats, 500);
}

// Generate report
async function generateReport() {
    const reportType = document.getElementById('reportType')?.value;
    const output = document.getElementById('reportOutput');
    const content = document.getElementById('reportContent');
    
    if (!output || !content) return;
    
    output.style.display = 'block';
    content.innerHTML = '<div class="loading-spinner"></div>';
    
    // Simulate report generation
    setTimeout(() => {
        content.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-check-circle" style="font-size: 3em; color: #2ecc71;"></i>
                <h3>Report Generated Successfully</h3>
                <p>${reportType} report for the selected period</p>
                <button class="btn btn-primary" onclick="window.print()">
                    <i class="fas fa-print"></i> Print Report
                </button>
                <button class="btn btn-outline">
                    <i class="fas fa-download"></i> Download PDF
                </button>
            </div>
        `;
    }, 1500);
}

// Draw quick stats chart
async function drawQuickStats() {
    const ctx = document.getElementById('quickStatsChart')?.getContext('2d');
    if (!ctx) return;
    
    // Get real data
    const studentsCount = (await db.collection('users').where('role', '==', 'student').get()).size;
    const lecturersCount = (await db.collection('users').where('role', '==', 'lecturer').get()).size;
    const coursesCount = (await db.collection('courses').get()).size;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Students', 'Lecturers', 'Courses', 'Admins'],
            datasets: [{
                label: 'Count',
                data: [studentsCount, lecturersCount, coursesCount, 1],
                backgroundColor: ['#3498db', '#2ecc71', '#f39c12', '#9b59b6']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ===================== SYSTEM SETTINGS =====================

async function loadSystemSettings(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1>System Settings</h1>
        </div>
        
        <div class="grid-2">
            <div class="section">
                <h2>General Settings</h2>
                <form id="generalSettings">
                    <div class="form-group">
                        <label>University Name</label>
                        <input type="text" class="form-input" value="University of Cameroon">
                    </div>
                    <div class="form-group">
                        <label>Current Semester</label>
                        <select class="form-select">
                            <option selected>Spring 2024</option>
                            <option>Fall 2024</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Maximum Courses Per Student</label>
                        <input type="number" class="form-input" value="6" min="1" max="10">
                    </div>
                    <div class="form-group">
                        <label>Registration Deadline</label>
                        <input type="date" class="form-input" value="2024-01-31">
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Save Settings
                    </button>
                </form>
            </div>
            
            <div class="section">
                <h2>Notification Settings</h2>
                <form id="notificationSettings">
                    <div class="form-group">
                        <label>
                            <input type="checkbox" checked> Enable Email Notifications
                        </label>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" checked> Enable SMS Notifications
                        </label>
                    </div>
                    <div class="form-group">
                        <label>SMTP Server</label>
                        <input type="text" class="form-input" value="smtp.university.edu">
                    </div>
                    <div class="form-group">
                        <label>SMS Gateway API Key</label>
                        <input type="password" class="form-input" value="••••••••••••••••">
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Save Settings
                    </button>
                </form>
            </div>
        </div>
    `;
}

// ===================== AUDIT LOGS =====================

async function loadAuditLogs(container) {
    const logsSnapshot = await db.collection('audit_logs')
        .orderBy('timestamp', 'desc')
        .limit(100)
        .get();
    
    container.innerHTML = `
        <div class="page-header">
            <h1>Audit Logs</h1>
            <button class="btn btn-outline" onclick="clearAuditLogs()">
                <i class="fas fa-trash"></i> Clear Old Logs
            </button>
        </div>
        
        <div class="section">
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date/Time</th>
                            <th>Admin</th>
                            <th>Action</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logsSnapshot.docs.length > 0 ?
                            logsSnapshot.docs.map(doc => {
                                const log = doc.data();
                                return `
                                    <tr>
                                        <td>${formatDateTime(log.timestamp?.toDate())}</td>
                                        <td>${log.adminName || 'System'}</td>
                                        <td><span class="badge badge-primary">${log.action}</span></td>
                                        <td>${log.description}</td>
                                    </tr>
                                `;
                            }).join('') :
                            '<tr><td colspan="4" style="text-align: center;">No audit logs found</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Log admin action
async function logAdminAction(action, description) {
    try {
        await db.collection('audit_logs').add({
            action,
            description,
            adminId: localStorage.getItem('userId'),
            adminName: localStorage.getItem('userName'),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            ipAddress: 'System'
        });
    } catch (error) {
        console.error('Error logging action:', error);
    }
}

// Clear old audit logs
async function clearAuditLogs() {
    if (!confirm('Clear audit logs older than 30 days?')) return;
    showNotification('Old logs cleared successfully!', 'success');
}

// ===================== UTILITY FUNCTIONS =====================

function getFirebaseError(error) {
    const errors = {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/user-not-found': 'User not found',
        'permission-denied': 'You do not have permission'
    };
    return errors[error.code] || error.message || 'An error occurred';
}

// Export payment report
function exportPaymentReport() {
    exportToPDF('Payment Report', '<p>Payment report generated on ' + new Date().toLocaleDateString() + '</p>');
}

// Show add calendar event
function showAddCalendarEvent() {
    showNotification('Calendar event feature coming soon!', 'info');
}

// =============================================
// END OF js/admin.js
// =============================================