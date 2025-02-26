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
        const studentName = document.getElementById('studentName');
        
        // Thử lấy thông tin từ nhiều nguồn
        let studentInfo = this.student;
        
        if (!studentInfo) {
            // Thử lấy từ currentUser
            studentInfo = JSON.parse(localStorage.getItem('currentUser') || '{}');
            
            // Nếu không có, thử lấy từ userInfo
            if (!studentInfo || Object.keys(studentInfo).length === 0) {
                studentInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            }
            
            // Nếu vẫn không có, tạo dữ liệu mẫu
            if (!studentInfo || Object.keys(studentInfo).length === 0) {
                studentInfo = { fullName: 'Học sinh', name: 'Học sinh' };
            }
        }
        
        if (welcomeName) {
            welcomeName.textContent = studentInfo.fullName || studentInfo.name || 'Học sinh';
        }
        if (studentName) {
            studentName.textContent = studentInfo.fullName || studentInfo.name || 'Học sinh';
        }
        
        console.log('Đã tải thông tin học sinh:', studentInfo);
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
        
        const scores = JSON.parse(localStorage.getItem('scores')) || {};
        const studentScores = scores[this.student.studentId] || {};
        
        // Tính toán thống kê
        let totalScore = 0;
        let totalWeight = 0;
        let totalSubjects = 0;
        let completedSubjects = 0;

        Object.entries(studentScores).forEach(([subject, subjectScores]) => {
            let subjectTotal = 0;
            let subjectWeight = 0;

            Object.entries(subjectScores).forEach(([type, scores]) => {
                scores.forEach(score => {
                    const weight = this.getScoreWeight(type);
                    subjectTotal += score * weight;
                    subjectWeight += weight;
                });
            });

            if (subjectWeight > 0) {
                const average = subjectTotal / subjectWeight;
                totalScore += average;
                totalWeight++;
                totalSubjects++;
                if (average >= 5) completedSubjects++;
            }
        });

        const averageScore = totalWeight > 0 ? totalScore / totalWeight : 0;
        const completionRate = totalSubjects > 0 ? (completedSubjects / totalSubjects) * 100 : 0;

        // Cập nhật giao diện
        const averageScoreElement = document.getElementById('averageScore');
        const completionRateElement = document.getElementById('completionRate');
        const daysToExamElement = document.getElementById('daysToExam');

        if (averageScoreElement) {
            averageScoreElement.textContent = averageScore.toFixed(1);
        }

        if (completionRateElement) {
            completionRateElement.textContent = `${Math.round(completionRate)}%`;
        }

        if (daysToExamElement) {
            // Giả lập ngày thi gần nhất (7 ngày tới)
            daysToExamElement.textContent = '7';
        }
    }

    getScoreWeight(type) {
        switch (type) {
            case 'Kiểm tra học kỳ': return 3;
            case 'Kiểm tra 1 tiết': return 2;
            case 'Kiểm tra miệng':
            case 'Kiểm tra 15 phút':
            default: return 1;
        }
    }

    loadRecentScores() {
        if (!this.student || !this.student.studentId) {
            console.error('Không có thông tin ID học sinh');
            return;
        }

        const scores = JSON.parse(localStorage.getItem('scores')) || {};
        const studentScores = scores[this.student.studentId] || {};
        
        // Chuyển đổi cấu trúc điểm thành mảng để dễ sắp xếp
        const recentScores = [];
        Object.entries(studentScores).forEach(([subject, subjectScores]) => {
            Object.entries(subjectScores).forEach(([type, scores]) => {
                scores.forEach(score => {
                    recentScores.push({
                        subject,
                        type,
                        score,
                        date: new Date().toISOString() // Sử dụng ngày hiện tại vì chưa có trường date
                    });
                });
            });
        });

        // Sắp xếp theo ngày mới nhất và lấy 5 điểm gần nhất
        const latestScores = recentScores
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        const container = document.getElementById('recentScores');
        if (!container) return;

        if (latestScores.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">Chưa có điểm số nào</p>';
            return;
        }

        container.innerHTML = latestScores.map(score => `
            <div class="score-item flex items-center justify-between p-3 border-b border-gray-200">
                <div class="score-info">
                    <h4 class="font-semibold">${score.subject}</h4>
                    <p class="text-sm text-gray-600">${score.type}</p>
                </div>
                <div class="score-value ${this.getScoreClass(score.score)}">
                    ${score.score.toFixed(1)}
                </div>
            </div>
        `).join('');
    }

    getScoreClass(score) {
        if (score >= 8) return 'text-green-600';
        if (score >= 6.5) return 'text-blue-600';
        if (score >= 5) return 'text-yellow-600';
        return 'text-red-600';
    }

    loadUpcomingExams() {
        if (!this.student || !this.student.studentId) {
            console.error('Không có thông tin ID học sinh');
            return;
        }
        
        const dataService = new DataService();
        const exams = dataService.getUpcomingExams(this.student.studentId);
        
        const examsContainer = document.getElementById('upcomingExams');
        if (!examsContainer) return;
        
        if (exams.length === 0) {
            examsContainer.innerHTML = '<div class="no-exams">Không có kỳ thi nào sắp tới</div>';
            return;
        }
        
        let examsHTML = '';
        
        exams.forEach(exam => {
            const daysLeft = this.calculateDaysLeft(exam.date);
            const urgencyClass = this.getUrgencyClass(daysLeft);
            
            examsHTML += `
                <div class="exam-item ${urgencyClass}">
                    <div class="exam-date">
                        <div class="exam-day">${this.formatDay(exam.date)}</div>
                        <div class="exam-month">${this.formatMonth(exam.date)}</div>
                    </div>
                    <div class="exam-details">
                        <div class="exam-subject">${exam.subject}</div>
                        <div class="exam-info">
                            <span class="exam-type">${exam.type}</span>
                            <span class="exam-time"><i class="far fa-clock"></i> ${exam.time}</span>
                            <span class="exam-room"><i class="fas fa-door-open"></i> ${exam.room}</span>
                        </div>
                    </div>
                    <div class="exam-countdown">
                        <span class="days-left">${daysLeft}</span>
                        <span class="days-text">ngày</span>
                    </div>
                </div>
            `;
        });
        
        examsContainer.innerHTML = examsHTML;
    }
    
    calculateDaysLeft(dateString) {
        const examDate = new Date(dateString);
        const today = new Date();
        const diffTime = examDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }
    
    getUrgencyClass(daysLeft) {
        if (daysLeft <= 3) return 'urgent';
        if (daysLeft <= 7) return 'soon';
        return 'normal';
    }
    
    formatDay(dateString) {
        const date = new Date(dateString);
        return date.getDate();
    }
    
    formatMonth(dateString) {
        const date = new Date(dateString);
        const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
        return months[date.getMonth()];
    }

    loadSubjectProgress() {
        if (!this.student || !this.student.studentId) {
            console.error('Không có thông tin ID học sinh');
            return;
        }
        
        const dataService = new DataService();
        const progress = dataService.getSubjectProgress(this.student.studentId);
        
        const progressContainer = document.getElementById('subjectProgressContainer');
        if (!progressContainer) return;
        
        let progressHTML = '';
        
        progress.forEach(subject => {
            const progressPercentage = subject.completed;
            const progressClass = this.getProgressClass(progressPercentage);
            
            progressHTML += `
                <div class="progress-item ${progressClass}">
                    <div class="progress-header">
                        <span class="subject-name">${subject.name}</span>
                        <span class="progress-percentage">${progressPercentage}%</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="progress-details">
                        <span class="progress-status">${this.getProgressStatus(progressPercentage)}</span>
                        <span class="progress-date">Cập nhật: ${subject.lastUpdate}</span>
                    </div>
                </div>
            `;
        });
        
        progressContainer.innerHTML = progressHTML;
    }
    
    getProgressClass(percentage) {
        if (percentage < 30) return 'progress-low';
        if (percentage < 70) return 'progress-medium';
        if (percentage < 90) return 'progress-high';
        return 'progress-excellent';
    }
    
    getProgressStatus(percentage) {
        if (percentage < 30) return 'Cần cải thiện';
        if (percentage < 70) return 'Đang tiến triển';
        if (percentage < 90) return 'Tốt';
        return 'Xuất sắc';
    }

    getScoreRating(score) {
        if (score >= 8.5) return 'Giỏi';
        if (score >= 7.0) return 'Khá';
        if (score >= 5.0) return 'Trung bình';
        return 'Yếu';
    }
    
    // Phương thức để chuyển đến trang hồ sơ
    viewProfile() {
        if (window.navigationInstance) {
            window.navigationInstance.loadPage('profile');
        } else {
            console.error('Navigation instance not found');
            // Fallback: chuyển hướng trực tiếp đến trang hồ sơ
            window.location.href = 'student-profile.html';
        }
    }
}

// Biến toàn cục để lưu trữ instance của dashboard
let dashboardInstance;

// Khởi tạo dashboard khi trang được load
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo dashboard và lưu vào biến toàn cục
    dashboardInstance = new StudentDashboard();
    window.dashboardInstance = dashboardInstance;
    
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