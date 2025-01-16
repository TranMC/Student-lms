// Kiểm tra đăng nhập
const teacher = checkTeacherAuth();

// Khởi tạo localStorage nếu chưa có
if (!localStorage.getItem('scores')) {
    localStorage.setItem('scores', JSON.stringify([]));
}

// Lấy form và bảng
const scoreForm = document.getElementById('scoreForm');
const scoreHistory = document.getElementById('scoreHistory');

// Xử lý sự kiện submit form
scoreForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const scoreData = {
        id: Date.now(), // Unique ID for each score
        date: document.getElementById('date').value,
        class: document.getElementById('className').value,
        studentId: document.getElementById('studentId').value,
        subject: document.getElementById('subject').value,
        scoreType: document.getElementById('scoreType').value,
        score: document.getElementById('score').value,
        teacherId: teacher.username
    };

    // Lấy điểm hiện có và thêm điểm mới
    const scores = JSON.parse(localStorage.getItem('scores'));
    scores.push(scoreData);
    localStorage.setItem('scores', JSON.stringify(scores));

    // Cập nhật bảng
    updateScoreTable();
    
    // Reset form
    scoreForm.reset();
    alert('Đã lưu điểm thành công!');
});

// Cập nhật bảng điểm
function updateScoreTable() {
    const scores = JSON.parse(localStorage.getItem('scores'));
    const tbody = scoreHistory.querySelector('tbody');
    tbody.innerHTML = '';

    scores.filter(score => score.teacherId === teacher.username)
         .forEach(score => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${score.date}</td>
            <td>${score.class}</td>
            <td>${score.studentId}</td>
            <td>${score.subject}</td>
            <td>${score.scoreType}</td>
            <td>${score.score}</td>
            <td>
                <button onclick="editScore(${score.id})" class="btn btn-small btn-primary">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteScore(${score.id})" class="btn btn-small btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Xóa điểm
function deleteScore(id) {
    if (confirm('Bạn có chắc muốn xóa điểm này?')) {
        const scores = JSON.parse(localStorage.getItem('scores'));
        const newScores = scores.filter(score => score.id !== id);
        localStorage.setItem('scores', JSON.stringify(newScores));
        updateScoreTable();
    }
}

// Sửa điểm
function editScore(id) {
    const scores = JSON.parse(localStorage.getItem('scores'));
    const score = scores.find(s => s.id === id);
    if (score) {
        document.getElementById('className').value = score.class;
        document.getElementById('studentId').value = score.studentId;
        document.getElementById('subject').value = score.subject;
        document.getElementById('scoreType').value = score.scoreType;
        document.getElementById('score').value = score.score;
        document.getElementById('date').value = score.date;
        
        // Thêm ID vào form để biết đang sửa điểm nào
        scoreForm.dataset.editId = id;
    }
}

// Cập nhật danh sách học sinh khi chọn lớp
document.getElementById('className').addEventListener('change', function(e) {
    const selectedClass = e.target.value;
    const studentSelect = document.getElementById('studentId');
    studentSelect.innerHTML = '<option value="">Chọn học sinh</option>';
    
    if (selectedClass) {
        // Lọc học sinh theo lớp
        const classStudents = users.students.filter(student => student.class === selectedClass);
        classStudents.forEach(student => {
            const option = document.createElement('option');
            option.value = student.username;
            option.textContent = student.fullName;
            studentSelect.appendChild(option);
        });
    }
});

// Load dữ liệu khi trang được tải
updateScoreTable(); 