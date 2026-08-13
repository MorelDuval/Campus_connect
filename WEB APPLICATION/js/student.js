// Student Dashboard Logic - Campus Connect

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkStudentAuth();
    
    // Initialize dashboard
    initializeStudentDashboard();
    
    // Navigation handling
    setupNavigation();
    
    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Mobile menu toggle
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
});

// Check if user is authenticated as student
function checkStudentAuth() {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = '../index.html';
            return;
        }
        
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'student') {
            window.location.href = '../index.html';
            return;
        }
        
        // Load user data
        loadStudentData(user);
    });
}

// Initialize dashboard with overview
function initializeStudentDashboard() {
    loadPage('overview');
    loadNotifications();
    startNotificationListener();
}

// Navigation Setup
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Load corresponding page
            const page = this.getAttribute('data-page');
            loadPage(page);
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });
    });
}

// Load page content dynamically
async function loadPage(page) {
    const contentArea = document.getElementById('contentArea');
    
    // Show loading animation
    contentArea.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading ${page}...</p>
        </div>
    `;
    
    try {
        switch(page) {
            case 'overview':
                await loadOverviewPage(contentArea);
                break;
            case 'courses':
                await loadCoursesPage(contentArea);
                break;
            case 'registration':
                await loadRegistrationPage(contentArea);
                break;
            case 'timetable':
                await loadTimetablePage(contentArea);
                break;
            case 'assignments':
                await loadAssignmentsPage(contentArea);
                break;
            case 'grades':
                await loadGradesPage(contentArea);
                break;
            case 'fees':
                await loadFeesPage(contentArea);
                break;
            case 'announcements':
                await loadAnnouncementsPage(contentArea);
                break;
            default:
                contentArea.innerHTML = '<h2>Page not found</h2>';
        }
    } catch (error) {
        console.error('Error loading page:', error);
        contentArea.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading page</h3>
                <p>Please try again or contact support.</p>
                <button onclick="location.reload()" class="btn btn-primary">Retry</button>
            </div>
        `;
    }
}

// ===================== OVERVIEW PAGE =====================
async function loadOverviewPage(container) {
    const userId = localStorage.getItem('userId');
    
    // Get student data
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    // Get enrolled courses count
    const enrollmentsSnapshot = await db.collection('enrollments')
        .where('studentId', '==', userId)
        .get();
    
    // Get pending assignments
    const assignmentsSnapshot = await db.collection('assignments')
        .where('studentId', '==', userId)
        .where('status', '==', 'pending')
        .get();
    
    // Get unread announcements
    const announcementsSnapshot = await db.collection('announcements')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();
    
    container.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Welcome back, ${userData.fullName}!</h1>
                <p class="text-muted">Here's your academic overview</p>
            </div>
            <div class="academic-info">
                <span class="badge badge-primary">${userData.department}</span>
                <span class="badge badge-success">Level ${userData.level}</span>
            </div>
        </div>
        
        <!-- Stats Cards -->
        <div class="stats-grid">
            <div class="stat-card blue animate__animated animate__fadeInUp">
                <i class="fas fa-book-open"></i>
                <div class="stat-value">${enrollmentsSnapshot.size}</div>
                <div class="stat-label">Enrolled Courses</div>
                <div class="stat-trend positive">
                    <i class="fas fa-arrow-up"></i> Current Semester
                </div>
            </div>
            
            <div class="stat-card orange animate__animated animate__fadeInUp">
                <i class="fas fa-clock"></i>
                <div class="stat-value">${assignmentsSnapshot.size}</div>
                <div class="stat-label">Pending Assignments</div>
                <div class="stat-trend warning">
                    <i class="fas fa-exclamation-circle"></i> Due soon
                </div>
            </div>
            
            <div class="stat-card green animate__animated animate__fadeInUp">
                <i class="fas fa-chart-line"></i>
                <div class="stat-value">${userData.gpa || '3.5'}</div>
                <div class="stat-label">Current GPA</div>
                <div class="stat-trend positive">
                    <i class="fas fa-arrow-up"></i> Good standing
                </div>
            </div>
            
            <div class="stat-card purple animate__animated animate__fadeInUp">
                <i class="fas fa-calendar-check"></i>
                <div class="stat-value">85%</div>
                <div class="stat-label">Attendance</div>
                <div class="stat-trend neutral">
                    <i class="fas fa-minus"></i> Average
                </div>
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="section">
            <h2>Quick Actions</h2>
            <div class="quick-actions-grid">
                <div class="quick-action-card" onclick="loadPage('registration')">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>Course Registration</h3>
                    <p>Register for new courses</p>
                </div>
                <div class="quick-action-card" onclick="loadPage('timetable')">
                    <i class="fas fa-calendar-alt"></i>
                    <h3>View Timetable</h3>
                    <p>Check your class schedule</p>
                </div>
                <div class="quick-action-card" onclick="loadPage('assignments')">
                    <i class="fas fa-tasks"></i>
                    <h3>Submit Assignment</h3>
                    <p>Submit pending work</p>
                </div>
                <div class="quick-action-card" onclick="loadPage('fees')">
                    <i class="fas fa-receipt"></i>
                    <h3>Pay Fees</h3>
                    <p>View and pay tuition</p>
                </div>
            </div>
        </div>
        
        <!-- Recent Announcements -->
        <div class="section">
            <h2>Recent Announcements</h2>
            <div class="announcements-list">
                ${announcementsSnapshot.empty ? 
                    '<p class="text-muted">No announcements</p>' :
                    announcementsSnapshot.docs.map(doc => {
                        const data = doc.data();
                        return `
                            <div class="announcement-item">
                                <div class="announcement-icon">
                                    <i class="fas fa-bullhorn"></i>
                                </div>
                                <div class="announcement-content">
                                    <h4>${data.title}</h4>
                                    <p>${data.message.substring(0, 100)}...</p>
                                    <span class="announcement-date">
                                        <i class="fas fa-clock"></i>
                                        ${formatDate(data.createdAt)}
                                    </span>
                                </div>
                            </div>
                        `;
                    }).join('')
                }
            </div>
        </div>
        
        <!-- Upcoming Deadlines -->
        <div class="section">
            <h2>Upcoming Deadlines</h2>
            <div class="deadlines-list">
                <div class="deadline-item">
                    <div class="deadline-date">
                        <span class="day">15</span>
                        <span class="month">MAR</span>
                    </div>
                    <div class="deadline-info">
                        <h4>Mathematics Assignment 3</h4>
                        <p>CS301 - Dr. Smith</p>
                    </div>
                    <span class="deadline-status urgent">2 days left</span>
                </div>
                <div class="deadline-item">
                    <div class="deadline-date">
                        <span class="day">20</span>
                        <span class="month">MAR</span>
                    </div>
                    <div class="deadline-info">
                        <h4>Fee Payment Deadline</h4>
                        <p>Second Installment</p>
                    </div>
                    <span class="deadline-status warning">1 week left</span>
                </div>
            </div>
        </div>
    `;
}

// ===================== MY COURSES PAGE =====================
async function loadCoursesPage(container) {
    const userId = localStorage.getItem('userId');
    
    try {
        // Try multiple field name variations
        let enrollmentsSnapshot = null;
        
        try {
            enrollmentsSnapshot = await db.collection('enrollments')
                .where('studentId', '==', userId)
                .get();
        } catch (e) {
            console.log('Trying alternate field names for enrollments...');
            try {
                enrollmentsSnapshot = await db.collection('enrollments')
                    .where('student_id', '==', userId)
                    .get();
            } catch (e2) {
                enrollmentsSnapshot = await db.collection('enrollments').get();
            }
        }
        
        // Get enrolled course IDs
        const enrollments = enrollmentsSnapshot.docs
            .map(doc => doc.data())
            .filter(e => e.studentId === userId || e.student_id === userId || e.studentUid === userId);
        
        const courseIds = enrollments.map(e => e.courseId || e.course_id || e.courseID);
        
        // Get course details
        let courses = [];
        if (courseIds.length > 0) {
            const coursesSnapshot = await db.collection('courses').get();
            courses = coursesSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(c => courseIds.includes(c.id));
        }
        
        container.innerHTML = `
            <div class="page-header">
                <h1>My Courses</h1>
                <p class="text-muted">Currently enrolled in ${courses.length} course(s)</p>
            </div>
            
            <!-- Courses Grid -->
            <div class="courses-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
                ${courses.length > 0 ? courses.map(course => `
                    <div class="course-card" style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                            <span style="background: #007bff; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                                ${course.code || 'N/A'}
                            </span>
                            <span style="color: #28a745; font-weight: bold;">${course.credits || 3} Credits</span>
                        </div>
                        <h3 style="margin: 10px 0; font-size: 18px;">${course.name || 'Untitled Course'}</h3>
                        <p style="color: #666; margin-bottom: 12px; font-size: 14px;">${course.description || 'No description available'}</p>
                        <div style="border-top: 1px solid #eee; padding-top: 12px;">
                            <p style="margin: 8px 0; font-size: 13px;"><strong>Lecturer:</strong> ${course.lecturer || course.lecturerName || 'TBA'}</p>
                            <p style="margin: 8px 0; font-size: 13px;"><strong>Schedule:</strong> ${course.schedule || 'TBA'}</p>
                            <p style="margin: 8px 0; font-size: 13px;"><strong>Venue:</strong> ${course.venue || 'TBA'}</p>
                        </div>
                        <button class="btn btn-outline" style="width: 100%; margin-top: 12px;" onclick="viewCourseDetails('${course.id}', '${course.code}')">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                    </div>
                `).join('') : `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                        <p style="color: #999; font-size: 16px;">No courses enrolled yet.</p>
                        <p style="color: #999; margin-top: 10px;">Register for courses to get started.</p>
                        <button class="btn btn-primary" style="margin-top: 20px;" onclick="loadPage('registration')">
                            Browse & Register Courses
                        </button>
                    </div>
                `}
            </div>
        `;
    } catch (error) {
        console.error('Error loading courses:', error);
        container.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading courses</h3>
                <p>${error.message || 'Please try again later.'}</p>
                <button onclick="loadPage('courses')" class="btn btn-primary">Retry</button>
            </div>
        `;
    }
}

// ===================== COURSE REGISTRATION PAGE =====================
async function loadRegistrationPage(container) {
    // Get available courses
    const coursesSnapshot = await db.collection('courses')
        .where('semester', '==', '2024-Spring')
        .get();
    
    // Get student's current enrollments
    const userId = localStorage.getItem('userId');
    const enrollmentsSnapshot = await db.collection('enrollments')
        .where('studentId', '==', userId)
        .get();
    
    const enrolledCourseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
    
    container.innerHTML = `
        <div class="page-header">
            <h1>Course Registration</h1>
            <p class="text-muted">Semester: Spring 2024</p>
        </div>
        
        <!-- Registration Summary -->
        <div class="registration-summary">
            <div class="summary-card">
                <i class="fas fa-book"></i>
                <div>
                    <h3>${enrolledCourseIds.length} Courses Enrolled</h3>
                    <p>Maximum allowed: 6 courses</p>
                </div>
            </div>
            <div class="summary-card">
                <i class="fas fa-clock"></i>
                <div>
                    <h3>18 Credit Hours</h3>
                    <p>Maximum allowed: 21 credits</p>
                </div>
            </div>
        </div>
        
        <!-- Available Courses -->
        <div class="section">
            <div class="section-header">
                <h2>Available Courses</h2>
                <div class="filter-controls">
                    <select id="departmentFilter" class="form-select">
                        <option value="">All Departments</option>
                        <option value="CS">Computer Science</option>
                        <option value="MATH">Mathematics</option>
                        <option value="PHY">Physics</option>
                    </select>
                    <input type="text" id="searchCourse" placeholder="Search courses..." class="form-input">
                </div>
            </div>
            
            <div class="courses-grid" id="coursesGrid">
                ${coursesSnapshot.docs.map(doc => {
                    const course = doc.data();
                    const isEnrolled = enrolledCourseIds.includes(doc.id);
                    return `
                        <div class="course-card ${isEnrolled ? 'enrolled' : ''}" data-department="${course.department}">
                            <div class="course-header">
                                <span class="course-code">${course.code}</span>
                                <span class="course-credits">${course.credits} Credits</span>
                            </div>
                            <h3>${course.name}</h3>
                            <p class="course-description">${course.description}</p>
                            <div class="course-details">
                                <span><i class="fas fa-user"></i> ${course.lecturer}</span>
                                <span><i class="fas fa-clock"></i> ${course.schedule}</span>
                                <span><i class="fas fa-door-open"></i> ${course.venue}</span>
                            </div>
                            <div class="course-footer">
                                <span class="seats-available">
                                    <i class="fas fa-users"></i>
                                    ${course.seats - course.enrolled} seats left
                                </span>
                                <button class="btn ${isEnrolled ? 'btn-danger' : 'btn-primary'} register-btn"
                                        data-course-id="${doc.id}"
                                        ${course.seats <= course.enrolled && !isEnrolled ? 'disabled' : ''}>
                                    ${isEnrolled ? 'Drop Course' : 'Register'}
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    // Add event listeners for registration buttons
    setupRegistrationListeners();
    setupCourseFilters();
}

// Setup course registration/dropping
function setupRegistrationListeners() {
    document.querySelectorAll('.register-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const courseId = this.getAttribute('data-course-id');
            const isEnrolled = this.textContent.trim() === 'Drop Course';
            
            try {
                if (isEnrolled) {
                    await dropCourse(courseId);
                } else {
                    await registerCourse(courseId);
                }
            } catch (error) {
                showNotification('Error processing request', 'error');
            }
        });
    });
}

// Register for a course
async function registerCourse(courseId) {
    const userId = localStorage.getItem('userId');
    
    // Check prerequisites (you can add logic here)
    // Check time conflicts (you can add logic here)
    
    // Create enrollment record
    await db.collection('enrollments').add({
        studentId: userId,
        courseId: courseId,
        enrolledAt: firebase.firestore.FieldValue.serverTimestamp(),
        semester: '2024-Spring',
        status: 'active'
    });
    
    // Update course enrollment count
    await db.collection('courses').doc(courseId).update({
        enrolled: firebase.firestore.FieldValue.increment(1)
    });
    
    showNotification('Successfully registered for course!', 'success');
    setTimeout(() => loadPage('registration'), 1000);
}

// Drop a course
async function dropCourse(courseId) {
    const userId = localStorage.getItem('userId');
    
    // Find and delete enrollment
    const enrollmentQuery = await db.collection('enrollments')
        .where('studentId', '==', userId)
        .where('courseId', '==', courseId)
        .get();
    
    if (!enrollmentQuery.empty) {
        await enrollmentQuery.docs[0].ref.delete();
        
        // Update course enrollment count
        await db.collection('courses').doc(courseId).update({
            enrolled: firebase.firestore.FieldValue.increment(-1)
        });
        
        showNotification('Course dropped successfully', 'success');
        setTimeout(() => loadPage('registration'), 1000);
    }
}

// Course filtering
function setupCourseFilters() {
    const departmentFilter = document.getElementById('departmentFilter');
    const searchInput = document.getElementById('searchCourse');
    
    function filterCourses() {
        const department = departmentFilter.value;
        const searchTerm = searchInput.value.toLowerCase();
        
        document.querySelectorAll('.course-card').forEach(card => {
            const cardDepartment = card.getAttribute('data-department');
            const cardText = card.textContent.toLowerCase();
            
            const matchesDepartment = !department || cardDepartment === department;
            const matchesSearch = !searchTerm || cardText.includes(searchTerm);
            
            card.style.display = matchesDepartment && matchesSearch ? 'block' : 'none';
        });
    }
    
    departmentFilter.addEventListener('change', filterCourses);
    searchInput.addEventListener('input', filterCourses);
}

// ===================== TIMETABLE PAGE =====================
async function loadTimetablePage(container) {
    const userId = localStorage.getItem('userId');
    
    // Get student's enrolled courses
    const enrollmentsSnapshot = await db.collection('enrollments')
        .where('studentId', '==', userId)
        .get();
    
    // Get course details for timetable
    const timetableData = {
        'Monday': [],
        'Tuesday': [],
        'Wednesday': [],
        'Thursday': [],
        'Friday': []
    };
    
    for (const enrollmentDoc of enrollmentsSnapshot.docs) {
        const courseDoc = await db.collection('courses')
            .doc(enrollmentDoc.data().courseId)
            .get();
        
        if (courseDoc.exists) {
            const course = courseDoc.data();
            // Parse schedule (formats: "Mon 8:00-10:00", "Mon 8:00 - 10:00", "Mon 8:00-10:00, Wed 10:00-12:00")
            const schedules = course.schedule.split(',').map(s => s.trim()).filter(Boolean);
            schedules.forEach(schedule => {
                const match = schedule.match(/^(Mon|Tue|Wed|Thu|Fri)\s+([0-9]{1,2}:[0-9]{2}\s*-\s*[0-9]{1,2}:[0-9]{2})$/i);
                if (!match) return;
                const dayMap = {
                    'Mon': 'Monday',
                    'Tue': 'Tuesday',
                    'Wed': 'Wednesday',
                    'Thu': 'Thursday',
                    'Fri': 'Friday'
                };
                const fullDay = dayMap[match[1]];
                const time = match[2].replace(/ /g, '');
                if (fullDay) {
                    timetableData[fullDay].push({
                        code: course.code,
                        name: course.name,
                        time: time,
                        venue: course.venue,
                        lecturer: course.lecturer
                    });
                }
            });
        }
    }
    
    container.innerHTML = `
        <div class="page-header">
            <h1>My Timetable</h1>
            <div class="timetable-controls">
                <button class="btn btn-outline" onclick="exportTimetable()">
                    <i class="fas fa-download"></i> Export PDF
                </button>
                <button class="btn btn-outline" onclick="window.print()">
                    <i class="fas fa-print"></i> Print
                </button>
            </div>
        </div>
        
        <div class="timetable-container">
            <table class="timetable">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Monday</th>
                        <th>Tuesday</th>
                        <th>Wednesday</th>
                        <th>Thursday</th>
                        <th>Friday</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateTimetableRows()}
                </tbody>
            </table>
        </div>
        
        <!-- Course Details Cards -->
        <div class="section mt-4">
            <h2>Course Details</h2>
            <div class="course-details-grid">
                ${Object.values(timetableData).flat().map(course => `
                    <div class="course-detail-card">
                        <div class="course-color ${getCourseColor(course.code)}"></div>
                        <div class="course-info">
                            <h4>${course.code} - ${course.name}</h4>
                            <p><i class="fas fa-clock"></i> ${course.time}</p>
                            <p><i class="fas fa-door-open"></i> ${course.venue}</p>
                            <p><i class="fas fa-user"></i> ${course.lecturer}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    renderTimetable(timetableData);
}

function generateTimetableRows() {
    const timeSlots = [
        '8:00 - 9:00',
        '9:00 - 10:00',
        '10:00 - 11:00',
        '11:00 - 12:00',
        '12:00 - 13:00',
        '13:00 - 14:00',
        '14:00 - 15:00',
        '15:00 - 16:00',
        '16:00 - 17:00'
    ];
    
    let rows = '';
    timeSlots.forEach(slot => {
        rows += `
            <tr>
                <td class="time-slot">${slot}</td>
                <td class="timetable-cell" data-day="monday" data-time="${slot}"></td>
                <td class="timetable-cell" data-day="tuesday" data-time="${slot}"></td>
                <td class="timetable-cell" data-day="wednesday" data-time="${slot}"></td>
                <td class="timetable-cell" data-day="thursday" data-time="${slot}"></td>
                <td class="timetable-cell" data-day="friday" data-time="${slot}"></td>
            </tr>
        `;
    });
    return rows;
}

function renderTimetable(timetableData) {
    Object.keys(timetableData).forEach(day => {
        timetableData[day].forEach(entry => {
            const timeRanges = parseTimeRange(entry.time);
            const timeCells = document.querySelectorAll(
                `.timetable-cell[data-day="${day.toLowerCase()}"]`
            );

            timeCells.forEach(cell => {
                const slot = cell.getAttribute('data-time');
                if (timeRanges.includes(slot)) {
                    cell.innerHTML = `
                        <div class="timetable-entry">
                            <strong>${entry.code}</strong>
                            <span>${entry.name}</span>
                            <span>${entry.time}</span>
                            <span>${entry.venue}</span>
                        </div>
                    `;
                    cell.classList.add('timetable-filled');
                }
            });
        });
    });
}

function parseTimeRange(timeRange) {
    const allSlots = [
        '8:00 - 9:00',
        '9:00 - 10:00',
        '10:00 - 11:00',
        '11:00 - 12:00',
        '12:00 - 13:00',
        '13:00 - 14:00',
        '14:00 - 15:00',
        '15:00 - 16:00',
        '16:00 - 17:00'
    ];

    const [start, end] = timeRange.split('-').map(value => value.trim());
    if (!start || !end) return [];

    return allSlots.filter(slot => {
        const [slotStart, slotEnd] = slot.split(' - ').map(v => v.trim());
        return slotStart >= start && slotEnd <= end;
    });
}

function getCourseColor(courseCode) {
    const colors = ['blue', 'green', 'orange', 'purple', 'teal', 'red'];
    const index = courseCode
        .split('')
        .reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
}

function exportTimetable() {
    const printWindow = window.open('', '_blank');
    const timetableHtml = document.querySelector('.timetable-container')?.outerHTML || '<p>No timetable available</p>';

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>My Timetable</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ccc; padding: 10px; vertical-align: top; }
                th { background: #f7f7f7; }
                .timetable-entry { margin-bottom: 0.5rem; }
                .timetable-entry strong { display: block; margin-bottom: 0.25rem; }
            </style>
        </head>
        <body>
            <h1>My Timetable</h1>
            ${timetableHtml}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ===================== ASSIGNMENTS PAGE =====================
async function loadAssignmentsPage(container) {
    const userId = localStorage.getItem('userId');
    
    try {
        // Try multiple field name variations for studentId
        let assignmentsSnapshot = null;
        
        try {
            assignmentsSnapshot = await db.collection('assignments')
                .where('studentId', '==', userId)
                .orderBy('dueDate', 'asc')
                .get();
        } catch (e) {
            console.log('Trying alternate field names for assignments...');
            try {
                assignmentsSnapshot = await db.collection('assignments')
                    .where('student_id', '==', userId)
                    .orderBy('dueDate', 'asc')
                    .get();
            } catch (e2) {
                assignmentsSnapshot = await db.collection('assignments').get();
            }
        }

        const assignments = assignmentsSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(a => a.studentId === userId || a.student_id === userId || a.studentUid === userId)
            .sort((a, b) => {
                const dateA = a.dueDate?.toDate ? a.dueDate.toDate() : new Date(a.dueDate || 0);
                const dateB = b.dueDate?.toDate ? b.dueDate.toDate() : new Date(b.dueDate || 0);
                return dateA - dateB;
            });

    const pendingCount = assignments.filter(a => a.status === 'pending').length;
    const submittedCount = assignments.filter(a => a.status === 'submitted').length;
    const gradedCount = assignments.filter(a => a.status === 'graded').length;
    
    container.innerHTML = `
        <div class="page-header">
            <h1>Assignments</h1>
            <div class="assignment-stats">
                <div class="stat-badge">
                    <span class="count">${pendingCount}</span>
                    <span class="label">Pending</span>
                </div>
                <div class="stat-badge submitted">
                    <span class="count">${submittedCount}</span>
                    <span class="label">Submitted</span>
                </div>
                <div class="stat-badge graded">
                    <span class="count">${gradedCount}</span>
                    <span class="label">Graded</span>
                </div>
            </div>
        </div>
        
        <!-- Assignment Submission Modal -->
        <div class="modal" id="submissionModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Submit Assignment</h3>
                    <button class="close-modal" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="submissionForm">
                        <input type="hidden" id="assignmentId">
                        <div class="form-group">
                            <label>Assignment Title</label>
                            <input type="text" id="submissionTitle" readonly class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Upload File</label>
                            <div class="file-upload">
                                <input type="file" id="assignmentFile" accept=".pdf,.doc,.docx,.zip">
                                <div class="file-upload-area">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <p>Drag & drop or click to upload</p>
                                    <span class="file-info" id="fileInfo"></span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Comments (Optional)</label>
                            <textarea id="submissionComments" rows="3" class="form-input"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fas fa-paper-plane"></i> Submit Assignment
                        </button>
                    </form>
                </div>
            </div>
        </div>
        
        <!-- Assignments List -->
        <div class="assignments-container">
            <div class="assignments-tabs">
                <button class="tab active" data-tab="all">All</button>
                <button class="tab" data-tab="pending">Pending</button>
                <button class="tab" data-tab="submitted">Submitted</button>
                <button class="tab" data-tab="graded">Graded</button>
            </div>
            
            <div class="assignments-list" id="assignmentsList">
                ${assignments.length > 0 ? assignments.map(assignment => {
                    const deadlineDate = assignment.dueDate?.toDate ? assignment.dueDate.toDate() : assignment.dueDate ? new Date(assignment.dueDate) : null;
                    const now = new Date();
                    const daysLeft = deadlineDate && !Number.isNaN(deadlineDate.getTime())
                        ? Math.max(0, Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24)))
                        : 'N/A';
                    const status = assignment.status || 'pending';
                    const safeTitle = escapeHtmlAttribute(assignment.title || 'Untitled Assignment');
                    const safeDescription = escapeHtmlAttribute(assignment.description || 'No description provided.');
                    const courseLabel = escapeHtmlAttribute(assignment.courseCode || 'N/A');
                    
                    return `
                        <div class="assignment-card" data-status="${status}">
                            <div class="assignment-header">
                                <div>
                                    <h3>${escapeHtml(assignment.title || 'Untitled Assignment')}</h3>
                                    <span class="course-badge">${courseLabel}</span>
                                </div>
                                <div class="assignment-status">
                                    <span class="status-badge status-${status}">
                                        ${status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <p class="assignment-description">${safeDescription}</p>
                            <div class="assignment-meta">
                                <span><i class="fas fa-calendar"></i> Due: ${formatDate(deadlineDate)}</span>
                                <span><i class="fas fa-clock"></i> ${daysLeft} days left</span>
                                ${assignment.grade ? `<span><i class="fas fa-star"></i> Grade: ${escapeHtml(assignment.grade)}/100</span>` : ''}
                            </div>
                            <div class="assignment-actions">
                                ${status === 'pending' ? `
                                    <button class="btn btn-primary submit-btn" 
                                            onclick="openSubmissionModal('${assignment.id}', '${safeTitle}')">
                                        <i class="fas fa-upload"></i> Submit
                                    </button>
                                ` : ''}
                                ${status === 'graded' ? `
                                    <button class="btn btn-outline" onclick="viewFeedback('${assignment.id}')">
                                        <i class="fas fa-comment"></i> View Feedback
                                    </button>
                                ` : ''}
                                <button class="btn btn-outline" onclick="viewAssignmentDetails('${assignment.id}')">
                                    <i class="fas fa-eye"></i> Details
                                </button>
                            </div>
                        </div>
                    `;
                }).join('') : '<p class="text-muted">No assignments available at the moment.</p>'}
            </div>
        </div>
    `;
    
    // Setup assignment tabs
    setupAssignmentTabs();
    setupSubmissionForm();
    } catch (error) {
        console.error('Error loading assignments:', error);
        container.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading assignments</h3>
                <p>${error.message || 'Please try again later.'}</p>
                <button onclick="loadPage('assignments')" class="btn btn-primary">Retry</button>
            </div>
        `;
    }
}

// Open submission modal
function openSubmissionModal(assignmentId, title) {
    document.getElementById('assignmentId').value = assignmentId;
    document.getElementById('submissionTitle').value = title;
    document.getElementById('submissionModal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('submissionModal').style.display = 'none';
}

// Setup submission form
function setupSubmissionForm() {
    document.getElementById('submissionForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const assignmentId = document.getElementById('assignmentId').value;
        const file = document.getElementById('assignmentFile').files[0];
        const comments = document.getElementById('submissionComments').value;
        
        if (!file) {
            showNotification('Please select a file', 'error');
            return;
        }
        
        try {
            // Upload file to Firebase Storage (you'll need to set this up)
            // For now, we'll update the assignment status
            await db.collection('assignments').doc(assignmentId).update({
                status: 'submitted',
                submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
                submissionFile: file.name,
                submissionComments: comments
            });
            
            closeModal();
            showNotification('Assignment submitted successfully!', 'success');
            setTimeout(() => loadPage('assignments'), 1000);
        } catch (error) {
            showNotification('Error submitting assignment', 'error');
        }
    });
}

// Assignment tabs
function setupAssignmentTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-tab');
            document.querySelectorAll('.assignment-card').forEach(card => {
                if (filter === 'all' || card.getAttribute('data-status') === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

async function viewFeedback(assignmentId) {
    try {
        const assignmentDoc = await db.collection('assignments').doc(assignmentId).get();
        if (!assignmentDoc.exists) {
            showNotification('Assignment details not found', 'error');
            return;
        }

        const assignment = assignmentDoc.data();
        const message = assignment.feedback || 'No feedback has been provided yet.';
        alert(`Feedback for ${assignment.title || 'Assignment'}:\n\n${message}`);
    } catch (error) {
        showNotification('Unable to load feedback', 'error');
        console.error('viewFeedback error:', error);
    }
}

async function viewAssignmentDetails(assignmentId) {
    try {
        const assignmentDoc = await db.collection('assignments').doc(assignmentId).get();
        if (!assignmentDoc.exists) {
            showNotification('Assignment not found', 'error');
            return;
        }

        const assignment = assignmentDoc.data();
        const details = [
            `Title: ${assignment.title}`,
            `Course: ${assignment.courseCode}`,
            `Due Date: ${formatDate(assignment.dueDate?.toDate())}`,
            `Status: ${assignment.status}`,
            `Description: ${assignment.description}`,
            assignment.grade ? `Grade: ${assignment.grade}/100` : null,
            assignment.submissionComments ? `Comments: ${assignment.submissionComments}` : null
        ].filter(Boolean).join('\n');

        alert(`Assignment Details:\n\n${details}`);
    } catch (error) {
        showNotification('Unable to load assignment details', 'error');
        console.error('viewAssignmentDetails error:', error);
    }
}

// ===================== GRADES PAGE =====================
async function loadGradesPage(container) {
    const userId = localStorage.getItem('userId');
    
    // Get student's grades
    const gradesSnapshot = await db.collection('grades')
        .where('studentId', '==', userId)
        .get();
    
    const grades = gradesSnapshot.docs.map(doc => doc.data());
    
    // Calculate GPA
    const gpa = calculateGPA(grades);
    
    container.innerHTML = `
        <div class="page-header">
            <h1>My Grades</h1>
            <button class="btn btn-primary" onclick="exportGradesPDF()">
                <i class="fas fa-file-pdf"></i> Download PDF Grade Sheet
            </button>
        </div>
        
        <!-- GPA Summary -->
        <div class="gpa-summary">
            <div class="gpa-card">
                <div class="gpa-circle">
                    <svg class="progress-ring" width="120" height="120">
                        <circle class="progress-ring-bg" cx="60" cy="60" r="52" />
                        <circle class="progress-ring-fill" cx="60" cy="60" r="52" 
                                style="stroke-dasharray: ${gpa * 80} 327" />
                    </svg>
                    <div class="gpa-value">${gpa.toFixed(2)}</div>
                </div>
                <h3>Current GPA</h3>
                <p>Scale: 4.0</p>
            </div>
            <div class="gpa-details">
                <div class="gpa-detail-item">
                    <span>Total Credits</span>
                    <strong>${grades.reduce((sum, g) => sum + (g.credits || 3), 0)}</strong>
                </div>
                <div class="gpa-detail-item">
                    <span>Courses Taken</span>
                    <strong>${grades.length}</strong>
                </div>
                <div class="gpa-detail-item">
                    <span>Academic Standing</span>
                    <strong class="text-success">Good</strong>
                </div>
            </div>
        </div>
        
        <!-- Grades Table -->
        <div class="section">
            <h2>Semester Grades</h2>
            <div class="semester-selector">
                <select class="form-select" id="semesterSelect">
                    <option value="2024-Spring">Spring 2024</option>
                    <option value="2023-Fall">Fall 2023</option>
                    <option value="2023-Spring">Spring 2023</option>
                </select>
            </div>
            
            <div class="table-responsive">
                <table class="data-table grades-table">
                    <thead>
                        <tr>
                            <th>Course Code</th>
                            <th>Course Name</th>
                            <th>Credits</th>
                            <th>CA Score (40%)</th>
                            <th>Exam Score (60%)</th>
                            <th>Total (100%)</th>
                            <th>Grade</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${grades.map(grade => `
                            <tr>
                                <td><strong>${grade.courseCode}</strong></td>
                                <td>${grade.courseName}</td>
                                <td>${grade.credits}</td>
                                <td>${grade.caScore}</td>
                                <td>${grade.examScore}</td>
                                <td><strong>${grade.total}</strong></td>
                                <td>
                                    <span class="grade-badge grade-${grade.grade.toLowerCase()}">
                                        ${grade.grade}
                                    </span>
                                </td>
                                <td>${getGradeRemark(grade.grade)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="2"><strong>Semester GPA</strong></td>
                            <td colspan="6"><strong>${gpa.toFixed(2)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
        
        <!-- Grade Distribution Chart -->
        <div class="section">
            <h2>Grade Distribution</h2>
            <div class="chart-container">
                <canvas id="gradeChart"></canvas>
            </div>
        </div>
    `;
    
    // Draw grade chart
    setTimeout(() => drawGradeChart(grades), 100);
}

// Calculate GPA
function calculateGPA(grades) {
    if (grades.length === 0) return 0;
    
    const gradePoints = {
        'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0,
        'F': 0.0
    };
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    grades.forEach(grade => {
        const credits = grade.credits || 3;
        totalPoints += (gradePoints[grade.grade] || 0) * credits;
        totalCredits += credits;
    });
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

// Get grade remark
function getGradeRemark(grade) {
    const remarks = {
        'A': 'Excellent',
        'A-': 'Very Good',
        'B+': 'Good',
        'B': 'Satisfactory',
        'B-': 'Above Average',
        'C+': 'Average',
        'C': 'Below Average',
        'D': 'Poor',
        'F': 'Fail'
    };
    return remarks[grade] || '';
}

// Export grades as PDF
function exportGradesPDF() {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Generate PDF content
    const content = document.querySelector('.grades-table').outerHTML;
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Grade Sheet</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .header { text-align: center; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>University Grade Sheet</h1>
                <p>Student: ${localStorage.getItem('userName')}</p>
                <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
            ${content}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Draw grade distribution chart
function drawGradeChart(grades) {
    const ctx = document.getElementById('gradeChart')?.getContext('2d');
    if (!ctx) return;
    
    const gradeCount = {};
    grades.forEach(g => {
        gradeCount[g.grade] = (gradeCount[g.grade] || 0) + 1;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(gradeCount),
            datasets: [{
                label: 'Number of Courses',
                data: Object.values(gradeCount),
                backgroundColor: [
                    '#27ae60', '#2ecc71', '#f1c40f', 
                    '#e67e22', '#e74c3c'
                ]
            }]
        }
    });
}

// ===================== FEES PAGE =====================
async function loadFeesPage(container) {
    const userId = localStorage.getItem('userId');
    
    try {
        // Try multiple field name variations for studentId
        let paymentsSnapshot = null;
        
        try {
            paymentsSnapshot = await db.collection('payments')
                .where('studentId', '==', userId)
                .orderBy('paidAt', 'desc')
                .get();
        } catch (e) {
            console.log('Trying alternate field names for payments...');
            try {
                paymentsSnapshot = await db.collection('payments')
                    .where('student_id', '==', userId)
                    .orderBy('paidAt', 'desc')
                    .get();
            } catch (e2) {
                paymentsSnapshot = await db.collection('payments').get();
            }
        }
        
        const payments = paymentsSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(p => p.studentId === userId || p.student_id === userId || p.studentUid === userId)
            .sort((a, b) => {
                const dateA = a.paidAt?.toDate ? a.paidAt.toDate() : new Date(a.paidAt || 0);
                const dateB = b.paidAt?.toDate ? b.paidAt.toDate() : new Date(b.paidAt || 0);
                return dateB - dateA;
            });
    
    // Calculate totals
    const totalPaid = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
    
    const totalPending = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);
    
    container.innerHTML = `
        <div class="page-header">
            <h1>Fee Payment</h1>
            <p class="text-muted">Track your tuition and other fees</p>
        </div>
        
        <!-- Payment Summary Cards -->
        <div class="stats-grid">
            <div class="stat-card blue">
                <i class="fas fa-check-circle"></i>
                <div class="stat-value">${formatCurrency(totalPaid)}</div>
                <div class="stat-label">Total Paid</div>
            </div>
            <div class="stat-card orange">
                <i class="fas fa-clock"></i>
                <div class="stat-value">${formatCurrency(totalPending)}</div>
                <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card green">
                <i class="fas fa-calendar-check"></i>
                <div class="stat-value">${getNextPayment(payments)}</div>
                <div class="stat-label">Next Payment Due</div>
            </div>
        </div>
        
        <!-- Payment Breakdown -->
        <div class="section">
            <h2>Fee Structure - ${getCurrentSemester()}</h2>
            <div class="fee-breakdown">
                <div class="fee-item">
                    <div class="fee-info">
                        <h4>Tuition Fee</h4>
                        <p>Full semester tuition</p>
                    </div>
                    <div class="fee-amount">
                        <span class="amount">50,000 FCFA</span>
                        <span class="status-badge status-completed">Paid</span>
                    </div>
                </div>
                <div class="fee-item">
                    <div class="fee-info">
                        <h4>Registration Fee</h4>
                        <p>Annual registration</p>
                    </div>
                    <div class="fee-amount">
                        <span class="amount">10,000 FCFA</span>
                        <span class="status-badge status-completed">Paid</span>
                    </div>
                </div>
                <div class="fee-item">
                    <div class="fee-info">
                        <h4>Library Fee</h4>
                        <p>Library access fee</p>
                    </div>
                    <div class="fee-amount">
                        <span class="amount">5,000 FCFA</span>
                        <span class="status-badge status-pending">Pending</span>
                    </div>
                </div>
                <div class="fee-item">
                    <div class="fee-info">
                        <h4>Technology Fee</h4>
                        <p>IT infrastructure</p>
                    </div>
                    <div class="fee-amount">
                        <span class="amount">3,000 FCFA</span>
                        <span class="status-badge status-pending">Pending</span>
                    </div>
                </div>
            </div>
            <div class="fee-total">
                <span>Total Due: <strong>68,000 FCFA</strong></span>
                <span>Paid: <strong>60,000 FCFA</strong></span>
                <span>Balance: <strong class="text-warning">8,000 FCFA</strong></span>
            </div>
        </div>
        
        <!-- Payment History -->
        <div class="section">
            <h2>Payment History</h2>
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Receipt</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.length > 0 ? payments.map(payment => `
                            <tr>
                                <td>${formatDate(payment.paidAt?.toDate())}</td>
                                <td>${payment.description}</td>
                                <td>${formatCurrency(payment.amount)}</td>
                                <td>${payment.method || 'Bank Transfer'}</td>
                                <td>
                                    <span class="status-badge status-${payment.status}">
                                        ${payment.status.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    ${payment.status === 'completed' ? 
                                        `<button class="btn btn-sm btn-outline" onclick="downloadReceipt('${payment.id}')">
                                            <i class="fas fa-download"></i> PDF
                                        </button>` : 
                                        '<span class="text-muted">N/A</span>'
                                    }
                                </td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="6" style="text-align: center;">No payment history found</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Payment Instructions -->
        <div class="section">
            <h2>How to Pay</h2>
            <div class="payment-methods">
                <div class="payment-method-card">
                    <i class="fas fa-university"></i>
                    <h4>Bank Transfer</h4>
                    <p>Account: 1234567890</p>
                    <p>Bank: UBA Cameroon</p>
                </div>
                <div class="payment-method-card">
                    <i class="fas fa-mobile-alt"></i>
                    <h4>Mobile Money</h4>
                    <p>MTN: 6XX XXX XXX</p>
                    <p>Orange: 6XX XXX XXX</p>
                </div>
                <div class="payment-method-card">
                    <i class="fas fa-credit-card"></i>
                    <h4>Online Payment</h4>
                    <p>Coming Soon</p>
                    <button class="btn btn-primary btn-sm" disabled>Pay Online</button>
                </div>
            </div>
            <div class="payment-note">
                <i class="fas fa-info-circle"></i>
                <p>After payment, send your receipt to <strong>finance@university.edu</strong> 
                   or upload it below for verification.</p>
            </div>
        </div>
        
        <!-- Upload Payment Proof -->
        <div class="section">
            <h2>Upload Payment Proof</h2>
            <form id="paymentProofForm" class="upload-form">
                <div class="form-group">
                    <label>Payment Type</label>
                    <select id="paymentType" class="form-select" required>
                        <option value="">Select payment type</option>
                        <option value="tuition">Tuition Fee</option>
                        <option value="registration">Registration Fee</option>
                        <option value="library">Library Fee</option>
                        <option value="technology">Technology Fee</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Amount Paid (FCFA)</label>
                    <input type="number" id="paymentAmount" class="form-input" required min="1000">
                </div>
                <div class="form-group">
                    <label>Upload Receipt</label>
                    <div class="file-upload">
                        <input type="file" id="receiptFile" accept=".pdf,.jpg,.png" required>
                        <div class="file-upload-area">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Upload your payment receipt</p>
                            <span class="file-info" id="receiptInfo"></span>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Additional Notes</label>
                    <textarea id="paymentNotes" class="form-input" rows="3"></textarea>
                </div>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-paper-plane"></i> Submit Payment Proof
                </button>
            </form>
        </div>
    `;
    
    // Setup payment form
    setupPaymentForm();
    } catch (error) {
        console.error('Error loading fees:', error);
        container.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading fee information</h3>
                <p>${error.message || 'Please try again later.'}</p>
                <button onclick="loadPage('fees')" class="btn btn-primary">Retry</button>
            </div>
        `;
    }
}

// Setup payment proof upload
function setupPaymentForm() {
    document.getElementById('paymentProofForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const type = document.getElementById('paymentType').value;
        const amount = document.getElementById('paymentAmount').value;
        const file = document.getElementById('receiptFile').files[0];
        const notes = document.getElementById('paymentNotes').value;
        
        if (!file) {
            showNotification('Please upload a receipt', 'error');
            return;
        }
        
        try {
            // Create payment record
            await db.collection('payments').add({
                studentId: localStorage.getItem('userId'),
                type: type,
                amount: parseInt(amount),
                description: type.charAt(0).toUpperCase() + type.slice(1) + ' Fee',
                status: 'pending',
                notes: notes,
                receiptFile: file.name,
                paidAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            showNotification('Payment proof submitted successfully!', 'success');
            document.getElementById('paymentProofForm').reset();
            setTimeout(() => loadPage('fees'), 1000);
        } catch (error) {
            showNotification('Error submitting payment proof', 'error');
        }
    });
}

// Download receipt
function downloadReceipt(paymentId) {
    // Generate receipt PDF
    const receiptContent = `
        <div style="text-align: center; padding: 40px;">
            <h1>Payment Receipt</h1>
            <p>University of Cameroon</p>
            <hr>
            <p><strong>Receipt #:</strong> REC-${paymentId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Student:</strong> ${localStorage.getItem('userName')}</p>
            <p><strong>Status:</strong> Completed</p>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
}

// ===================== ANNOUNCEMENTS PAGE =====================
async function loadAnnouncementsPage(container) {
    const userId = localStorage.getItem('userId');
    
    try {
        // Try to get announcements with error handling
        let announcementsSnapshot = null;
        
        try {
            announcementsSnapshot = await db.collection('announcements')
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();
        } catch (e) {
            console.log('Trying alternate query for announcements...');
            // Try without orderBy if the above fails
            announcementsSnapshot = await db.collection('announcements').get();
        }

        let announcementsHtml = '';
        if (announcementsSnapshot && announcementsSnapshot.docs.length > 0) {
            announcementsHtml = announcementsSnapshot.docs
                .map(doc => {
                    const announcement = doc.data();
                    const date = announcement.createdAt ? announcement.createdAt.toDate() : null;
                    const safeTitle = escapeHtml(announcement.title || 'No Title');
                    const safeMessage = escapeHtml(announcement.message || 'No message');
                    const safePostedBy = escapeHtml(announcement.postedBy || 'Anonymous');
                    
                    return `
                        <div class="announcement-card" data-category="${announcement.category || 'general'}">
                            <div class="announcement-icon">
                                ${getAnnouncementIcon(announcement.category)}
                            </div>
                            <div class="announcement-body">
                                <div class="announcement-header">
                                    <h3>${safeTitle}</h3>
                                    <span class="category-badge category-${announcement.category || 'general'}">
                                        ${announcement.category || 'General'}
                                    </span>
                                </div>
                                <p class="announcement-message">${safeMessage}</p>
                                <div class="announcement-meta">
                                    <span><i class="fas fa-user"></i> ${safePostedBy}</span>
                                    <span><i class="fas fa-clock"></i> ${formatDate(date)}</span>
                                    ${announcement.attachment ?
                                        `<span><i class="fas fa-paperclip"></i> <a href="#">${escapeHtml(announcement.attachment)}</a></span>`
                                        : ''
                                    }
                                </div>
                            </div>
                        </div>
                    `;
                })
                .sort((a, b) => {
                    // Sort by date if available
                    return b - a;
                })
                .join('');
        } else {
            announcementsHtml = '<p class="text-center text-muted">No announcements yet</p>';
        }

        container.innerHTML = `
            <div class="page-header">
                <h1>Announcements</h1>
                <div class="announcement-filters">
                    <select id="announcementFilter" class="form-select">
                        <option value="all">All Announcements</option>
                        <option value="general">General</option>
                        <option value="academic">Academic</option>
                        <option value="events">Events</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
            </div>
            
            <!-- Announcements List -->
            <div class="announcements-container">
                ${announcementsHtml}
            </div>
        `;
        
        // Setup announcement filters
        setupAnnouncementFilters();
    } catch (error) {
        console.error('Error loading announcements:', error);
        container.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading announcements</h3>
                <p>${error.message || 'Please try again later.'}</p>
                <button onclick="loadPage('announcements')" class="btn btn-primary">Retry</button>
            </div>
        `;
    }
}

// ===================== HELPER FUNCTIONS =====================

// View course details
async function viewCourseDetails(courseId, courseCode) {
    try {
        const courseDoc = await db.collection('courses').doc(courseId).get();
        if (!courseDoc.exists) {
            showNotification('Course not found', 'error');
            return;
        }
        
        const course = courseDoc.data();
        const details = [
            `Course: ${course.code} - ${course.name}`,
            `Credits: ${course.credits || 3}`,
            `Lecturer: ${course.lecturer || course.lecturerName || 'TBA'}`,
            `Schedule: ${course.schedule || 'TBA'}`,
            `Venue: ${course.venue || 'TBA'}`,
            `Semester: ${course.semester || 'Current'}`,
            `Description: ${course.description || 'No description provided'}`,
            course.prerequisites ? `Prerequisites: ${course.prerequisites}` : null,
            course.syllabus ? `Syllabus: ${course.syllabus}` : null
        ].filter(Boolean).join('\n');
        
        alert(`Course Details:\n\n${details}`);
    } catch (error) {
        showNotification('Error loading course details', 'error');
        console.error('viewCourseDetails error:', error);
    }
}

// Get announcement icon based on category
function getAnnouncementIcon(category) {
    const icons = {
        'urgent': '<i class="fas fa-exclamation-circle" style="color: #e74c3c;"></i>',
        'academic': '<i class="fas fa-book" style="color: #3498db;"></i>',
        'events': '<i class="fas fa-calendar" style="color: #2ecc71;"></i>',
        'general': '<i class="fas fa-bullhorn" style="color: #f39c12;"></i>'
    };
    return icons[category] || icons['general'];
}

// Setup announcement filters
function setupAnnouncementFilters() {
    document.getElementById('announcementFilter')?.addEventListener('change', function() {
        const filter = this.value;
        document.querySelectorAll('.announcement-card').forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// ===================== UTILITY FUNCTIONS =====================

// Format date to readable string
function formatDate(date) {
    if (!date) return 'N/A';
    const nativeDate = date?.toDate ? date.toDate() : new Date(date);
    if (Number.isNaN(nativeDate.getTime())) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return nativeDate.toLocaleDateString('en-US', options);
}

// Format currency
function formatCurrency(amount) {
    const value = Number(amount) || 0;
    return value.toLocaleString('en-US') + ' FCFA';
}

function escapeHtmlAttribute(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Get current semester
function getCurrentSemester() {
    const month = new Date().getMonth();
    return month < 6 ? 'Spring' : 'Fall';
}

// Get next payment due date
function getNextPayment(payments) {
    if (!payments || payments.length === 0) return 'N/A';
    const pending = payments.find(p => p.status === 'pending');
    return pending ? formatDate(pending.dueDate) : 'All Paid';
}

// Show notification toast
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="close-notification">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
    
    // Close button
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.signOut().then(() => {
            localStorage.clear();
            window.location.href = '../index.html';
        });
    }
}

// Toggle sidebar on mobile
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Load notifications
function loadNotifications() {
    // This would fetch real notifications from Firebase
    const notificationCount = 3;
    const badge = document.querySelector('.notifications .badge');
    if (badge && notificationCount > 0) {
        badge.textContent = notificationCount;
        badge.style.display = 'block';
    }
}

// Start notification listener
function startNotificationListener() {
    // Listen for real-time updates
    db.collection('notifications')
        .where('userId', '==', localStorage.getItem('userId'))
        .where('read', '==', false)
        .onSnapshot((snapshot) => {
            const count = snapshot.docs.length;
            const badge = document.querySelector('.notifications .badge');
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'block' : 'none';
            }
        });
}

// Load student data
async function loadStudentData(user) {
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            document.getElementById('userName').textContent = userData.fullName;
        }
    } catch (error) {
        console.error('Error loading student data:', error);
    }
}