// Hàm xử lý toggle password
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle i');
    
    // Thêm animation fade out
    passwordInput.classList.add('fade-out-password');
    
    setTimeout(() => {
        // Đổi type của input
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
        
        // Xóa animation fade out và thêm animation fade in
        passwordInput.classList.remove('fade-out-password');
        passwordInput.classList.add('fade-in-password');
        
        // Xóa class animation sau khi hoàn thành
        setTimeout(() => {
            passwordInput.classList.remove('fade-in-password');
        }, 400); // Tăng thời gian để phù hợp với animation mới
    }, 200); // Tăng thời gian delay
}

// Xử lý form đăng nhập
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const roleSelect = document.getElementById('role');
    const submitButton = document.querySelector('button[type="submit"]');

    // Thêm class ripple cho button
    submitButton.classList.add('ripple');

    // Animation khi click button
    submitButton.addEventListener('click', function(e) {
        // Thêm animation click
        this.classList.add('login-button-click');
        
        // Tạo hiệu ứng ripple
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.style.setProperty('--ripple-x', x + 'px');
        this.style.setProperty('--ripple-y', y + 'px');

        // Xóa class sau khi animation hoàn thành
        setTimeout(() => {
            this.classList.remove('login-button-click');
        }, 300);
    });

    // Animation cho select role
    roleSelect.addEventListener('change', function() {
        this.style.animation = 'none';
        this.offsetHeight; // Trigger reflow
        this.style.animation = 'selectPulse 0.5s ease';
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        let loginSuccess = false;
        let redirectUrl = '';

        switch(role) {
            case 'admin':
                loginSuccess = adminLogin(username, password);
                redirectUrl = 'admin-dashboard.html';
                break;
            case 'teacher':
                loginSuccess = teacherLogin(username, password);
                redirectUrl = 'teacher-dashboard.html';
                break;
            case 'student':
                loginSuccess = studentLogin(username, password);
                redirectUrl = 'student-dashboard.html';
                break;
        }

        if (loginSuccess) {
            window.location.href = redirectUrl;
        } else {
            alert('Sai tên đăng nhập, mật khẩu hoặc vai trò!');
        }
    });
}); 