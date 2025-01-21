class StudentManager {
    constructor() {
        this.initializeStudents();
        this.setupEventListeners();
        this.loadStudents();
    }

    initializeStudents() {
        if (!localStorage.getItem('students')) {
            localStorage.setItem('students', JSON.stringify([]));
        }
    }

    setupEventListeners() {
        // Tìm kiếm học sinh
        document.getElementById('searchStudent')?.addEventListener('input', (e) => {
            this.filterStudents(e.target.value, document.getElementById('classFilter').value);
        });

        // Lọc theo lớp
        document.getElementById('classFilter')?.addEventListener('change', (e) => {
            this.filterStudents(document.getElementById('searchStudent').value, e.target.value);
        });

        // Form thêm/sửa học sinh
        document.getElementById('studentForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStudent();
        });

        // Đóng modal
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
    }

    loadStudents() {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const tbody = document.querySelector('#studentTable tbody');
        if (!tbody) return;

        tbody.innerHTML = students.map(student => `
            <tr>
                <td>${student.studentId}</td>
                <td>${student.fullName}</td>
                <td>${student.class}</td>
                <td>${this.calculateAverage(student.studentId)}</td>
                <td>${this.getGradeLevel(this.calculateAverage(student.studentId))}</td>
                <td>
                    <button class="btn btn-edit" onclick="studentManager.editStudent('${student.studentId}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete" onclick="studentManager.deleteStudent('${student.studentId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    calculateAverage(studentId) {
        const scores = JSON.parse(localStorage.getItem('scores') || '[]');
        const studentScores = scores.filter(score => score.studentId === studentId);
        
        if (studentScores.length === 0) return 0;

        // Tính điểm theo trọng số
        const weightedScores = studentScores.map(score => {
            let weight = 1;
            switch(score.type) {
                case 'Miệng': weight = 1; break;
                case '15 phút': weight = 1; break;
                case '1 tiết': weight = 2; break;
                case 'Giữa kỳ': weight = 2; break;
                case 'Cuối kỳ': weight = 3; break;
                default: weight = 1;
            }
            return { score: parseFloat(score.score), weight };
        });

        const totalWeight = weightedScores.reduce((sum, item) => sum + item.weight, 0);
        const weightedSum = weightedScores.reduce((sum, item) => sum + (item.score * item.weight), 0);

        return (weightedSum / totalWeight).toFixed(1);
    }

    getGradeLevel(average) {
        if (average >= 8.5) return 'Giỏi';
        if (average >= 7.0) return 'Khá';
        if (average >= 5.0) return 'Trung bình';
        return 'Yếu';
    }

    filterStudents(searchText, classFilter) {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const filtered = students.filter(student => {
            const matchSearch = student.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
                              student.studentId.toLowerCase().includes(searchText.toLowerCase());
            const matchClass = !classFilter || student.class === classFilter;
            return matchSearch && matchClass;
        });

        const tbody = document.querySelector('#studentTable tbody');
        if (!tbody) return;

        tbody.innerHTML = filtered.map(student => `
            <tr>
                <td>${student.studentId}</td>
                <td>${student.fullName}</td>
                <td>${student.class}</td>
                <td>${this.calculateAverage(student.studentId)}</td>
                <td>${this.getGradeLevel(this.calculateAverage(student.studentId))}</td>
                <td>
                    <button class="btn btn-edit" onclick="studentManager.editStudent('${student.studentId}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete" onclick="studentManager.deleteStudent('${student.studentId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    openAddStudentModal() {
        document.getElementById('modalTitle').textContent = 'Thêm Học Sinh Mới';
        document.getElementById('studentForm').reset();
        document.getElementById('studentId').disabled = false;
        document.getElementById('studentModal').style.display = 'block';
    }

    editStudent(studentId) {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const student = students.find(s => s.studentId === studentId);
        if (!student) return;

        document.getElementById('modalTitle').textContent = 'Sửa Thông Tin Học Sinh';
        document.getElementById('studentId').value = student.studentId;
        document.getElementById('studentId').disabled = true;
        document.getElementById('fullName').value = student.fullName;
        document.getElementById('class').value = student.class;
        document.getElementById('username').value = student.username;
        document.getElementById('email').value = student.email;
        document.getElementById('phone').value = student.phone || '';
        
        document.getElementById('studentModal').style.display = 'block';
    }

    saveStudent() {
        const studentId = document.getElementById('studentId').value;
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        
        const studentData = {
            studentId: studentId,
            fullName: document.getElementById('fullName').value,
            class: document.getElementById('class').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };

        const existingIndex = students.findIndex(s => s.studentId === studentId);
        if (existingIndex >= 0) {
            // Cập nhật học sinh
            students[existingIndex] = {...students[existingIndex], ...studentData};
        } else {
            // Thêm học sinh mới
            students.push(studentData);
        }

        localStorage.setItem('students', JSON.stringify(students));
        this.closeModal();
        this.loadStudents();

        // Cập nhật tất cả các trang
        if (window.navigationInstance) {
            window.navigationInstance.refreshAllPages();
        }
    }

    deleteStudent(studentId) {
        if (!confirm('Bạn có chắc chắn muốn xóa học sinh này? Tất cả điểm của học sinh này cũng sẽ bị xóa.')) return;

        // Xóa học sinh
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const filteredStudents = students.filter(s => s.studentId !== studentId);
        localStorage.setItem('students', JSON.stringify(filteredStudents));

        // Xóa tất cả điểm của học sinh
        const scores = JSON.parse(localStorage.getItem('scores') || '[]');
        const filteredScores = scores.filter(s => s.studentId !== studentId);
        localStorage.setItem('scores', JSON.stringify(filteredScores));

        this.loadStudents();
        
        // Cập nhật tất cả các trang
        if (window.navigationInstance) {
            window.navigationInstance.refreshAllPages();
        }
    }

    closeModal() {
        document.getElementById('studentModal').style.display = 'none';
    }
}

// Khởi tạo quản lý học sinh
let studentManager;
document.addEventListener('DOMContentLoaded', () => {
    studentManager = new StudentManager();
    window.studentManager = studentManager; // Để có thể truy cập từ onclick
    window.openAddStudentModal = () => studentManager.openAddStudentModal();
    window.closeModal = () => studentManager.closeModal();
}); 