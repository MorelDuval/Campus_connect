// Authentication Logic for Campus Connect

// Wait for the page to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Get DOM elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const togglePassword = document.getElementById('togglePassword');
    
    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
    });
    
    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent page reload
        
        // Get form values
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const role = document.querySelector('input[name="role"]:checked').value;
        
        // Basic validation
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        if (!email.endsWith('.edu') && !email.includes('university')) {
            showError('Please use your university email address');
            return;
        }
        
        // Show loading spinner
        showLoading(true);
        hideError();
        
        try {
            // Sign in with Firebase
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Get user data from Firestore
            const userDoc = await db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                throw new Error('User profile not found');
            }
            
            const userData = userDoc.data();
            
            // Verify role matches
            if (userData.role !== role) {
                await auth.signOut();
                throw new Error(`This account is not registered as ${role}`);
            }
            
            // Store user session
            localStorage.setItem('userRole', userData.role);
            localStorage.setItem('userName', userData.fullName);
            localStorage.setItem('userId', user.uid);
            
            // Redirect based on role
            redirectToDashboard(userData.role);
            
        } catch (error) {
            console.error('Login error:', error);
            showError(getErrorMessage(error));
        } finally {
            showLoading(false);
        }
    });
    
    // Helper function: Show loading
    function showLoading(show) {
        if (show) {
            loadingSpinner.classList.add('show');
            loginForm.querySelector('.login-btn').disabled = true;
        } else {
            loadingSpinner.classList.remove('show');
            loginForm.querySelector('.login-btn').disabled = false;
        }
    }
    
    // Helper function: Show error
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }
    
    // Helper function: Hide error
    function hideError() {
        errorMessage.classList.remove('show');
    }
    
    // Helper function: Get user-friendly error message
    function getErrorMessage(error) {
        switch (error.code) {
            case 'auth/user-not-found':
                return 'No account found with this email';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please try again later';
            default:
                return error.message || 'Login failed. Please try again';
        }
    }
    
    // Helper function: Redirect to dashboard
    function redirectToDashboard(role) {
        let dashboardUrl;
        
        switch (role) {
            case 'student':
                dashboardUrl = 'pages/student-dashboard.html';
                break;
            case 'lecturer':
                dashboardUrl = 'pages/lecturer-dashboard.html';
                break;
            case 'admin':
                dashboardUrl = 'pages/admin-dashboard.html';
                break;
            default:
                showError('Invalid role');
                return;
        }
        
        // Add animation before redirect
        document.querySelector('.container').style.transform = 'scale(0.95)';
        document.querySelector('.container').style.opacity = '0';
        document.querySelector('.container').style.transition = 'all 0.5s';
        
        setTimeout(() => {
            window.location.href = dashboardUrl;
        }, 500);
    }
    
    // Check if user is already logged in
    checkAuthState();
});

// Check authentication state
function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in, redirect to their dashboard
            const userRole = localStorage.getItem('userRole');
            if (userRole) {
                // Only redirect if we're on the login page
                if (window.location.pathname.includes('index.html') || 
                    window.location.pathname === '/') {
                    redirectToDashboard(userRole);
                }
            }
        }
    });
}