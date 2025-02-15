class StudentDashboard {
    constructor() {
        if (!checkStudentAuth()) {
            window.location.href = 'login.html';
            return;
        }
        
        this.student = JSON.parse(localStorage.getItem('currentStudent'));
        if (!this.student) {
            console.error('Không tìm thấy thông tin học sinh');
            return;
        }
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
        if (!this.student || !this.student.studentId) {
            console.error('Không có thông tin ID học sinh');
            return;
        }
        
        const dataService = new DataService();
        const stats = dataService.getStudentStats(this.student.studentId);
        
        if (stats) {
            const averageScoreElement = document.getElementById('averageScore');
            const completionRateElement = document.getElementById('completionRate');
            const daysToExamElement = document.getElementById('daysToExam');

            if (averageScoreElement) {
                averageScoreElement.textContent = stats.averageScore.toFixed(1);
            }
            if (completionRateElement) {
                completionRateElement.textContent = `${stats.completionRate}%`;
            }
            if (daysToExamElement) {
                daysToExamElement.textContent = stats.daysToExam;
            }
        }
    }

    loadRecentScores() {
        try {
            const scores = JSON.parse(localStorage.getItem('scores') || '[]');
            const studentScores = scores
                .filter(score => score.studentId === this.student.studentId)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);

            const tableBody = document.getElementById('recentScoresTable');
            if (!tableBody) return;

            tableBody.innerHTML = studentScores.map(score => `
                <tr>
                    <td>${score.subject}</td>
                    <td>${score.type}</td>
                    <td class="score-value ${score.score >= 5 ? 'pass' : 'fail'}">${score.score.toFixed(1)}</td>
                    <td>${new Date(score.date).toLocaleDateString('vi-VN')}</td>
                    <td>${this.getScoreEvaluation(score.score)}</td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Lỗi khi tải điểm gần đây:', error);
        }
    }

    getScoreEvaluation(score) {
        if (score >= 8) return '<span class="badge success">Tốt</span>';
        if (score >= 5) return '<span class="badge warning">Đạt</span>';
        return '<span class="badge danger">Chưa đạt</span>';
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
        try {
            const dataService = new DataService();
            const progress = dataService.getSubjectProgress(this.student.studentId);
            
            const progressGrid = document.getElementById('subjectProgress');
            if (!progressGrid) return;

            progressGrid.innerHTML = progress.map(subject => `
                <div class="progress-item">
                    <div class="subject-info">
                        <h4>${subject.subject}</h4>
                        <span class="progress-text">${subject.completed}/${subject.total} cột điểm</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${subject.percentage}%"></div>
                    </div>
                    <div class="subject-average">
                        TB: <span class="${subject.average >= 5 ? 'pass' : 'fail'}">${subject.average}</span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Lỗi khi tải tiến độ môn học:', error);
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
document.addEventListener('DOMContentLoaded', function() {
    // Lấy thông tin học sinh từ localStorage
    const studentInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    // Hiển thị tên học sinh trong header
    if (studentInfo && studentInfo.name) {
        document.getElementById('studentName').textContent = studentInfo.name;
        document.getElementById('studentNameWelcome').textContent = studentInfo.name;
    }
    
    // Cập nhật thời gian hiện tại
    updateDateTime();
});

function updateDateTime() {
    const now = new Date();
    const dateTimeString = now.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('currentDateTime').textContent = dateTimeString;
} 