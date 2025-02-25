class TeacherDashboard {
    constructor() {
        this.dataService = new DataService();
        this.initializeDashboard();
    }

    async initializeDashboard() {
        try {
            // Debug: Kiểm tra dữ liệu trong localStorage
            const teacherData = localStorage.getItem('currentUser');
            console.log('Raw teacher data:', teacherData);

            if (teacherData) {
                const teacher = JSON.parse(teacherData);
                console.log('Parsed teacher data:', teacher);

                // Nếu teacher là mảng, lấy phần tử đầu tiên
                const teacherInfo = Array.isArray(teacher) ? teacher[0] : teacher;
                console.log('Teacher info to use:', teacherInfo);

                const welcomeElement = document.getElementById('teacherNameWelcome');
                const headerElement = document.getElementById('teacherName');
                
                if (welcomeElement) {
                    welcomeElement.textContent = teacherInfo.fullName || 'Giáo viên';
                }
                if (headerElement) {
                    headerElement.textContent = teacherInfo.fullName || 'Giáo viên';
                }
            } else {
                console.log('No teacher data found in localStorage');
            }

            const data = await this.dataService.fetchDashboardData();
            this.updateDashboardView(data);
            
            // Cập nhật thời gian
            this.updateDateTime();
            setInterval(() => this.updateDateTime(), 60000);
            
            // Lắng nghe sự kiện cập nhật
            document.addEventListener('dashboard-data-updated', (event) => {
                this.updateDashboardView(event.detail);
            });
        } catch (error) {
            console.error('Lỗi khởi tạo dashboard:', error);
            console.error('Error details:', error.message);
            
            // Sử dụng dữ liệu mẫu từ teacher-dashboard-content.html nếu có lỗi
            this.useSampleData();
        }
    }

    updateDashboardView(data) {
        // Cập nhật tên giáo viên
        const welcomeElement = document.getElementById('teacherNameWelcome');
        const headerElement = document.getElementById('teacherName');
        
        if (welcomeElement) welcomeElement.textContent = data.teacher.fullName;
        if (headerElement) headerElement.textContent = data.teacher.fullName;

        // Cập nhật thống kê
        const { statistics } = data;
        const totalStudentsElement = document.getElementById('totalStudents');
        const averageElement = document.getElementById('averageScore');
        const passRateElement = document.getElementById('passRate');

        if (totalStudentsElement) totalStudentsElement.textContent = statistics.totalStudents;
        if (averageElement) averageElement.textContent = statistics.averageScore;
        if (passRateElement) passRateElement.textContent = `${statistics.passRate}%`;

        // Cập nhật điểm gần đây
        this.updateRecentScores(data.recentScores);
        
        // Cập nhật lịch dạy
        this.updateSchedule(data.schedule);
    }

    updateDateTime() {
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
        }
    }

    updateRecentScores(scores) {
        const recentScoresContainer = document.getElementById('recentScores');
        if (recentScoresContainer) {
            recentScoresContainer.innerHTML = scores.map(score => `
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
        }
    }

    updateSchedule(schedule) {
        const scheduleContainer = document.getElementById('todaySchedule');
        if (scheduleContainer) {
            scheduleContainer.innerHTML = schedule.map(item => `
                <div class="schedule-item">
                    <div class="schedule-time">${item.time}</div>
                    <div class="schedule-info">
                        <div class="schedule-class">${item.class}</div>
                        <div class="schedule-subject">${item.subject}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Thêm phương thức để sử dụng dữ liệu mẫu khi có lỗi
    useSampleData() {
        console.log('Sử dụng dữ liệu mẫu từ mockData');
        // Kiểm tra xem mockData có tồn tại không (được định nghĩa trong teacher-dashboard-content.html)
        if (typeof mockData !== 'undefined') {
            this.updateDashboardView({
                teacher: mockData.teacher,
                statistics: {
                    totalStudents: mockData.stats.totalStudents,
                    averageScore: '8.5',
                    passRate: '85'
                },
                recentScores: [],
                schedule: mockData.schedule ? mockData.schedule["2023-11-01"] : []
            });
        }
    }
}

// Khởi tạo dashboard khi trang load
document.addEventListener('DOMContentLoaded', () => {
    new TeacherDashboard();
}); 