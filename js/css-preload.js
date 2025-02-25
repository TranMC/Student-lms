/**
 * Script tiền tải CSS cho ứng dụng
 * Được thiết kế để tải trước các tập tin CSS cần thiết
 * và đảm bảo người dùng không thấy trạng thái không có CSS (FOUC)
 */

(function() {
    console.log('CSS Preloader đang chạy');
    
    // Danh sách các CSS cốt lõi cần tải trước
    const coreCssFiles = [
        'css/teacher-default.css',
        'css/dashboard.css'
    ];
    
    // Danh sách các CSS trang cụ thể
    const pageCssFiles = {
        'teacher-dashboard': 'css/teacher-dashboard.css',
        'teacher-scores': 'css/teacher-scores.css',
        'teacher-students': 'css/teacher-students.css',
        'teacher-schedule': 'css/teacher-schedule.css',
        'student-dashboard': 'css/student-dashboard.css',
        'student-scores': 'css/student-scores.css'
    };
    
    // Hàm tạo preload hint
    function createPreloadLink(href) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = href;
        return link;
    }
    
    // Hàm tạo stylesheet link
    function createStylesheetLink(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        return link;
    }
    
    // Hàm tạo inline style
    function createInlineStyle() {
        const style = document.createElement('style');
        style.textContent = `
            body {
                font-family: 'Segoe UI', Tahoma, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f5f7fb;
                color: #333;
            }
            
            .header {
                background-color: #4361ee;
                color: white;
                padding: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .sidebar {
                width: 250px;
                background-color: white;
                position: fixed;
                height: 100%;
                overflow-y: auto;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            
            .main-content {
                margin-left: 250px;
                padding: 20px;
            }
            
            .loading-indicator {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 300px;
                color: #4a6da7;
                font-size: 1.2rem;
            }
            
            @media (max-width: 768px) {
                .main-content {
                    margin-left: 80px;
                }
            }
        `;
        return style;
    }
    
    // Thêm inline style ngay lập tức để tránh FOUC
    document.head.appendChild(createInlineStyle());
    
    // Tải CSS cốt lõi
    coreCssFiles.forEach(cssFile => {
        // Thêm preload hint
        document.head.appendChild(createPreloadLink(cssFile));
        
        // Thêm stylesheet
        document.head.appendChild(createStylesheetLink(cssFile));
    });
    
    // Xác định trang hiện tại từ URL
    const currentPath = window.location.pathname;
    let currentPage = '';
    
    if (currentPath.includes('teacher-dashboard')) {
        currentPage = 'teacher-dashboard';
    } else if (currentPath.includes('student-dashboard')) {
        currentPage = 'student-dashboard';
    } else {
        // Mặc định là trang đăng nhập hoặc trang chủ
        const loginCss = 'css/login.css';
        document.head.appendChild(createPreloadLink(loginCss));
        document.head.appendChild(createStylesheetLink(loginCss));
    }
    
    // Tải CSS trang cụ thể nếu có
    if (currentPage && pageCssFiles[currentPage]) {
        const pageCss = pageCssFiles[currentPage];
        document.head.appendChild(createPreloadLink(pageCss));
        document.head.appendChild(createStylesheetLink(pageCss));
    }
    
    console.log('CSS Preloader đã tải xong các file CSS cần thiết');
})(); 