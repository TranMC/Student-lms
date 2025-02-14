class StudentDashboard {
    constructor() {
        this.student = JSON.parse(localStorage.getItem('currentStudent'));
        this.init();
    }

    init() {
        this.loadStudentInfo();
        this.loadDashboardStats();
        this.loadRecentScores();
        this.loadUpcomingExams();
        this.loadSubjectProgress();
        this.updateDateTime();
    }

    loadStudentInfo() {
        const welcomeName = document.getElementById('studentNameWelcome');
        if (welcomeName && this.student) {
            welcomeName.textContent = this.student.fullName;
        }
    }

    updateDateTime() {
        const dateTimeElement = document.getElementById('currentDateTime');
        if (dateTimeElement) {
            const now = new Date();
            dateTimeElement.textContent = now.toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    loadDashboardStats() {
        // Lấy dữ liệu từ DataService
        const dataService = new DataService();
        const stats = dataService.getStudentStats(this.student.studentId);
        
        // Cập nhật UI
        document.getElementById('averageScore').textContent = stats.averageScore.toFixed(1);
        document.getElementById('completionRate').textContent = `${stats.completionRate}%`;
        document.getElementById('daysToExam').textContent = stats.daysToExam;
    }

    loadRecentScores() {
        const dataService = new DataService();
        const recentScores = dataService.getRecentScores(this.student.studentId);
        const tableBody = document.getElementById('recentScoresTable');
        
        if (tableBody) {
            tableBody.innerHTML = recentScores.map(score => `
                <tr>
                    <td>${score.subject}</td>
                    <td>${score.type}</td>
                    <td>${score.score}</td>
                    <td>${new Date(score.date).toLocaleDateString('vi-VN')}</td>
                    <td>${this.getScoreRating(score.score)}</td>
                </tr>
            `).join('');
        }
    }

    loadUpcomingExams() {
        const dataService = new DataService();
        const exams = dataService.getUpcomingExams(this.student.studentId);
        const examsList = document.getElementById('upcomingExams');
        
        if (examsList) {
            examsList.innerHTML = exams.map(exam => `
                <div class="event-item">
                    <div class="event-date">
                        <div class="day">${new Date(exam.date).getDate()}</div>
                        <div class="month">${new Date(exam.date).toLocaleDateString('vi-VN', { month: 'short' })}</div>
                    </div>
                    <div class="event-info">
                        <h4>${exam.subject}</h4>
                        <p>${exam.type} - ${exam.time}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    loadSubjectProgress() {
        const dataService = new DataService();
        const progress = dataService.getSubjectProgress(this.student.studentId);
        const progressGrid = document.getElementById('subjectProgress');
        
        if (progressGrid) {
            progressGrid.innerHTML = progress.map(subject => `
                <div class="progress-item">
                    <div class="subject-info">
                        <h4>${subject.name}</h4>
                        <p>${subject.completed}/${subject.total} bài học</p>
                    </div>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(subject.completed/subject.total)*100}%"></div>
                    </div>
                </div>
            `).join('');
        }
    }

    getScoreRating(score) {
        if (score >= 8.5) return 'Giỏi';
        if (score >= 7.0) return 'Khá';
        if (score >= 5.0) return 'Trung bình';
        return 'Yếu';
    }
}

// Khởi tạo dashboard khi trang được load
document.addEventListener('DOMContentLoaded', () => {
    if (checkStudentAuth()) {
        window.dashboardInstance = new StudentDashboard();
    }
}); 