// =============================================
// LECTURER DASHBOARD - COMPLETE JAVASCRIPT
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    checkLecturerAuth();
    initializeLecturerDashboard();
    setupLecturerNavigation();
    document.getElementById('logoutBtn')?.addEventListener('click', handleLecturerLogout);
    document.getElementById('menuToggle')?.addEventListener('click', toggleLecturerSidebar);
});

// Authentication Check
function checkLecturerAuth() {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = '../index.html';
            return;
        }
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'lecturer') {
            window.location.href = '../index.html';
            return;
        }
        loadLecturerData(user);
    });
}

// Load lecturer data
async function loadLecturerData(user) {
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            document.getElementById('userName').textContent = userData.fullName;
            document.getElementById('sidebarUserName').textContent = userData.fullName;
        }
    } catch (error) {
        console.error('Error loading lecturer data:', error);
    }
}

// Initialize dashboard
function initializeLecturerDashboard() {
    loadLecturerPage('overview');
}

// Navigation Setup
function setupLecturerNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            const page = this.getAttribute('data-page');
            loadLecturerPage(page);
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });
    });
}

// Load page content
async function loadLecturerPage(page) {
    const contentArea = document.getElementById('contentArea');
    showLoading(contentArea);
    
    try {
        switch(page) {
            case 'overview': await loadLecturerOverview(contentArea); break;
            case 'courses': await loadMyCourses(contentArea); break;
            case 'grades': await loadGradeEntry(contentArea); break;
            case 'attendance': await loadAttendancePage(contentArea); break;
            case 'students': await loadStudentList(contentArea); break;
            case 'announcements': await loadLecturerAnnouncements(contentArea); break;
            case 'materials': await loadCourseMaterials(contentArea); break;
            case 'reports': await loadLecturerReports(contentArea); break;
            default: contentArea.innerHTML = '<h2>Page not found</h2>';
        }
    } catch (error) {
        console.error('Error loading page:', error);
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

// Show loading
function showLoading(container) {
    container.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    `;
}

// ===================== LECTURER OVERVIEW =====================
async function loadLecturerOverview(container) {
    const userId = localStorage.getItem('userId');
    const coursesSnapshot = await db.collection('courses').where('lecturerId', '==', userId).get();
    const totalStudents = coursesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().enrolled || 0), 0);
    const today = new Date().toLocaleDateString('en-US', {weekday: 'short'});
    const todayClasses = coursesSnapshot.docs.filter(d => d.data().schedule?.includes(today)).length;
    
    // Get pending grades count
    let pendingGrades = 0;
    for (const courseDoc of coursesSnapshot.docs) {
        const gradesSnapshot = await db.collection('grades')
            .where('courseId', '==', courseDoc.id)
            .where('status', '!=', 'published')
            .get();
        pendingGrades += gradesSnapshot.size;
    }
    
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Welcome back, ${localStorage.getItem('userName')}!</h1>
                <p class="text-muted">Here's your teaching overview</p>
            </div>
            <div class="quick-date">
                <i class="fas fa-calendar"></i>
                ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card blue">
                <i class="fas fa-book"></i>
                <div class="stat-value">${coursesSnapshot.size}</div>
                <div class="stat-label">My Courses</div>
            </div>
            <div class="stat-card green">
                <i class="fas fa-users"></i>
                <div class="stat-value">${totalStudents}</div>
                <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-card orange">
                <i class="fas fa-clock"></i>
                <div class="stat-value">${todayClasses}</div>
                <div class="stat-label">Classes Today</div>
            </div>
            <div class="stat-card purple">
                <i class="fas fa-star"></i>
                <div class="stat-value">${pendingGrades}</div>
                <div class="stat-label">Pending Grades</div>
            </div>
        </div>
        
        <div class="grid-2">
            <div class="section">
                <h2>Today's Schedule</h2>
                <div class="schedule-list">
                    ${coursesSnapshot.docs.filter(d => d.data().schedule?.includes(today)).map(doc => {
                        const course = doc.data();
                        return `
                            <div class="schedule-item">
                                <div class="schedule-time">
                                    <span class="time">${course.schedule || '8:00 - 10:00'}</span>
                                </div>
                                <div class="schedule-info">
                                    <h4>${course.code} - ${course.name}</h4>
                                    <p><i class="fas fa-door-open"></i> ${course.venue || 'Room 101'}</p>
                                    <p><i class="fas fa-users"></i> ${course.enrolled || 0} Students</p>
                                </div>
                            </div>
                        `;
                    }).join('') || '<p class="text-muted">No classes today</p>'}
                </div>
            </div>
            
            <div class="section">
                <h2>Quick Actions</h2>
                <div class="quick-actions-grid">
                    <div class="quick-action-card" onclick="loadLecturerPage('grades')">
                        <i class="fas fa-pen"></i>
                        <h3>Enter Grades</h3>
                    </div>
                    <div class="quick-action-card" onclick="loadLecturerPage('attendance')">
                        <i class="fas fa-clipboard-list"></i>
                        <h3>Take Attendance</h3>
                    </div>
                    <div class="quick-action-card" onclick="loadLecturerPage('announcements')">
                        <i class="fas fa-bullhorn"></i>
                        <h3>Post Announcement</h3>
                    </div>
                    <div class="quick-action-card" onclick="loadLecturerPage('materials')">
                        <i class="fas fa-upload"></i>
                        <h3>Upload Materials</h3>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===================== MY COURSES =====================
async function loadMyCourses(container) {
    const userId = localStorage.getItem('userId');
    const coursesSnapshot = await db.collection('courses').where('lecturerId', '==', userId).get();
    
    container.innerHTML = `
        <div class="page-header">
            <h1>My Courses</h1>
            <p class="text-muted">Manage your assigned courses</p>
        </div>
        
        <div class="courses-grid">
            ${coursesSnapshot.docs.map(doc => {
                const course = doc.data();
                return `
                    <div class="course-card detailed">
                        <div class="course-header">
                            <span class="course-code">${course.code}</span>
                            <span class="course-credits">${course.credits} Credits</span>
                        </div>
                        <h3>${course.name}</h3>
                        <p>${course.description || 'No description'}</p>
                        <div class="course-details">
                            <span><i class="fas fa-users"></i> ${course.enrolled || 0} Students</span>
                            <span><i class="fas fa-clock"></i> ${course.schedule || 'TBA'}</span>
                            <span><i class="fas fa-door-open"></i> ${course.venue || 'TBA'}</span>
                        </div>
                        <div class="course-actions">
                            <button class="btn btn-sm btn-primary" onclick="loadLecturerPage('students')">
                                <i class="fas fa-list"></i> Students
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="loadLecturerPage('grades')">
                                <i class="fas fa-star"></i> Grades
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="loadLecturerPage('attendance')">
                                <i class="fas fa-clipboard"></i> Attendance
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ===================== GRADE ENTRY =====================
async function loadGradeEntry(container) {
    const userId = localStorage.getItem('userId');
    const coursesSnapshot = await db.collection('courses').where('lecturerId', '==', userId).get();
    
    container.innerHTML = `
        <div class="page-header">
            <h1>Grade Entry</h1>
            <div class="grade-controls">
                <select id="courseSelect" class="form-select" onchange="loadStudentsForGrading()">
                    <option value="">Select Course</option>
                    ${coursesSnapshot.docs.map(doc => {
                        const course = doc.data();
                        return `<option value="${doc.id}">${course.code} - ${course.name}</option>`;
                    }).join('')}
                </select>
                <select id="assessmentType" class="form-select">
                    <option value="ca">Continuous Assessment (40%)</option>
                    <option value="exam">Exam (60%)</option>
                </select>
            </div>
        </div>
        <div id="gradeEntryArea">
            <div class="empty-state">
                <i class="fas fa-arrow-up"></i>
                <h3>Select a course to enter grades</h3>
            </div>
        </div>
    `;
}

// Load students for grading
async function loadStudentsForGrading() {
    const courseId = document.getElementById('courseSelect')?.value;
    const assessmentType = document.getElementById('assessmentType')?.value;
    if (!courseId) return;
    
    const gradeArea = document.getElementById('gradeEntryArea');
    gradeArea.innerHTML = '<div class="loading-spinner"></div>';
    
    const enrollmentsSnapshot = await db.collection('enrollments')
        .where('courseId', '==', courseId).where('status', '==', 'active').get();
    
    const studentIds = enrollmentsSnapshot.docs.map(doc => doc.data().studentId);
    const students = [];
    
    for (const studentId of studentIds) {
        const studentDoc = await db.collection('users').doc(studentId).get();
        if (studentDoc.exists) {
            students.push({ id: studentId, ...studentDoc.data() });
        }
    }
    
    const maxScore = assessmentType === 'ca' ? 40 : 60;
    
    gradeArea.innerHTML = `
        <div class="grade-entry-form">
            <div class="grade-entry-header">
                <h3>${assessmentType === 'ca' ? 'Continuous Assessment (Max: 40)' : 'Exam (Max: 60)'}</h3>
            </div>
            <table class="data-table">
                <thead>
                    <tr><th>#</th><th>Student ID</th><th>Name</th><th>Score (/${maxScore})</th><th>%</th></tr>
                </thead>
                <tbody>
                    ${students.map((s, i) => `
                        <tr>
                            <td>${i+1}</td>
                            <td>${s.studentId || 'N/A'}</td>
                            <td>${s.fullName}</td>
                            <td><input type="number" class="form-input grade-input" data-student-id="${s.id}" min="0" max="${maxScore}"></td>
                            <td class="percentage-display">0%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="grade-entry-actions">
                <button class="btn btn-primary" onclick="saveGrades('${courseId}', '${assessmentType}')">
                    <i class="fas fa-save"></i> Save
                </button>
                <button class="btn btn-success" onclick="publishGrades('${courseId}')">
                    <i class="fas fa-check-circle"></i> Publish
                </button>
            </div>
        </div>
    `;
    
    document.querySelectorAll('.grade-input').forEach(input => {
        input.addEventListener('input', function() {
            const score = parseInt(this.value) || 0;
            const pct = Math.round((score / maxScore) * 100);
            this.closest('tr').querySelector('.percentage-display').textContent = pct + '%';
        });
    });
}

// Save grades
async function saveGrades(courseId, assessmentType) {
    const inputs = document.querySelectorAll('.grade-input');
    let saved = 0;
    
    for (const input of inputs) {
        const studentId = input.getAttribute('data-student-id');
        const score = parseInt(input.value) || 0;
        if (score === 0) continue;
        
        const existing = await db.collection('grades')
            .where('studentId', '==', studentId)
            .where('courseId', '==', courseId).get();
        
        const data = {
            studentId, courseId,
            [assessmentType === 'ca' ? 'caScore' : 'examScore']: score,
            semester: '2024-Spring'
        };
        
        if (existing.empty) {
            await db.collection('grades').add({...data, examScore: 0, caScore: 0, status: 'draft'});
        } else {
            await existing.docs[0].ref.update(data);
        }
        saved++;
    }
    
    showNotification(`${saved} grades saved successfully!`, 'success');
}

// Publish grades
async function publishGrades(courseId) {
    if (!confirm('Publish all grades? Students will be able to see them.')) return;
    
    const gradesSnapshot = await db.collection('grades').where('courseId', '==', courseId).get();
    
    for (const doc of gradesSnapshot.docs) {
        const grade = doc.data();
        const total = (grade.caScore || 0) + (grade.examScore || 0);
        let letter = 'F';
        if (total >= 80) letter = 'A';
        else if (total >= 75) letter = 'A-';
        else if (total >= 70) letter = 'B+';
        else if (total >= 65) letter = 'B';
        else if (total >= 60) letter = 'B-';
        else if (total >= 55) letter = 'C+';
        else if (total >= 50) letter = 'C';
        else if (total >= 45) letter = 'D';
        
        await doc.ref.update({
            total, grade: letter,
            status: 'published',
            publishedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    
    showNotification('Grades published successfully!', 'success');
}

// ===================== ATTENDANCE PAGE =====================
async function loadAttendancePage(container) {
    const userId = localStorage.getItem('userId');
    const coursesSnapshot = await db.collection('courses').where('lecturerId', '==', userId).get();
    
    container.innerHTML = `
        <div class="page-header">
            <h1>Attendance</h1>
            <div>
                <select id="attendanceCourse" class="form-select" onchange="loadAttendanceSheet()">
                    <option value="">Select Course</option>
                    ${coursesSnapshot.docs.map(doc => {
                        const c = doc.data();
                        return `<option value="${doc.id}">${c.code} - ${c.name}</option>`;
                    }).join('')}
                </select>
                <input type="date" id="attendanceDate" class="form-input" value="${new Date().toISOString().split('T')[0]}">
            </div>
        </div>
        <div id="attendanceArea">
            <div class="empty-state">
                <i class="fas fa-clipboard-check"></i>
                <h3>Select a course to take attendance</h3>
            </div>
        </div>
    `;
}

async function loadAttendanceSheet() {
    const courseId = document.getElementById('attendanceCourse')?.value;
    const date = document.getElementById('attendanceDate')?.value;
    if (!courseId) return;
    
    const area = document.getElementById('attendanceArea');
    area.innerHTML = '<div class="loading-spinner"></div>';
    
    const enrollmentsSnapshot = await db.collection('enrollments')
        .where('courseId', '==', courseId).where('status', '==', 'active').get();
    
    const studentIds = enrollmentsSnapshot.docs.map(doc => doc.data().studentId);
    const students = [];
    
    for (const sid of studentIds) {
        const doc = await db.collection('users').doc(sid).get();
        if (doc.exists) students.push({ id: sid, ...doc.data() });
    }
    
    area.innerHTML = `
        <div class="attendance-sheet">
            <h3>Attendance for ${date}</h3>
            <table class="data-table">
                <thead><tr><th>#</th><th>Student</th><th>Status</th></tr></thead>
                <tbody>
                    ${students.map((s, i) => `
                        <tr>
                            <td>${i+1}</td>
                            <td>${s.fullName} (${s.studentId || 'N/A'})</td>
                            <td>
                                <select class="form-select attendance-status" data-student-id="${s.id}">
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="late">Late</option>
                                    <option value="excused">Excused</option>
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <button class="btn btn-primary" onclick="saveAttendance('${courseId}', '${date}')">
                <i class="fas fa-save"></i> Save Attendance
            </button>
        </div>
    `;
}

async function saveAttendance(courseId, date) {
    const statuses = document.querySelectorAll('.attendance-status');
    let saved = 0;
    
    for (const select of statuses) {
        const studentId = select.getAttribute('data-student-id');
        await db.collection('attendance').add({
            studentId, courseId, date,
            status: select.value,
            markedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        saved++;
    }
    
    showNotification(`Attendance saved for ${saved} students!`, 'success');
}

// ===================== STUDENT LIST =====================
async function loadStudentList(container) {
    const userId = localStorage.getItem('userId');
    const coursesSnapshot = await db.collection('courses').where('lecturerId', '==', userId).get();
    
    container.innerHTML = `
        <div class="page-header">
            <h1>Student List</h1>
            <select id="studentCourseFilter" class="form-select" onchange="filterStudentsByCourse()">
                <option value="all">All Courses</option>
                ${coursesSnapshot.docs.map(doc => {
                    const c = doc.data();
                    return `<option value="${doc.id}">${c.code} - ${c.name}</option>`;
                }).join('')}
            </select>
        </div>
        <div id="studentListArea"><div class="loading-spinner"></div></div>
    `;
    
    await filterStudentsByCourse();
}

async function filterStudentsByCourse() {
    const courseId = document.getElementById('studentCourseFilter')?.value;
    const area = document.getElementById('studentListArea');
    area.innerHTML = '<div class="loading-spinner"></div>';
    
    let enrollmentsSnapshot;
    if (courseId === 'all') {
        const userId = localStorage.getItem('userId');
        const coursesSnapshot = await db.collection('courses').where('lecturerId', '==', userId).get();
        const courseIds = coursesSnapshot.docs.map(d => d.id);
        // Simplified: get all enrollments for lecturer's courses
        enrollmentsSnapshot = await db.collection('enrollments')
            .where('courseId', 'in', courseIds.length > 0 ? courseIds : ['none'])
            .get();
    } else {
        enrollmentsSnapshot = await db.collection('enrollments')
            .where('courseId', '==', courseId).get();
    }
    
    const uniqueStudents = new Map();
    for (const doc of enrollmentsSnapshot.docs) {
        const data = doc.data();
        if (!uniqueStudents.has(data.studentId)) {
            uniqueStudents.set(data.studentId, []);
        }
        uniqueStudents.get(data.studentId).push(data.courseId);
    }
    
    const students = [];
    for (const [sid, courses] of uniqueStudents) {
        const userDoc = await db.collection('users').doc(sid).get();
        if (userDoc.exists) {
            students.push({ id: sid, courses: courses.length, ...userDoc.data() });
        }
    }
    
    area.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Courses</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.length > 0 ? students.map((s, i) => `
                        <tr>
                            <td>${i + 1}</td>
                            <td><strong>${formatStudentId(s.studentId)}</strong></td>
                            <td>${s.fullName}</td>
                            <td>${s.email}</td>
                            <td>${s.department || 'N/A'}</td>
                            <td><span class="badge badge-primary">${s.courses} course(s)</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline" onclick="viewStudentDetails('${s.id}')" title="View Details">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline" onclick="messageStudent('${s.id}')" title="Send Message">
                                    <i class="fas fa-envelope"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('') : `
                        <tr>
                            <td colspan="7" style="text-align: center;">No students found</td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>
        <div style="margin-top: 15px; text-align: right;">
            <button class="btn btn-outline" onclick="exportStudentList()">
                <i class="fas fa-download"></i> Export List
            </button>
        </div>
    `;
}

// View student details
async function viewStudentDetails(studentId) {
    const studentDoc = await db.collection('users').doc(studentId).get();
    if (!studentDoc.exists) {
        showNotification('Student not found', 'error');
        return;
    }
    
    const student = studentDoc.data();
    
    // Get student's grades in lecturer's courses
    const userId = localStorage.getItem('userId');
    const coursesSnapshot = await db.collection('courses')
        .where('lecturerId', '==', userId).get();
    
    const courseIds = coursesSnapshot.docs.map(d => d.id);
    
    let gradesHtml = '';
    for (const courseId of courseIds) {
        const gradesSnapshot = await db.collection('grades')
            .where('studentId', '==', studentId)
            .where('courseId', '==', courseId).get();
        
        if (!gradesSnapshot.empty) {
            const grade = gradesSnapshot.docs[0].data();
            const courseDoc = await db.collection('courses').doc(courseId).get();
            const course = courseDoc.data();
            
            gradesHtml += `
                <tr>
                    <td>${course?.code || 'N/A'}</td>
                    <td>${course?.name || 'N/A'}</td>
                    <td>${grade.caScore || 0}</td>
                    <td>${grade.examScore || 0}</td>
                    <td><strong>${(grade.caScore || 0) + (grade.examScore || 0)}</strong></td>
                    <td><span class="grade-badge grade-${(grade.grade || 'f').toLowerCase()}">${grade.grade || 'N/A'}</span></td>
                </tr>
            `;
        }
    }
    
    const modal = document.getElementById('adminModal') || createModal();
    document.getElementById('modalTitle').textContent = `Student Details: ${student.fullName}`;
    document.getElementById('modalBody').innerHTML = `
        <div class="student-profile">
            <div style="text-align: center; margin-bottom: 20px;">,
                
                <h3>${student.fullName}</h3>
                <p class="text-muted">${student.studentId || 'ID: N/A'}</p>
            </div>
            
            <div class="grid-2" style="margin-bottom: 20px;">
                <div>
                    <p><strong>Email:</strong> ${student.email}</p>
                    <p><strong>Phone:</strong> ${student.phone || 'N/A'}</p>
                </div>
                <div>
                    <p><strong>Department:</strong> ${student.department || 'N/A'}</p>
                    <p><strong>Level:</strong> ${student.level || 'N/A'}</p>
                </div>
            </div>
            
            <h4>Grades in My Courses</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>CA (40%)</th>
                        <th>Exam (60%)</th>
                        <th>Total</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${gradesHtml || '<tr><td colspan="6" style="text-align: center;">No grades recorded</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Message student
function messageStudent(studentId) {
    showNotification('Messaging feature coming soon!', 'info');
}

// Export student list
function exportStudentList() {
    const table = document.querySelector('.data-table');
    if (!table) return;
    
    exportToPDF('Student List', table.outerHTML);
}

// Create modal if not exists
function createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'adminModal';
    modal.innerHTML = `
        <div class="modal-content modal-lg">
            <div class="modal-header">
                <h3 id="modalTitle">Modal Title</h3>
                <button class="close-modal" onclick="this.closest('.modal').style.display='none'">&times;</button>
            </div>
            <div class="modal-body" id="modalBody"></div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    return modal;
}

// Close admin modal
function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.style.display = 'none';
}

// ===================== LECTURER ANNOUNCEMENTS =====================
async function loadLecturerAnnouncements(container) {
    const userId = localStorage.getItem('userId');
    
    try {
        // Try multiple field name variations
        let announcementsSnapshot = null;
        
        try {
            announcementsSnapshot = await db.collection('announcements')
                .where('postedBy', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();
        } catch (e) {
            console.log('Trying alternate field names for announcements...');
            try {
                announcementsSnapshot = await db.collection('announcements')
                    .where('lecturer_id', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .get();
            } catch (e2) {
                // If queries fail, get all announcements and filter
                announcementsSnapshot = await db.collection('announcements')
                    .orderBy('createdAt', 'desc')
                    .get();
            }
        }
        
        // Filter by userId if needed
        const announcements = announcementsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(a => !a.postedBy || a.postedBy === userId || a.lecturer_id === userId);
        
        container.innerHTML = `
            <div class="page-header">
                <h1>Announcements</h1>
                <button class="btn btn-primary" onclick="showCreateAnnouncementForm()">
                    <i class="fas fa-plus"></i> New Announcement
                </button>
            </div>
            
            <!-- Create Announcement Form (Hidden by default) -->
            <div class="section" id="createAnnouncementForm" style="display: none;">
                <h2>Create Announcement</h2>
                <form id="announcementForm">
                    <div class="form-group">
                        <label>Title *</label>
                        <input type="text" id="announcementTitle" class="form-input" required placeholder="Enter announcement title">
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="announcementCategory" class="form-select">
                            <option value="general">General</option>
                            <option value="academic">Academic</option>
                            <option value="events">Events</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Message *</label>
                        <textarea id="announcementMessage" class="form-textarea" rows="5" required placeholder="Type your announcement message..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="sendNotification"> Send email/SMS notification to students
                        </label>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> Post Announcement
                        </button>
                        <button type="button" class="btn btn-outline" onclick="hideCreateAnnouncementForm()">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- Existing Announcements -->
            <div class="section">
                <h2>My Announcements</h2>
                <div class="announcements-list">
                    ${announcements.length > 0 ? 
                        announcements.map(a => {
                            const safeTitle = escapeHtml(a.title || 'No Title');
                            const safeMessage = escapeHtml(a.message || 'No message');
                            
                            return `
                                <div class="announcement-card">
                                    <div class="announcement-icon">
                                        ${getAnnouncementIcon(a.category)}
                                    </div>
                                    <div class="announcement-body">
                                        <div class="announcement-header">
                                            <h3>${safeTitle}</h3>
                                            <span class="badge badge-${a.category === 'urgent' ? 'danger' : a.category === 'academic' ? 'primary' : 'warning'}">
                                                ${a.category || 'general'}
                                            </span>
                                        </div>
                                        <p class="announcement-message">${safeMessage}</p>
                                        <div class="announcement-meta">
                                            <span><i class="fas fa-clock"></i> ${formatDateTime(a.createdAt?.toDate())}</span>
                                        </div>
                                        <div style="margin-top: 10px;">
                                            <button class="btn btn-sm btn-outline" onclick="editAnnouncement('${a.id}')">
                                                <i class="fas fa-edit"></i> Edit
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteAnnouncement('${a.id}')">
                                                <i class="fas fa-trash"></i> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('') :
                        '<p class="text-muted text-center">No announcements yet. Create your first one!</p>'
                    }
                </div>
            </div>
        `;
        
        // Setup announcement form
        setupAnnouncementForm();
    } catch (error) {
        console.error('Error loading announcements:', error);
        container.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading announcements</h3>
                <p>${error.message || 'Please try again later.'}</p>
                <button onclick="loadLecturerPage('announcements')" class="btn btn-primary">Retry</button>
            </div>
        `;
    }
}

// Get lecturer course options for dropdown
async function getLecturerCourseOptions(userId) {
    const coursesSnapshot = await db.collection('courses')
        .where('lecturerId', '==', userId).get();
    
    return coursesSnapshot.docs.map(doc => {
        const c = doc.data();
        return `<option value="${doc.id}">${c.code} - ${c.name}</option>`;
    }).join('');
}

// Show create announcement form
function showCreateAnnouncementForm() {
    const form = document.getElementById('createAnnouncementForm');
    if (form) form.style.display = 'block';
}

// Hide create announcement form
function hideCreateAnnouncementForm() {
    const form = document.getElementById('createAnnouncementForm');
    if (form) form.style.display = 'none';
    document.getElementById('announcementForm')?.reset();
}

// Setup announcement form submission
function setupAnnouncementForm() {
    document.getElementById('announcementForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('announcementTitle').value.trim();
        const category = document.getElementById('announcementCategory').value;
        const courseId = document.getElementById('announcementCourse').value;
        const message = document.getElementById('announcementMessage').value.trim();
        const sendNotification = document.getElementById('sendNotification').checked;
        
        if (!title || !message) {
            showNotification('Please fill in all required fields', 'warning');
            return;
        }
        
        try {
            const announcementData = {
                title,
                category,
                message,
                targetCourse: courseId,
                postedBy: localStorage.getItem('userId'),
                postedByName: localStorage.getItem('userName'),
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                notificationSent: sendNotification
            };
            
            await db.collection('announcements').add(announcementData);
            
            showNotification('Announcement posted successfully!', 'success');
            hideCreateAnnouncementForm();
            
            // Refresh announcements
            setTimeout(() => loadLecturerPage('announcements'), 500);
            
        } catch (error) {
            console.error('Error posting announcement:', error);
            showNotification('Error posting announcement', 'error');
        }
    });
}

// Edit announcement
async function editAnnouncement(announcementId) {
    const doc = await db.collection('announcements').doc(announcementId).get();
    if (!doc.exists) return;
    
    const announcement = doc.data();
    
    const modal = document.getElementById('adminModal') || createModal();
    document.getElementById('modalTitle').textContent = 'Edit Announcement';
    document.getElementById('modalBody').innerHTML = `
        <form id="editAnnouncementForm">
            <input type="hidden" id="editAnnouncementId" value="${announcementId}">
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="editTitle" class="form-input" value="${announcement.title}" required>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="editCategory" class="form-select">
                    <option value="general" ${announcement.category === 'general' ? 'selected' : ''}>General</option>
                    <option value="academic" ${announcement.category === 'academic' ? 'selected' : ''}>Academic</option>
                    <option value="events" ${announcement.category === 'events' ? 'selected' : ''}>Events</option>
                    <option value="urgent" ${announcement.category === 'urgent' ? 'selected' : ''}>Urgent</option>
                </select>
            </div>
            <div class="form-group">
                <label>Message</label>
                <textarea id="editMessage" class="form-textarea" rows="5" required>${announcement.message}</textarea>
            </div>
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-save"></i> Update Announcement
            </button>
        </form>
    `;
    
    modal.style.display = 'flex';
    
    document.getElementById('editAnnouncementForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        await db.collection('announcements').doc(announcementId).update({
            title: document.getElementById('editTitle').value,
            category: document.getElementById('editCategory').value,
            message: document.getElementById('editMessage').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        modal.style.display = 'none';
        showNotification('Announcement updated!', 'success');
        setTimeout(() => loadLecturerPage('announcements'), 500);
    });
}

// Delete announcement
async function deleteAnnouncement(announcementId) {
    if (!confirmAction('Are you sure you want to delete this announcement?')) return;
    
    try {
        await db.collection('announcements').doc(announcementId).delete();
        showNotification('Announcement deleted!', 'success');
        setTimeout(() => loadLecturerPage('announcements'), 500);
    } catch (error) {
        showNotification('Error deleting announcement', 'error');
    }
}

// Get announcement icon
function getAnnouncementIcon(category) {
    const icons = {
        'urgent': '<i class="fas fa-exclamation-circle" style="color: #e74c3c; font-size: 1.5em;"></i>',
        'academic': '<i class="fas fa-book" style="color: #3498db; font-size: 1.5em;"></i>',
        'events': '<i class="fas fa-calendar" style="color: #2ecc71; font-size: 1.5em;"></i>',
        'general': '<i class="fas fa-bullhorn" style="color: #f39c12; font-size: 1.5em;"></i>'
    };
    return icons[category] || icons['general'];
}

// ===================== COURSE MATERIALS =====================
async function loadCourseMaterials(container) {
    const userId = localStorage.getItem('userId');
    
    try {
        // Get lecturer's courses
        let coursesSnapshot = null;
        try {
            coursesSnapshot = await db.collection('courses')
                .where('lecturerId', '==', userId).get();
        } catch (e) {
            console.log('Trying alternate field names for courses...');
            try {
                coursesSnapshot = await db.collection('courses')
                    .where('lecturer_id', '==', userId).get();
            } catch (e2) {
                coursesSnapshot = await db.collection('courses').get();
            }
        }
        
        // Get materials
        let materialsSnapshot = null;
        try {
            materialsSnapshot = await db.collection('materials')
                .where('uploadedBy', '==', userId)
                .orderBy('uploadedAt', 'desc')
                .get();
        } catch (e) {
            console.log('Trying alternate field names for materials...');
            try {
                materialsSnapshot = await db.collection('materials')
                    .where('lecturer_id', '==', userId)
                    .orderBy('uploadedAt', 'desc')
                    .get();
            } catch (e2) {
                materialsSnapshot = await db.collection('materials').get();
            }
        }
        
        // Filter materials for this lecturer
        const materials = materialsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(m => m.uploadedBy === userId || m.lecturer_id === userId);
        
        container.innerHTML = `
            <div class="page-header">
                <h1>Course Materials</h1>
                <button class="btn btn-primary" onclick="showUploadMaterialForm()">
                    <i class="fas fa-upload"></i> Upload Material
                </button>
            </div>
            
            <!-- Upload Form (Hidden) -->
            <div class="section" id="uploadMaterialForm" style="display: none;">
                <h2>Upload New Material</h2>
                <form id="materialForm">
                    <div class="grid-2">
                        <div class="form-group">
                            <label>Course *</label>
                            <select id="materialCourse" class="form-select" required>
                                <option value="">Select Course</option>
                                ${coursesSnapshot.docs.map(doc => {
                                    const c = doc.data();
                                    return `<option value="${doc.id}">${c.code} - ${c.name}</option>`;
                                }).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Material Type</label>
                            <select id="materialType" class="form-select">
                                <option value="lecture">Lecture Notes</option>
                                <option value="assignment">Assignment</option>
                                <option value="tutorial">Tutorial</option>
                                <option value="reference">Reference Material</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Title *</label>
                        <input type="text" id="materialTitle" class="form-input" required placeholder="e.g., Chapter 1 - Introduction" />
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="materialDescription" class="form-textarea" rows="3" placeholder="Brief description of the material"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Upload File *</label>
                        <div class="file-upload">
                            <input type="file" id="materialFile" required accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" />
                            <div class="file-upload-area">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Click to upload or drag and drop</p>
                                <span class="file-info" id="materialFileInfo"></span>
                            </div>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-upload"></i> Upload
                        </button>
                        <button type="button" class="btn btn-outline" onclick="hideUploadMaterialForm()">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- Materials List -->
            <div class="section">
                <h2>Uploaded Materials</h2>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Course</th>
                                <th>Type</th>
                                <th>File</th>
                                <th>Uploaded</th>
                                <th>Downloads</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${materials.length > 0 ?
                                materials.map(m => {
                                    const safeTitle = escapeHtml(m.title || 'Untitled');
                                    const safeCourse = escapeHtml(m.courseName || m.course_name || 'N/A');
                                    const safeFile = escapeHtml(m.fileName || m.file_name || 'N/A');
                                    
                                    return `
                                        <tr>
                                            <td><strong>${safeTitle}</strong></td>
                                            <td>${safeCourse}</td>
                                            <td><span class="badge badge-primary">${m.type || 'other'}</span></td>
                                            <td>${safeFile}</td>
                                            <td>${formatDate(m.uploadedAt?.toDate())}</td>
                                            <td>${m.downloads || 0}</td>
                                            <td>
                                                <button class="btn btn-sm btn-outline" onclick="downloadMaterial('${m.id}')">
                                                    <i class="fas fa-download"></i>
                                                </button>
                                                <button class="btn btn-sm btn-danger" onclick="deleteMaterial('${m.id}')">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('') :
                                '<tr><td colspan="7" style="text-align: center;">No materials uploaded yet</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        // Setup material form
        setupMaterialForm();
    } catch (error) {
        console.error('Error loading materials:', error);
        container.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading materials</h3>
                <p>${error.message || 'Please try again later.'}</p>
                <button onclick="loadLecturerPage('materials')" class="btn btn-primary">Retry</button>
            </div>
        `;
    }
}
                            '<tr><td colspan="7" style="text-align: center;">No materials uploaded yet</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // Setup material form
    setupMaterialForm();
}

// Show upload material form
function showUploadMaterialForm() {
    document.getElementById('uploadMaterialForm').style.display = 'block';
}

// Hide upload material form
function hideUploadMaterialForm() {
    document.getElementById('uploadMaterialForm').style.display = 'none';
    document.getElementById('materialForm')?.reset();
}

// Setup material form
function setupMaterialForm() {
    document.getElementById('materialForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const courseId = document.getElementById('materialCourse').value;
        const type = document.getElementById('materialType').value;
        const title = document.getElementById('materialTitle').value.trim();
        const description = document.getElementById('materialDescription').value.trim();
        const file = document.getElementById('materialFile').files[0];
        
        if (!courseId || !title || !file) {
            showNotification('Please fill all required fields', 'warning');
            return;
        }
        
        try {
            // Get course name
            const courseDoc = await db.collection('courses').doc(courseId).get();
            const courseName = courseDoc.exists ? `${courseDoc.data().code} - ${courseDoc.data().name}` : 'Unknown';
            
            // Create material record
            await db.collection('materials').add({
                courseId,
                courseName,
                type,
                title,
                description,
                fileName: file.name,
                fileSize: file.size,
                uploadedBy: localStorage.getItem('userId'),
                uploadedByName: localStorage.getItem('userName'),
                uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
                downloads: 0
            });
            
            showNotification('Material uploaded successfully!', 'success');
            hideUploadMaterialForm();
            setTimeout(() => loadLecturerPage('materials'), 500);
            
        } catch (error) {
            console.error('Error uploading material:', error);
            showNotification('Error uploading material', 'error');
        }
    });
}

// Download material
async function downloadMaterial(materialId) {
    try {
        // Increment download count
        await db.collection('materials').doc(materialId).update({
            downloads: firebase.firestore.FieldValue.increment(1)
        });
        
        showNotification('Download started!', 'success');
        // In a real app, you'd get the download URL from Firebase Storage
    } catch (error) {
        showNotification('Error downloading material', 'error');
    }
}

// Delete material
async function deleteMaterial(materialId) {
    if (!confirmAction('Delete this material? This cannot be undone.')) return;
    
    try {
        await db.collection('materials').doc(materialId).delete();
        showNotification('Material deleted!', 'success');
        setTimeout(() => loadLecturerPage('materials'), 500);
    } catch (error) {
        showNotification('Error deleting material', 'error');
    }
}

// ===================== LECTURER REPORTS =====================
async function loadLecturerReports(container) {
    const userId = localStorage.getItem('userId');
    
    // Get statistics
    const coursesSnapshot = await db.collection('courses')
        .where('lecturerId', '==', userId).get();
    
    const courseIds = coursesSnapshot.docs.map(d => d.id);
    
    // Count total students
    let totalStudents = 0;
    coursesSnapshot.docs.forEach(d => totalStudents += (d.data().enrolled || 0));
    
    // Count published grades
    let publishedGrades = 0;
    let totalGrades = 0;
    for (const courseId of courseIds) {
        const gradesSnapshot = await db.collection('grades')
            .where('courseId', '==', courseId).get();
        totalGrades += gradesSnapshot.size;
        publishedGrades += gradesSnapshot.docs.filter(d => d.data().status === 'published').length;
    }
    
    container.innerHTML = `
        <div class="page-header">
            <h1>Reports & Analytics</h1>
            <button class="btn btn-outline" onclick="window.print()">
                <i class="fas fa-print"></i> Print Report
            </button>
        </div>
        
        <!-- Summary Cards -->
        <div class="stats-grid">
            <div class="stat-card blue">
                <i class="fas fa-book"></i>
                <div class="stat-value">${coursesSnapshot.size}</div>
                <div class="stat-label">Active Courses</div>
            </div>
            <div class="stat-card green">
                <i class="fas fa-users"></i>
                <div class="stat-value">${totalStudents}</div>
                <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-card orange">
                <i class="fas fa-check-circle"></i>
                <div class="stat-value">${publishedGrades}</div>
                <div class="stat-label">Grades Published</div>
            </div>
            <div class="stat-card purple">
                <i class="fas fa-percentage"></i>
                <div class="stat-value">${totalGrades > 0 ? Math.round((publishedGrades / totalGrades) * 100) : 0}%</div>
                <div class="stat-label">Completion Rate</div>
            </div>
        </div>
        
        <!-- Course Performance -->
        <div class="section">
            <h2>Course Performance Overview</h2>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>Students</th>
                            <th>Avg. CA</th>
                            <th>Avg. Exam</th>
                            <th>Avg. Total</th>
                            <th>Pass Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${await generateCoursePerformanceRows(courseIds, coursesSnapshot)}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Grade Distribution Chart -->
        <div class="section">
            <h2>Overall Grade Distribution</h2>
            <div style="max-width: 600px; margin: 0 auto;">
                <canvas id="gradeDistributionChart"></canvas>
            </div>
        </div>
    `;
    
    // Draw chart after render
    setTimeout(() => drawGradeDistributionChart(courseIds), 500);
}

// Generate course performance rows
async function generateCoursePerformanceRows(courseIds, coursesSnapshot) {
    let rows = '';
    
    for (const doc of coursesSnapshot.docs) {
        const course = doc.data();
        const gradesSnapshot = await db.collection('grades')
            .where('courseId', '==', doc.id)
            .where('status', '==', 'published').get();
        
        const grades = gradesSnapshot.docs.map(d => d.data());
        const count = grades.length;
        
        if (count === 0) {
            rows += `
                <tr>
                    <td>${course.code} - ${course.name}</td>
                    <td>${course.enrolled || 0}</td>
                    <td colspan="4" style="text-align: center;">No grades published</td>
                </tr>
            `;
            continue;
        }
        
        const avgCA = Math.round(grades.reduce((s, g) => s + (g.caScore || 0), 0) / count);
        const avgExam = Math.round(grades.reduce((s, g) => s + (g.examScore || 0), 0) / count);
        const avgTotal = Math.round(grades.reduce((s, g) => s + (g.total || 0), 0) / count);
        const passCount = grades.filter(g => (g.total || 0) >= 50).length;
        const passRate = Math.round((passCount / count) * 100);
        
        rows += `
            <tr>
                <td><strong>${course.code}</strong> - ${course.name}</td>
                <td>${course.enrolled || 0}</td>
                <td>${avgCA}/40</td>
                <td>${avgExam}/60</td>
                <td><strong>${avgTotal}/100</strong></td>
                <td>
                    <span class="badge ${passRate >= 70 ? 'badge-success' : passRate >= 50 ? 'badge-warning' : 'badge-danger'}">
                        ${passRate}%
                    </span>
                </td>
            </tr>
        `;
    }
    
    return rows || '<tr><td colspan="6" style="text-align: center;">No data available</td></tr>';
}

// Draw grade distribution chart
async function drawGradeDistributionChart(courseIds) {
    const ctx = document.getElementById('gradeDistributionChart')?.getContext('2d');
    if (!ctx) return;
    
    const distribution = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
    
    for (const courseId of courseIds) {
        const gradesSnapshot = await db.collection('grades')
            .where('courseId', '==', courseId)
            .where('status', '==', 'published').get();
        
        gradesSnapshot.docs.forEach(doc => {
            const grade = doc.data().grade;
            if (grade) {
                const letter = grade.charAt(0);
                if (distribution[letter] !== undefined) {
                    distribution[letter]++;
                }
            }
        });
    }
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['A (80-100)', 'B (60-79)', 'C (50-59)', 'D (45-49)', 'F (0-44)'],
            datasets: [{
                data: [distribution['A'], distribution['B'], distribution['C'], distribution['D'], distribution['F']],
                backgroundColor: ['#2ecc71', '#3498db', '#f39c12', '#e67e22', '#e74c3c'],
                borderWidth: 2,
                borderColor: 'white'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// =============================================
// END OF js/lecturer.js
// =============================================