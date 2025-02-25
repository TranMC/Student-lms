/**
 * Class quản lý học sinh cho giáo viên
 */
class TeacherStudents {
    constructor() {
        console.log('TeacherStudents đã được khởi tạo');
        this.students = [];
        this.scores = [];
        this.initializeStudents();
    }

    async initializeStudents() {
        try {
            // Lấy dữ liệu từ localStorage
            this.loadData();
            
            // Khởi tạo bảng học sinh
            this.renderStudentTable();
            
            // Khởi tạo sự kiện
            this.initializeEvents();
        } catch (error) {
            console.error('Lỗi khởi tạo trang học sinh:', error);
        }
    }

    loadData() {
        // Lấy dữ liệu học sinh từ localStorage
        this.students = JSON.parse(localStorage.getItem('students') || '[]');
        console.log('Đã tải dữ liệu học sinh:', this.students);
        
        // Lấy dữ liệu điểm số từ localStorage
        this.scores = JSON.parse(localStorage.getItem('scores') || '[]');
        console.log('Đã tải dữ liệu điểm số:', this.scores);
    }

    renderStudentTable() {
        const tableBody = document.querySelector('#studentTable tbody');
        if (!tableBody) {
            console.error('Không tìm thấy bảng học sinh');
            return;
        }
        
        // Xóa dữ liệu cũ
        tableBody.innerHTML = '';
        
        // Lấy giá trị tìm kiếm
        const searchValue = document.getElementById('searchStudent')?.value?.toLowerCase() || '';
        
        // Lọc và hiển thị học sinh
        const filteredStudents = searchValue
            ? this.students.filter(student => 
                (student.fullName && student.fullName.toLowerCase().includes(searchValue)) ||
                (student.id && student.id.toLowerCase().includes(searchValue)) ||
                (student.class && student.class.toLowerCase().includes(searchValue))
            )
            : this.students;
        
        if (filteredStudents.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">Không có dữ liệu học sinh</td>
                </tr>
            `;
            return;
        }
        
        // Hiển thị học sinh
        filteredStudents.forEach(student => {
            // Tính điểm trung bình
            const studentScores = this.scores.filter(score => score.studentId === student.id);
            let averageScore = 0;
            if (studentScores.length > 0) {
                const totalScore = studentScores.reduce((sum, score) => sum + parseFloat(score.score), 0);
                averageScore = totalScore / studentScores.length;
            }
            
            // Xác định học loại
            const ranking = this.getRanking(averageScore);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.id || 'N/A'}</td>
                <td>${student.fullName || 'N/A'}</td>
                <td>${student.class || 'N/A'}</td>
                <td>${averageScore.toFixed(1)}</td>
                <td>${ranking}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    getRanking(average) {
        if (average >= 8.5) return 'Xuất sắc';
        if (average >= 7.0) return 'Giỏi';
        if (average >= 6.5) return 'Khá';
        if (average >= 5.0) return 'Trung bình';
        return 'Yếu';
    }

    initializeEvents() {
        // Sự kiện tìm kiếm
        const searchInput = document.getElementById('searchStudent');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderStudentTable();
            });
        }
    }
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xem đã có instance chưa
    if (!window.studentsInstance) {
        window.studentsInstance = new TeacherStudents();
    }
}); 