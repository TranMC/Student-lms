class StudentProfile extends BaseComponent {
    constructor(auth, dataService) {
        super(auth, dataService);
        this.init();
    }

    init() {
        if (!this.student) {
            console.error('Không tìm thấy thông tin học sinh');
            return;
        }
        this.loadProfile();
        this.loadAcademicInfo();
        this.setupEventListeners();
    }

    loadProfile() {
        try {
            // Thông tin cơ bản
            document.getElementById('studentFullName').textContent = this.student.fullName || '';
            document.getElementById('studentFullNameInfo').textContent = this.student.fullName || '';
            document.getElementById('studentId').textContent = `Mã học sinh: ${this.student.studentId || ''}`;
            document.getElementById('studentBirthday').textContent = this.formatDate(this.student.birthday) || '';
            document.getElementById('studentGender').textContent = this.student.gender || '';
            document.getElementById('studentClass').textContent = this.student.class || '';
            document.getElementById('studentYear').textContent = this.student.academicYear || '';
            document.getElementById('studentGrade').textContent = this.student.grade || '';

            // Thông tin liên hệ
            document.getElementById('studentEmail').textContent = this.student.email || '';
            document.getElementById('studentPhone').textContent = this.student.phone || '';
            document.getElementById('studentAddress').textContent = this.student.address || '';

            // Thông tin gia đình
            document.getElementById('parentName').textContent = this.student.parentName || '';
            document.getElementById('parentPhone').textContent = this.student.parentPhone || '';
            document.getElementById('parentEmail').textContent = this.student.parentEmail || '';
        } catch (error) {
            console.error('Lỗi khi load thông tin profile:', error);
        }
    }

    loadAcademicInfo() {
        try {
            const scores = this.dataService.getRecentScores(this.student.studentId);
            
            // Tính điểm trung bình học kỳ
            const semester1Scores = scores.filter(score => score.semester === 1);
            const semester2Scores = scores.filter(score => score.semester === 2);

            const gpa1 = this.calculateGPA(semester1Scores);
            const gpa2 = this.calculateGPA(semester2Scores);
            const gpaYear = (gpa1 + gpa2) / 2;

            // Cập nhật UI
            document.getElementById('gpa1').textContent = gpa1.toFixed(2);
            document.getElementById('gpa2').textContent = gpa2.toFixed(2);
            document.getElementById('gpaYear').textContent = gpaYear.toFixed(2);
            document.getElementById('academicRank').textContent = this.getAcademicRank(gpaYear);
            document.getElementById('conductRank').textContent = this.student.conduct || 'Tốt';
        } catch (error) {
            console.error('Lỗi khi load thông tin học tập:', error);
        }
    }

    setupEventListeners() {
        // Lắng nghe sự kiện cho các nút
        const editBtn = document.querySelector('button[onclick="studentProfile.editProfile()"]');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.editProfile());
        }

        const changePasswordBtn = document.querySelector('button[onclick="studentProfile.changePassword()"]');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.changePassword());
        }

        const printBtn = document.querySelector('button[onclick="studentProfile.printProfile()"]');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printProfile());
        }
    }

    editProfile() {
        const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
        if (!modal) {
            console.error('Không tìm thấy modal');
            return;
        }

        // Điền thông tin hiện tại vào form
        document.getElementById('editEmail').value = this.student.email || '';
        document.getElementById('editPhone').value = this.student.phone || '';
        document.getElementById('editAddress').value = this.student.address || '';
        document.getElementById('editParentName').value = this.student.parentName || '';
        document.getElementById('editParentPhone').value = this.student.parentPhone || '';
        document.getElementById('editParentEmail').value = this.student.parentEmail || '';

        modal.show();
    }

    async saveProfile() {
        // Lấy thông tin từ form
        const updatedInfo = {
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value,
            address: document.getElementById('editAddress').value,
            parentName: document.getElementById('editParentName').value,
            parentPhone: document.getElementById('editParentPhone').value,
            parentEmail: document.getElementById('editParentEmail').value
        };

        try {
            // Cập nhật thông tin học sinh
            this.student = { ...this.student, ...updatedInfo };
            localStorage.setItem('currentStudent', JSON.stringify(this.student));

            // Cập nhật trong danh sách học sinh
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            const index = students.findIndex(s => s.studentId === this.student.studentId);
            if (index !== -1) {
                students[index] = { ...students[index], ...updatedInfo };
                localStorage.setItem('students', JSON.stringify(students));
            }

            // Cập nhật hiển thị
            this.loadProfile();
            bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
            this.showToast('Cập nhật thông tin thành công!', 'success');
        } catch (error) {
            this.showToast('Lỗi khi cập nhật thông tin!', 'error');
            console.error('Lỗi:', error);
        }
    }

    async changePassword() {
        const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
        modal.show();
    }

    async savePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Kiểm tra mật khẩu
        if (!this.validatePassword(currentPassword, newPassword, confirmPassword)) {
            return;
        }

        try {
            // Cập nhật mật khẩu
            this.student.password = newPassword;
            localStorage.setItem('currentStudent', JSON.stringify(this.student));

            // Cập nhật trong danh sách học sinh
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            const index = students.findIndex(s => s.studentId === this.student.studentId);
            if (index !== -1) {
                students[index].password = newPassword;
                localStorage.setItem('students', JSON.stringify(students));
            }

            bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
            this.showToast('Đổi mật khẩu thành công!', 'success');
        } catch (error) {
            this.showToast('Lỗi khi đổi mật khẩu!', 'error');
            console.error('Lỗi:', error);
        }
    }

    printProfile() {
        // Tạo template in
        const printContent = document.getElementById('printTemplate').cloneNode(true);
        printContent.style.display = 'block';
        
        // Thêm nội dung
        const content = `
            <div class="student-info">
                <h4>THÔNG TIN CÁ NHÂN</h4>
                <table class="print-table">
                    <tr>
                        <td><strong>Họ và tên:</strong> ${this.student.fullName}</td>
                        <td><strong>Mã học sinh:</strong> ${this.student.studentId}</td>
                    </tr>
                    <tr>
                        <td><strong>Ngày sinh:</strong> ${this.formatDate(this.student.birthday)}</td>
                        <td><strong>Giới tính:</strong> ${this.student.gender || ''}</td>
                    </tr>
                    <tr>
                        <td><strong>Lớp:</strong> ${this.student.class}</td>
                        <td><strong>Niên khóa:</strong> ${this.student.academicYear || ''}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>Địa chỉ:</strong> ${this.student.address || ''}</td>
                    </tr>
                </table>

                <h4>THÔNG TIN LIÊN HỆ</h4>
                <table class="print-table">
                    <tr>
                        <td><strong>Email:</strong> ${this.student.email || ''}</td>
                        <td><strong>Số điện thoại:</strong> ${this.student.phone || ''}</td>
                    </tr>
                </table>

                <h4>THÔNG TIN PHỤ HUYNH</h4>
                <table class="print-table">
                    <tr>
                        <td><strong>Họ tên phụ huynh:</strong> ${this.student.parentName || ''}</td>
                        <td><strong>Số điện thoại:</strong> ${this.student.parentPhone || ''}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>Email:</strong> ${this.student.parentEmail || ''}</td>
                    </tr>
                </table>

                <h4>KẾT QUẢ HỌC TẬP</h4>
                <table class="print-table">
                    <tr>
                        <td><strong>Điểm TB HK1:</strong> ${document.getElementById('gpa1').textContent}</td>
                        <td><strong>Điểm TB HK2:</strong> ${document.getElementById('gpa2').textContent}</td>
                        <td><strong>Điểm TB năm:</strong> ${document.getElementById('gpaYear').textContent}</td>
                    </tr>
                    <tr>
                        <td><strong>Xếp loại:</strong> ${document.getElementById('academicRank').textContent}</td>
                        <td><strong>Hạnh kiểm:</strong> ${document.getElementById('conductRank').textContent}</td>
                        <td></td>
                    </tr>
                </table>
            </div>
        `;
        
        printContent.querySelector('.print-profile').insertAdjacentHTML('beforeend', content);
        
        // Tạo iframe để in
        const printFrame = document.createElement('iframe');
        printFrame.style.display = 'none';
        document.body.appendChild(printFrame);
        
        printFrame.contentDocument.write(`
            <html>
                <head>
                    <title>Hồ sơ học sinh - ${this.student.fullName}</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .print-profile { padding: 20px; }
                        .school-info { text-align: center; margin-bottom: 30px; }
                        .print-table { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
                        .print-table td { padding: 8px; border: 1px solid #ddd; }
                        h4 { margin: 20px 0 10px; color: #007bff; }
                    </style>
                </head>
                <body>
                    ${printContent.outerHTML}
                </body>
            </html>
        `);
        
        printFrame.contentWindow.print();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(printFrame);
        }, 100);
    }

    // Helper methods
    calculateGPA(scores) {
        if (!scores || scores.length === 0) return 0;
        return scores.reduce((sum, score) => sum + parseFloat(score.score), 0) / scores.length;
    }

    getAcademicRank(gpa) {
        if (gpa >= 8.5) return 'Giỏi';
        if (gpa >= 7.0) return 'Khá';
        if (gpa >= 5.0) return 'Trung bình';
        return 'Yếu';
    }

    formatDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    }

    validatePassword(current, newPass, confirm) {
        if (current !== this.student.password) {
            this.showToast('Mật khẩu hiện tại không đúng!', 'error');
            return false;
        }
        if (newPass.length < 6) {
            this.showToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
            return false;
        }
        if (newPass !== confirm) {
            this.showToast('Mật khẩu mới không khớp!', 'error');
            return false;
        }
        return true;
    }
}

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    const auth = new AuthService();
    if (auth.checkStudentAuth() && window.location.hash === '#profile') {
        window.studentProfile = new StudentProfile(auth, new DataService());
    }
});