document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Kiểm tra trong danh sách giáo viên
    const teacher = users.teachers.find(t => t.username === username && t.password === password);
    if (teacher) {
        // Lưu thông tin đăng nhập vào sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify({
            username: teacher.username,
            role: teacher.role,
            fullName: teacher.fullName,
            subject: teacher.subject
        }));
        window.location.href = 'teacher-dashboard.html';
        return;
    }

    // Kiểm tra trong danh sách học sinh
    const student = users.students.find(s => s.username === username && s.password === password);
    if (student) {
        // Lưu thông tin đăng nhập vào sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify({
            username: student.username,
            role: student.role,
            fullName: student.fullName,
            studentId: student.studentId,
            class: student.class
        }));
        window.location.href = 'student-dashboard.html';
        return;
    }

    // Nếu không tìm thấy user
    alert('Tên đăng nhập hoặc mật khẩu không đúng!');
}); 