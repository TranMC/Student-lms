// Kiểm tra đăng nhập
const teacher = checkTeacherAuth();

// Khởi tạo localStorage nếu chưa có
if (!localStorage.getItem('students')) {
    localStorage.setItem('students', JSON.stringify([]));
}

// Elements
const modal = document.getElementById('studentModal');
const studentForm = document.getElementById('studentForm');
const searchInput = document.getElementById('searchStudent');
const classFilter = document.getElementById('classFilter');

// Hàm mở modal thêm học sinh
function openAddStudentModal() {
    document.getElementById('modalTitle').textContent = 'Thêm Học Sinh Mới';
    studentForm.reset();
    modal.style.display = 'block';
}

// Hàm đóng modal
function closeModal() {
    modal.style.display = 'none';
}

// Đóng modal khi click bên ngoài
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

// Xử lý thêm/sửa học sinh
studentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const studentData = {
        id: document.getElementById('studentId').value,
        fullName: document.getElementById('fullName').value,
        class: document.getElementById('class').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };

    const students = JSON.parse(localStorage.getItem('students'));
    const existingIndex = students.findIndex(s => s.id === studentData.id);

    if (existingIndex >= 0) {
        // Cập nhật học sinh
        students[existingIndex] = studentData;
    } else {
        // Thêm học sinh mới
        students.push(studentData);
    }

    localStorage.setItem('students', JSON.stringify(students));
    updateStudentTable();
    closeModal();
});

// Hàm tính điểm trung bình
function calculateAverage(studentId) {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    const studentScores = scores.filter(score => score.studentId === studentId);
    
    if (studentScores.length === 0) return 0;
    
    const total = studentScores.reduce((sum, score) => sum + parseFloat(score.score), 0);
    return (total / studentScores.length).toFixed(2);
}

// Hàm xác định xếp loại
function getGrade(average) {
    if (average >= 8.5) return 'Giỏi';
    if (average >= 7.0) return 'Khá';
    if (average >= 5.0) return 'Trung bình';
    return 'Yếu';
}

// Hàm cập nhật bảng học sinh
function updateStudentTable() {
    const students = JSON.parse(localStorage.getItem('students'));
    const tbody = document.getElementById('studentTable').querySelector('tbody');
    const searchTerm = searchInput.value.toLowerCase();
    const selectedClass = classFilter.value;

    tbody.innerHTML = '';

    students.filter(student => {
        const matchSearch = student.fullName.toLowerCase().includes(searchTerm) ||
                          student.id.toLowerCase().includes(searchTerm);
        const matchClass = !selectedClass || student.class === selectedClass;
        return matchSearch && matchClass;
    }).forEach(student => {
        const average = calculateAverage(student.id);
        const grade = getGrade(average);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.fullName}</td>
            <td>${student.class}</td>
            <td>${average}</td>
            <td><span class="grade ${grade.toLowerCase()}">${grade}</span></td>
            <td>
                <button onclick="editStudent('${student.id}')" class="btn btn-small btn-primary">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteStudent('${student.id}')" class="btn btn-small btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
                <button onclick="viewDetails('${student.id}')" class="btn btn-small btn-info">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Hàm sửa học sinh
function editStudent(id) {
    const students = JSON.parse(localStorage.getItem('students'));
    const student = students.find(s => s.id === id);
    
    if (student) {
        document.getElementById('modalTitle').textContent = 'Sửa Thông Tin Học Sinh';
        document.getElementById('studentId').value = student.id;
        document.getElementById('fullName').value = student.fullName;
        document.getElementById('class').value = student.class;
        document.getElementById('email').value = student.email;
        document.getElementById('phone').value = student.phone;
        
        modal.style.display = 'block';
    }
}

// Hàm xóa học sinh
function deleteStudent(id) {
    if (confirm('Bạn có chắc muốn xóa học sinh này?')) {
        const students = JSON.parse(localStorage.getItem('students'));
        const newStudents = students.filter(student => student.id !== id);
        localStorage.setItem('students', JSON.stringify(newStudents));
        updateStudentTable();
    }
}

// Xử lý tìm kiếm
searchInput.addEventListener('input', updateStudentTable);
classFilter.addEventListener('change', updateStudentTable);

// Load dữ liệu ban đầu
updateStudentTable(); 