document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Lấy danh sách học sinh từ localStorage
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const student = students.find(s => s.username === username && s.password === password);

    if (student) {
        // Lưu thông tin học sinh vào localStorage
        localStorage.setItem('currentStudent', JSON.stringify(student));
        window.location.href = 'student-dashboard.html';
    } else {
        alert('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
}); 