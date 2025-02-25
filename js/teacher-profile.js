/**
 * Class quản lý hồ sơ cá nhân cho giáo viên
 */
class TeacherProfile {
    constructor() {
        console.log('Khởi tạo TeacherProfile');
        this.teacher = null;
        
        // Đảm bảo các phương thức có thể truy cập đến 'this'
        this.loadTeacherData = this.loadTeacherData.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.openEditModal = this.openEditModal.bind(this);
        this.openPasswordModal = this.openPasswordModal.bind(this);
        this.closeModals = this.closeModals.bind(this);
        this.saveProfile = this.saveProfile.bind(this);
        this.savePassword = this.savePassword.bind(this);
        this.showNotification = this.showNotification.bind(this);
        
        // Khởi tạo
        this.initialize();
    }

    initialize() {
        console.log('Khởi tạo dữ liệu hồ sơ giáo viên');
        this.loadTeacherData();
        this.setupEvents();
        
        // Tạo biến toàn cục để truy cập từ các sự kiện
        window.profileManager = this;
    }

    loadTeacherData() {
        console.log('Đang tải dữ liệu giáo viên');
        
        // Tải thông tin giáo viên từ localStorage
        const userData = localStorage.getItem('currentUser');
        
        if (userData) {
            try {
                const parsedData = JSON.parse(userData);
                console.log('Đã tải dữ liệu giáo viên:', parsedData);
                
                // Xử lý cả trường hợp dữ liệu là mảng hoặc đối tượng
                this.teacher = Array.isArray(parsedData) ? parsedData[0] : parsedData;
            } catch (error) {
                console.error('Lỗi khi phân tích dữ liệu giáo viên:', error);
                this.loadSampleData();
            }
        } else {
            console.warn('Không tìm thấy dữ liệu giáo viên, sử dụng dữ liệu mẫu');
            this.loadSampleData();
        }
        
        // Cập nhật giao diện
        this.updateProfile();
    }

    loadSampleData() {
        // Dữ liệu mẫu nếu không có dữ liệu trong localStorage
        this.teacher = {
            id: 'T001',
            username: 'teacher',
            fullName: 'Nguyễn Văn Thành',
            email: 'teacher@example.com',
            department: 'Khoa học tự nhiên',
            phone: '0987654321',
            birthday: '1985-01-15',
            address: 'Số 123, Đường Nguyễn Trãi, Hà Nội',
            subject: 'Toán học',
            startDate: '2015-09-01',
            qualification: 'Thạc sĩ',
            role: 'teacher'
        };
        
        // Lưu vào localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.teacher));
        console.log('Đã tạo dữ liệu giáo viên mẫu');
    }

    updateProfile() {
        console.log('Cập nhật thông tin hiển thị hồ sơ giáo viên');
        
        if (!this.teacher) {
            console.warn('Không có dữ liệu giáo viên');
            return;
        }
        
        // Cập nhật các phần tử trên giao diện
        const elements = {
            teacherNameWelcome: document.getElementById('teacherNameWelcome'),
            teacherFullName: document.getElementById('teacherFullName'),
            teacherId: document.getElementById('teacherId'),
            teacherDepartment: document.getElementById('teacherDepartment'),
            fullName: document.getElementById('fullName'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            birthday: document.getElementById('birthday'),
            address: document.getElementById('address'),
            subject: document.getElementById('subject'),
            startDate: document.getElementById('startDate'),
            qualification: document.getElementById('qualification')
        };
        
        // Cập nhật nội dung các phần tử
        if (elements.teacherNameWelcome) elements.teacherNameWelcome.textContent = this.teacher.fullName;
        if (elements.teacherFullName) elements.teacherFullName.textContent = this.teacher.fullName;
        if (elements.teacherId) elements.teacherId.textContent = 'ID: ' + this.teacher.id;
        if (elements.teacherDepartment) elements.teacherDepartment.textContent = this.teacher.department || 'Khoa học tự nhiên';
        if (elements.fullName) elements.fullName.textContent = this.teacher.fullName;
        if (elements.email) elements.email.textContent = this.teacher.email;
        if (elements.phone) elements.phone.textContent = this.teacher.phone || 'Chưa cập nhật';
        if (elements.birthday) elements.birthday.textContent = this.formatDate(this.teacher.birthday) || 'Chưa cập nhật';
        if (elements.address) elements.address.textContent = this.teacher.address || 'Chưa cập nhật';
        if (elements.subject) elements.subject.textContent = this.teacher.subject || 'Chưa cập nhật';
        if (elements.startDate) elements.startDate.textContent = this.formatDate(this.teacher.startDate) || 'Chưa cập nhật';
        if (elements.qualification) elements.qualification.textContent = this.teacher.qualification || 'Chưa cập nhật';
    }

    formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            console.error('Lỗi khi định dạng ngày', error);
            return dateString;
        }
    }

    setupEvents() {
        console.log('Thiết lập các sự kiện');
        
        // Xử lý sự kiện mở modal chỉnh sửa
        const editBtn = document.getElementById('editProfileBtn');
        if (editBtn) {
            editBtn.addEventListener('click', this.openEditModal);
        }
        
        // Xử lý sự kiện mở modal đổi mật khẩu
        const changePwdBtn = document.getElementById('changePasswordBtn');
        if (changePwdBtn) {
            changePwdBtn.addEventListener('click', this.openPasswordModal);
        }
        
        // Xử lý sự kiện đóng modal
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', this.closeModals);
        });
        
        // Đóng modal khi click bên ngoài
        window.addEventListener('click', (event) => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (event.target === modal) {
                    this.closeModals();
                }
            });
        });
        
        // Xử lý sự kiện lưu thông tin hồ sơ
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', this.saveProfile);
        }
        
        // Xử lý sự kiện lưu mật khẩu mới
        const savePasswordBtn = document.getElementById('savePasswordBtn');
        if (savePasswordBtn) {
            savePasswordBtn.addEventListener('click', this.savePassword);
        }
        
        // Thiết lập phím tắt Escape để đóng modal
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeModals();
            }
        });
    }

    openEditModal() {
        console.log('Mở modal chỉnh sửa thông tin');
        
        const modal = document.getElementById('editProfileModal');
        if (!modal) {
            console.error('Không tìm thấy modal chỉnh sửa');
            return;
        }
        
        if (!this.teacher) {
            console.error('Không có dữ liệu giáo viên');
            return;
        }
        
        // Điền thông tin hiện tại vào form
        const elements = {
            fullName: document.getElementById('editFullName'),
            email: document.getElementById('editEmail'),
            phone: document.getElementById('editPhone'),
            birthday: document.getElementById('editBirthday'),
            address: document.getElementById('editAddress'),
            subject: document.getElementById('editSubject'),
            qualification: document.getElementById('editQualification')
        };
        
        if (elements.fullName) elements.fullName.value = this.teacher.fullName || '';
        if (elements.email) elements.email.value = this.teacher.email || '';
        if (elements.phone) elements.phone.value = this.teacher.phone || '';
        if (elements.birthday) elements.birthday.value = this.teacher.birthday || '';
        if (elements.address) elements.address.value = this.teacher.address || '';
        if (elements.subject) elements.subject.value = this.teacher.subject || '';
        if (elements.qualification) elements.qualification.value = this.teacher.qualification || 'Cử nhân';
        
        // Hiển thị modal
        modal.style.display = 'flex';
        
        // Focus vào trường đầu tiên
        if (elements.fullName) {
            setTimeout(() => {
                elements.fullName.focus();
            }, 100);
        }
    }

    openPasswordModal() {
        console.log('Mở modal đổi mật khẩu');
        
        const modal = document.getElementById('changePasswordModal');
        if (!modal) {
            console.error('Không tìm thấy modal đổi mật khẩu');
            return;
        }
        
        // Reset form
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.reset();
        }
        
        // Hiển thị modal
        modal.style.display = 'flex';
        
        // Focus vào trường đầu tiên
        const currentPassword = document.getElementById('currentPassword');
        if (currentPassword) {
            setTimeout(() => {
                currentPassword.focus();
            }, 100);
        }
    }

    closeModals() {
        console.log('Đóng tất cả modal');
        
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    saveProfile() {
        console.log('Lưu thông tin hồ sơ');
        
        // Lấy dữ liệu từ form
        const fullName = document.getElementById('editFullName').value;
        const email = document.getElementById('editEmail').value;
        const phone = document.getElementById('editPhone').value;
        const birthday = document.getElementById('editBirthday').value;
        const address = document.getElementById('editAddress').value;
        const subject = document.getElementById('editSubject').value;
        const qualification = document.getElementById('editQualification').value;
        
        // Kiểm tra dữ liệu bắt buộc
        if (!fullName || !email) {
            this.showNotification('Vui lòng điền đầy đủ các trường bắt buộc!', 'error');
            return;
        }
        
        // Cập nhật dữ liệu
        this.teacher.fullName = fullName;
        this.teacher.email = email;
        this.teacher.phone = phone;
        this.teacher.birthday = birthday;
        this.teacher.address = address;
        this.teacher.subject = subject;
        this.teacher.qualification = qualification;
        
        // Lưu vào localStorage
        localStorage.setItem('currentUser', JSON.stringify(this.teacher));
        
        // Cập nhật giao diện
        this.updateProfile();
        
        // Hiển thị thông báo thành công
        this.showNotification('Cập nhật thông tin thành công!', 'success');
        
        // Đóng modal
        this.closeModals();
    }

    savePassword() {
        console.log('Lưu mật khẩu mới');
        
        // Lấy dữ liệu từ form
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Kiểm tra dữ liệu
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showNotification('Mật khẩu mới và xác nhận mật khẩu không khớp!', 'error');
            return;
        }
        
        // Giả lập kiểm tra mật khẩu hiện tại
        // Trong thực tế, cần gửi yêu cầu đến server để xác thực
        if (currentPassword !== 'password') {
            this.showNotification('Mật khẩu hiện tại không đúng!', 'error');
            return;
        }
        
        // Hiển thị thông báo thành công
        this.showNotification('Đổi mật khẩu thành công!', 'success');
        
        // Đóng modal
        this.closeModals();
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

// Khởi tạo quản lý hồ sơ khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM đã tải xong, khởi tạo TeacherProfile');
    if (!window.profileManager) {
        window.profileManager = new TeacherProfile();
    }
}); 