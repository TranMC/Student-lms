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
        if (!score) {
            NotificationManager.showToast('Không tìm thấy thông tin điểm số', 'error');
            return;
        }

        document.getElementById('modalTitle').textContent = 'Sửa Điểm';
        document.getElementById('scoreId').value = score.id;
        document.getElementById('studentSelect').value = score.studentId;
        document.getElementById('subject').value = score.subject;
        document.getElementById('scoreType').value = score.type;
        document.getElementById('scoreValue').value = score.score;
        document.getElementById('scoreDate').value = score.date.split('T')[0];

        document.getElementById('scoreModal').style.display = 'block';
    }

    validateScoreData(scoreData) {
        // Kiểm tra học sinh
        if (!scoreData.studentId) {
            NotificationManager.showToast('Vui lòng chọn học sinh', 'error');
            return false;
        }

        // Kiểm tra môn học
        if (!scoreData.subject) {
            NotificationManager.showToast('Vui lòng chọn môn học', 'error');
            return false;
        }

        // Kiểm tra loại điểm
        if (!scoreData.type) {
            NotificationManager.showToast('Vui lòng chọn loại điểm', 'error');
            return false;
        }

        // Kiểm tra giá trị điểm
        const score = parseFloat(scoreData.score);
        if (isNaN(score) || score < 0 || score > 10) {
            NotificationManager.showToast('Điểm số phải từ 0 đến 10', 'error');
            return false;
        }

        // Kiểm tra ngày
        if (!scoreData.date) {
            NotificationManager.showToast('Vui lòng chọn ngày nhập điểm', 'error');
            return false;
        }

        return true;
    }

    saveScore() {
        const scoreId = document.getElementById('scoreId')?.value || Date.now().toString();
        const studentId = document.getElementById('studentSelect').value;
        const subject = document.getElementById('subject').value;
        const type = document.getElementById('scoreType').value;
        const score = document.getElementById('scoreValue').value;
        const date = document.getElementById('scoreDate').value;

        const scoreData = {
            id: scoreId,
            studentId,
            subject,
            type,
            score: parseFloat(score),
            date
        };

        // Validate dữ liệu
        if (!this.validateScoreData(scoreData)) {
            return;
        }

        // Xác nhận trước khi lưu
        NotificationManager.showConfirmPopup(
            'Xác nhận lưu điểm',
            'Bạn có chắc chắn muốn lưu thông tin điểm này?',
            () => {
                const scores = JSON.parse(localStorage.getItem('scores') || '[]');
                const existingIndex = scores.findIndex(s => s.id === scoreId);

                if (existingIndex >= 0) {
                    scores[existingIndex] = scoreData;
                } else {
                    scores.push(scoreData);
                }

                localStorage.setItem('scores', JSON.stringify(scores));
                this.closeModal();
                this.loadScores();
                NotificationManager.showToast('Đã lưu điểm thành công', 'success');
            }
        );
    }

    deleteScore(scoreId) {
        NotificationManager.showConfirmPopup(
            'Xác nhận xóa điểm',
            'Bạn có chắc chắn muốn xóa điểm này? Hành động này không thể hoàn tác.',
            () => {
                const scores = JSON.parse(localStorage.getItem('scores') || '[]');
                const filteredScores = scores.filter(s => s.id !== scoreId);
                localStorage.setItem('scores', JSON.stringify(filteredScores));
                
                this.loadScores();
                NotificationManager.showToast('Đã xóa điểm thành công', 'success');
            }
        );
    }

    closeModal() {
        document.getElementById('scoreModal').style.display = 'none';
    }
}

// Khởi tạo quản lý điểm
let scoreManager;
document.addEventListener('DOMContentLoaded', () => {
    scoreManager = new ScoreManager();
    window.scoreManager = scoreManager;
}); 