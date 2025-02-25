class Navigation {
    constructor(userRole) {
        console.log(`Khởi tạo Navigation cho vai trò: ${userRole}`);
        this.userRole = userRole;
        this.mainContent = document.getElementById('mainContent');
        
        if (!this.mainContent) {
            console.error("Không tìm thấy phần tử có id 'mainContent'");
            return;
        }
        
        this.loadedScripts = [];
        
        // Đảm bảo dữ liệu được tải trước khi thiết lập navigation
        this.ensureDataLoaded();
        
        // Thiết lập các sự kiện điều hướng
        this.setupNavigationEvents();
    }

    setupNavigationEvents() {
        const links = document.querySelectorAll('.sidebar-link');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Xóa lớp active từ tất cả các liên kết
                links.forEach(l => l.classList.remove('active'));
                
                // Thêm lớp active cho liên kết được nhấp
                link.classList.add('active');
                
                // Tải nội dung tương ứng
                const pageName = link.getAttribute('data-page');
                this.loadPage(pageName);
            });
        });
    }

    async loadPage(pageName) {
        try {
            console.log(`Đang tải trang: ${pageName}`);
            
            if (!pageName) {
                console.error("Tên trang không được cung cấp");
                this.showErrorMessage('Lỗi: Tên trang không hợp lệ.');
                return;
            }
            
            if (!this.mainContent) {
                console.error("mainContent không tồn tại, không thể tải trang");
                return;
            }
            
            // Hiển thị loading indicator
            this.showLoadingIndicator();
            
            // Đảm bảo dữ liệu được tải trước khi chuyển trang
            this.ensureDataLoaded();
            
            // Fetch nội dung HTML
            try {
                const response = await fetch(`components/${pageName}.html`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const htmlContent = await response.text();
                
                // Cập nhật nội dung
                this.mainContent.innerHTML = htmlContent;
                
                // Tải các file CSS cần thiết
                this.loadRequiredCSS(pageName);
                
                // Tải và thực thi các script tương ứng
                await this.loadPageScripts(pageName);
                
                // Đảm bảo teacher-dashboard.js cập nhật lại các phần tử nếu trang là dashboard
                if (pageName === 'teacher-dashboard-content' && window.dashboardInstance) {
                    console.log('Cập nhật lại dashboard sau khi tải');
                    // Đợi một khoảng thời gian ngắn để DOM được cập nhật
                    setTimeout(() => {
                        // Cập nhật tên giáo viên và thời gian
                        if (typeof window.dashboardInstance.updateTeacherName === 'function') {
                            window.dashboardInstance.updateTeacherName();
                        }
                        
                        if (typeof window.dashboardInstance.updateDateTime === 'function') {
                            window.dashboardInstance.updateDateTime();
                        }
                    }, 100);
                }
                
                console.log(`Đã tải trang: ${pageName}`);
            } catch (error) {
                console.error(`Lỗi khi tải trang ${pageName}:`, error);
                this.showErrorMessage(`Không thể tải nội dung trang ${pageName}. Lỗi: ${error.message}`);
            }
        } catch (error) {
            console.error('Lỗi khi tải trang:', error);
            this.showErrorMessage('Không thể tải nội dung trang. Vui lòng thử lại sau.');
        }
    }

    loadRequiredCSS(pageName) {
        console.log(`Đang tải CSS cho trang: ${pageName}`);
        
        // Xác định CSS cần tải dựa trên tên trang
        const cssFileName = pageName.replace('-content', '');
        const cssPath = `css/${cssFileName}.css`;
        
        // Kiểm tra xem CSS đã được tải chưa
        const existingLink = document.querySelector(`link[href="${cssPath}"]`);
        if (!existingLink) {
            try {
                // Thêm preload hint để tăng tốc tải CSS
                const preloadLink = document.createElement('link');
                preloadLink.rel = 'preload';
                preloadLink.as = 'style';
                preloadLink.href = cssPath;
                document.head.appendChild(preloadLink);
                
                // Tạo thẻ link cho CSS mới
                const linkElement = document.createElement('link');
                linkElement.rel = 'stylesheet';
                linkElement.href = cssPath;
                
                // Theo dõi thời gian tải
                let cssLoadStartTime = Date.now();
                
                // Xử lý sự kiện load và error
                linkElement.onload = () => {
                    let loadTime = Date.now() - cssLoadStartTime;
                    console.log(`Đã tải CSS ${cssPath} trong ${loadTime}ms`);
                };
                
                linkElement.onerror = () => {
                    console.warn(`Không thể tải file CSS: ${cssPath}, sử dụng CSS mặc định`);
                    // Sử dụng CSS mặc định cho vai trò
                    linkElement.href = this.userRole === 'teacher' 
                        ? 'css/teacher-default.css' 
                        : 'css/student-dashboard.css';
                };
                
                // Kiểm tra xem file CSS có tồn tại không
                fetch(cssPath)
                    .then(response => {
                        if (!response.ok) {
                            console.warn(`Không thể tải file CSS: ${cssPath}, sử dụng CSS mặc định`);
                            // Sử dụng CSS mặc định cho vai trò
                            linkElement.href = this.userRole === 'teacher' 
                                ? 'css/teacher-default.css' 
                                : 'css/student-dashboard.css';
                        }
                        return response.text();
                    })
                    .catch(error => {
                        console.error(`Lỗi khi tải CSS ${cssPath}:`, error);
                        // Đảm bảo có CSS dự phòng
                        linkElement.href = this.userRole === 'teacher' 
                            ? 'css/teacher-default.css' 
                            : 'css/student-dashboard.css';
                    });
                
                // Đặt ưu tiên tải CSS
                linkElement.setAttribute('importance', 'high');
                
                // Thêm vào phần head của document
                document.head.appendChild(linkElement);
                
                // Thêm inline style để tránh FOUC (Flash of Unstyled Content)
                if (pageName.includes('dashboard')) {
                    this.addInlineStyleForDashboard();
                }
                
                // Thêm CSS cơ bản ngay lập tức để tránh bị trống trong thời gian tải
                this.addImmediateBasicStyles();
                
                console.log(`CSS đã được thêm vào head: ${cssPath}`);
            } catch (error) {
                console.error('Lỗi khi tải CSS:', error);
                
                // Trong trường hợp lỗi, thêm CSS inline cơ bản
                this.addFallbackInlineStyle();
            }
        } else {
            console.log(`CSS đã tồn tại: ${cssPath}`);
        }
    }

    addInlineStyleForDashboard() {
        // Thêm style inline cho dashboard để tránh FOUC
        const style = document.createElement('style');
        style.textContent = `
            .dashboard-container {
                display: flex;
                min-height: calc(100vh - 64px);
            }
            
            .main-content {
                flex: 1;
                padding: 20px;
                margin-left: 250px;
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
            
            .welcome-section {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                background-color: white;
                border-radius: 12px;
                padding: 20px 30px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            }
            
            @media (max-width: 768px) {
                .main-content {
                    margin-left: 80px;
                }
            }
        `;
        document.head.appendChild(style);
        console.log('Đã thêm inline style cho dashboard');
    }

    addFallbackInlineStyle() {
        // Thêm style fallback cơ bản trong trường hợp không tải được CSS
        const style = document.createElement('style');
        style.textContent = `
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f5f7fb;
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
            }
        `;
        document.head.appendChild(style);
        console.log('Đã thêm inline style fallback do không tải được CSS');
    }

    addImmediateBasicStyles() {
        // Thêm CSS cơ bản ngay lập tức để tránh bị trống trong thời gian tải
        const style = document.createElement('style');
        style.textContent = `
            body {
                font-family: 'Segoe UI', Tahoma, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f5f7fb;
                color: #333;
            }
            
            .container, .scores-content, .dashboard-content {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .modal {
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-content {
                background-color: white;
                padding: 0;
                border-radius: 8px;
                width: 80%;
                max-width: 600px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                position: relative;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .table th, 
            .table td {
                padding: 12px 15px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            
            .btn {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
            }
            
            .btn-primary {
                background-color: #4a6da7;
                color: white;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-control {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
        console.log('Đã thêm basic styles ngay lập tức để tránh FOUC');
    }

    loadPageScripts(pageName) {
        console.log(`Đang tải script cho trang: ${pageName}`);
        
        // Chuẩn bị danh sách script cần tải dựa trên trang
        let scriptsToLoad = [];
        
        // Lấy tên script từ tên trang (bỏ -content)
        const scriptBaseName = pageName.replace('-content', '');
        
        // Thêm script tương ứng với trang
        if (pageName === 'teacher-dashboard-content') {
            // Dashboard đã được tải trong file HTML chính
            console.log('Dashboard script đã được tải trong file HTML chính');
        } else if (pageName === 'teacher-students-content') {
            scriptsToLoad.push('js/teacher-students.js');
        } else if (pageName === 'teacher-scores-content') {
            scriptsToLoad.push('js/teacher-scores.js');
        } else if (pageName === 'teacher-schedule-content') {
            scriptsToLoad.push('js/teacher-schedule.js');
        } else if (pageName === 'teacher-profile-content') {
            scriptsToLoad.push('js/teacher-profile.js');
        } else if (pageName === 'student-dashboard-content') {
            scriptsToLoad.push('js/student-dashboard.js');
        }
        
        // Tải tất cả script đã xác định
        scriptsToLoad.forEach(scriptPath => {
            this.loadScript(scriptPath);
        });
    }

    loadScript(src) {
        // Kiểm tra xem script đã được tải chưa
        if (this.loadedScripts.includes(src)) {
            console.log(`Script đã tồn tại: ${src}`);
            return Promise.resolve();
        }
        
        console.log(`Đang tải script: ${src}`);
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            script.onload = () => {
                console.log(`Đã tải script: ${src}`);
                this.loadedScripts.push(src);
                
                // Khởi tạo các đối tượng cần thiết sau khi tải script
                this.initializeComponentAfterScriptLoad(src);
                
                resolve();
            };
            
            script.onerror = (error) => {
                console.error(`Lỗi khi tải script: ${src}`, error);
                // Tạo lớp giả cho script không tồn tại để tránh lỗi
                this.createEmptyClassForMissingScript(src);
                reject(error);
            };
            
            document.head.appendChild(script);
        });
    }

    initializeComponentAfterScriptLoad(scriptPath) {
        // Khởi tạo component tương ứng sau khi script được tải
        try {
            if (scriptPath === 'js/teacher-scores.js') {
                console.log('Khởi tạo TeacherScores sau khi tải script');
                if (typeof TeacherScores === 'function' && !window.scoreManager) {
                    window.scoreManager = new TeacherScores();
                }
            } else if (scriptPath === 'js/teacher-students.js') {
                console.log('Khởi tạo TeacherStudents sau khi tải script');
                if (typeof TeacherStudents === 'function' && !window.studentManager) {
                    window.studentManager = new TeacherStudents();
                }
            } else if (scriptPath === 'js/teacher-schedule.js') {
                console.log('Khởi tạo TeacherSchedule sau khi tải script');
                if (typeof TeacherSchedule === 'function' && !window.scheduleManager) {
                    window.scheduleManager = new TeacherSchedule();
                }
            }
        } catch (error) {
            console.error('Lỗi khi khởi tạo component:', error);
        }
    }

    createEmptyClassForMissingScript(scriptPath) {
        // Tạo các lớp giả để tránh lỗi khi script không tồn tại
        try {
            if (scriptPath === 'js/teacher-scores.js' && typeof TeacherScores === 'undefined') {
                console.warn('Tạo lớp TeacherScores giả');
                window.TeacherScores = class {
                    constructor() {
                        console.warn('Đây là lớp TeacherScores giả. Script thực chưa được tải.');
                    }
                };
                window.scoreManager = new TeacherScores();
            } else if (scriptPath === 'js/teacher-students.js' && typeof TeacherStudents === 'undefined') {
                console.warn('Tạo lớp TeacherStudents giả');
                window.TeacherStudents = class {
                    constructor() {
                        console.warn('Đây là lớp TeacherStudents giả. Script thực chưa được tải.');
                    }
                };
                window.studentManager = new TeacherStudents();
            }
        } catch (error) {
            console.error('Lỗi khi tạo lớp giả:', error);
        }
    }

    ensureDataLoaded() {
        console.log('Đảm bảo dữ liệu được tải');
        
        // Kiểm tra và tải dữ liệu người dùng hiện tại
        this.checkAndLoadCurrentUser();
        
        // Kiểm tra và tải dữ liệu học sinh
        this.checkAndLoadStudentsData();
        
        // Kiểm tra và tải dữ liệu điểm số
        this.checkAndLoadScoresData();
    }

    checkAndLoadCurrentUser() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            console.warn('Không tìm thấy dữ liệu người dùng hiện tại, đang tải dữ liệu mẫu');
            
            // Tải dữ liệu mẫu dựa trên vai trò
            if (this.userRole === 'teacher') {
                this.loadSampleTeacherData();
            } else if (this.userRole === 'student') {
                this.loadSampleStudentData();
            }
        } else {
            console.log('Đã có dữ liệu người dùng hiện tại');
        }
    }

    checkAndLoadStudentsData() {
        const studentsData = localStorage.getItem('students');
        if (!studentsData) {
            console.warn('Không tìm thấy dữ liệu học sinh, đang tải dữ liệu mẫu');
            this.loadSampleStudentsData();
        } else {
            console.log('Đã có dữ liệu học sinh');
        }
    }

    checkAndLoadScoresData() {
        const scoresData = localStorage.getItem('scores');
        if (!scoresData) {
            console.warn('Không tìm thấy dữ liệu điểm số, đang tải dữ liệu mẫu');
            this.loadSampleScoresData();
        } else {
            console.log('Đã có dữ liệu điểm số');
        }
    }

    loadSampleTeacherData() {
        const sampleTeacher = {
            id: 'T001',
            username: 'teacher',
            fullName: 'Nguyễn Văn Thành',
            email: 'teacher@example.com',
            department: 'Khoa học tự nhiên',
            role: 'teacher'
        };
        
        localStorage.setItem('currentUser', JSON.stringify(sampleTeacher));
        console.log('Đã tải dữ liệu giáo viên mẫu');
    }

    loadSampleStudentData() {
        const sampleStudent = {
            id: 'SV001',
            username: 'student',
            fullName: 'Trần Văn An',
            email: 'student@example.com',
            class: '10A1',
            role: 'student'
        };
        
        localStorage.setItem('currentUser', JSON.stringify(sampleStudent));
        console.log('Đã tải dữ liệu học sinh mẫu');
    }

    loadSampleStudentsData() {
        const sampleStudents = [
            { id: 'SV001', fullName: 'Trần Văn An', class: '10A1', gender: 'Nam', birthdate: '2006-05-10' },
            { id: 'SV002', fullName: 'Nguyễn Thị Bình', class: '10A1', gender: 'Nữ', birthdate: '2006-08-15' },
            { id: 'SV003', fullName: 'Lê Hoàng Cường', class: '10A2', gender: 'Nam', birthdate: '2006-03-22' },
            { id: 'SV004', fullName: 'Phạm Thị Dung', class: '10A2', gender: 'Nữ', birthdate: '2006-11-05' },
            { id: 'SV005', fullName: 'Hoàng Văn Đức', class: '11B1', gender: 'Nam', birthdate: '2005-07-30' },
            { id: 'SV006', fullName: 'Trần Thị Hà', class: '11B1', gender: 'Nữ', birthdate: '2005-09-25' },
            { id: 'SV007', fullName: 'Nguyễn Văn Khoa', class: '11B2', gender: 'Nam', birthdate: '2005-04-12' },
            { id: 'SV008', fullName: 'Võ Thị Lan', class: '11B2', gender: 'Nữ', birthdate: '2005-12-28' },
            { id: 'SV009', fullName: 'Trần Minh Quân', class: '12C1', gender: 'Nam', birthdate: '2004-02-18' },
            { id: 'SV010', fullName: 'Nguyễn Thị Xuân', class: '12C1', gender: 'Nữ', birthdate: '2004-06-08' }
        ];
        
        localStorage.setItem('students', JSON.stringify(sampleStudents));
        console.log('Đã tải dữ liệu danh sách học sinh mẫu');
    }

    loadSampleScoresData() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const sampleScores = [
            { id: 1, studentId: 'SV001', subject: 'Toán học', score: 8.5, type: 'Kiểm tra', date: today.toISOString().split('T')[0] },
            { id: 2, studentId: 'SV002', subject: 'Toán học', score: 7.5, type: 'Kiểm tra', date: today.toISOString().split('T')[0] },
            { id: 3, studentId: 'SV003', subject: 'Toán học', score: 9.0, type: 'Kiểm tra', date: today.toISOString().split('T')[0] },
            { id: 4, studentId: 'SV001', subject: 'Vật lý', score: 8.0, type: 'Kiểm tra', date: yesterday.toISOString().split('T')[0] },
            { id: 5, studentId: 'SV002', subject: 'Vật lý', score: 6.5, type: 'Kiểm tra', date: yesterday.toISOString().split('T')[0] },
            { id: 6, studentId: 'SV003', subject: 'Vật lý', score: 7.5, type: 'Kiểm tra', date: yesterday.toISOString().split('T')[0] },
            { id: 7, studentId: 'SV001', subject: 'Hóa học', score: 7.0, type: 'Kiểm tra', date: lastWeek.toISOString().split('T')[0] },
            { id: 8, studentId: 'SV002', subject: 'Hóa học', score: 8.0, type: 'Kiểm tra', date: lastWeek.toISOString().split('T')[0] },
            { id: 9, studentId: 'SV003', subject: 'Hóa học', score: 9.5, type: 'Kiểm tra', date: lastWeek.toISOString().split('T')[0] }
        ];
        
        localStorage.setItem('scores', JSON.stringify(sampleScores));
        console.log('Đã tải dữ liệu điểm số mẫu');
    }

    showErrorMessage(message) {
        if (!this.mainContent) {
            console.error("mainContent không tồn tại, không thể hiển thị lỗi");
            return;
        }
        
        console.error("Hiển thị thông báo lỗi:", message);
        
        this.mainContent.innerHTML = `
            <div class="error-container" style="
                text-align: center;
                padding: 2rem;
                margin: 2rem auto;
                max-width: 600px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            ">
                <div class="error-icon" style="
                    color: #e53935;
                    font-size: 4rem;
                    margin-bottom: 1rem;
                ">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="error-title" style="
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    color: #333;
                ">
                    Đã xảy ra lỗi
                </div>
                <div class="error-message" style="
                    color: #666;
                    margin-bottom: 1.5rem;
                    line-height: 1.5;
                ">${message}</div>
                <button class="error-button" style="
                    background-color: #4a6da7;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                " onclick="window.location.reload()">
                    Tải lại trang
                </button>
            </div>
        `;
    }

    showLoadingIndicator() {
        if (!this.mainContent) return;
        
        this.mainContent.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải...</p>
            </div>
        `;
    }
}

// Khởi tạo navigation và export để các module khác có thể sử dụng
let navigationInstance;
document.addEventListener('DOMContentLoaded', () => {
    navigationInstance = new Navigation();
    window.navigationInstance = navigationInstance;
});

// Hàm tiện ích để tải nội dung trang từ bên ngoài
function loadPageContent(page) {
    if (window.navigationInstance) {
        window.navigationInstance.loadPage(page);
    } else {
        console.error('Navigation instance not initialized');
    }
} 