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
                parent1Relation: 'Cha',
                gpa1: '8.5',
                gpa2: '8.7',
                gpaYear: '8.6',
                academicRank: 'Giỏi',
                conductRank: 'Tốt'
            };
            
            // Lưu dữ liệu mẫu vào localStorage
            localStorage.setItem('currentStudent', JSON.stringify(this.student));
            console.log('Đã tạo và lưu dữ liệu mẫu:', this.student);
        }
        
        this.init();
    }

    init() {
        console.log('=== StudentProfile init được gọi ===');
        this.loadProfileData();
        this.loadAvatar();
    }

    loadProfileData() {
        console.log('=== loadProfileData được gọi ===');
        console.log('Loading profile data:', this.student);
        // Cập nhật thông tin học sinh trong giao diện
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
        
        // Cập nhật thông tin nếu các phần tử tồn tại
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
        
        // Cập nhật thông tin phụ huynh
        if (parentName) parentName.textContent = this.student.parent1Name || 'Chưa cập nhật';
        if (parentPhone) parentPhone.textContent = this.student.parent1Phone || 'Chưa cập nhật';
        if (parentEmail) parentEmail.textContent = this.student.parent1Email || 'Chưa cập nhật';
        
        // Cập nhật thông tin học tập
        const gpa1 = document.getElementById('gpa1');
        const gpa2 = document.getElementById('gpa2');
        const gpaYear = document.getElementById('gpaYear');
        const academicRank = document.getElementById('academicRank');
        const conductRank = document.getElementById('conductRank');
        
        if (gpa1) gpa1.textContent = this.student.gpa1 || '8.5';
        if (gpa2) gpa2.textContent = this.student.gpa2 || '8.7';
        if (gpaYear) gpaYear.textContent = this.student.gpaYear || '8.6';
        if (academicRank) academicRank.textContent = this.student.academicRank || 'Giỏi';
        if (conductRank) conductRank.textContent = this.student.conductRank || 'Tốt';
        
        console.log('Đã tải dữ liệu hồ sơ:', this.student);
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
        if (avatarPreview && avatarPreview.src) {
            // Lưu avatar vào đối tượng student
            this.student.avatar = avatarPreview.src;
            
            // Cập nhật avatar trong giao diện
            const avatarImage = document.getElementById('avatarImage');
            if (avatarImage) {
                avatarImage.src = avatarPreview.src;
                avatarImage.style.display = 'block';
                const iconElement = document.querySelector('#profileAvatar i');
                if (iconElement) {
                    iconElement.style.display = 'none';
                }
            }
            
            // Lưu thông tin vào localStorage
            localStorage.setItem('currentStudent', JSON.stringify(this.student));
            
            // Đóng modal
            this.closeModal('changeAvatarModal');
            
            // Thông báo thành công
            this.showToast('Cập nhật ảnh đại diện thành công!', 'success');
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
        // Chuẩn bị nội dung in
        const printTemplate = document.getElementById('printTemplate');
        if (printTemplate) {
            console.log('Chuẩn bị in hồ sơ');
            
            // Tạo style cho bản in
            const printStyle = `
                <style>
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #printTemplate, #printTemplate * {
                            visibility: visible;
                        }
                        #printTemplate {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                    }
                    .print-profile {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .school-info {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .student-info {
                        margin-bottom: 30px;
                    }
                    .student-info h2 {
                        margin-bottom: 15px;
                        border-bottom: 1px solid #ccc;
                        padding-bottom: 5px;
                    }
                    .academic-info h3 {
                        margin-bottom: 15px;
                        border-bottom: 1px solid #ccc;
                        padding-bottom: 5px;
                    }
                </style>
            `;
            
            // Tạo nội dung in hồ sơ
            printTemplate.innerHTML = printStyle + `
                <div class="print-profile">
                    <div class="school-info text-center">
                        <h2>TRƯỜNG THPT ABC</h2>
                        <h3>HỒ SƠ HỌC SINH</h3>
                    </div>
                    <div class="student-info">
                        <h2>${this.student.fullName || 'Chưa cập nhật'}</h2>
                        <p>Mã học sinh: ${this.student.studentId || ''}</p>
                        <p>Lớp: ${this.student.className || this.student.class || 'Chưa cập nhật'}</p>
                        <p>Ngày sinh: ${this.formatDateForDisplay(this.student.birthDate || this.student.birthday || '')}</p>
                        <p>Giới tính: ${this.student.gender || 'Chưa cập nhật'}</p>
                        <p>Email: ${this.student.email || 'Chưa cập nhật'}</p>
                        <p>Số điện thoại: ${this.student.phone || 'Chưa cập nhật'}</p>
                        <p>Địa chỉ: ${this.student.address || 'Chưa cập nhật'}</p>
                    </div>
                    <div class="academic-info">
                        <h3>Thông tin học tập</h3>
                        <p>Điểm trung bình học kỳ 1: ${this.student.gpa1 || '8.5'}</p>
                        <p>Điểm trung bình học kỳ 2: ${this.student.gpa2 || '8.7'}</p>
                        <p>Điểm trung bình cả năm: ${this.student.gpaYear || '8.6'}</p>
                        <p>Xếp loại học lực: ${this.student.academicRank || 'Giỏi'}</p>
                        <p>Hạnh kiểm: ${this.student.conductRank || 'Tốt'}</p>
                    </div>
                </div>
            `;
            
            // In hồ sơ
            console.log('Gọi hàm window.print()');
            window.print();
        } else {
            console.error('Không tìm thấy phần tử printTemplate');
            // Tạo một printTemplate mới nếu không tìm thấy
            const newPrintTemplate = document.createElement('div');
            newPrintTemplate.id = 'printTemplate';
            newPrintTemplate.style.display = 'none';
            document.body.appendChild(newPrintTemplate);
            
            // Gọi lại phương thức
            this.printProfile();
        }
    }

    // Phương thức mở modal chung - helper
    openModal(modalId) {
        console.log(`Mở modal ${modalId}`);
        const modal = document.getElementById(modalId);
        
        if (!modal) {
            console.error(`Không tìm thấy modal ${modalId}`);
            return false;
        }
        
        try {
            // Thử sử dụng Bootstrap
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
                return true;
            } else {
                throw new Error('Bootstrap không khả dụng');
            }
        } catch (error) {
            console.warn(`Không thể sử dụng Bootstrap Modal: ${error.message}`);
            
            // Fallback: hiển thị modal theo cách thủ công
            modal.style.display = 'block';
            modal.classList.add('show');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('role', 'dialog');
            modal.removeAttribute('aria-hidden');
            
            // Thêm backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(backdrop);
            
            // Thêm class cho body
            document.body.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '17px';
            
            // Thêm sự kiện đóng modal
            const closeButtons = modal.querySelectorAll('[data-bs-dismiss="modal"]');
            closeButtons.forEach(button => {
                button.addEventListener('click', () => this.closeModal(modalId));
            });
            
            return true;
        }
    }
    
    // Phương thức đóng modal chung - helper
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        
        if (!modal) {
            console.error(`Không tìm thấy modal ${modalId}`);
            return;
        }
        
        try {
            // Thử sử dụng Bootstrap
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                    return;
                } else {
                    throw new Error('Không tìm thấy instance của Modal');
                }
            } else {
                throw new Error('Bootstrap không khả dụng');
            }
        } catch (error) {
            console.warn(`Không thể sử dụng Bootstrap Modal để đóng: ${error.message}`);
            
            // Fallback: đóng modal theo cách thủ công
            modal.style.display = 'none';
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            modal.removeAttribute('aria-modal');
            modal.removeAttribute('role');
            
            // Xóa backdrop
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.parentNode.removeChild(backdrop);
            }
            
            // Xóa class modal-open
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
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
        console.log(`=== showToast: ${message} (${type}) ===`);
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            console.error('Không tìm thấy phần tử toastContainer');
            // Tạo một toastContainer mới nếu không tìm thấy
            const newToastContainer = document.createElement('div');
            newToastContainer.id = 'toastContainer';
            newToastContainer.style.position = 'fixed';
            newToastContainer.style.top = '20px';
            newToastContainer.style.right = '20px';
            newToastContainer.style.zIndex = '9999';
            document.body.appendChild(newToastContainer);
            
            // Gọi lại phương thức
            this.showToast(message, type);
            return;
        }
        
        const toastId = 'toast-' + Date.now();
        const toastHTML = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        toastContainer.innerHTML += toastHTML;
        
        const toastElement = document.getElementById(toastId);
        if (toastElement) {
            try {
                // Thử sử dụng Bootstrap Toast
                if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
                    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
                    toast.show();
                    
                    // Xóa toast sau khi ẩn
                    toastElement.addEventListener('hidden.bs.toast', function () {
                        toastElement.remove();
                    });
                } else {
                    throw new Error('Bootstrap.Toast không khả dụng');
                }
            } catch (error) {
                console.warn(`Không thể sử dụng Bootstrap Toast: ${error.message}`);
                
                // Fallback: hiển thị toast theo cách thủ công
                toastElement.style.display = 'block';
                toastElement.style.opacity = '1';
                toastElement.style.backgroundColor = type === 'error' ? '#dc3545' : 
                                                    type === 'success' ? '#198754' : 
                                                    type === 'warning' ? '#ffc107' : '#0dcaf0';
                toastElement.style.color = '#fff';
                toastElement.style.padding = '15px';
                toastElement.style.borderRadius = '5px';
                toastElement.style.marginBottom = '10px';
                
                // Thêm sự kiện đóng toast
                const closeButton = toastElement.querySelector('.btn-close');
                if (closeButton) {
                    closeButton.onclick = function() {
                        toastElement.remove();
                    };
                }
                
                // Tự động đóng sau 3 giây
                setTimeout(() => {
                    toastElement.style.opacity = '0';
                    toastElement.style.transition = 'opacity 0.5s';
                    
                    // Xóa phần tử sau khi ẩn
                    setTimeout(() => {
                        if (toastElement.parentNode) {
                            toastElement.parentNode.removeChild(toastElement);
                        }
                    }, 500);
                }, 3000);
            }
        }
    }

    // Phương thức để định dạng ngày tháng cho input
    formatDateForInput(dateString) {
        if (!dateString) return '';
        
        // Kiểm tra nếu đã đúng định dạng YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        
        // Chuyển đổi từ DD/MM/YYYY sang YYYY-MM-DD
        const parts = dateString.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        
        return dateString;
    }

    // Phương thức để định dạng ngày tháng cho hiển thị
    formatDateForDisplay(dateString) {
        if (!dateString) return '';
        
        // Chuyển đổi từ YYYY-MM-DD sang DD/MM/YYYY
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const parts = dateString.split('-');
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        
        // Nếu đã là định dạng DD/MM/YYYY
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
            return dateString;
        }
        
        return dateString;
    }
}

// Không cần khởi tạo profile ở đây vì đã được khởi tạo trong file HTML