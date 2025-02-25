class StudentDashboard {
    constructor() {
        if (!checkStudentAuth()) {
            window.location.href = 'login.html';
            return;
        }
        
        this.fetchStudentData();
    }

    async fetchStudentData() {
        try {
            const response = await fetch('/api/student/current');
            if (!response.ok) {
                throw new Error('Failed to fetch student data');
            }
            this.student = await response.json();
            this.init();
        } catch (error) {
            console.error('Không tìm thấy thông tin học sinh:', error);
        }
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

    async loadDashboardStats() {
        if (!this.student || !this.student.studentId) {
            console.error('Không có thông tin ID học sinh');
            return;
        }
        
        try {
            const response = await fetch(`/api/student/${this.student.studentId}/stats`);
            if (!response.ok) {
                throw new Error('Failed to fetch student stats');
            }
            const stats = await response.json();
            
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
        } catch (error) {
            console.error('Lỗi khi tải thống kê:', error);
        }
    }

    async loadRecentScores() {
        try {
            const response = await fetch(`/api/student/${this.student.studentId}/scores`);
            if (!response.ok) {
                throw new Error('Failed to fetch recent scores');
            }
            const scores = await response.json();
            const studentScores = scores
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

    async loadUpcomingExams() {
        try {
            const response = await fetch(`/api/student/${this.student.studentId}/exams`);
            if (!response.ok) {
                throw new Error('Failed to fetch upcoming exams');
            }
            const exams = await response.json();
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
        } catch (error) {
            console.error('Lỗi khi tải kỳ thi sắp tới:', error);
        }
    }

    async loadSubjectProgress() {
        try {
            const response = await fetch(`/api/student/${this.student.studentId}/progress`);
            if (!response.ok) {
                throw new Error('Failed to fetch subject progress');
            }
            const progress = await response.json();
            
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
    new StudentDashboard();
});