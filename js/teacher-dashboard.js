class TeacherDashboard {
    constructor() {
        this.teacher = checkTeacherAuth();
        if (this.teacher) {
            this.initializeDashboard();
        }
    }

    initializeDashboard() {
        // Hiển thị tên giáo viên
        this.updateTeacherName();
        
        // Cập nhật thời gian
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 60000);
        
        // Cập nhật thống kê
        this.updateStats();
        
        // Cập nhật lịch dạy
        this.updateSchedule();
        
        // Cập nhật điểm gần đây
        this.updateRecentScores();
    }

    updateTeacherName() {
        const welcomeElement = document.getElementById('teacherNameWelcome');
        const headerElement = document.getElementById('teacherName');
        
        if (welcomeElement) welcomeElement.textContent = this.teacher.fullName;
        if (headerElement) headerElement.textContent = this.teacher.fullName;
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

    updateStats() {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const scores = JSON.parse(localStorage.getItem('scores') || '[]');

        // Cập nhật số học sinh
        const totalStudentsElement = document.getElementById('totalStudents');
        if (totalStudentsElement) {
            totalStudentsElement.textContent = students.length;
        }

        if (scores.length > 0) {
            // Tính điểm trung bình
            const average = scores.reduce((sum, score) => sum + parseFloat(score.score), 0) / scores.length;
            const averageElement = document.getElementById('averageScore');
            if (averageElement) {
                averageElement.textContent = average.toFixed(1);
            }

            // Tính tỷ lệ đạt
            const passCount = scores.filter(score => parseFloat(score.score) >= 5).length;
            const passRate = (passCount / scores.length) * 100;
            const passRateElement = document.getElementById('passRate');
            if (passRateElement) {
                passRateElement.textContent = `${passRate.toFixed(1)}%`;
            }
        }
    }

    updateSchedule() {
        const scheduleContainer = document.getElementById('todaySchedule');
        if (scheduleContainer) {
            const schedule = this.getTeacherSchedule();
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

    updateRecentScores() {
        const recentScoresContainer = document.getElementById('recentScores');
        if (recentScoresContainer) {
            const scores = JSON.parse(localStorage.getItem('scores') || '[]')
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);

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

    getTeacherSchedule() {
        // Mẫu lịch dạy - có thể thay bằng dữ liệu thực từ API/DB
        return [
            { time: '07:00 - 08:30', class: '12A1', subject: 'Toán' },
            { time: '08:45 - 10:15', class: '12A2', subject: 'Vật lý' },
            { time: '10:30 - 12:00', class: '12A1', subject: 'Hóa học' }
        ];
    }
}

// Khởi tạo dashboard khi trang load
document.addEventListener('DOMContentLoaded', () => {
    new TeacherDashboard();
}); 