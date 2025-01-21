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
            const content = await response.text();
            this.pageContent.innerHTML = content;

            // Đợi DOM cập nhật
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Khởi tạo chức năng
            this.initializePageFunctions(page);
            this.currentPage = page;
        } catch (error) {
            console.error('Error loading page:', error);
        }
    }

    initializePageFunctions(page) {
        try {
            // Hủy các instance cũ
            if (window.studentManager) window.studentManager = null;
            if (window.scoreManager) window.scoreManager = null;
            if (window.statisticsManager) window.statisticsManager = null;
            if (window.dashboardManager) window.dashboardManager = null;

            // Khởi tạo manager mới theo trang
            switch(page) {
                case 'dashboard':
                    window.dashboardManager = new TeacherDashboard();
                    break;
                case 'students':
                    window.studentManager = new StudentManager();
                    break;
                case 'scores':
                    window.scoreManager = new ScoreManager();
                    break;
                case 'statistics':
                    if (window.StatisticsManager) {
                        window.statisticsManager = new window.StatisticsManager();
                    }
                    break;
            }
        } catch (error) {
            console.error('Error in initializePageFunctions:', error);
        }
    }

    // Hàm cập nhật lại dữ liệu cho tất cả các trang
    refreshAllPages() {
        // Cập nhật trang hiện tại
        switch(this.currentPage) {
            case 'dashboard':
                if (window.dashboardManager) {
                    window.dashboardManager.updateStats();
                }
                break;
            case 'students':
                if (window.studentManager) {
                    window.studentManager.loadStudents();
                }
                break;
            case 'scores':
                if (window.scoreManager) {
                    window.scoreManager.loadScores();
                }
                break;
            case 'statistics':
                if (window.statisticsManager) {
                    window.statisticsManager.updateStatistics();
                }
                break;
        }
    }
}

// Khởi tạo navigation và export để các module khác có thể sử dụng
let navigationInstance;
document.addEventListener('DOMContentLoaded', () => {
    navigationInstance = new Navigation();
    window.navigationInstance = navigationInstance;
    // Load trang mặc định
    navigationInstance.loadPage('dashboard');
}); 