class Navigation {
    constructor() {
        this.currentPage = 'dashboard';
        this.initializeNavigation();
    }

    initializeNavigation() {
        document.querySelectorAll('.sidebar a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.getAttribute('href').substring(1);
                this.loadPage(page);
            });
        });

        // Load trang mặc định
        this.loadPage('dashboard');
    }

    async loadPage(page) {
        try {
            console.log('Loading page:', page); // Debug log
            const response = await fetch(`components/student-${page}-content.html`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const content = await response.text();
            const mainContent = document.querySelector('main.dashboard');
            if (mainContent) {
                mainContent.innerHTML = content;
                this.initializeComponent(page);
                this.updateActiveLink(page);
            } else {
                console.error('Main content container not found');
            }
        } catch (error) {
            console.error('Error loading page:', error);
        }
    }

    initializeComponent(page) {
        // Khởi tạo component tương ứng
        switch(page) {
            case 'dashboard':
                new StudentDashboard();
                break;
            case 'scores':
                new StudentScores();
                break;
            case 'schedule':
                new StudentSchedule();
                break;
            case 'profile':
                new StudentProfile();
                break;
            case 'notifications':
                new StudentNotifications();
                break;
        }
    }

    updateActiveLink(page) {
        // Cập nhật trạng thái active cho menu
        document.querySelectorAll('.sidebar li').forEach(li => {
            li.classList.remove('active');
        });
        const activeLink = document.querySelector(`.sidebar a[href="#${page}"]`);
        if (activeLink) {
            activeLink.parentElement.classList.add('active');
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

function loadPageContent(page) {
    let filePath = '';
    switch(page) {
        case 'schedule':
            filePath = 'components/teacher-schedule-content.html';
            break;
        // ... các case khác ...
    }

    fetch(filePath)
        .then(response => response.text())
        .then(content => {
            document.getElementById('pageContent').innerHTML = content;
            
            if (page === 'schedule') {
                const script = document.createElement('script');
                script.src = 'js/teacher-schedule.js';
                document.body.appendChild(script);
            }
        })
        .catch(error => {
            console.error('Lỗi tải nội dung:', error);
        });
} 