/**
 * Class quản lý điểm số cho giáo viên
 */
class TeacherScores {
    constructor() {
        console.log('Khởi tạo TeacherScores');
        this.scores = [];
        this.students = [];
        this.classes = [];
        this.currentScoreId = null;
        
        // Đảm bảo rằng các phương thức có thể truy cập đến 'this'
        this.openAddScoreModal = this.openAddScoreModal.bind(this);
        this.openEditScoreModal = this.openEditScoreModal.bind(this);
        this.saveScore = this.saveScore.bind(this);
        this.deleteScore = this.deleteScore.bind(this);
        this.filterByClass = this.filterByClass.bind(this);
        this.closeModal = this.closeModal.bind(this);
        
        this.initializeScores();
    }

    initializeScores() {
        console.log('Khởi tạo dữ liệu điểm số');
        this.loadData();
        this.renderScoreTable();
        this.populateClassFilter();
        this.populateStudentDropdown();
        this.initializeEvents();
        
        // Tạo biến toàn cục để truy cập từ các sự kiện onclick trong HTML
        window.scoreManager = this;
        console.log('Đã tạo biến toàn cục scoreManager:', window.scoreManager);
    }

    loadData() {
        try {
            // Tải dữ liệu điểm số từ localStorage
            const scoresData = localStorage.getItem('scores');
            if (scoresData) {
                this.scores = JSON.parse(scoresData);
                console.log('Đã tải dữ liệu điểm số:', this.scores.length, 'bản ghi');
            } else {
                console.log('Không tìm thấy dữ liệu điểm số, sử dụng dữ liệu mẫu');
                this.loadSampleData();
            }

            // Tải dữ liệu học sinh từ localStorage
            const studentsData = localStorage.getItem('students');
            if (studentsData) {
                this.students = JSON.parse(studentsData);
                console.log('Đã tải dữ liệu học sinh:', this.students.length, 'học sinh');
                
                // Trích xuất danh sách lớp từ dữ liệu học sinh
                this.classes = [...new Set(this.students.map(student => student.class))];
                console.log('Danh sách lớp:', this.classes);
            } else {
                console.log('Không tìm thấy dữ liệu học sinh');
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            this.loadSampleData();
        }
    }

    loadSampleData() {
        // Dữ liệu mẫu nếu không có dữ liệu trong localStorage
        this.scores = [
            { id: 1, studentId: 'SV001', subject: 'Toán học', score: 8.5, date: '2023-05-15' },
            { id: 2, studentId: 'SV002', subject: 'Vật lý', score: 7.8, date: '2023-05-16' },
            { id: 3, studentId: 'SV003', subject: 'Hóa học', score: 9.0, date: '2023-05-17' },
            { id: 4, studentId: 'SV001', subject: 'Ngữ văn', score: 8.0, date: '2023-05-18' },
            { id: 5, studentId: 'SV004', subject: 'Tiếng Anh', score: 8.7, date: '2023-05-19' }
        ];
        
        // Lưu dữ liệu mẫu vào localStorage
        localStorage.setItem('scores', JSON.stringify(this.scores));
        console.log('Đã tạo và lưu dữ liệu điểm số mẫu');
    }

    renderScoreTable(classFilter = '') {
        const tableBody = document.getElementById('scoreTableBody');
        if (!tableBody) {
            console.error('Không tìm thấy bảng điểm số');
            return;
        }
        
        tableBody.innerHTML = '';
        
        // Lọc điểm số theo lớp nếu có bộ lọc
        let filteredScores = this.scores;
        if (classFilter) {
            const studentsInClass = this.students.filter(student => student.class === classFilter);
            const studentIdsInClass = studentsInClass.map(student => student.id);
            filteredScores = this.scores.filter(score => studentIdsInClass.includes(score.studentId));
        }
        
        if (filteredScores.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Không có dữ liệu điểm số</td></tr>`;
            return;
        }
        
        filteredScores.forEach(score => {
            const student = this.students.find(s => s.id === score.studentId);
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${score.id}</td>
                <td>${student ? student.fullName : 'N/A'}</td>
                <td>${student ? student.class : 'N/A'}</td>
                <td>${score.subject}</td>
                <td>${score.score}</td>
                <td>${score.date}</td>
                <td>
                    <button class="btn-edit" onclick="scoreManager.openEditScoreModal(${score.id})">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="btn-delete" onclick="scoreManager.deleteScore(${score.id})">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    populateClassFilter() {
        const classFilter = document.getElementById('classFilter');
        if (!classFilter) {
            console.error('Không tìm thấy bộ lọc lớp');
            return;
        }
        
        // Xóa các tùy chọn hiện tại
        classFilter.innerHTML = '<option value="">Tất cả các lớp</option>';
        
        // Thêm các lớp vào bộ lọc
        this.classes.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classFilter.appendChild(option);
        });
    }

    populateStudentDropdown() {
        const studentSelect = document.getElementById('studentId');
        if (!studentSelect) {
            console.error('Không tìm thấy dropdown học sinh');
            return;
        }
        
        // Xóa các tùy chọn hiện tại
        studentSelect.innerHTML = '<option value="">Chọn học sinh</option>';
        
        // Thêm học sinh vào dropdown
        this.students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.fullName} (${student.class})`;
            studentSelect.appendChild(option);
        });
    }

    initializeEvents() {
        // Bắt sự kiện thay đổi bộ lọc lớp
        const classFilter = document.getElementById('classFilter');
        if (classFilter) {
            classFilter.addEventListener('change', this.filterByClass);
        }
        
        // Bắt sự kiện nút thêm điểm số
        const addScoreBtn = document.getElementById('addScoreBtn');
        if (addScoreBtn) {
            addScoreBtn.addEventListener('click', this.openAddScoreModal);
        }
        
        // Bắt sự kiện nút lưu điểm số
        const saveScoreBtn = document.getElementById('saveScoreBtn');
        if (saveScoreBtn) {
            saveScoreBtn.addEventListener('click', this.saveScore);
        }
        
        // Bắt sự kiện đóng modal
        const closeModalBtns = document.querySelectorAll('.close-modal');
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', this.closeModal);
        });
        
        // Bắt sự kiện click bên ngoài modal để đóng
        const modal = document.getElementById('scoreModal');
        if (modal) {
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    this.closeModal();
                }
            });
        }
        
        // Thiết lập phím tắt Escape để đóng modal
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    filterByClass(event) {
        const classFilter = event.target.value;
        this.renderScoreTable(classFilter);
    }

    openAddScoreModal() {
        console.log('Mở modal thêm điểm số');
        this.currentScoreId = null;
        
        // Reset form
        const form = document.getElementById('scoreForm');
        if (form) {
            form.reset();
        }
        
        // Cập nhật tiêu đề modal
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = 'Thêm điểm số mới';
        }
        
        // Đặt ngày mặc định là hôm nay
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
        
        // Hiển thị modal
        const modal = document.getElementById('scoreModal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Focus vào dropdown học sinh
            setTimeout(() => {
                const studentSelect = document.getElementById('studentId');
                if (studentSelect) {
                    studentSelect.focus();
                }
            }, 100);
        } else {
            console.error('Không tìm thấy modal');
        }
    }

    openEditScoreModal(scoreId) {
        console.log('Mở modal sửa điểm số:', scoreId);
        this.currentScoreId = scoreId;
        
        // Tìm điểm số cần sửa
        const score = this.scores.find(s => s.id === scoreId);
        if (!score) {
            console.error('Không tìm thấy điểm số với ID:', scoreId);
            return;
        }
        
        // Điền thông tin vào form
        const studentIdSelect = document.getElementById('studentId');
        const subjectInput = document.getElementById('subject');
        const scoreInput = document.getElementById('score');
        const dateInput = document.getElementById('date');
        
        if (studentIdSelect) studentIdSelect.value = score.studentId;
        if (subjectInput) subjectInput.value = score.subject;
        if (scoreInput) scoreInput.value = score.score;
        if (dateInput) dateInput.value = score.date;
        
        // Cập nhật tiêu đề modal
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = 'Sửa điểm số';
        }
        
        // Hiển thị modal
        const modal = document.getElementById('scoreModal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Focus vào input môn học
            setTimeout(() => {
                if (subjectInput) {
                    subjectInput.focus();
                    subjectInput.select();
                }
            }, 100);
        } else {
            console.error('Không tìm thấy modal');
        }
    }
    
    closeModal() {
        const modal = document.getElementById('scoreModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    saveScore() {
        // Lấy dữ liệu từ form
        const studentId = document.getElementById('studentId').value;
        const subject = document.getElementById('subject').value;
        const scoreValue = document.getElementById('score').value;
        const date = document.getElementById('date').value;
        
        // Kiểm tra dữ liệu
        if (!studentId || !subject || !scoreValue || !date) {
            this.showNotification('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }
        
        const score = parseFloat(scoreValue);
        if (isNaN(score) || score < 0 || score > 10) {
            this.showNotification('Điểm số phải nằm trong khoảng từ 0 đến 10', 'error');
            return;
        }
        
        if (this.currentScoreId) {
            // Cập nhật điểm số hiện có
            const index = this.scores.findIndex(s => s.id === this.currentScoreId);
            if (index !== -1) {
                this.scores[index] = {
                    id: this.currentScoreId,
                    studentId,
                    subject,
                    score,
                    date
                };
                
                this.showNotification('Đã cập nhật điểm số thành công', 'success');
            }
        } else {
            // Thêm điểm số mới
            const newId = this.scores.length > 0 ? Math.max(...this.scores.map(s => s.id)) + 1 : 1;
            this.scores.push({
                id: newId,
                studentId,
                subject,
                score,
                date
            });
            
            this.showNotification('Đã thêm điểm số mới thành công', 'success');
        }
        
        // Lưu vào localStorage
        localStorage.setItem('scores', JSON.stringify(this.scores));
        
        // Cập nhật bảng điểm số
        this.renderScoreTable(document.getElementById('classFilter').value);
        
        // Đóng modal
        this.closeModal();
    }

    deleteScore(scoreId) {
        if (confirm('Bạn có chắc chắn muốn xóa điểm số này?')) {
            // Xóa điểm số
            this.scores = this.scores.filter(score => score.id !== scoreId);
            
            // Lưu vào localStorage
            localStorage.setItem('scores', JSON.stringify(this.scores));
            
            // Cập nhật bảng điểm số
            this.renderScoreTable(document.getElementById('classFilter').value);
            
            this.showNotification('Đã xóa điểm số thành công', 'success');
        }
    }
    
    showNotification(message, type = 'info') {
        // Kiểm tra xem phần tử thông báo đã tồn tại chưa
        let notification = document.getElementById('notification');
        
        if (!notification) {
            // Tạo phần tử thông báo nếu chưa tồn tại
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.right = '20px';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '4px';
            notification.style.color = 'white';
            notification.style.fontWeight = '500';
            notification.style.zIndex = '9999';
            notification.style.boxShadow = '0 3px 6px rgba(0,0,0,0.16)';
            notification.style.transform = 'translateY(100px)';
            notification.style.transition = 'transform 0.3s ease';
            document.body.appendChild(notification);
        }
        
        // Đặt màu sắc dựa trên loại thông báo
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#10b981';
                break;
            case 'error':
                notification.style.backgroundColor = '#ef4444';
                break;
            case 'warning':
                notification.style.backgroundColor = '#f59e0b';
                break;
            default:
                notification.style.backgroundColor = '#3b82f6';
        }
        
        // Đặt nội dung thông báo
        notification.textContent = message;
        
        // Hiển thị thông báo
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Ẩn thông báo sau 3 giây
        setTimeout(() => {
            notification.style.transform = 'translateY(100px)';
            
            // Xóa phần tử sau khi hoàn thành animation
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Khởi tạo quản lý điểm số khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM đã tải xong, khởi tạo TeacherScores');
    if (!window.scoreManager) {
        window.scoreManager = new TeacherScores();
    }
}); 