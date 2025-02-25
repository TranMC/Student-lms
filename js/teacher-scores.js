/**
 * Class quản lý điểm số cho giáo viên
 */
class TeacherScores {
    constructor() {
        console.log('TeacherScores đã được khởi tạo');
        this.scores = [];
        this.students = [];
        this.currentScoreId = null;
        this.initializeScores();
    }

    async initializeScores() {
        try {
            // Lấy dữ liệu từ localStorage
            this.loadData();
            
            // Khởi tạo bảng điểm
            this.renderScoreTable();
            
            // Khởi tạo dropdown học sinh
            this.populateStudentSelect();
            
            // Khởi tạo sự kiện
            this.initializeEvents();
            
            // Đặt ngày mặc định là hôm nay
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('scoreDate').value = today;
        } catch (error) {
            console.error('Lỗi khởi tạo trang điểm số:', error);
        }
    }

    loadData() {
        // Lấy dữ liệu điểm số từ localStorage
        this.scores = JSON.parse(localStorage.getItem('scores') || '[]');
        console.log('Đã tải dữ liệu điểm số:', this.scores);
        
        // Lấy dữ liệu học sinh từ localStorage
        this.students = JSON.parse(localStorage.getItem('students') || '[]');
        console.log('Đã tải dữ liệu học sinh:', this.students);
    }

    renderScoreTable() {
        const tableBody = document.querySelector('#scoreTable tbody');
        if (!tableBody) {
            console.error('Không tìm thấy bảng điểm');
            return;
        }
        
        // Xóa dữ liệu cũ
        tableBody.innerHTML = '';
        
        // Lấy giá trị lọc lớp
        const classFilter = document.getElementById('classFilter')?.value || '';
        
        // Lọc điểm số theo lớp nếu có
        const filteredScores = classFilter
            ? this.scores.filter(score => {
                const student = this.students.find(s => s.id === score.studentId);
                return student && student.class === classFilter;
            })
            : this.scores;
        
        if (filteredScores.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">Không có dữ liệu điểm số</td>
                </tr>
            `;
            return;
        }
        
        // Hiển thị điểm số
        filteredScores.forEach(score => {
            const student = this.students.find(s => s.id === score.studentId) || { id: 'N/A', fullName: 'Không xác định', class: 'N/A' };
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id}</td>
                <td>${student.fullName}</td>
                <td>${student.class}</td>
                <td>${score.subject}</td>
                <td>${score.type}</td>
                <td>${score.score}</td>
                <td>${score.date}</td>
                <td>
                    <button class="btn-edit" onclick="scoreManager.openEditScoreModal('${score.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="scoreManager.deleteScore('${score.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    populateStudentSelect() {
        const studentSelect = document.getElementById('studentSelect');
        if (!studentSelect) {
            console.error('Không tìm thấy dropdown học sinh');
            return;
        }
        
        // Xóa các option cũ trừ option đầu tiên
        while (studentSelect.options.length > 1) {
            studentSelect.remove(1);
        }
        
        // Thêm học sinh vào dropdown
        this.students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.fullName} (${student.class})`;
            studentSelect.appendChild(option);
        });
    }

    initializeEvents() {
        // Sự kiện lọc lớp
        const classFilter = document.getElementById('classFilter');
        if (classFilter) {
            classFilter.addEventListener('change', () => {
                this.renderScoreTable();
            });
        }
        
        // Sự kiện submit form
        const scoreForm = document.getElementById('scoreForm');
        if (scoreForm) {
            scoreForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveScore();
            });
        }
        
        // Sự kiện đóng modal
        const closeBtn = document.querySelector('.modal .close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }
    }

    openAddScoreModal() {
        // Reset form
        document.getElementById('scoreForm').reset();
        document.getElementById('scoreId').value = '';
        document.getElementById('modalTitle').textContent = 'Thêm Điểm Mới';
        this.currentScoreId = null;
        
        // Đặt ngày mặc định là hôm nay
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('scoreDate').value = today;
        
        // Hiển thị modal
        document.getElementById('scoreModal').style.display = 'block';
    }

    openEditScoreModal(scoreId) {
        const score = this.scores.find(s => s.id === scoreId);
        if (!score) {
            console.error('Không tìm thấy điểm số với ID:', scoreId);
            return;
        }
        
        // Cập nhật tiêu đề modal
        document.getElementById('modalTitle').textContent = 'Chỉnh Sửa Điểm';
        
        // Lưu ID điểm số hiện tại
        this.currentScoreId = scoreId;
        document.getElementById('scoreId').value = scoreId;
        
        // Điền dữ liệu vào form
        document.getElementById('studentSelect').value = score.studentId;
        document.getElementById('subject').value = score.subject;
        document.getElementById('scoreType').value = score.type;
        document.getElementById('scoreValue').value = score.score;
        document.getElementById('scoreDate').value = score.date;
        
        // Hiển thị modal
        document.getElementById('scoreModal').style.display = 'block';
    }

    saveScore() {
        // Lấy dữ liệu từ form
        const scoreId = this.currentScoreId || `score_${Date.now()}`;
        const studentId = document.getElementById('studentSelect').value;
        const subject = document.getElementById('subject').value;
        const type = document.getElementById('scoreType').value;
        const score = document.getElementById('scoreValue').value;
        const date = document.getElementById('scoreDate').value;
        
        // Tạo đối tượng điểm số
        const scoreData = {
            id: scoreId,
            studentId,
            subject,
            type,
            score,
            date
        };
        
        // Cập nhật hoặc thêm mới điểm số
        if (this.currentScoreId) {
            // Cập nhật điểm số hiện có
            const index = this.scores.findIndex(s => s.id === this.currentScoreId);
            if (index !== -1) {
                this.scores[index] = scoreData;
            }
        } else {
            // Thêm điểm số mới
            this.scores.push(scoreData);
        }
        
        // Lưu vào localStorage
        localStorage.setItem('scores', JSON.stringify(this.scores));
        
        // Cập nhật bảng điểm
        this.renderScoreTable();
        
        // Đóng modal
        this.closeModal();
    }

    deleteScore(scoreId) {
        if (confirm('Bạn có chắc chắn muốn xóa điểm số này?')) {
            // Xóa điểm số
            this.scores = this.scores.filter(score => score.id !== scoreId);
            
            // Lưu vào localStorage
            localStorage.setItem('scores', JSON.stringify(this.scores));
            
            // Cập nhật bảng điểm
            this.renderScoreTable();
        }
    }

    closeModal() {
        document.getElementById('scoreModal').style.display = 'none';
        this.currentScoreId = null;
    }
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xem đã có instance chưa
    if (!window.scoreManager) {
        window.scoreManager = new TeacherScores();
    }
}); 