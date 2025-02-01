class TeacherDashboard {
    constructor() {
        this.initializeDashboard();
    }

    async initializeDashboard() {
        try {
            const data = await DataService.fetchDashboardData();
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
}

// Khởi tạo dashboard khi trang load
document.addEventListener('DOMContentLoaded', () => {
    new TeacherDashboard();
}); 