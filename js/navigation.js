class Navigation {
    constructor() {
        this.currentPage = 'dashboard';
        this.pageContent = document.getElementById('pageContent');
        this.initializeNavigation();
    }

    initializeNavigation() {
        document.querySelectorAll('.sidebar li').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.loadPage(page);
            });
        });
    }

    async loadPage(page) {
        try {
            // Cập nhật active state
            document.querySelectorAll('.sidebar li').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.page === page) {
                    item.classList.add('active');
                }
            });

            // Load nội dung trang
            const response = await fetch(`components/teacher-${page}-content.html`);
            if (!response.ok) throw new Error('Không thể tải trang');
            
            const content = await response.text();
            this.pageContent.innerHTML = content;

            // Khởi tạo các chức năng cho trang mới
            this.initializePageFunctions(page);
        } catch (error) {
            console.error('Error loading page:', error);
            this.pageContent.innerHTML = '<div class="error">Không thể tải trang. Vui lòng thử lại sau.</div>';
        }
    }

    initializePageFunctions(page) {
        switch(page) {
            case 'dashboard':
                new TeacherDashboard();
                break;
            case 'students':
                new StudentManager();
                break;
            case 'scores':
                // Khởi tạo trang điểm
                break;
            case 'statistics':
                // Khởi tạo trang thống kê
                break;
        }
    }
}

// Khởi tạo navigation khi trang load
document.addEventListener('DOMContentLoaded', () => {
    const navigation = new Navigation();
    // Load trang mặc định
    navigation.loadPage('dashboard');
}); 