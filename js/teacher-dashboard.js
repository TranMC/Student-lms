class TeacherDashboard {
    constructor() {
        this.teacher = null;
        this.statistics = {
            totalStudents: 0,
            totalClasses: 0,
            averageScore: 0,
            lessonsThisWeek: 0
        };
        this.schedule = [];
        this.recentScores = [];
    }

    initialize() {
        console.log('Khởi tạo Teacher Dashboard...');
        
        // Kiểm tra xác thực
        if (!window.auth || !window.auth.isTeacher()) {
            window.location.href = 'login.html';
            return;
        }
        
        // Lấy thông tin giáo viên
        this.teacher = window.auth.getCurrentUser();
        
        // Cập nhật giao diện
        this.updateTeacherInfo();
        this.updateDateTime();
        this.loadStatistics();
        this.loadTodaySchedule();
        this.loadRecentScores();
        
        // Thiết lập cập nhật thời gian định kỳ
        setInterval(() => this.updateDateTime(), 60000);
        
        console.log('Teacher Dashboard đã được khởi tạo thành công');
    }

    updateTeacherInfo() {
        const teacherNameElement = document.getElementById('teacherNameWelcome');
        if (teacherNameElement && this.teacher) {
            teacherNameElement.textContent = this.teacher.fullName || 'Giáo viên';
        }
    }

    updateDateTime() {
        const dateTimeElement = document.getElementById('currentDateTime');
        if (dateTimeElement) {
            const now = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            dateTimeElement.textContent = now.toLocaleDateString('vi-VN', options);
        }
    }

    loadStatistics() {
        // Trong thực tế, dữ liệu này sẽ được lấy từ API
        const mockStats = {
            totalStudents: 120 + Math.floor(Math.random() * 10),
            totalClasses: 8 + Math.floor(Math.random() * 2),
            averageScore: (7.5 + Math.random()).toFixed(1),
            lessonsThisWeek: 24 + Math.floor(Math.random() * 4)
        };

        this.statistics = mockStats;
        this.updateStatisticsUI();
    }

    updateStatisticsUI() {
        const elements = {
            totalStudents: document.getElementById('totalStudents'),
            totalClasses: document.getElementById('totalClasses'),
            averageScore: document.getElementById('averageScore'),
            lessonsThisWeek: document.getElementById('lessonsThisWeek')
        };

        for (const [key, element] of Object.entries(elements)) {
            if (element && this.statistics[key] !== undefined) {
                element.textContent = this.statistics[key];
            }
        }
    }

    loadTodaySchedule() {
        const scheduleContainer = document.getElementById('todaySchedule');
        if (!scheduleContainer) return;

        // Trong thực tế, dữ liệu này sẽ được lấy từ API
        const now = new Date();
        const currentHour = now.getHours();

        const mockSchedule = [
            {
                subject: 'Toán học',
                className: '12A1',
                room: '305',
                startTime: '07:30',
                endTime: '09:00',
                status: currentHour >= 7 && currentHour < 9 ? 'in-progress' : 
                        currentHour < 7 ? 'upcoming' : 'completed'
            },
            {
                subject: 'Vật lý',
                className: '11B2',
                room: '204',
                startTime: '09:30',
                endTime: '11:00',
                status: currentHour >= 9 && currentHour < 11 ? 'in-progress' : 
                        currentHour < 9 ? 'upcoming' : 'completed'
            },
            {
                subject: 'Hóa học',
                className: '10A3',
                room: '105',
                startTime: '13:30',
                endTime: '15:00',
                status: currentHour >= 13 && currentHour < 15 ? 'in-progress' : 
                        currentHour < 13 ? 'upcoming' : 'completed'
            }
        ];

        this.schedule = mockSchedule;
        this.updateScheduleUI();
    }

    updateScheduleUI() {
        const scheduleContainer = document.getElementById('todaySchedule');
        if (!scheduleContainer) return;

        if (this.schedule.length === 0) {
            scheduleContainer.innerHTML = '<div class="empty-state">Không có lịch dạy hôm nay</div>';
            return;
        }

        const statusText = {
            'in-progress': 'Đang diễn ra',
            'upcoming': 'Sắp diễn ra',
            'completed': 'Đã hoàn thành'
        };

        const scheduleHTML = this.schedule.map(item => `
            <div class="schedule-item">
                <div class="schedule-time">
                    <span class="time">${item.startTime} - ${item.endTime}</span>
                    <span class="badge ${item.status}">${statusText[item.status]}</span>
                </div>
                <div class="schedule-details">
                    <h4>${item.subject}</h4>
                    <p>Lớp ${item.className} - Phòng ${item.room}</p>
                </div>
            </div>
        `).join('');

        scheduleContainer.innerHTML = scheduleHTML;
    }

    loadRecentScores() {
        const scoresContainer = document.getElementById('recentScores');
        if (!scoresContainer) return;

        // Trong thực tế, dữ liệu này sẽ được lấy từ API
        const mockScores = [
            {
                student: 'Nguyễn Văn A',
                subject: 'Toán học',
                type: 'Kiểm tra 15p',
                date: '15/05/2023',
                score: 8.5
            },
            {
                student: 'Trần Thị B',
                subject: 'Vật lý',
                type: 'Kiểm tra 45p',
                date: '16/05/2023',
                score: 7.0
            },
            {
                student: 'Lê Văn C',
                subject: 'Hóa học',
                type: 'Kiểm tra 15p',
                date: '17/05/2023',
                score: 9.0
            }
        ];

        this.recentScores = mockScores;
        this.updateScoresUI();
    }

    updateScoresUI() {
        const scoresContainer = document.getElementById('recentScores');
        if (!scoresContainer) return;

        if (this.recentScores.length === 0) {
            scoresContainer.innerHTML = '<div class="empty-state">Không có điểm số gần đây</div>';
            return;
        }

        const scoresHTML = this.recentScores.map(item => `
            <div class="score-item">
                <div class="score-info">
                    <div class="score-student">${item.student}</div>
                    <div class="score-details">${item.subject} - ${item.type} - ${item.date}</div>
                </div>
                <div class="score-value">${item.score}</div>
            </div>
        `).join('');

        scoresContainer.innerHTML = scoresHTML;
    }
}

// Khởi tạo TeacherDashboard khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    window.teacherDashboard = new TeacherDashboard();
    window.teacherDashboard.initialize();
}); 