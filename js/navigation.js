class Navigation {
    constructor() {
        this.currentPage = 'dashboard';
        this.initializeNavigation();
    }

    initializeNavigation() {
        document.querySelectorAll('.sidebar a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = e.currentTarget.getAttribute('href');
                
                // Kiểm tra nếu là link trực tiếp đến file HTML
                if (href.endsWith('.html')) {
                    window.location.href = href;
                    return;
                }
                
                const page = href.substring(1);
                this.loadPage(page);
            });
        });

        // Load trang mặc định
        this.loadPage('dashboard');
    }

    async loadPage(page) {
        try {
            console.log('Loading page:', page); // Debug log
            
            // Không cần xử lý đặc biệt cho trang profile nữa
            // if (page === 'profile') {
            //     window.location.href = 'student-profile.html';
            //     return;
            // }
            
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
        console.log('Khởi tạo component cho trang:', page);
        
        switch(page) {
            case 'dashboard':
                if (typeof StudentDashboard !== 'undefined') {
                    console.log('Khởi tạo StudentDashboard');
                    window.dashboardInstance = new StudentDashboard();
                } else {
                    console.error('StudentDashboard class is not defined');
                }
                break;
            case 'scores':
                if (typeof StudentScores !== 'undefined') {
                    console.log('Khởi tạo StudentScores');
                    window.scoresInstance = new StudentScores();
                } else {
                    console.error('StudentScores class is not defined');
                }
                break;
            case 'schedule':
                if (typeof StudentSchedule !== 'undefined') {
                    console.log('Khởi tạo StudentSchedule');
                    window.scheduleInstance = new StudentSchedule();
                } else {
                    console.error('StudentSchedule class is not defined');
                }
                break;
            case 'profile':
                console.log('Chuẩn bị khởi tạo StudentProfile');
                if (typeof StudentProfile !== 'undefined') {
                    console.log('Khởi tạo StudentProfile từ navigation.js');
                    // Đảm bảo chỉ tạo một instance
                    if (!window.studentProfile) {
                        window.studentProfile = new StudentProfile();
                    } else {
                        console.log('StudentProfile đã tồn tại, tải lại dữ liệu');
                        window.studentProfile.loadProfileData();
                        window.studentProfile.loadAvatar();
                    }
                } else {
                    console.error('StudentProfile class is not defined - có thể script chưa được tải');
                    // Thử tải script
                    const script = document.createElement('script');
                    script.src = 'js/student-profile.js';
                    script.onload = () => {
                        console.log('Đã tải student-profile.js, khởi tạo StudentProfile');
                        if (typeof StudentProfile !== 'undefined') {
                            window.studentProfile = new StudentProfile();
                        }
                    };
                    document.body.appendChild(script);
                }
                break;
            case 'notifications':
                if (typeof StudentNotifications !== 'undefined') {
                    console.log('Khởi tạo StudentNotifications');
                    window.notificationsInstance = new StudentNotifications();
                } else {
                    console.error('StudentNotifications class is not defined');
                }
                break;
        }
    }

    updateActiveLink(page) {
        // Cập nhật trạng thái active cho menu
        document.querySelectorAll('.sidebar li').forEach(li => {
            li.classList.remove('active');
        });
        const activeLink = document.querySelector(`.sidebar a[href="#${page}"]`) || 
                          document.querySelector(`.sidebar a[href="student-${page}.html"]`);
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