class StudentProfile extends BaseComponent {
    constructor() {
        super();
        this.student = JSON.parse(localStorage.getItem('currentStudent'));
        this.dataService = new DataService();
        if (!this.student) {
            console.error('Không tìm thấy thông tin học sinh');
            return;
        }
        this.setupModalHandlers();
        this.initializeSampleData();
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.loadProfile();
        this.loadAcademicInfo();
    }

    loadProfile() {
        try {
            const profileContent = `
                <div class="profile-header">
                    <div class="student-avatar">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                    <div class="student-info">
                        <h2 id="studentFullName">${this.student.fullName || ''}</h2>
                        <div class="student-basic-info">
                            <span><i class="fas fa-id-card"></i> Mã học sinh: <strong id="studentId">${this.student.studentId || ''}</strong></span>
                            <span><i class="fas fa-chalkboard"></i> Lớp: <strong>${this.student.class || ''}</strong></span>
                            <span><i class="fas fa-calendar"></i> Năm học: <strong>${this.student.year || ''}</strong></span>
                        </div>
                    </div>
                    <div class="profile-actions">
                        <button class="btn btn-primary" id="editProfileBtn">
                            <i class="fas fa-edit"></i> Chỉnh sửa
                        </button>
                        <button class="btn btn-secondary" id="changePasswordBtn">
                            <i class="fas fa-key"></i> Đổi mật khẩu
                        </button>
                        <button class="btn btn-info" id="printProfileBtn">
                            <i class="fas fa-print"></i> In hồ sơ
                        </button>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-section personal-info">
                        <h3><i class="fas fa-info-circle"></i> Thông tin cá nhân</h3>
                        <div class="info-content two-columns">
                            <div class="info-item">
                                <label><i class="fas fa-birthday-cake"></i> Ngày sinh:</label>
                                <span id="studentBirthday">${this.student.birthday || 'Chưa cập nhật'}</span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-venus-mars"></i> Giới tính:</label>
                                <span id="studentGender">${this.student.gender || 'Chưa cập nhật'}</span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-envelope"></i> Email:</label>
                                <span id="studentEmail">${this.student.email || 'Chưa cập nhật'}</span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-phone"></i> Số điện thoại:</label>
                                <span id="studentPhone">${this.student.phone || 'Chưa cập nhật'}</span>
                            </div>
                            <div class="info-item full-width">
                                <label><i class="fas fa-home"></i> Địa chỉ:</label>
                                <span id="studentAddress">${this.student.address || 'Chưa cập nhật'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="info-section parents-info">
                        <h3><i class="fas fa-users"></i> Thông tin phụ huynh</h3>
                        <div class="parents-grid">
                            <div class="parent-card">
                                <h4>Phụ huynh</h4>
                                <div class="info-content">
                                    <div class="info-item">
                                        <label><i class="fas fa-user"></i> Họ tên:</label>
                                        <span id="parent1Name">${this.student.parent1Name || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div class="info-item">
                                        <label><i class="fas fa-heart"></i> Mối quan hệ:</label>
                                        <span id="parent1Relation">${this.student.parent1Relation || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div class="info-item">
                                        <label><i class="fas fa-phone"></i> Số điện thoại:</label>
                                        <span id="parent1Phone">${this.student.parent1Phone || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div class="info-item">
                                        <label><i class="fas fa-envelope"></i> Email:</label>
                                        <span id="parent1Email">${this.student.parent1Email || 'Chưa cập nhật'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="parent-card">
                                <h4>Phụ huynh</h4>
                                <div class="info-content">
                                    <div class="info-item">
                                        <label><i class="fas fa-user"></i> Họ tên:</label>
                                        <span id="parent2Name">${this.student.parent2Name || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div class="info-item">
                                        <label><i class="fas fa-heart"></i> Mối quan hệ:</label>
                                        <span id="parent2Relation">${this.student.parent2Relation || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div class="info-item">
                                        <label><i class="fas fa-phone"></i> Số điện thoại:</label>
                                        <span id="parent2Phone">${this.student.parent2Phone || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div class="info-item">
                                        <label><i class="fas fa-envelope"></i> Email:</label>
                                        <span id="parent2Email">${this.student.parent2Email || 'Chưa cập nhật'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="info-section academic-info">
                        <h3><i class="fas fa-graduation-cap"></i> Thông tin học tập</h3>
                        <div class="info-content two-columns">
                            <div class="info-item">
                                <label><i class="fas fa-chart-line"></i> Điểm TB HK1:</label>
                                <span id="gpa1" class="highlight">0.0</span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-chart-line"></i> Điểm TB HK2:</label>
                                <span id="gpa2" class="highlight">0.0</span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-star"></i> Điểm TB năm:</label>
                                <span id="gpaYear" class="highlight">0.0</span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-medal"></i> Xếp loại:</label>
                                <span id="academicRank" class="highlight">-</span>
                            </div>
                            <div class="info-item">
                                <label><i class="fas fa-heart"></i> Hạnh kiểm:</label>
                                <span id="conductRank" class="highlight">-</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const profileContainer = document.querySelector('.profile-container');
            if (profileContainer) {
                profileContainer.innerHTML = profileContent;
                
                // Gắn lại các event listener
                document.getElementById('editProfileBtn')?.addEventListener('click', () => this.editProfile());
                document.getElementById('changePasswordBtn')?.addEventListener('click', () => this.changePassword());
                document.getElementById('printProfileBtn')?.addEventListener('click', () => this.printProfile());
            }

            // Load thông tin học tập
            this.loadAcademicInfo();
        } catch (error) {
            console.error('Lỗi khi load thông tin profile:', error);
        }
    }

    loadAcademicInfo() {
        try {
            const scores = JSON.parse(localStorage.getItem('scores') || '[]');
            const studentScores = scores.filter(score => score.studentId === this.student.studentId);
            
            // Tính điểm trung bình từng học kỳ
            const semester1Scores = studentScores.filter(score => score.semester === 1);
            const semester2Scores = studentScores.filter(score => score.semester === 2);
            
            const gpa1 = this.calculateGPA(semester1Scores);
            const gpa2 = this.calculateGPA(semester2Scores);
            const gpaYear = (gpa1 + gpa2) / 2;

            // Cập nhật UI với kiểm tra null
            const elements = {
                gpa1: document.getElementById('gpa1'),
                gpa2: document.getElementById('gpa2'),
                gpaYear: document.getElementById('gpaYear'),
                academicRank: document.getElementById('academicRank'),
                conductRank: document.getElementById('conductRank')
            };

            // Chỉ cập nhật nếu element tồn tại
            if (elements.gpa1) elements.gpa1.textContent = gpa1.toFixed(1);
            if (elements.gpa2) elements.gpa2.textContent = gpa2.toFixed(1);
            if (elements.gpaYear) elements.gpaYear.textContent = gpaYear.toFixed(1);
            if (elements.academicRank) elements.academicRank.textContent = this.getAcademicRank(gpaYear);
            if (elements.conductRank) elements.conductRank.textContent = this.getConductRank(gpaYear);
        } catch (error) {
            console.error('Lỗi khi load thông tin học tập:', error);
        }
    }

    setupEventListeners() {
        // Tìm tất cả các nút liên quan đến profile
        const editProfileBtn = document.getElementById('editProfileBtn');
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.editProfile());
        }
        
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.changePassword());
        }
    }

    editProfile() {
        try {
            // Lấy các trường input trong modal
            const elements = {
                editFullName: document.getElementById('editFullName'),
                editBirthday: document.getElementById('editBirthday'),
                editGender: document.getElementById('editGender'),
                editEmail: document.getElementById('editEmail'),
                editPhone: document.getElementById('editPhone'),
                editAddress: document.getElementById('editAddress'),
                // Phụ huynh 1
                editParent1Name: document.getElementById('editParent1Name'),
                editParent1Relation: document.getElementById('editParent1Relation'),
                editParent1Phone: document.getElementById('editParent1Phone'),
                editParent1Email: document.getElementById('editParent1Email'),
                // Phụ huynh 2
                editParent2Name: document.getElementById('editParent2Name'),
                editParent2Relation: document.getElementById('editParent2Relation'),
                editParent2Phone: document.getElementById('editParent2Phone'),
                editParent2Email: document.getElementById('editParent2Email')
            };

            // Điền thông tin hiện tại vào form
            if (elements.editFullName) elements.editFullName.value = this.student.fullName || '';
            if (elements.editBirthday) elements.editBirthday.value = this.student.birthday || '';
            if (elements.editGender) elements.editGender.value = this.student.gender || '';
            if (elements.editEmail) elements.editEmail.value = this.student.email || '';
            if (elements.editPhone) elements.editPhone.value = this.student.phone || '';
            if (elements.editAddress) elements.editAddress.value = this.student.address || '';
            
            // Phụ huynh 1
            if (elements.editParent1Name) elements.editParent1Name.value = this.student.parent1Name || '';
            if (elements.editParent1Relation) elements.editParent1Relation.value = this.student.parent1Relation || '';
            if (elements.editParent1Phone) elements.editParent1Phone.value = this.student.parent1Phone || '';
            if (elements.editParent1Email) elements.editParent1Email.value = this.student.parent1Email || '';
            
            // Phụ huynh 2
            if (elements.editParent2Name) elements.editParent2Name.value = this.student.parent2Name || '';
            if (elements.editParent2Relation) elements.editParent2Relation.value = this.student.parent2Relation || '';
            if (elements.editParent2Phone) elements.editParent2Phone.value = this.student.parent2Phone || '';
            if (elements.editParent2Email) elements.editParent2Email.value = this.student.parent2Email || '';

            // Hiển thị modal
            const modal = document.getElementById('editProfileModal');
            if (modal) {
                const modalInstance = new bootstrap.Modal(modal);
                modalInstance.show();
            }
        } catch (error) {
            console.error('Lỗi khi mở form chỉnh sửa:', error);
            this.showToast('Có lỗi xảy ra khi mở form chỉnh sửa!', 'error');
        }
    }

    changePassword() {
        const modal = document.getElementById('changePasswordModal');
        if (modal) {
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
        }
    }

    saveProfile() {
        const updatedInfo = {
            fullName: document.getElementById('editFullName').value,
            birthday: document.getElementById('editBirthday').value,
            gender: document.getElementById('editGender').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value,
            address: document.getElementById('editAddress').value,
            // Phụ huynh 1
            parent1Name: document.getElementById('editParent1Name').value,
            parent1Relation: document.getElementById('editParent1Relation').value,
            parent1Phone: document.getElementById('editParent1Phone').value,
            parent1Email: document.getElementById('editParent1Email').value,
            // Phụ huynh 2
            parent2Name: document.getElementById('editParent2Name').value,
            parent2Relation: document.getElementById('editParent2Relation').value,
            parent2Phone: document.getElementById('editParent2Phone').value,
            parent2Email: document.getElementById('editParent2Email').value
        };

        try {
            this.student = { ...this.student, ...updatedInfo };
            localStorage.setItem('currentStudent', JSON.stringify(this.student));

            const students = JSON.parse(localStorage.getItem('students') || '[]');
            const index = students.findIndex(s => s.studentId === this.student.studentId);
            if (index !== -1) {
                students[index] = { ...students[index], ...updatedInfo };
                localStorage.setItem('students', JSON.stringify(students));
            }

            this.loadProfile();
            bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
            this.showToast('Cập nhật thông tin thành công!', 'success');
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            this.showToast('Có lỗi xảy ra khi cập nhật!', 'error');
        }
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
        try {
            // Tạo nội dung cần in
            const printContent = `
                <div class="print-profile" style="padding: 20px; font-family: Arial, sans-serif;">
                    <h2 style="text-align: center; color: #333;">HỒ SƠ HỌC SINH</h2>
                    
                    <div style="margin: 20px 0;">
                        <h3 style="color: #2196F3;">Thông tin cá nhân</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Họ và tên:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${this.student.fullName || ''}</td>
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Mã học sinh:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${this.student.studentId || ''}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Ngày sinh:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${this.student.birthday || ''}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Giới tính:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${this.student.gender || ''}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 5px solid #ddd;"><strong>Lớp:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${this.student.class || ''}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Năm học:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${this.student.year || ''}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="margin: 20px 0;">
                        <h3 style="color: #2196F3;">Thông tin liên hệ</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${this.student.email || ''}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Số điện thoại:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${this.student.phone || ''}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Địa chỉ:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${this.student.address || ''}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="margin: 20px 0;">
                        <h3 style="color: #2196F3;">Thông tin phụ huynh</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Họ tên phụ huynh:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${this.student.parent1Name || ''}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Mối quan hệ:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${this.student.parent1Relation || ''}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Số điện thoại:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${this.student.parent1Phone || ''}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${this.student.parent1Email || ''}</td>
                            </tr>
                        </table>
                    </div>

                    <div style="margin: 20px 0;">
                        <h3 style="color: #2196F3;">Kết quả học tập</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Điểm trung bình HK1:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${document.getElementById('gpa1')?.textContent || ''}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Điểm trung bình HK2:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${document.getElementById('gpa2')?.textContent || ''}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Điểm trung bình năm:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${document.getElementById('gpaYear')?.textContent || ''}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Xếp loại:</strong></td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${document.getElementById('academicRank')?.textContent || ''}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            `;

            // Tạo cửa sổ in mới
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Hồ sơ học sinh - ${this.student.fullName}</title>
                    </head>
                    <body>
                        ${printContent}
                        <script>
                            window.onload = function() {
                                window.print();
                                window.onafterprint = function() {
                                    window.close();
                                }
                            }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();

        } catch (error) {
            console.error('Lỗi khi in hồ sơ:', error);
            this.showToast('Có lỗi xảy ra khi in hồ sơ!', 'error');
        }
    }

    // Helper methods
    calculateGPA(scores) {
        if (!scores || scores.length === 0) return 0;
        const sum = scores.reduce((acc, score) => acc + parseFloat(score.score), 0);
        return sum / scores.length;
    }

    getAcademicRank(gpa) {
        if (gpa >= 9.0) return 'Xuất sắc';
        if (gpa >= 8.0) return 'Giỏi';
        if (gpa >= 7.0) return 'Khá';
        if (gpa >= 5.0) return 'Trung bình';
        return 'Yếu';
    }

    getConductRank(gpa) {
        if (gpa >= 8.0) return 'Tốt';
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

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            console.error('Không tìm thấy container toast');
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <div class="message">${message}</div>
            </div>
        `;

        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    setupModalHandlers() {
        // Xử lý khi modal mở
        document.body.addEventListener('show.bs.modal', function () {
            document.body.style.overflow = 'auto';
            document.body.style.paddingRight = '0';
        });

        // Xử lý khi modal đóng
        document.body.addEventListener('hidden.bs.modal', function () {
            document.body.style.overflow = 'auto';
            document.body.style.paddingRight = '0';
            // Đảm bảo scroll vẫn hoạt động sau khi đóng modal
            setTimeout(() => {
                document.body.style.overflow = 'auto';
            }, 100);
        });
    }

    initializeSampleData() {
        const currentStudent = JSON.parse(localStorage.getItem('currentStudent'));
        if (!currentStudent) return;

        const sampleScores = [
            {
                studentId: currentStudent.studentId,
                subject: 'Toán',
                semester: 1,
                score: 8.5,
                type: 'Kiểm tra 15 phút',
                date: '2024-02-15',
                comment: 'Tốt'
            },
            {
                studentId: currentStudent.studentId,
                subject: 'Văn',
                semester: 1,
                score: 7.5,
                type: 'Kiểm tra 1 tiết',
                date: '2024-02-20',
                comment: 'Khá'
            },
            {
                studentId: currentStudent.studentId,
                subject: 'Anh',
                semester: 1,
                score: 9.0,
                type: 'Kiểm tra cuối kỳ',
                date: '2024-01-10',
                comment: 'Xuất sắc'
            },
            {
                studentId: currentStudent.studentId,
                subject: 'Lý',
                semester: 1,
                score: 8.0,
                type: 'Kiểm tra miệng',
                date: '2024-02-01',
                comment: 'Tốt'
            },
            {
                studentId: currentStudent.studentId,
                subject: 'Hóa',
                semester: 1,
                score: 7.0,
                type: 'Kiểm tra 15 phút',
                date: '2024-02-05',
                comment: 'Khá'
            },
            // Học kỳ 2
            {
                studentId: currentStudent.studentId,
                subject: 'Toán',
                semester: 2,
                score: 9.0,
                type: 'Kiểm tra 15 phút',
                date: '2024-03-15',
                comment: 'Xuất sắc'
            },
            {
                studentId: currentStudent.studentId,
                subject: 'Văn',
                semester: 2,
                score: 8.0,
                type: 'Kiểm tra 1 tiết',
                date: '2024-03-20',
                comment: 'Tốt'
            },
            {
                studentId: currentStudent.studentId,
                subject: 'Anh',
                semester: 2,
                score: 8.5,
                type: 'Kiểm tra cuối kỳ',
                date: '2024-04-10',
                comment: 'Tốt'
            },
            {
                studentId: currentStudent.studentId,
                subject: 'Lý',
                semester: 2,
                score: 7.5,
                type: 'Kiểm tra miệng',
                date: '2024-03-01',
                comment: 'Khá'
            },
            {
                studentId: currentStudent.studentId,
                subject: 'Hóa',
                semester: 2,
                score: 8.5,
                type: 'Kiểm tra 15 phút',
                date: '2024-03-05',
                comment: 'Tốt'
            }
        ];

        // Lưu vào localStorage
        const existingScores = JSON.parse(localStorage.getItem('scores') || '[]');
        const updatedScores = [...existingScores, ...sampleScores];
        localStorage.setItem('scores', JSON.stringify(updatedScores));

        // Cập nhật UI
        this.loadAcademicInfo();
    }
}

// Khởi tạo khi trang được load
document.addEventListener('DOMContentLoaded', () => {
    if (checkStudentAuth()) {
        window.studentProfile = new StudentProfile();
    }
});

window.StudentProfile = StudentProfile;