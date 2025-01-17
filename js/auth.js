// Khởi tạo dữ liệu mẫu
const initializeData = () => {
    // Khởi tạo dữ liệu giáo viên mẫu nếu chưa có
    if (!localStorage.getItem('teachers')) {
        const teachers = [{
            id: 1,
            username: 'teacher1',
            password: '123456',
            fullName: 'Hỗn thần độn',
            subject: 'Quỷ'
        }];
        localStorage.setItem('teachers', JSON.stringify(teachers));
    }

    // Khởi tạo dữ liệu học sinh mẫu nếu chưa có
    if (!localStorage.getItem('students')) {
        const students = [
            {
                studentId: 'HS001',
                fullName: 'Trần Văn An',
                class: '12A1',
                username: 'student1',
                password: '123456',
                email: 'an@example.com',
                phone: '0123456789'
            },
            {
                studentId: 'HS002',
                fullName: 'Lê Thị Bình',
                class: '12A1',
                username: 'student2',
                password: '123456',
                email: 'binh@example.com',
                phone: '0123456790'
            },
            {
                studentId: 'HS003',
                fullName: 'Phạm Văn Cường',
                class: '12A2',
                username: 'student3',
                password: '123456',
                email: 'cuong@example.com',
                phone: '0123456791'
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

// Kiểm tra đăng nhập giáo viên
const teacherLogin = (username, password) => {
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const teacher = teachers.find(t => t.username === username && t.password === password);
    
    if (teacher) {
        localStorage.setItem('currentTeacher', JSON.stringify(teacher));
        return true;
    }
    return false;
};

// Kiểm tra đăng nhập học sinh
const studentLogin = (username, password) => {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const student = students.find(s => s.username === username && s.password === password);
    
    if (student) {
        localStorage.setItem('currentStudent', JSON.stringify(student));
        return true;
    }
    return false;
};

// Kiểm tra trạng thái đăng nhập giáo viên
const checkTeacherAuth = () => {
    const teacherData = localStorage.getItem('currentTeacher');
    return teacherData ? JSON.parse(teacherData) : null;
};

// Kiểm tra trạng thái đăng nhập học sinh
const checkStudentAuth = () => {
    const studentData = localStorage.getItem('currentStudent');
    return studentData ? JSON.parse(studentData) : null;
};

// Đăng xuất
const logout = () => {
    localStorage.removeItem('currentTeacher');
    localStorage.removeItem('currentStudent');
    window.location.href = 'login.html';
};

// Khởi tạo dữ liệu khi tải trang
document.addEventListener('DOMContentLoaded', initializeData); 