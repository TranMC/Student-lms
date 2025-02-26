class Navigation {
    constructor() {
        this.userRole = window.location.href.includes('teacher') ? 'teacher' : 'student';
        this.currentPage = 'dashboard';
        
        // Thêm xử lý sự kiện hash change
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '') || 'dashboard';
            this.loadPage(hash);
        });

        // Xử lý hash ban đầu
        const initialHash = window.location.hash.replace('#', '') || 'dashboard';
        this.loadPage(initialHash);

        this.initializeNavigation();
    }

    // Phát hiện vai trò người dùng dựa trên URL hoặc thẻ body
    detectUserRole() {
        // Kiểm tra URL có chứa 'teacher' không
        if (window.location.href.includes('teacher')) {
            return 'teacher';
        }
        
        // Kiểm tra class của body
        if (document.body.classList.contains('teacher-view')) {
            return 'teacher';
        }
        
        // Mặc định là học sinh
        return 'student';
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
        console.log('Đang tải trang:', page);
        
        // Cập nhật active link
        this.updateActiveLink(page);
        
        // Nếu đang ở trang dashboard, không cần tải lại nội dung
        if (page === 'dashboard') {
            return;
        }

        try {
            // Tải nội dung HTML từ file component
            const response = await fetch(`components/student-${page}-content.html`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();

            // Tìm hoặc tạo phần tử pageContent
            let pageContent = document.getElementById('pageContent');
            if (!pageContent) {
                const mainDashboard = document.querySelector('main.dashboard');
                if (mainDashboard) {
                    pageContent = document.createElement('div');
                    pageContent.id = 'pageContent';
                    mainDashboard.innerHTML = '';
                    mainDashboard.appendChild(pageContent);
                } else {
                    throw new Error('Không tìm thấy main.dashboard');
                }
            }

            // Cập nhật nội dung
            pageContent.innerHTML = html;

            // Khởi tạo component tương ứng
            if (this.userRole === 'student') {
                this.initializeStudentComponent(page);
            } else {
                this.initializeTeacherComponent(page);
            }
        } catch (error) {
            console.error('Lỗi khi tải trang:', error);
            const mainContent = document.querySelector('main.dashboard');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="p-4 text-center">
                        <p class="text-red-500">Có lỗi xảy ra khi tải trang.</p>
                        <p>Vui lòng thử lại sau.</p>
                        <p class="text-sm text-gray-500">${error.message}</p>
                    </div>
                `;
            }
        }
    }

    loadRequiredCSS(prefix, page) {
        // Kiểm tra xem CSS đã được tải chưa
        const cssId = `${prefix}-${page}-css`;
        if (!document.getElementById(cssId)) {
            console.log(`Tải CSS cho ${prefix}-${page}`);
            
            // Tạo link element để tải CSS
            const link = document.createElement('link');
            link.id = cssId;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = `css/${prefix}-${page}.css`;
            link.media = 'all';
            
            // Thêm thuộc tính crossorigin để tránh lỗi MIME type
            link.crossOrigin = 'anonymous';
            
            // Kiểm tra tồn tại của file CSS trước khi thêm vào DOM
            fetch(link.href, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        // File CSS tồn tại, thêm vào head
                        document.head.appendChild(link);
                    } else {
                        console.warn(`CSS không tồn tại: ${link.href}`);
                        // Tải CSS mặc định
                        this.loadDefaultCSS(prefix);
                    }
                })
                .catch(error => {
                    console.error(`Lỗi khi kiểm tra CSS: ${error}`);
                    // Tải CSS mặc định
                    this.loadDefaultCSS(prefix);
                });
        }
    }
    
    loadDefaultCSS(prefix) {
        // Tải CSS mặc định nếu không tìm thấy CSS cụ thể
        const defaultCssId = `${prefix}-default-css`;
        if (!document.getElementById(defaultCssId)) {
            const defaultLink = document.createElement('link');
            defaultLink.id = defaultCssId;
            defaultLink.rel = 'stylesheet';
            defaultLink.type = 'text/css';
            defaultLink.href = `css/${prefix}-default.css`;
            defaultLink.crossOrigin = 'anonymous';
            
            // Kiểm tra tồn tại của file CSS mặc định
            fetch(defaultLink.href, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        document.head.appendChild(defaultLink);
                    } else {
                        console.warn(`CSS mặc định không tồn tại: ${defaultLink.href}`);
                    }
                })
                .catch(error => {
                    console.error(`Lỗi khi kiểm tra CSS mặc định: ${error}`);
                });
        }
    }

    initializeComponent(page) {
        // Khởi tạo component tương ứng dựa trên vai trò
        console.log('Khởi tạo component cho trang:', page, 'vai trò:', this.userRole);
        
        if (this.userRole === 'teacher') {
            this.initializeTeacherComponent(page);
        } else {
            this.initializeStudentComponent(page);
        }
    }
    
    initializeTeacherComponent(page) {
        // Đảm bảo dữ liệu cơ bản đã được tải
        this.ensureDataLoaded();
        
        switch(page) {
            case 'dashboard':
                if (typeof TeacherDashboard !== 'undefined') {
                    console.log('Khởi tạo TeacherDashboard');
                    window.dashboardInstance = new TeacherDashboard();
                } else {
                    console.log('TeacherDashboard class không được định nghĩa, tải script');
                    this.loadScript('js/teacher-dashboard.js');
                }
                break;
            case 'schedule':
                if (typeof TeacherSchedule !== 'undefined') {
                    console.log('Khởi tạo TeacherSchedule');
                    window.scheduleInstance = new TeacherSchedule();
                } else {
                    console.log('TeacherSchedule class không được định nghĩa, tải script');
                    this.loadScript('js/teacher-schedule.js');
                }
                break;
            case 'students':
                if (typeof TeacherStudents !== 'undefined') {
                    console.log('Khởi tạo TeacherStudents');
                    window.studentsInstance = new TeacherStudents();
                } else {
                    console.log('TeacherStudents class không được định nghĩa, tải script');
                    this.loadScript('js/teacher-students.js');
                }
                break;
            case 'scores':
                if (typeof TeacherScores !== 'undefined') {
                    console.log('Khởi tạo TeacherScores');
                    window.scoresInstance = new TeacherScores();
                } else {
                    console.log('TeacherScores class không được định nghĩa, tải script');
                    this.loadScript('js/teacher-scores.js');
                }
                break;
        }
    }
    
    initializeStudentComponent(page) {
        // Đảm bảo dữ liệu cơ bản đã được tải
        this.ensureDataLoaded();
        
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
                // Tải nội dung HTML trước
                const pageContent = document.getElementById('pageContent');
                if (!pageContent) {
                    console.error('Không tìm thấy phần tử pageContent');
                    const mainContent = document.querySelector('main.dashboard');
                    if (mainContent) {
                        const newPageContent = document.createElement('div');
                        newPageContent.id = 'pageContent';
                        mainContent.innerHTML = '';
                        mainContent.appendChild(newPageContent);
                    }
                }

                fetch('components/student-scores-content.html')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(html => {
                        const pageContent = document.getElementById('pageContent');
                        if (pageContent) {
                            pageContent.innerHTML = html;
                            
                            // Phát sự kiện khi nội dung HTML đã được tải
                            window.dispatchEvent(new CustomEvent('studentScoresContentLoaded'));
                            
                            // Khởi tạo hoặc tải lại StudentScores
                            if (typeof StudentScores !== 'undefined') {
                                console.log('Khởi tạo StudentScores mới');
                                if (window.scoresInstance) {
                                    // Nếu đã có instance, chỉ cần tải lại điểm
                                    window.scoresInstance.loadScores();
                                } else {
                                    // Tạo instance mới
                                    window.scoresInstance = new StudentScores();
                                }
                            } else {
                                console.error('StudentScores class is not defined');
                                this.loadScript('js/student-scores.js')
                                    .then(() => {
                                        if (typeof StudentScores !== 'undefined') {
                                            window.scoresInstance = new StudentScores();
                                        } else {
                                            throw new Error('Không thể tải StudentScores class');
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Lỗi khi tải script student-scores.js:', error);
                                        pageContent.innerHTML = `
                                            <div class="p-4 text-center">
                                                <p class="text-red-500">Có lỗi xảy ra khi tải dữ liệu điểm số.</p>
                                                <p>Vui lòng thử lại sau.</p>
                                            </div>
                                        `;
                                    });
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Lỗi khi tải nội dung điểm số:', error);
                        const pageContent = document.getElementById('pageContent');
                        if (pageContent) {
                            pageContent.innerHTML = `
                                <div class="p-4 text-center">
                                    <p class="text-red-500">Có lỗi xảy ra khi tải dữ liệu điểm số.</p>
                                    <p>Vui lòng thử lại sau.</p>
                                </div>
                            `;
                        }
                    });
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
                    this.loadScript('js/student-profile.js');
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

    loadScript(scriptSrc) {
        console.log(`Đang tải script: ${scriptSrc}`);
        
        // Kiểm tra xem script đã được tải chưa
        const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
        if (existingScript) {
            console.log(`Script ${scriptSrc} đã được tải trước đó`);
            return Promise.resolve();
        }
        
        return fetch(scriptSrc, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    return new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = scriptSrc;
                        script.onload = () => {
                            console.log(`Script ${scriptSrc} đã tải thành công`);
                            resolve();
                        };
                        script.onerror = (error) => {
                            console.error(`Lỗi khi tải script ${scriptSrc}:`, error);
                            // Tạo class rỗng để tránh lỗi runtime
                            this.createEmptyScriptClass(scriptSrc);
                            resolve(); // Vẫn resolve để không làm gián đoạn quá trình tải trang
                        };
                        document.body.appendChild(script);
                    });
                } else {
                    console.warn(`Script ${scriptSrc} không tồn tại, tạo class rỗng`);
                    this.createEmptyScriptClass(scriptSrc);
                    return Promise.resolve();
                }
            })
            .catch(error => {
                console.error(`Lỗi khi kiểm tra script ${scriptSrc}:`, error);
                this.createEmptyScriptClass(scriptSrc);
                return Promise.resolve();
            });
    }
    
    createEmptyScriptClass(scriptSrc) {
        const className = this.getClassNameFromSrc(scriptSrc);
        if (className && !window[className]) {
            console.log(`Tạo class rỗng cho ${className}`);
            
            // Tạo class rỗng với các phương thức cơ bản
            window[className] = class {
                constructor() {
                    console.warn(`Đây là class ${className} rỗng được tạo tự động vì không tìm thấy file JS`);
                }
            };
            
            // Tạo instance nếu cần thiết
            if (className === 'TeacherScores') {
                window.scoreManager = new window[className]();
            } else if (className === 'TeacherStudents') {
                window.studentsInstance = new window[className]();
            }
        }
    }
    
    getClassNameFromSrc(scriptSrc) {
        // Lấy tên file từ đường dẫn
        const fileName = scriptSrc.split('/').pop().replace('.js', '');
        
        // Chuyển đổi kebab-case thành PascalCase
        if (fileName === 'teacher-scores') {
            return 'TeacherScores';
        } else if (fileName === 'teacher-students') {
            return 'TeacherStudents';
        } else if (fileName === 'teacher-dashboard') {
            return 'TeacherDashboard';
        } else if (fileName === 'data-service') {
            return 'DataService';
        }
        
        return null;
    }

    updateActiveLink(page) {
        // Cập nhật trạng thái active cho menu
        document.querySelectorAll('.sidebar li').forEach(li => {
            li.classList.remove('active');
        });
        
        // Xác định tiền tố dựa trên vai trò
        const prefix = this.userRole === 'teacher' ? 'teacher' : 'student';
        
        const activeLink = document.querySelector(`.sidebar a[href="#${page}"]`) || 
                          document.querySelector(`.sidebar a[href="${prefix}-${page}.html"]`);
        if (activeLink) {
            activeLink.parentElement.classList.add('active');
        }
        
        // Lưu trang hiện tại
        this.currentPage = page;
    }

    ensureDataLoaded() {
        // Kiểm tra xem dữ liệu cơ bản đã được tải chưa
        console.log('Kiểm tra dữ liệu trong localStorage');
        
        try {
            // Kiểm tra dữ liệu người dùng hiện tại
            const currentUserData = localStorage.getItem('currentUser');
            console.log('Dữ liệu người dùng hiện tại:', currentUserData);
            
            if (!currentUserData) {
                console.warn('Không tìm thấy dữ liệu người dùng hiện tại');
                
                // Kiểm tra vai trò và tải dữ liệu mẫu nếu cần
                if (this.userRole === 'teacher') {
                    console.log('Tải dữ liệu giáo viên mẫu');
                    this.loadSampleTeacherData();
                } else if (this.userRole === 'student') {
                    console.log('Tải dữ liệu học sinh mẫu');
                    this.loadSampleStudentData();
                }
            } else {
                // Kiểm tra xem dữ liệu người dùng có đúng vai trò không
                const user = JSON.parse(currentUserData);
                console.log('Dữ liệu người dùng hiện tại:', user);
                
                if (user.role !== this.userRole) {
                    console.warn(`Vai trò người dùng (${user.role}) không khớp với vai trò hiện tại (${this.userRole})`);
                    
                    // Tải dữ liệu mẫu phù hợp với vai trò hiện tại
                    if (this.userRole === 'teacher') {
                        this.loadSampleTeacherData();
                    } else if (this.userRole === 'student') {
                        this.loadSampleStudentData();
                    }
                }
            }
            
            // Kiểm tra dữ liệu học sinh
            const studentsData = localStorage.getItem('students');
            console.log('Dữ liệu học sinh:', studentsData ? `Đã tìm thấy (${JSON.parse(studentsData).length} học sinh)` : 'Không tìm thấy');
            
            if (!studentsData || JSON.parse(studentsData).length === 0) {
                console.warn('Không tìm thấy dữ liệu học sinh hoặc danh sách rỗng');
                this.loadSampleStudentsData();
            }
            
            // Kiểm tra dữ liệu điểm số
            const scoresData = localStorage.getItem('scores');
            console.log('Dữ liệu điểm số:', scoresData ? `Đã tìm thấy (${JSON.parse(scoresData).length} điểm)` : 'Không tìm thấy');
            
            if (!scoresData || JSON.parse(scoresData).length === 0) {
                console.warn('Không tìm thấy dữ liệu điểm số hoặc danh sách rỗng');
                this.loadSampleScoresData();
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra dữ liệu:', error);
            
            // Nếu có lỗi, tải lại tất cả dữ liệu mẫu
            if (this.userRole === 'teacher') {
                this.loadSampleTeacherData();
            } else {
                this.loadSampleStudentData();
            }
            this.loadSampleStudentsData();
            this.loadSampleScoresData();
        }
    }
    
    loadSampleTeacherData() {
        console.log('Tải dữ liệu giáo viên mẫu');
        
        // Tạo dữ liệu giáo viên mẫu nếu chưa có
        const sampleTeacher = {
            id: 'T001',
            username: 'teacher',
            password: 'password',
            fullName: 'Nguyễn Văn Thành',
            email: 'teacher@example.com',
            phone: '0987654321',
            department: 'Công nghệ thông tin',
            role: 'teacher'
        };
        
        // Lưu vào localStorage
        localStorage.setItem('currentUser', JSON.stringify(sampleTeacher));
        
        // Kiểm tra và tạo danh sách giáo viên nếu chưa có
        const teachersData = localStorage.getItem('teachers');
        if (!teachersData) {
            localStorage.setItem('teachers', JSON.stringify([sampleTeacher]));
        }
    }
    
    loadSampleStudentData() {
        console.log('Tải dữ liệu học sinh mẫu');
        
        // Tạo dữ liệu học sinh mẫu nếu chưa có
        const sampleStudent = {
            id: 'S001',
            username: 'student',
            password: 'password',
            fullName: 'Trần Văn Học',
            email: 'student@example.com',
            phone: '0123456789',
            class: '12A1',
            role: 'student'
        };
        
        // Lưu vào localStorage
        localStorage.setItem('currentUser', JSON.stringify(sampleStudent));
        localStorage.setItem('currentStudent', JSON.stringify(sampleStudent));
    }
    
    loadSampleStudentsData() {
        console.log('Tải danh sách học sinh mẫu');
        
        // Tạo danh sách học sinh mẫu
        const sampleStudents = [
            {
                id: 'S001',
                username: 'student1',
                password: 'password',
                fullName: 'Trần Văn Học',
                email: 'student1@example.com',
                phone: '0123456789',
                class: '12A1'
            },
            {
                id: 'S002',
                username: 'student2',
                password: 'password',
                fullName: 'Nguyễn Thị Hương',
                email: 'student2@example.com',
                phone: '0123456788',
                class: '12A1'
            },
            {
                id: 'S003',
                username: 'student3',
                password: 'password',
                fullName: 'Lê Minh Tuấn',
                email: 'student3@example.com',
                phone: '0123456787',
                class: '12A2'
            }
        ];
        
        // Lưu vào localStorage
        localStorage.setItem('students', JSON.stringify(sampleStudents));
    }
    
    loadSampleScoresData() {
        console.log('Tải dữ liệu điểm số mẫu');
        
        // Tạo dữ liệu điểm số mẫu
        const sampleScores = [
            {
                id: 'SC001',
                studentId: 'S001',
                subject: 'Toán',
                score: 8.5,
                type: 'Giữa kỳ',
                date: '2023-10-15'
            },
            {
                id: 'SC002',
                studentId: 'S001',
                subject: 'Văn',
                score: 7.5,
                type: 'Giữa kỳ',
                date: '2023-10-16'
            },
            {
                id: 'SC003',
                studentId: 'S002',
                subject: 'Toán',
                score: 9.0,
                type: 'Giữa kỳ',
                date: '2023-10-15'
            },
            {
                id: 'SC004',
                studentId: 'S002',
                subject: 'Văn',
                score: 8.0,
                type: 'Giữa kỳ',
                date: '2023-10-16'
            },
            {
                id: 'SC005',
                studentId: 'S003',
                subject: 'Toán',
                score: 6.5,
                type: 'Giữa kỳ',
                date: '2023-10-15'
            }
        ];
        
        // Lưu vào localStorage
        localStorage.setItem('scores', JSON.stringify(sampleScores));
    }

    loadPageContent(pageName) {
        console.log(`Đang tải nội dung trang: ${pageName}`);
        
        // Xác định đường dẫn đến file HTML
        const contentPath = `components/${pageName}-content.html`;
        
        // Tải nội dung HTML
        fetch(contentPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Không thể tải nội dung trang ${pageName}`);
                }
                return response.text();
            })
            .then(html => {
                // Cập nhật nội dung
                const contentContainer = document.getElementById('content');
                if (contentContainer) {
                    contentContainer.innerHTML = html;
                    
                    // Tải CSS cho trang
                    this.loadRequiredCSS(pageName);
                    
                    // Tải các script cụ thể cho từng trang
                    if (pageName === 'teacher-dashboard') {
                        this.loadScript('js/data-service.js')
                            .then(() => this.loadScript('js/teacher-dashboard.js'));
                    } else if (pageName === 'teacher-scores') {
                        this.loadScript('js/teacher-scores.js');
                    } else if (pageName === 'teacher-students') {
                        this.loadScript('js/teacher-students.js');
                    }
                    
                    console.log(`Đã tải nội dung trang ${pageName} thành công`);
                } else {
                    console.error('Không tìm thấy container nội dung');
                }
            })
            .catch(error => {
                console.error(`Lỗi khi tải nội dung trang ${pageName}:`, error);
                // Hiển thị thông báo lỗi cho người dùng
                const contentContainer = document.getElementById('content');
                if (contentContainer) {
                    contentContainer.innerHTML = `
                        <div class="error-container">
                            <h2>Không thể tải nội dung</h2>
                            <p>Đã xảy ra lỗi khi tải trang ${pageName}. Vui lòng thử lại sau.</p>
                        </div>
                    `;
                }
            });
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