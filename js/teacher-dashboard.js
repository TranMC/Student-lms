class TeacherDashboard {
    constructor() {
        console.log('Khởi tạo TeacherDashboard');
        
        // Khởi tạo các thuộc tính
        this.teacher = null;
        this.statistics = {
            totalStudents: 0,
            averageScore: 0,
            passRate: 0
        };
        this.schedule = [];
        this.recentScores = [];
        
        // Bind các phương thức để giữ nguyên context
        this.updateDateTime = this.updateDateTime.bind(this);
        this.updateTeacherName = this.updateTeacherName.bind(this);
        
        // Khởi tạo dashboard
        this.initializeDashboard();
    }

    async initializeDashboard() {
        console.log('Khởi tạo bảng điều khiển giáo viên');
        
        // Tải dữ liệu giáo viên từ localStorage
        this.loadTeacherData();
        
        // Cập nhật ngay tên giáo viên và thời gian
        this.updateTeacherName();
        this.updateDateTime();
        
        // Cập nhật giao diện dashboard
        this.updateDashboardView();
        
        // Thiết lập hẹn giờ cập nhật thời gian mỗi phút
        console.log('Thiết lập hẹn giờ cập nhật thời gian');
        this.timeInterval = setInterval(() => {
            this.updateDateTime();
        }, 60000); // 60000ms = 1 phút
    }

    loadTeacherData() {
        console.log('Đang tải dữ liệu giáo viên từ localStorage');
        
        // Kiểm tra và tải thông tin giáo viên
        const teacherData = localStorage.getItem('currentUser');
        if (teacherData) {
            try {
                const parsedData = JSON.parse(teacherData);
                console.log('Đã tải dữ liệu giáo viên:', parsedData);
                
                // Xử lý cả trường hợp dữ liệu là mảng hoặc đối tượng
                this.teacher = Array.isArray(parsedData) ? parsedData[0] : parsedData;
            } catch (error) {
                console.error('Lỗi parse dữ liệu giáo viên:', error);
                this.loadSampleData();
            }
        } else {
            console.warn('Không tìm thấy dữ liệu giáo viên trong localStorage');
            this.loadSampleData();
        }
        
        // Tải dữ liệu thống kê
        this.loadStatistics();
        
        // Tải dữ liệu lịch trình
        this.loadSchedule();
        
        // Tải dữ liệu điểm số gần đây
        this.loadRecentScores();
    }

    loadStatistics() {
        console.log('Đang tải dữ liệu thống kê');
        
        // Tải dữ liệu học sinh để tính toán thống kê
        const studentsData = localStorage.getItem('students');
        const scoresData = localStorage.getItem('scores');
        
        if (studentsData && scoresData) {
            try {
                const students = JSON.parse(studentsData);
                const scores = JSON.parse(scoresData);
                
                // Tính toán các chỉ số thống kê
                const totalStudents = students.length;
                let totalScore = 0;
                let passCount = 0;
                
                scores.forEach(score => {
                    totalScore += parseFloat(score.score);
                    if (parseFloat(score.score) >= 5) {
                        passCount++;
                    }
                });
                
                const averageScore = scores.length > 0 ? (totalScore / scores.length).toFixed(1) : '0.0';
                const passRate = scores.length > 0 ? Math.round((passCount / scores.length) * 100) : 0;
                
                this.statistics = {
                    totalStudents,
                    averageScore,
                    passRate
                };
                
                console.log('Đã tải dữ liệu thống kê:', this.statistics);
            } catch (error) {
                console.error('Lỗi khi tính toán thống kê:', error);
                this.useSampleStatistics();
            }
        } else {
            console.warn('Không tìm thấy đủ dữ liệu để tính toán thống kê');
            this.useSampleStatistics();
        }
    }

    loadSchedule() {
        console.log('Đang tải dữ liệu lịch trình');
        
        // Trong thực tế, lịch trình sẽ được tải từ API hoặc localStorage
        // Ở đây, chúng ta sẽ sử dụng dữ liệu mẫu
        this.schedule = [
            { time: '07:30 - 09:00', class: '12A1', subject: 'Toán học' },
            { time: '09:30 - 11:00', class: '11B2', subject: 'Hình học' },
            { time: '13:30 - 15:00', class: '10A3', subject: 'Đại số' }
        ];
        
        console.log('Đã tải dữ liệu lịch trình:', this.schedule);
    }

    loadRecentScores() {
        console.log('Đang tải dữ liệu điểm số gần đây');
        
        // Tải dữ liệu điểm số và học sinh
        const scoresData = localStorage.getItem('scores');
        const studentsData = localStorage.getItem('students');
        
        if (scoresData && studentsData) {
            try {
                const scores = JSON.parse(scoresData);
                const students = JSON.parse(studentsData);
                
                // Sắp xếp điểm số theo ngày giảm dần và lấy 5 bản ghi gần nhất
                const recentScores = scores
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5)
                    .map(score => {
                        const student = students.find(s => s.id === score.studentId);
                        return {
                            studentName: student ? student.fullName : 'Unknown',
                            subject: score.subject,
                            score: score.score,
                            type: score.type || 'Bài kiểm tra',
                            date: score.date
                        };
                    });
                
                this.recentScores = recentScores;
                console.log('Đã tải dữ liệu điểm số gần đây:', this.recentScores);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu điểm số gần đây:', error);
                this.useSampleRecentScores();
            }
        } else {
            console.warn('Không tìm thấy đủ dữ liệu để tải điểm số gần đây');
            this.useSampleRecentScores();
        }
    }

    updateDashboardView() {
        console.log('Cập nhật giao diện dashboard');
        
        // Cập nhật tên giáo viên
        this.updateTeacherName();
        
        // Cập nhật thống kê
        this.updateStatistics();
        
        // Cập nhật lịch trình
        this.updateSchedule();
        
        // Cập nhật điểm số gần đây
        this.updateRecentScores();
    }

    updateTeacherName() {
        console.log('Cập nhật tên giáo viên');
        
        // Nếu không có dữ liệu giáo viên, hiển thị thông báo
        if (!this.teacher) {
            console.warn('Không có dữ liệu giáo viên');
            return;
        }
        
        // Cập nhật tên giáo viên trên header
        const headerElement = document.getElementById('teacherName');
        if (headerElement) {
            headerElement.textContent = this.teacher.fullName;
        } else {
            console.warn('Không tìm thấy phần tử headerElement, thử lại sau 500ms');
            setTimeout(() => this.updateTeacherName(), 500);
        }
        
        // Cập nhật tên giáo viên trong lời chào
        const welcomeElement = document.getElementById('teacherNameWelcome');
        if (welcomeElement) {
            welcomeElement.textContent = this.teacher.fullName;
        } else {
            console.warn('Không tìm thấy phần tử welcomeElement, có thể chưa tải component');
            // Đăng ký một MutationObserver để theo dõi khi phần tử được thêm vào DOM
            if (!this.teacherNameObserver) {
                this.teacherNameObserver = new MutationObserver((mutations) => {
                    const welcomeElement = document.getElementById('teacherNameWelcome');
                    if (welcomeElement) {
                        welcomeElement.textContent = this.teacher.fullName;
                        this.teacherNameObserver.disconnect();
                    }
                });
                
                this.teacherNameObserver.observe(document.body, { 
                    childList: true, 
                    subtree: true 
                });
            }
        }
    }

    updateStatistics() {
        console.log('Cập nhật thống kê');
        
        const totalStudentsElement = document.getElementById('totalStudents');
        const averageElement = document.getElementById('averageScore');
        const passRateElement = document.getElementById('passRate');

        if (totalStudentsElement) {
            totalStudentsElement.textContent = this.statistics.totalStudents || 0;
        }
        
        if (averageElement) {
            averageElement.textContent = this.statistics.averageScore || '0.0';
        }
        
        if (passRateElement) {
            passRateElement.textContent = `${this.statistics.passRate || 0}%`;
        }
    }

    updateDateTime() {
        console.log('Cập nhật thời gian');
        
        const dateElement = document.getElementById('currentDateTime');
        if (dateElement) {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            dateElement.textContent = now.toLocaleDateString('vi-VN', options);
            console.log('Đã cập nhật thời gian: ' + dateElement.textContent);
        } else {
            console.warn('Không tìm thấy phần tử currentDateTime, thử lại sau 500ms');
            
            // Thử lại sau 500ms
            setTimeout(() => this.updateDateTime(), 500);
            
            // Nếu chưa có, đăng ký một MutationObserver để theo dõi khi phần tử được thêm vào DOM
            if (!this.dateTimeObserver) {
                this.dateTimeObserver = new MutationObserver((mutations) => {
                    const dateElement = document.getElementById('currentDateTime');
                    if (dateElement) {
                        const now = new Date();
                        const options = { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        };
                        dateElement.textContent = now.toLocaleDateString('vi-VN', options);
                        console.log('Đã cập nhật thời gian (từ observer): ' + dateElement.textContent);
                        this.dateTimeObserver.disconnect();
                    }
                });
                
                this.dateTimeObserver.observe(document.body, { 
                    childList: true, 
                    subtree: true 
                });
            }
        }
    }

    updateRecentScores() {
        console.log('Cập nhật điểm số gần đây');
        
        const recentScoresContainer = document.getElementById('recentScores');
        if (recentScoresContainer) {
            if (this.recentScores.length === 0) {
                recentScoresContainer.innerHTML = '<div class="empty-state">Không có dữ liệu điểm số gần đây</div>';
                return;
            }
            
            recentScoresContainer.innerHTML = this.recentScores.map(score => `
                <div class="score-item">
                    <div class="score-info">
                        <div class="score-student">${score.studentName}</div>
                        <div class="score-details">
                            ${score.subject} - ${score.type} - ${new Date(score.date).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                    <div class="score-value">${score.score}</div>
                </div>
            `).join('');
        } else {
            console.warn('Không tìm thấy phần tử recentScoresContainer');
        }
    }

    updateSchedule() {
        console.log('Cập nhật lịch trình');
        
        const scheduleContainer = document.getElementById('todaySchedule');
        if (scheduleContainer) {
            if (this.schedule.length === 0) {
                scheduleContainer.innerHTML = '<div class="empty-state">Không có lịch dạy hôm nay</div>';
                return;
            }
            
            scheduleContainer.innerHTML = this.schedule.map(item => `
                <div class="schedule-item">
                    <div class="schedule-time">${item.time}</div>
                    <div class="schedule-info">
                        <div class="schedule-class">${item.class}</div>
                        <div class="schedule-subject">${item.subject}</div>
                    </div>
                </div>
            `).join('');
        } else {
            console.warn('Không tìm thấy phần tử scheduleContainer');
        }
    }

    loadSampleData() {
        console.log('Tải dữ liệu giáo viên mẫu');
        
        this.teacher = {
            id: 'T001',
            username: 'teacher',
            fullName: 'Nguyễn Văn Thành',
            email: 'teacher@example.com',
            department: 'Khoa học tự nhiên',
            role: 'teacher'
        };
        
        // Lưu vào localStorage để sử dụng lần sau
        localStorage.setItem('currentUser', JSON.stringify(this.teacher));
    }

    useSampleStatistics() {
        console.log('Sử dụng thống kê mẫu');
        
        this.statistics = {
            totalStudents: 120,
            averageScore: '7.5',
            passRate: 85
        };
    }

    useSampleRecentScores() {
        console.log('Sử dụng điểm số gần đây mẫu');
        
        this.recentScores = [
            { studentName: 'Nguyễn Văn A', subject: 'Toán học', score: 8.5, type: 'Kiểm tra', date: '2023-05-15' },
            { studentName: 'Trần Thị B', subject: 'Vật lý', score: 7.0, type: 'Kiểm tra', date: '2023-05-14' },
            { studentName: 'Lê Văn C', subject: 'Hóa học', score: 9.0, type: 'Kiểm tra', date: '2023-05-13' }
        ];
    }
}

// Khởi tạo dashboard khi trang load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM đã tải xong, khởi tạo TeacherDashboard');
    window.dashboardInstance = new TeacherDashboard();
}); 