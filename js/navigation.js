class Navigation {
    constructor() {
        // Kiểm tra xác thực trước khi khởi tạo
        if (!window.auth || !window.auth.checkAuth()) {
            return;
        }

        this.mainContent = document.getElementById('mainContent');
        this.loadingOverlay = document.getElementById('contentLoading');
        this.setupEventListeners();
        this.loadDefaultPage();
    }

    setupEventListeners() {
        // Xử lý sự kiện cho các liên kết trong sidebar
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('data-target');
                this.loadPage(target);

                // Cập nhật trạng thái active
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Xử lý sự kiện cho nút menu mobile
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('show');
            });
        }

        // Xử lý sự kiện cho nút logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (window.auth) {
                    window.auth.logout();
                }
            });
        }

        // Xử lý sự kiện khi người dùng sử dụng nút back/forward của trình duyệt
        window.addEventListener('popstate', (event) => {
            const pageName = event.state?.page || 'dashboard';
            this.loadPage(pageName, false); // false: không thêm vào history
        });
    }

    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
        }
    }

    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }

    async loadPage(pageName, addToHistory = true) {
        if (!this.mainContent) return;

        // Kiểm tra xác thực trước khi tải trang
        if (!window.auth || !window.auth.checkAuth()) {
            return;
        }

        this.showLoading();
        
        try {
            // Kiểm tra quyền truy cập trang
            if (!this.checkPageAccess(pageName)) {
                throw new Error('Bạn không có quyền truy cập trang này');
            }

            // Thêm tiền tố dựa vào role của người dùng
            let prefix = '';
            const user = window.auth.getCurrentUser();
            if (user) {
                prefix = user.role + '-';
            }

            const response = await fetch(`components/${prefix}${pageName}-content.html`);
            if (!response.ok) {
                throw new Error(`Không thể tải trang: ${response.statusText}`);
            }

            const content = await response.text();
            
            // Kiểm tra nội dung trước khi hiển thị
            if (!content.trim()) {
                throw new Error('Trang không có nội dung');
            }

            this.mainContent.innerHTML = content;

            // Cập nhật URL nếu cần
            if (addToHistory) {
                history.pushState({page: pageName}, '', `#${pageName}`);
            }

            // Cập nhật tiêu đề trang
            this.updatePageTitle(pageName);

            // Khởi tạo các chức năng cho trang mới
            await this.initializePageFunctions(pageName);

            // Cập nhật trạng thái active cho sidebar
            this.updateSidebarActive(pageName);

        } catch (error) {
            console.error('Lỗi khi tải trang:', error);
            this.showErrorMessage(error.message || 'Không thể tải trang. Vui lòng thử lại sau.');
        } finally {
            this.hideLoading();
        }
    }

    checkPageAccess(pageName) {
        // Kiểm tra quyền truy cập dựa trên role
        const user = window.auth.getCurrentUser();
        if (!user) return false;

        // Các trang chung cho mọi role
        const commonPages = ['profile', 'settings'];
        if (commonPages.includes(pageName)) return true;

        // Kiểm tra quyền truy cập theo role
        switch (user.role) {
            case 'teacher':
                return pageName.startsWith('teacher-') || !pageName.includes('-');
            case 'student':
                return pageName.startsWith('student-') || !pageName.includes('-');
            case 'admin':
                return pageName.startsWith('admin-') || !pageName.includes('-');
            default:
                return false;
        }
    }

    updatePageTitle(pageName) {
        const titles = {
            'dashboard': 'Trang Chủ',
            'schedule': 'Lịch Dạy',
            'scores': 'Quản Lý Điểm',
            'students': 'Danh Sách Học Sinh',
            'classes': 'Lớp Học',
            'reports': 'Báo Cáo',
            'profile': 'Hồ Sơ Cá Nhân',
            'settings': 'Cài Đặt'
        };

        const baseTitle = 'Hệ Thống Quản Lý Giáo Viên';
        const pageTitle = titles[pageName] || 'Trang Không Xác Định';
        document.title = `${pageTitle} | ${baseTitle}`;
    }

    updateSidebarActive(pageName) {
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        sidebarLinks.forEach(link => {
            const target = link.getAttribute('data-target');
            if (target === pageName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    loadDefaultPage() {
        // Tải trang mặc định hoặc trang từ hash URL
        const hash = window.location.hash.slice(1) || 'dashboard';
        this.loadPage(hash);
    }

    showErrorMessage(message) {
        if (this.mainContent) {
            this.mainContent.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Đã xảy ra lỗi</h3>
                    <p>${message}</p>
                    <button onclick="window.navigation.loadDefaultPage()" class="btn-primary">
                        Quay lại trang chủ
                    </button>
                </div>
            `;
        }
    }

    async initializePageFunctions(pageName) {
        try {
            // Khởi tạo các chức năng tương ứng với từng trang
            switch (pageName) {
                case 'dashboard':
                    if (window.teacherDashboard) {
                        await window.teacherDashboard.initialize();
                    }
                    break;
                case 'schedule':
                    if (window.teacherSchedule) {
                        await window.teacherSchedule.initialize();
                    }
                    break;
                case 'scores':
                    if (window.teacherScores) {
                        await window.teacherScores.initialize();
                    }
                    break;
                case 'students':
                    if (window.teacherStudents) {
                        await window.teacherStudents.initialize();
                    }
                    break;
                case 'profile':
                    if (window.teacherProfile) {
                        await window.teacherProfile.initialize();
                    }
                    break;
            }
        } catch (error) {
            console.error(`Lỗi khi khởi tạo trang ${pageName}:`, error);
            throw new Error('Không thể khởi tạo trang. Vui lòng thử lại sau.');
        }
    }
}

// Khởi tạo Navigation khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
}); 