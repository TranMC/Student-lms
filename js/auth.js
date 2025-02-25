class Auth {
    constructor() {
        this.initializeData();
        this.setupLoginForm();
    }

    initializeData() {
        // Khởi tạo admin nếu chưa có
        if (!localStorage.getItem('admins')) {
            const admins = [{
                id: 1,
                username: 'admin',
                password: '1',
                role: 'admin'
            }];
            localStorage.setItem('admins', JSON.stringify(admins));
        }

        // Cập nhật teachers với role
        if (!localStorage.getItem('teachers')) {
            const teachers = [{
                id: 1,
                username: 'teacher1',
                password: '123456',
                fullName: 'Nguyễn Văn A',
                subject: 'Toán',
                role: 'teacher'
            }];
            localStorage.setItem('teachers', JSON.stringify(teachers));
        }

        // Cập nhật students với role
        if (!localStorage.getItem('students')) {
            const students = [
                {
                    studentId: 'HS001',
                    fullName: 'Trần Văn An',
                    class: '12A1',
                    username: 'student1',
                    password: '123456',
                    email: 'an@example.com',
                    phone: '0123456789',
                    role: 'student'
                },
                {
                    studentId: 'HS002',
                    fullName: 'Lê Thị Bình',
                    class: '12A1',
                    username: 'student2',
                    password: '123456',
                    email: 'binh@example.com',
                    phone: '0123456790',
                    role: 'student'
                },
                {
                    studentId: 'HS003',
                    fullName: 'Phạm Văn Cường',
                    class: '12A2',
                    username: 'student3',
                    password: '123456',
                    email: 'cuong@example.com',
                    phone: '0123456791',
                    role: 'student'
                },
                {
                    studentId: 'TEST',
                    fullName: 'Tester',
                    class: 'Test',
                    username: 'test',
                    password: '1',
                    email: 'Test@example.com',
                    phone: 'test',
                    role: 'student'
                }
            ];
            localStorage.setItem('students', JSON.stringify(students));
        }

        // Khởi tạo dữ liệu lớp học nếu chưa có
        if (!localStorage.getItem('classes')) {
            const classes = [
                {
                    classId: 'L001',
                    className: '12A1',
                    teacherId: 1,
                    status: 'active'
                },
                {
                    classId: 'L002',
                    className: '12A2',
                    teacherId: 1,
                    status: 'active'
                },
                {
                    classId: 'L003',
                    className: '12A3',
                    teacherId: 1,
                    status: 'active'
                }
            ];
            localStorage.setItem('classes', JSON.stringify(classes));
        }

        // Khởi tạo dữ liệu điểm mẫu nếu chưa có
        if (!localStorage.getItem('scores')) {
            const scores = [
                {
                    id: '1',
                    studentId: 'HS001',
                    subject: 'Toán',
                    type: 'Miệng',
                    score: 8,
                    date: '2024-01-15'
                },
                {
                    id: '2',
                    studentId: 'HS001',
                    subject: 'Toán',
                    type: '15 phút',
                    score: 7.5,
                    date: '2024-01-16'
                },
                {
                    id: '3',
                    studentId: 'HS002',
                    subject: 'Toán',
                    type: '1 tiết',
                    score: 9,
                    date: '2024-01-17'
                },
                {
                    id: '4',
                    studentId: 'HS003',
                    subject: 'Toán',
                    type: 'Giữa kỳ',
                    score: 8.5,
                    date: '2024-01-18'
                }
            ];
            localStorage.setItem('scores', JSON.stringify(scores));
        }
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const role = document.getElementById('role').value;
                const rememberMe = document.getElementById('rememberMe').checked;

                if (rememberMe) {
                    localStorage.setItem('rememberedUsername', username);
                    localStorage.setItem('rememberedRole', role);
                } else {
                    localStorage.removeItem('rememberedUsername');
                    localStorage.removeItem('rememberedRole');
                }

                let loginSuccess = false;
                let redirectUrl = '';
                
                // Kiểm tra đăng nhập theo role
                if (role === 'admin') {
                    loginSuccess = this.adminLogin(username, password);
                    redirectUrl = 'admin-dashboard.html';
                } else if (role === 'teacher') {
                    loginSuccess = this.teacherLogin(username, password);
                    redirectUrl = 'teacher-dashboard.html';
                } else if (role === 'student') {
                    loginSuccess = this.studentLogin(username, password);
                    redirectUrl = 'student-dashboard.html';
                }

                if (loginSuccess) {
                    window.location.href = redirectUrl;
                } else {
                    alert('Tên đăng nhập hoặc mật khẩu không đúng!');
                }
            });
        }
    }

    adminLogin(username, password) {
        const admins = JSON.parse(localStorage.getItem('admins') || '[]');
        const admin = admins.find(a => a.username === username && a.password === password);
        
        if (admin) {
            localStorage.setItem('currentUser', JSON.stringify({...admin, role: 'admin'}));
            return true;
        }
        return false;
    }

    teacherLogin(username, password) {
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const teacher = teachers.find(t => t.username === username && t.password === password);
        
        if (teacher) {
            localStorage.setItem('currentUser', JSON.stringify({...teacher, role: 'teacher'}));
            return true;
        }
        return false;
    }

    studentLogin(username, password) {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const student = students.find(s => s.username === username && s.password === password);
        
        if (student) {
            localStorage.setItem('currentUser', JSON.stringify({...student, role: 'student'}));
            localStorage.setItem('currentStudent', JSON.stringify(student));
            return true;
        }
        return false;
    }

    checkAuth() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    checkRole() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            this.redirectToLogin();
            return;
        }

        const currentPath = window.location.pathname;
        const role = currentUser.role;

        if (currentPath.includes('admin') && role !== 'admin') {
            window.location.href = `${role}-dashboard.html`;
        } else if (currentPath.includes('teacher') && role !== 'teacher') {
            window.location.href = `${role}-dashboard.html`;
        } else if (currentPath.includes('student') && role !== 'student') {
            window.location.href = `${role}-dashboard.html`;
        }
    }

    redirectToLogin() {
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentStudent');
        this.redirectToLogin();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    isTeacher() {
        const currentUser = this.getCurrentUser();
        return currentUser && currentUser.role === 'teacher';
    }

    isStudent() {
        const currentUser = this.getCurrentUser();
        return currentUser && currentUser.role === 'student';
    }

    isAdmin() {
        const currentUser = this.getCurrentUser();
        return currentUser && currentUser.role === 'admin';
    }
}

// Khởi tạo đối tượng Auth toàn cục
window.auth = new Auth();