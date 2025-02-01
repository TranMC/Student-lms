// Khởi tạo dữ liệu mẫu
const initializeData = () => {
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
            }
        ];
        localStorage.setItem('students', JSON.stringify(students));
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
};

// Kiểm tra đăng nhập admin
const adminLogin = (username, password) => {
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    const admin = admins.find(a => a.username === username && a.password === password);
    
    if (admin) {
        localStorage.setItem('currentUser', JSON.stringify({...admin, role: 'admin'}));
        return true;
    }
    return false;
};

// Kiểm tra đăng nhập giáo viên
const teacherLogin = (username, password) => {
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const teacher = teachers.find(t => t.username === username && t.password === password);
    
    if (teacher) {
        localStorage.setItem('currentUser', JSON.stringify({...teacher, role: 'teacher'}));
        return true;
    }
    return false;
};

// Kiểm tra đăng nhập học sinh
const studentLogin = (username, password) => {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const student = students.find(s => s.username === username && s.password === password);
    
    if (student) {
        localStorage.setItem('currentUser', JSON.stringify({...student, role: 'student'}));
        return true;
    }
    return false;
};

// Kiểm tra role của user hiện tại
const getCurrentUser = () => {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
};

// Đăng xuất
const logout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
};

// Khởi tạo dữ liệu khi tải trang
document.addEventListener('DOMContentLoaded', initializeData);

