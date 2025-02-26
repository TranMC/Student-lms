class StudentScores {
    constructor() {
        this.student = JSON.parse(localStorage.getItem('currentStudent'));
        this.allScores = []; // Lưu trữ tất cả điểm để tiện lọc
        this.init();
    }

    init() {
        this.loadScores();
        this.initializeFilters();
    }

    initializeFilters() {
        try {
            // Lấy các phần tử filter
            const subjectFilter = document.getElementById('subjectFilter');
            const scoreFilter = document.getElementById('scoreFilter');
            const semesterFilter = document.getElementById('semesterFilter');

            if (subjectFilter && this.allScores.length > 0) {
                // Tạo danh sách môn học unique
                const subjects = [...new Set(this.allScores.map(score => score.subject))];
                subjectFilter.innerHTML = `
                    <option value="">Tất cả môn</option>
                    ${subjects.map(subject => `<option value="${subject}">${subject}</option>`).join('')}
                `;
            }

            // Thêm event listeners
            subjectFilter?.addEventListener('change', () => this.applyFilters());
            scoreFilter?.addEventListener('change', () => this.applyFilters());
            semesterFilter?.addEventListener('change', () => this.applyFilters());
        } catch (error) {
            console.error('Lỗi khi khởi tạo bộ lọc:', error);
        }
    }

    applyFilters() {
        try {
            const subjectFilter = document.getElementById('subjectFilter').value;
            const scoreFilter = document.getElementById('scoreFilter').value;
            const semesterFilter = document.getElementById('semesterFilter').value;

            let filteredScores = [...this.allScores];

            // Lọc theo môn học
            if (subjectFilter) {
                filteredScores = filteredScores.filter(score => score.subject === subjectFilter);
            }

            // Lọc theo học kỳ
            if (semesterFilter) {
                filteredScores = filteredScores.filter(score => score.semester === parseInt(semesterFilter));
            }

            // Lọc theo điểm số
            if (scoreFilter) {
                switch (scoreFilter) {
                    case 'high':
                        filteredScores = filteredScores.filter(score => score.score >= 8);
                        break;
                    case 'medium':
                        filteredScores = filteredScores.filter(score => score.score >= 5 && score.score < 8);
                        break;
                    case 'low':
                        filteredScores = filteredScores.filter(score => score.score < 5);
                        break;
                }
            }

            this.renderScoresTable(filteredScores);
            this.updateStatistics(filteredScores);
            this.updateAcademicSummary(filteredScores);
        } catch (error) {
            console.error('Lỗi khi áp dụng bộ lọc:', error);
        }
    }

    loadScores() {
        try {
            const scores = JSON.parse(localStorage.getItem('scores') || '[]');
            this.allScores = scores.filter(score => score.studentId === this.student.studentId);
            
            this.renderScoresTable(this.allScores);
            this.updateStatistics(this.allScores);
            this.updateAcademicSummary(this.allScores);
            this.initializeFilters(); // Khởi tạo lại bộ lọc sau khi có dữ liệu
        } catch (error) {
            console.error('Lỗi khi tải điểm:', error);
        }
    }

    renderScoresTable(scores) {
        const tableBody = document.getElementById('scoresTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = scores.map(score => `
            <tr>
                <td>${score.subject}</td>
                <td>${score.semester}</td>
                <td>${score.type}</td>
                <td>${score.score}</td>
                <td>${score.date}</td>
                <td>${score.comment}</td>
            </tr>
        `).join('');

        if (scores.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">Chưa có điểm</td>
                </tr>
            `;
        }
    }

    updateStatistics(scores) {
        try {
            // Tính toán các thống kê
            const stats = {
                totalScores: scores.length,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0,
                passRate: 0
            };

            if (scores.length > 0) {
                // Tính điểm trung bình
                const sum = scores.reduce((acc, score) => acc + score.score, 0);
                stats.averageScore = sum / scores.length;
                
                // Tìm điểm cao nhất và thấp nhất
                stats.highestScore = Math.max(...scores.map(score => score.score));
                stats.lowestScore = Math.min(...scores.map(score => score.score));
                
                // Tính tỷ lệ đạt
                const passedScores = scores.filter(score => score.score >= 5);
                stats.passRate = (passedScores.length / scores.length) * 100;
            }

            // Cập nhật UI với kiểm tra null
            const elements = {
                totalScores: document.getElementById('totalScores'),
                highestScore: document.getElementById('highestScore'),
                lowestScore: document.getElementById('lowestScore'),
                passRate: document.getElementById('passRate')
            };

            // Chỉ cập nhật nếu element tồn tại
            if (elements.totalScores) elements.totalScores.textContent = stats.totalScores;
            if (elements.highestScore) elements.highestScore.textContent = stats.highestScore.toFixed(1);
            if (elements.lowestScore) elements.lowestScore.textContent = stats.lowestScore.toFixed(1);
            if (elements.passRate) elements.passRate.textContent = `${stats.passRate.toFixed(1)}%`;

        } catch (error) {
            console.error('Lỗi khi cập nhật thống kê:', error);
        }
    }

    updateAcademicSummary(scores) {
        try {
            // Tính toán các giá trị tổng kết
            const summary = {
                averageGrade: 0,
                academicRanking: '-',
                passedSubjects: 0
            };

            if (scores.length > 0) {
                // Tính điểm trung bình
                const sum = scores.reduce((acc, score) => acc + score.score, 0);
                summary.averageGrade = sum / scores.length;

                // Xác định xếp loại
                summary.academicRanking = this.getAcademicRanking(summary.averageGrade);

                // Đếm số môn đạt
                const uniqueSubjects = [...new Set(scores.map(score => score.subject))];
                const passedSubjects = uniqueSubjects.filter(subject => {
                    const subjectScores = scores.filter(score => score.subject === subject);
                    const subjectAverage = subjectScores.reduce((sum, score) => sum + score.score, 0) / subjectScores.length;
                    return subjectAverage >= 5;
                });
                summary.passedSubjects = passedSubjects.length;
            }

            // Cập nhật UI với kiểm tra null
            const elements = {
                averageGrade: document.getElementById('averageGrade'),
                academicRanking: document.getElementById('academicRanking'),
                passedSubjects: document.getElementById('passedSubjects')
            };

            // Chỉ cập nhật nếu element tồn tại
            if (elements.averageGrade) {
                elements.averageGrade.textContent = summary.averageGrade.toFixed(1);
            }
            if (elements.academicRanking) {
                elements.academicRanking.textContent = summary.academicRanking;
            }
            if (elements.passedSubjects) {
                elements.passedSubjects.textContent = summary.passedSubjects.toString();
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật tổng kết học tập:', error);
        }
    }

    getAcademicRanking(average) {
        if (average >= 9.0) return 'Xuất sắc';
        if (average >= 8.0) return 'Giỏi';
        if (average >= 7.0) return 'Khá';
        if (average >= 5.0) return 'Trung bình';
        return 'Yếu';
    }

    // Helper methods from StudentDashboard can be reused here
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    window.studentScores = new StudentScores();
}); 