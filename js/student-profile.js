class StudentProfile {
    constructor() {
        console.log('=== StudentProfile constructor được gọi ===');
        // Thử lấy dữ liệu từ cả hai nguồn
        this.student = JSON.parse(localStorage.getItem('currentStudent') || '{}');
        
        // Nếu không có dữ liệu từ currentStudent, thử lấy từ currentUser
        if (!this.student || Object.keys(this.student).length === 0) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (currentUser && currentUser.role === 'student') {
                this.student = currentUser;
                console.log('Đã lấy dữ liệu từ currentUser:', this.student);
            }
        }
        
        // Nếu vẫn không có dữ liệu, thử lấy từ danh sách students
        if (!this.student || Object.keys(this.student).length === 0) {
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            if (students.length > 0) {
                // Lấy học sinh đầu tiên trong danh sách để demo
                this.student = students[0];
                console.log('Đã lấy dữ liệu từ danh sách students:', this.student);
            }
        }
        
        if (!this.student || Object.keys(this.student).length === 0) {
            console.log('Không tìm thấy thông tin học sinh, tạo dữ liệu mẫu');
            // Tạo dữ liệu mẫu nếu không tìm thấy
            this.student = {
                studentId: 'HS001',
                fullName: 'Nguyễn Văn A',
                className: '12A1',
                birthDate: '2006-01-01',
                gender: 'Nam',
                email: 'nguyenvana@example.com',
                phone: '0123456789',
                address: 'Hà Nội, Việt Nam',
                password: '123456', // Mật khẩu mặc định
                parent1Name: 'Nguyễn Văn B',
                parent1Phone: '0987654321',
                parent1Email: 'nguyenvanb@example.com',
                parent1Relation: 'Cha'
            };
            
            // Lưu dữ liệu mẫu vào localStorage
            localStorage.setItem('currentStudent', JSON.stringify(this.student));
            console.log('Đã tạo và lưu dữ liệu mẫu:', this.student);
        }
        
        // Lắng nghe sự kiện cập nhật điểm số từ storage
        window.addEventListener('storage', (e) => {
            if (e.key === 'scores') {
                console.log('Điểm số đã được cập nhật từ tab khác, đang tải lại...');
                this.loadProfileData();
            }
        });

        // Lắng nghe sự kiện cập nhật điểm số từ cùng tab
        window.addEventListener('scoresUpdated', () => {
            console.log('Điểm số đã được cập nhật trong tab hiện tại, đang tải lại...');
            this.loadProfileData();
        });

        this.init();
    }

    init() {
        console.log('=== StudentProfile init được gọi ===');
        this.loadProfileData();
        this.loadAvatar();

        // Thêm các event listeners
        const changeAvatarBtn = document.getElementById('changeAvatarBtn');
        const editProfileBtn = document.getElementById('editProfileBtn');
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        const printProfileBtn = document.getElementById('printProfileBtn');
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        const savePasswordBtn = document.getElementById('savePasswordBtn');

        if (changeAvatarBtn) {
            changeAvatarBtn.addEventListener('click', () => this.changeAvatar());
        }

        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.editProfile());
        }

        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.changePassword());
        }

        if (printProfileBtn) {
            printProfileBtn.addEventListener('click', () => this.printProfile());
        }

        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => this.saveProfile());
        }

        if (savePasswordBtn) {
            savePasswordBtn.addEventListener('click', () => this.savePassword());
        }

        // Thêm event listener cho input file avatar
        const avatarInput = document.getElementById('avatarInput');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => this.previewAvatar(e));
        }
    }

    loadProfileData() {
        console.log('=== loadProfileData được gọi ===');
        console.log('Loading profile data:', this.student);
        
        if (!this.student || !this.student.studentId) {
            console.error('Không có thông tin học sinh');
            return;
        }

        // Cập nhật thông tin cơ bản
        const studentFullName = document.getElementById('studentFullName');
        const studentId = document.getElementById('studentId');
        const studentFullNameInfo = document.getElementById('studentFullNameInfo');
        const studentBirthday = document.getElementById('studentBirthday');
        const studentGender = document.getElementById('studentGender');
        const studentClass = document.getElementById('studentClass');
        const studentYear = document.getElementById('studentYear');
        const studentGrade = document.getElementById('studentGrade');
        const studentEmail = document.getElementById('studentEmail');
        const studentPhone = document.getElementById('studentPhone');
        const studentAddress = document.getElementById('studentAddress');
        const parentName = document.getElementById('parentName');
        const parentPhone = document.getElementById('parentPhone');
        const parentEmail = document.getElementById('parentEmail');
        
        if (studentFullName) studentFullName.textContent = this.student.fullName || 'Chưa cập nhật';
        if (studentId) studentId.textContent = this.student.studentId || '';
        if (studentFullNameInfo) studentFullNameInfo.textContent = this.student.fullName || 'Chưa cập nhật';
        if (studentBirthday) studentBirthday.textContent = this.formatDateForDisplay(this.student.birthDate || this.student.birthday || '');
        if (studentGender) studentGender.textContent = this.student.gender || 'Chưa cập nhật';
        if (studentClass) studentClass.textContent = this.student.className || this.student.class || 'Chưa cập nhật';
        if (studentYear) studentYear.textContent = '2023-2024';
        if (studentGrade) studentGrade.textContent = this.student.className ? this.student.className.substring(0, 2) : '12';
        if (studentEmail) studentEmail.textContent = this.student.email || 'Chưa cập nhật';
        if (studentPhone) studentPhone.textContent = this.student.phone || 'Chưa cập nhật';
        if (studentAddress) studentAddress.textContent = this.student.address || 'Chưa cập nhật';
        if (parentName) parentName.textContent = this.student.parent1Name || 'Chưa cập nhật';
        if (parentPhone) parentPhone.textContent = this.student.parent1Phone || 'Chưa cập nhật';
        if (parentEmail) parentEmail.textContent = this.student.parent1Email || 'Chưa cập nhật';

        // Tính toán và cập nhật điểm số
        const scores = JSON.parse(localStorage.getItem('scores') || '[]');
        const studentScores = scores.filter(score => score.studentId === this.student.studentId);
        
        // Tổ chức điểm theo học kỳ và loại
        const semester1Scores = {};
        const semester2Scores = {};
        
        studentScores.forEach(score => {
            const semesterScores = score.semester === '2' ? semester2Scores : semester1Scores;
            if (!semesterScores[score.subject]) {
                semesterScores[score.subject] = {
                    'Kiểm tra miệng': [],
                    'Kiểm tra 15 phút': [],
                    'Kiểm tra 1 tiết': [],
                    'Kiểm tra học kỳ': []
                };
            }
            semesterScores[score.subject][score.type].push(score.score);
        });

        // Tính điểm trung bình từng học kỳ
        const gpa1 = this.calculateSemesterGPA(semester1Scores);
        const gpa2 = this.calculateSemesterGPA(semester2Scores);
        const gpaYear = (gpa1 + gpa2) / 2;

        // Cập nhật giao diện điểm số
        const gpa1Element = document.getElementById('gpa1');
        const gpa2Element = document.getElementById('gpa2');
        const gpaYearElement = document.getElementById('gpaYear');
        const academicRankElement = document.getElementById('academicRank');
        const conductRankElement = document.getElementById('conductRank');
        
        if (gpa1Element) gpa1Element.textContent = gpa1.toFixed(1);
        if (gpa2Element) gpa2Element.textContent = gpa2.toFixed(1);
        if (gpaYearElement) gpaYearElement.textContent = gpaYear.toFixed(1);
        if (academicRankElement) academicRankElement.textContent = this.getAcademicRank(gpaYear);
        if (conductRankElement) conductRankElement.textContent = this.student.conductRank || 'Tốt';
        
        console.log('Đã tải xong dữ liệu hồ sơ:', this.student);
    }

    calculateSemesterGPA(semesterScores) {
        let totalScore = 0;
        let totalWeight = 0;
        
        Object.values(semesterScores).forEach(subjectScores => {
            let subjectTotal = 0;
            let subjectWeight = 0;
            
            // Tính điểm trung bình môn học
            Object.entries(subjectScores).forEach(([type, scores]) => {
                if (scores.length > 0) {
                    const weight = this.getScoreWeight(type);
                    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
                    subjectTotal += average * weight;
                    subjectWeight += weight;
                }
            });
            
            if (subjectWeight > 0) {
                totalScore += subjectTotal / subjectWeight;
                totalWeight++;
            }
        });
        
        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }

    getScoreWeight(type) {
        switch (type) {
            case 'Kiểm tra học kỳ': return 3;
            case 'Kiểm tra 1 tiết': return 2;
            case 'Kiểm tra miệng':
            case 'Kiểm tra 15 phút':
            default: return 1;
        }
    }

    getAcademicRank(average) {
        if (average >= 8) return 'Giỏi';
        if (average >= 6.5) return 'Khá';
        if (average >= 5) return 'Trung bình';
        return 'Yếu';
    }

    // Phương thức để tải avatar từ localStorage
    loadAvatar() {
        const avatarImage = document.getElementById('avatarImage');
        if (avatarImage && this.student.avatar) {
            avatarImage.src = this.student.avatar;
            avatarImage.style.display = 'block';
            const iconElement = document.querySelector('#profileAvatar i');
            if (iconElement) {
                iconElement.style.display = 'none';
            }
        }
    }

    // Phương thức để mở modal đổi avatar
    changeAvatar() {
        console.log('=== changeAvatar được gọi ===');
        this.openModal('changeAvatarModal');
    }

    // Phương thức để xem trước avatar
    previewAvatar(event) {
        console.log('previewAvatar called');
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatarPreview = document.getElementById('avatarPreview');
                if (avatarPreview) {
                    avatarPreview.src = e.target.result;
                    avatarPreview.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        }
    }

    // Phương thức để lưu avatar
    saveAvatar() {
        console.log('=== saveAvatar được gọi ===');
        const avatarPreview = document.getElementById('avatarPreview');
        if (!avatarPreview || !avatarPreview.src || avatarPreview.src === window.location.href) {
            this.showToast('Vui lòng chọn ảnh trước khi lưu!', 'warning');
            return;
        }

        try {
            // Lưu avatar vào đối tượng student
            this.student.avatar = avatarPreview.src;
            
            // Cập nhật avatar trong giao diện
            const avatarImage = document.getElementById('avatarImage');
            if (avatarImage) {
                avatarImage.src = avatarPreview.src;
                avatarImage.style.display = 'block';
                
                // Ẩn icon mặc định nếu có
                const iconElement = document.querySelector('#profileAvatar i');
                if (iconElement) {
                    iconElement.style.display = 'none';
                }
            }
            
            // Lưu thông tin vào localStorage
            localStorage.setItem('currentStudent', JSON.stringify(this.student));
            
            // Đóng modal
            this.closeModal('changeAvatarModal');
            
            // Reset preview
            avatarPreview.src = '';
            avatarPreview.style.display = 'none';
            
            // Reset input file
            const avatarInput = document.getElementById('avatarInput');
            if (avatarInput) {
                avatarInput.value = '';
            }
            
            // Thông báo thành công
            this.showToast('Cập nhật ảnh đại diện thành công!', 'success');
        } catch (error) {
            console.error('Lỗi khi lưu avatar:', error);
            this.showToast('Có lỗi xảy ra khi lưu ảnh!', 'error');
        }
    }

    // Phương thức để mở modal chỉnh sửa hồ sơ
    editProfile() {
        console.log('=== editProfile được gọi ===');
        
        // Kiểm tra các phần tử form
        const editFullName = document.getElementById('editFullName');
        const editBirthday = document.getElementById('editBirthday');
        const editGender = document.getElementById('editGender');
        const editEmail = document.getElementById('editEmail');
        const editPhone = document.getElementById('editPhone');
        const editAddress = document.getElementById('editAddress');
        
        if (!editFullName || !editBirthday || !editGender || !editEmail || !editPhone || !editAddress) {
            console.error('Không tìm thấy các phần tử form');
            return;
        }
        
        // Điền thông tin hiện tại vào form
        editFullName.value = this.student.fullName || '';
        editBirthday.value = this.formatDateForInput(this.student.birthDate || this.student.birthday || '');
        editGender.value = this.student.gender || 'Nam';
        editEmail.value = this.student.email || '';
        editPhone.value = this.student.phone || '';
        editAddress.value = this.student.address || '';
        
        // Điền thông tin phụ huynh nếu có
        const editParent1Name = document.getElementById('editParent1Name');
        const editParent1Phone = document.getElementById('editParent1Phone');
        const editParent1Email = document.getElementById('editParent1Email');
        const editParent1Relation = document.getElementById('editParent1Relation');
        
        if (editParent1Name) {
            editParent1Name.value = this.student.parent1Name || '';
        }
        if (editParent1Phone) {
            editParent1Phone.value = this.student.parent1Phone || '';
        }
        if (editParent1Email) {
            editParent1Email.value = this.student.parent1Email || '';
        }
        if (editParent1Relation) {
            editParent1Relation.value = this.student.parent1Relation || '';
        }
        
        // Hiển thị modal
        this.openModal('editProfileModal');
    }

    // Phương thức để mở modal đổi mật khẩu
    changePassword() {
        console.log('=== changePassword được gọi ===');
        this.openModal('changePasswordModal');
    }

    // Phương thức để in hồ sơ
    printProfile() {
        console.log('=== printProfile được gọi ===');
        const printTemplate = document.getElementById('printTemplate');
        if (!printTemplate) {
            console.error('Không tìm thấy template in');
            return;
        }

        try {
            // Tạo nội dung in
            const content = `
                <div class="print-profile">
                    <div class="school-info">
                        <h2>TRƯỜNG THPT ABC</h2>
                        <h3>HỒ SƠ HỌC SINH</h3>
                    </div>
                    <div class="student-info">
                        <h2>${this.student.fullName || 'Chưa cập nhật'}</h2>
                        <p><strong>Mã học sinh:</strong> ${this.student.studentId || ''}</p>
                        <p><strong>Lớp:</strong> ${this.student.className || this.student.class || 'Chưa cập nhật'}</p>
                        <p><strong>Ngày sinh:</strong> ${this.formatDateForDisplay(this.student.birthDate || this.student.birthday || '')}</p>
                        <p><strong>Giới tính:</strong> ${this.student.gender || 'Chưa cập nhật'}</p>
                        <p><strong>Email:</strong> ${this.student.email || 'Chưa cập nhật'}</p>
                        <p><strong>Số điện thoại:</strong> ${this.student.phone || 'Chưa cập nhật'}</p>
                        <p><strong>Địa chỉ:</strong> ${this.student.address || 'Chưa cập nhật'}</p>
                    </div>
                    <div class="academic-info">
                        <h3>Thông tin học tập</h3>
                        <p><strong>Điểm trung bình học kỳ 1:</strong> ${this.student.gpa1 || 'Không có'}</p>
                        <p><strong>Điểm trung bình học kỳ 2:</strong> ${this.student.gpa2 || 'Không có'}</p>
                        <p><strong>Điểm trung bình cả năm:</strong> ${this.student.gpaYear || 'Không có'}</p>
                        <p><strong>Xếp loại học lực:</strong> ${this.student.academicRank || 'Chưa xếp hạng'}</p>
                        <p><strong>Hạnh kiểm:</strong> ${this.student.conductRank || 'Chưa xếp hạng'}</p>
                    </div>
                </div>
            `;

            // Cập nhật nội dung template
            printTemplate.innerHTML = content;
            printTemplate.style.display = 'block';

            // Đợi một chút để đảm bảo nội dung được render
            setTimeout(() => {
                window.print();
                // Ẩn template sau khi in
                printTemplate.style.display = 'none';
            }, 100);
        } catch (error) {
            console.error('Lỗi khi in hồ sơ:', error);
            this.showToast('Có lỗi xảy ra khi in hồ sơ!', 'error');
        }
    }

    // Phương thức mở modal chung - helper
    openModal(modalId) {
        console.log('=== openModal được gọi với modalId:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        } else {
            console.error('Không tìm thấy modal với id:', modalId);
        }
    }
    
    // Phương thức đóng modal chung - helper
    closeModal(modalId) {
        console.log('=== closeModal được gọi với modalId:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
        } else {
            console.error('Không tìm thấy modal với id:', modalId);
        }
    }

    // Phương thức để lưu thông tin hồ sơ
    saveProfile() {
        console.log('=== saveProfile được gọi ===');
        // Kiểm tra các phần tử form
        const editFullName = document.getElementById('editFullName');
        const editBirthday = document.getElementById('editBirthday');
        const editGender = document.getElementById('editGender');
        const editEmail = document.getElementById('editEmail');
        const editPhone = document.getElementById('editPhone');
        const editAddress = document.getElementById('editAddress');
        
        if (!editFullName || !editBirthday || !editGender || !editEmail || !editPhone || !editAddress) {
            console.error('Không tìm thấy các phần tử form');
            return;
        }
        
        // Lấy thông tin từ form
        this.student.fullName = editFullName.value;
        this.student.birthDate = editBirthday.value;
        this.student.gender = editGender.value;
        this.student.email = editEmail.value;
        this.student.phone = editPhone.value;
        this.student.address = editAddress.value;
        
        // Lấy thông tin phụ huynh nếu có
        const editParent1Name = document.getElementById('editParent1Name');
        const editParent1Phone = document.getElementById('editParent1Phone');
        const editParent1Email = document.getElementById('editParent1Email');
        const editParent1Relation = document.getElementById('editParent1Relation');
        
        if (editParent1Name) {
            this.student.parent1Name = editParent1Name.value;
        }
        if (editParent1Phone) {
            this.student.parent1Phone = editParent1Phone.value;
        }
        if (editParent1Email) {
            this.student.parent1Email = editParent1Email.value;
        }
        if (editParent1Relation) {
            this.student.parent1Relation = editParent1Relation.value;
        }
        
        // Lưu thông tin vào localStorage
        localStorage.setItem('currentStudent', JSON.stringify(this.student));
        
        // Cập nhật giao diện
        this.loadProfileData();
        
        // Đóng modal
        this.closeModal('editProfileModal');
        
        // Thông báo thành công
        this.showToast('Cập nhật thông tin thành công!', 'success');
    }

    // Phương thức để lưu mật khẩu mới
    savePassword() {
        console.log('=== savePassword được gọi ===');
        const currentPassword = document.getElementById('currentPassword');
        const newPassword = document.getElementById('newPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            console.error('Không tìm thấy các phần tử form mật khẩu');
            return;
        }
        
        // Kiểm tra mật khẩu hiện tại
        if (currentPassword.value !== this.student.password) {
            this.showToast('Mật khẩu hiện tại không đúng!', 'error');
            return;
        }
        
        // Kiểm tra mật khẩu mới và xác nhận mật khẩu
        if (newPassword.value !== confirmPassword.value) {
            this.showToast('Mật khẩu mới và xác nhận mật khẩu không khớp!', 'error');
            return;
        }
        
        // Cập nhật mật khẩu
        this.student.password = newPassword.value;
        
        // Lưu thông tin vào localStorage
        localStorage.setItem('currentStudent', JSON.stringify(this.student));
        
        // Đóng modal
        this.closeModal('changePasswordModal');
        
        // Thông báo thành công
        this.showToast('Đổi mật khẩu thành công!', 'success');
    }

    // Phương thức để hiển thị thông báo
    showToast(message, type = 'info') {
        console.log('=== showToast được gọi ===');
        // Tạo toast container nếu chưa có
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }

        // Tạo toast element
        const toastElement = document.createElement('div');
        toastElement.className = `toast align-items-center text-white bg-${type} border-0`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');

        // Tạo nội dung toast
        toastElement.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        // Thêm toast vào container
        toastContainer.appendChild(toastElement);

        // Khởi tạo toast Bootstrap
        const toast = new bootstrap.Toast(toastElement, {
            animation: true,
            autohide: true,
            delay: 3000
        });

        // Hiển thị toast
        toast.show();

        // Xóa toast sau khi ẩn
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    // Phương thức để định dạng ngày tháng cho input
    formatDateForInput(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('Lỗi khi định dạng ngày cho input:', error);
            return '';
        }
    }

    // Phương thức để định dạng ngày tháng cho hiển thị
    formatDateForDisplay(dateString) {
        if (!dateString) return 'Chưa cập nhật';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Chưa cập nhật';
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Lỗi khi định dạng ngày để hiển thị:', error);
            return 'Chưa cập nhật';
        }
    }
}

// Không cần khởi tạo profile ở đây vì đã được khởi tạo trong file HTML