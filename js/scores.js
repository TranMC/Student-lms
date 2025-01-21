class ScoreManager {
    constructor() {
        this.initializeScores();
        this.setupEventListeners();
        this.loadStudentsForScoring();
        this.loadScores();
    }

    initializeScores() {
        if (!localStorage.getItem('scores')) {
            localStorage.setItem('scores', JSON.stringify([]));
        }
    }

    setupEventListeners() {
        // Lọc học sinh theo lớp
        document.getElementById('classFilter')?.addEventListener('change', () => {
            this.loadStudentsForScoring();
        });

        // Form nhập điểm
        document.getElementById('scoreForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveScore();
        });

        // Đóng modal
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
    }

    loadStudentsForScoring() {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const classFilter = document.getElementById('classFilter')?.value;
        
        const filteredStudents = classFilter 
            ? students.filter(student => student.class === classFilter)
            : students;

        const studentSelect = document.getElementById('studentSelect');
        if (studentSelect) {
            studentSelect.innerHTML = `
                <option value="">Chọn học sinh</option>
                ${filteredStudents.map(student => `
                    <option value="${student.studentId}">
                        ${student.studentId} - ${student.fullName} - ${student.class}
                    </option>
                `).join('')}
            `;
        }
    }

    loadScores() {
        const scores = JSON.parse(localStorage.getItem('scores') || '[]');
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const tbody = document.querySelector('#scoreTable tbody');
        if (!tbody) return;

        // Sắp xếp điểm theo ngày mới nhất
        const sortedScores = scores.sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedScores.map(score => {
            const student = students.find(s => s.studentId === score.studentId);
            if (!student) return ''; // Bỏ qua nếu không tìm thấy học sinh

            return `
                <tr>
                    <td>${student.studentId}</td>
                    <td>${student.fullName}</td>
                    <td>${student.class}</td>
                    <td>${score.subject}</td>
                    <td>${score.type}</td>
                    <td>${score.score}</td>
                    <td>${new Date(score.date).toLocaleDateString('vi-VN')}</td>
                    <td>
                        <button class="btn btn-edit" onclick="scoreManager.editScore('${score.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-delete" onclick="scoreManager.deleteScore('${score.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    openAddScoreModal() {
        document.getElementById('modalTitle').textContent = 'Thêm Điểm Mới';
        document.getElementById('scoreForm').reset();
        document.getElementById('scoreModal').style.display = 'block';
        this.loadStudentsForScoring();
    }

    editScore(scoreId) {
        const scores = JSON.parse(localStorage.getItem('scores') || '[]');
        const score = scores.find(s => s.id === scoreId);
        if (!score) return;

        document.getElementById('modalTitle').textContent = 'Sửa Điểm';
        document.getElementById('scoreId').value = score.id;
        document.getElementById('studentSelect').value = score.studentId;
        document.getElementById('subject').value = score.subject;
        document.getElementById('scoreType').value = score.type;
        document.getElementById('scoreValue').value = score.score;
        document.getElementById('scoreDate').value = score.date.split('T')[0];

        document.getElementById('scoreModal').style.display = 'block';
    }

    saveScore() {
        const scoreId = document.getElementById('scoreId')?.value || Date.now().toString();
        const scores = JSON.parse(localStorage.getItem('scores') || '[]');
        const studentId = document.getElementById('studentSelect').value;
        const scoreValue = parseFloat(document.getElementById('scoreValue').value);

        // Kiểm tra học sinh có tồn tại
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const student = students.find(s => s.studentId === studentId);
        if (!student) {
            alert('Học sinh không tồn tại!');
            return;
        }

        // Validate điểm số
        if (scoreValue < 0 || scoreValue > 10) {
            alert('Điểm số phải từ 0 đến 10!');
            return;
        }

        const scoreData = {
            id: scoreId,
            studentId: studentId,
            studentName: student.fullName, // Thêm tên học sinh
            class: student.class, // Thêm lớp
            subject: document.getElementById('subject').value,
            type: document.getElementById('scoreType').value,
            score: scoreValue,
            date: document.getElementById('scoreDate').value
        };

        const existingIndex = scores.findIndex(s => s.id === scoreId);
        if (existingIndex >= 0) {
            scores[existingIndex] = scoreData;
        } else {
            scores.push(scoreData);
        }

        localStorage.setItem('scores', JSON.stringify(scores));
        this.closeModal();
        this.loadScores();

        // Cập nhật tất cả các trang
        if (window.navigationInstance) {
            window.navigationInstance.refreshAllPages();
        }
    }

    deleteScore(scoreId) {
        if (!confirm('Bạn có chắc chắn muốn xóa điểm này?')) return;

        const scores = JSON.parse(localStorage.getItem('scores') || '[]');
        const filteredScores = scores.filter(s => s.id !== scoreId);
        localStorage.setItem('scores', JSON.stringify(filteredScores));
        
        this.loadScores();

        // Cập nhật tất cả các trang
        if (window.navigationInstance) {
            window.navigationInstance.refreshAllPages();
        }
    }

    closeModal() {
        document.getElementById('scoreModal').style.display = 'none';
    }

    validateScore(score) {
        return score >= 0 && score <= 10;
    }
}

// Khởi tạo quản lý điểm
let scoreManager;
document.addEventListener('DOMContentLoaded', () => {
    scoreManager = new ScoreManager();
    window.scoreManager = scoreManager;
}); 