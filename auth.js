// AUTH.JS - Sistem Autentikasi dengan Fitur Tambahan
class AuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupTabSwitching();
        this.setupFormSubmissions();
        this.setupRealTimeValidation();
        this.checkExistingSession();
        this.setupModalHandlers(); 
    }

    // TAB SWITCHING
    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const formSections = document.querySelectorAll('.form-section');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                
                // Update active tab
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update active form
                formSections.forEach(section => section.classList.remove('active'));
                document.getElementById(tabName).classList.add('active');
                
                // Clear forms and reset validation
                this.clearFormValidation();
            });
        });
    }

    // FORM SUBMISSIONS
    setupFormSubmissions() {
        // Login Form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register Form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }

    // REAL-TIME VALIDATION
    setupRealTimeValidation() {
        // Username validation (register)
        document.getElementById('registerUsername').addEventListener('input', (e) => {
            this.validateUsername(e.target.value, 'register');
        });

        // Email validation
        document.getElementById('registerEmail').addEventListener('input', (e) => {
            this.validateEmail(e.target.value);
        });

        // Password validation
        document.getElementById('registerPassword').addEventListener('input', (e) => {
            this.validatePassword(e.target.value);
            // Also validate confirm password if it has value
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (confirmPassword) {
                this.validateConfirmPassword(confirmPassword, e.target.value);
            }
        });

        // Confirm password validation
        document.getElementById('confirmPassword').addEventListener('input', (e) => {
            const password = document.getElementById('registerPassword').value;
            this.validateConfirmPassword(e.target.value, password);
        });
    }

    // LOGIN HANDLER - DENGAN FITUR TAMBAHAN
    async handleLogin() {
        const form = document.getElementById('loginForm');
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Show loading
        this.showLoading('login');

        // Simulate API delay
        await this.delay(1000);

        // Validate inputs
        if (!this.validateLoginInputs(username, password)) {
            this.hideLoading('login');
            return;
        }

        // Cek apakah username terdaftar
        const userExists = this.users.find(u => u.username === username);
        if (!userExists) {
            this.hideLoading('login');
            this.showModalPopup(
                'error',
                'Username Tidak Terdaftar',
                'Username yang Anda masukkan belum terdaftar. Silakan daftar terlebih dahulu atau periksa kembali username Anda.',
                () => {
                    // Pindah ke tab register dan pre-fill username
                    document.querySelector('[data-tab="register"]').click();
                    document.getElementById('registerUsername').value = username;
                    document.getElementById('registerUsername').focus();
                }
            );
            return;
        }

        // Check credentials
        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.currentUser = user;
            this.saveSession(user);
            this.showNotification('Login berhasil! Selamat datang, ' + user.username, 'success');
            
            // Redirect to main website after delay
            setTimeout(() => {
                window.location.href = 'index.html'; 
            }, 1500);
        } else {
            this.showNotification('Username atau kata sandi salah!', 'error');
            this.setFieldError('loginUsername', 'Username atau kata sandi tidak valid');
            this.setFieldError('loginPassword', '');
        }

        this.hideLoading('login');
    }

    // REGISTER HANDLER - DENGAN FITUR TAMBAHAN
    async handleRegister() {
        const form = document.getElementById('registerForm');
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Show loading
        this.showLoading('register');

        // Simulate API delay
        await this.delay(1200);

        // Cek username yang sudah ada
        const existingUser = this.users.find(u => u.username === username);
        if (existingUser) {
            this.hideLoading('register');
            this.showModalPopup(
                'warning',
                'Username Sudah Digunakan',
                'Username yang Anda pilih sudah digunakan oleh pengguna lain. Silakan gunakan username yang berbeda.',
                () => {
                    document.getElementById('registerUsername').focus();
                    document.getElementById('registerUsername').select();
                }
            );
            this.setFieldError('registerUsername', 'Username sudah digunakan');
            return;
        }

        // Validate all inputs
        const isUsernameValid = this.validateUsername(username, 'register');
        const isEmailValid = this.validateEmail(email);
        const isPasswordValid = this.validatePassword(password);
        const isConfirmPasswordValid = this.validateConfirmPassword(confirmPassword, password);

        if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
            this.hideLoading('register');
            this.showNotification('Mohon perbaiki kesalahan pada form', 'error');
            return;
        }

        // Check for duplicate email
        const existingEmail = this.users.find(u => u.email === email);
        if (existingEmail) {
            this.setFieldError('registerEmail', 'Email sudah digunakan');
            this.hideLoading('register');
            this.showNotification('Email sudah terdaftar!', 'warning');
            return;
        }

        // Register new user
        const newUser = {
            id: Date.now(),
            username: username,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();

        this.hideLoading('register');
        this.showNotification('Pendaftaran berhasil! Silakan login dengan akun Anda.', 'success');

        // Switch to login tab and pre-fill username
        document.querySelector('[data-tab="login"]').click();
        document.getElementById('loginUsername').value = username;

        // Reset register form
        form.reset();
        this.clearFormValidation();
    }

    // FITUR TAMBAHAN - MODAL POPUP HANDLERS
    setupModalHandlers() {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalCancel = document.getElementById('modalCancel');
        const modalConfirm = document.getElementById('modalConfirm');

        // Close modal when clicking overlay
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.hideModalPopup();
            }
        });

        // Cancel button
        modalCancel.addEventListener('click', () => {
            this.hideModalPopup();
        });

        // Confirm button (akan di-set dinamis)
        modalConfirm.addEventListener('click', () => {
            if (this.modalConfirmAction) {
                this.modalConfirmAction();
            }
            this.hideModalPopup();
        });

        // Close with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('show')) {
                this.hideModalPopup();
            }
        });
    }

    showModalPopup(type, title, message, confirmAction = null) {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalIcon = document.getElementById('modalIcon');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalConfirm = document.getElementById('modalConfirm');
        const modalCancel = document.getElementById('modalCancel');

        // Set icon based on type
        modalIcon.className = 'modal-icon ' + type;
        if (type === 'error') {
            modalIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        } else if (type === 'warning') {
            modalIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        } else {
            modalIcon.innerHTML = '<i class="fas fa-info-circle"></i>';
        }

        // Set content
        modalTitle.textContent = title;
        modalMessage.textContent = message;

        // Set confirm action
        this.modalConfirmAction = confirmAction;

        // Customize buttons based on action
        if (confirmAction) {
            modalConfirm.textContent = type === 'error' ? 'Daftar Sekarang' : 'OK';
            modalCancel.style.display = 'block';
        } else {
            modalConfirm.textContent = 'OK';
            modalCancel.style.display = 'none';
        }

        // Show modal
        modalOverlay.style.display = 'flex';
        setTimeout(() => {
            modalOverlay.classList.add('show');
        }, 10);
    }

    hideModalPopup() {
        const modalOverlay = document.getElementById('modalOverlay');
        modalOverlay.classList.remove('show');
        setTimeout(() => {
            modalOverlay.style.display = 'none';
            this.modalConfirmAction = null;
        }, 300);
    }

    // VALIDATION METHODS
    validateLoginInputs(username, password) {
        let isValid = true;

        if (!username) {
            this.setFieldError('loginUsername', 'Username harus diisi');
            isValid = false;
        } else {
            this.clearFieldError('loginUsername');
        }

        if (!password) {
            this.setFieldError('loginPassword', 'Kata sandi harus diisi');
            isValid = false;
        } else {
            this.clearFieldError('loginPassword');
        }

        return isValid;
    }

    validateUsername(username, type = 'register') {
        const field = type === 'register' ? 'registerUsername' : 'loginUsername';
        const errorField = field + 'Error';
        const successField = field + 'Success';

        if (!username) {
            this.setFieldError(field, 'Username harus diisi');
            return false;
        }

        if (username.length < 3) {
            this.setFieldError(field, 'Username minimal 3 karakter');
            return false;
        }

        if (username.length > 20) {
            this.setFieldError(field, 'Username maksimal 20 karakter');
            return false;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            this.setFieldError(field, 'Username hanya boleh mengandung huruf, angka, dan underscore');
            return false;
        }

        if (type === 'register') {
            const existingUser = this.users.find(u => u.username === username);
            if (existingUser) {
                this.setFieldError(field, 'Username sudah digunakan');
                return false;
            }
            this.setFieldSuccess(field, 'Username tersedia');
        } else {
            this.clearFieldError(field);
        }

        return true;
    }

    validateEmail(email) {
        if (!email) {
            this.setFieldError('registerEmail', 'Email harus diisi');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.setFieldError('registerEmail', 'Format email tidak valid');
            return false;
        }

        const existingEmail = this.users.find(u => u.email === email);
        if (existingEmail) {
            this.setFieldError('registerEmail', 'Email sudah digunakan');
            return false;
        }

        this.setFieldSuccess('registerEmail', 'Email valid');
        return true;
    }

    validatePassword(password) {
        if (!password) {
            this.setFieldError('registerPassword', 'Kata sandi harus diisi');
            return false;
        }

        if (password.length < 6) {
            this.setFieldError('registerPassword', 'Kata sandi minimal 6 karakter');
            return false;
        }

        if (password.length > 50) {
            this.setFieldError('registerPassword', 'Kata sandi maksimal 50 karakter');
            return false;
        }

        // Check for at least one letter and one number
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
            this.setFieldError('registerPassword', 'Kata sandi harus mengandung huruf dan angka');
            return false;
        }

        this.setFieldSuccess('registerPassword', 'Kata sandi kuat');
        return true;
    }

    validateConfirmPassword(confirmPassword, password) {
        if (!confirmPassword) {
            this.setFieldError('confirmPassword', 'Konfirmasi kata sandi harus diisi');
            return false;
        }

        if (confirmPassword !== password) {
            this.setFieldError('confirmPassword', 'Kata sandi tidak cocok');
            return false;
        }

        this.setFieldSuccess('confirmPassword', 'Kata sandi cocok');
        return true;
    }

    // UI HELPER METHODS
    setFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');
        const successElement = document.getElementById(fieldName + 'Success');

        field.classList.add('error');
        field.classList.remove('success');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        if (successElement) {
            successElement.style.display = 'none';
        }
    }

    setFieldSuccess(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');
        const successElement = document.getElementById(fieldName + 'Success');

        field.classList.remove('error');
        field.classList.add('success');
        
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
        }
    }

    clearFieldError(fieldName) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');
        const successElement = document.getElementById(fieldName + 'Success');

        field.classList.remove('error', 'success');
        
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
        if (successElement) {
            successElement.style.display = 'none';
        }
    }

    clearFormValidation() {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('error', 'success');
        });

        const errorMessages = document.querySelectorAll('.error-message, .success-message');
        errorMessages.forEach(msg => {
            msg.style.display = 'none';
        });
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Hide notification after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-times-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    showLoading(formType) {
        const button = document.querySelector(`#${formType}Form .submit-btn`);
        const btnText = button.querySelector('.btn-text');
        const loading = button.querySelector('.loading');

        button.disabled = true;
        btnText.style.opacity = '0';
        loading.style.display = 'block';
    }

    hideLoading(formType) {
        const button = document.querySelector(`#${formType}Form .submit-btn`);
        const btnText = button.querySelector('.btn-text');
        const loading = button.querySelector('.loading');

        button.disabled = false;
        btnText.style.opacity = '1';
        loading.style.display = 'none';
    }

    // DATA MANAGEMENT
    loadUsers() {
        const stored = localStorage.getItem('misi_depo_users');
        if (stored) {
            return JSON.parse(stored);
        }
        return [
            // Default admin user
            {
                id: 1,
                username: 'admin',
                email: 'admin@misidepo.com',
                password: 'admin123',
                createdAt: new Date().toISOString()
            }
        ];
    }

    saveUsers() {
        localStorage.setItem('misi_depo_users', JSON.stringify(this.users));
    }

    saveSession(user) {
        localStorage.setItem('misi_depo_session', JSON.stringify({
            userId: user.id,
            username: user.username,
            loginTime: new Date().toISOString()
        }));
    }

    checkExistingSession() {
        const session = localStorage.getItem('misi_depo_session');
        if (session) {
            const sessionData = JSON.parse(session);
            const loginTime = new Date(sessionData.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

            // Session valid for 24 hours
            if (hoursDiff < 24) {
                window.location.href = 'paste.html';
                return;
            } else {
                localStorage.removeItem('misi_depo_session');
            }
        }
    }

    // UTILITY METHODS
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// PASSWORD TOGGLE FUNCTION
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = field.nextElementSibling;

    if (field.type === 'password') {
        field.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        field.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// INITIALIZE APPLICATION
document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
});