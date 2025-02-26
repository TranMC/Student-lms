class StudentScores {
    constructor() {
        this.student = JSON.parse(localStorage.getItem('currentStudent'));
        this.subjects = ['Toán', 'Văn', 'Anh', 'Lý', 'Hóa', 'Sinh'];
        this.scoreTypes = ['Kiểm tra miệng', 'Kiểm tra 15 phút', 'Kiểm tra 1 tiết', 'Kiểm tra học kỳ'];
        this.init();
    }

    init() {
        this.loadScores();
        this.setupFilters();
    }

    loadScores() {
        const studentId = this.student.studentId;
        const allScores = JSON.parse(localStorage.getItem('scores')) || [];
        const studentScores = allScores.filter(score => score.studentId === studentId);

        const scoreTableBody = document.getElementById('scoreTableBody');
        if (!scoreTableBody) return;

        // Tổ chức điểm theo môn học và loại điểm
        const organizedScores = {};
        this.subjects.forEach(subject => {
            organizedScores[subject] = {
                'Kiểm tra miệng': [],
                'Kiểm tra 15 phút': [],
                'Kiểm tra 1 tiết': [],
                'Kiểm tra học kỳ': []
            };
        });

        // Phân loại điểm
        studentScores.forEach(score => {
            if (organizedScores[score.subject] && organizedScores[score.subject][score.type]) {
                organizedScores[score.subject][score.type].push(score.score);
            }
        });

        // Hiển thị điểm
        scoreTableBody.innerHTML = this.subjects.map(subject => {
            const subjectScores = organizedScores[subject];
            
            // Lấy điểm cho từng loại
            const oralScores = subjectScores['Kiểm tra miệng'];
            const fifteenMinScores = subjectScores['Kiểm tra 15 phút'];
            const periodScores = subjectScores['Kiểm tra 1 tiết'];
            const semesterScores = subjectScores['Kiểm tra học kỳ'];

            // Tính điểm trung bình
            const average = this.calculateAverage({
                'Kiểm tra miệng': oralScores,
                'Kiểm tra 15 phút': fifteenMinScores,
                'Kiểm tra 1 tiết': periodScores,
                'Kiểm tra học kỳ': semesterScores
            });

            return `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${subject}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        ${this.renderScores(oralScores)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        ${this.renderScores(fifteenMinScores)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        ${this.renderScores(periodScores)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        ${this.renderScores(semesterScores)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getScoreClass(average)}">
                            ${average.toFixed(1)}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

        // Cập nhật thống kê điểm
        this.updateScoreStatistics(studentScores);
    }

    renderScores(scores) {
        if (!scores || scores.length === 0) {
            return '<span class="text-gray-400">-</span>';
        }

        return `
            <div class="flex items-center justify-center space-x-2">
                ${scores.map(score => `
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getScoreClass(score)}">
                        ${score.toFixed(1)}
                    </span>
                `).join('')}
            </div>
        `;
    }

    calculateAverage(subjectScores) {
        let totalScore = 0;
        let totalWeight = 0;

        Object.entries(subjectScores).forEach(([type, scores]) => {
            if (scores && scores.length > 0) {
                const weight = this.getScoreWeight(type);
                const scoreSum = scores.reduce((sum, score) => sum + score, 0);
                totalScore += scoreSum * weight;
                totalWeight += weight * scores.length;
            }
        });

        return totalWeight > 0 ? totalScore / totalWeight : 0;
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

    getScoreClass(score) {
        if (score >= 8) return 'bg-green-100 text-green-800';
        if (score >= 6.5) return 'bg-blue-100 text-blue-800';
        if (score >= 5) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    }

    updateScoreStatistics(studentScores) {
        let totalScore = 0;
        let totalCount = 0;
        let highestScore = 0;
        let lowestScore = 10;

        studentScores.forEach(score => {
            totalScore += score.score;
            totalCount++;
            highestScore = Math.max(highestScore, score.score);
            lowestScore = Math.min(lowestScore, score.score);
        });

        const averageScore = totalCount > 0 ? totalScore / totalCount : 0;

        // Cập nhật giao diện thống kê
        const statsContainer = document.getElementById('scoreStats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="grid grid-cols-4 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="text-sm text-blue-600 mb-1">Điểm trung bình</h4>
                        <p class="text-2xl font-bold text-blue-700">${averageScore.toFixed(1)}</p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="text-sm text-green-600 mb-1">Điểm cao nhất</h4>
                        <p class="text-2xl font-bold text-green-700">${totalCount > 0 ? highestScore.toFixed(1) : '-'}</p>
                    </div>
                    <div class="bg-yellow-50 p-4 rounded-lg">
                        <h4 class="text-sm text-yellow-600 mb-1">Điểm thấp nhất</h4>
                        <p class="text-2xl font-bold text-yellow-700">${totalCount > 0 ? lowestScore.toFixed(1) : '-'}</p>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <h4 class="text-sm text-purple-600 mb-1">Tổng số điểm</h4>
                        <p class="text-2xl font-bold text-purple-700">${totalCount}</p>
                    </div>
                </div>
            `;
        }
    }

    setupFilters() {
        const subjectFilter = document.getElementById('subjectFilter');
        const scoreFilter = document.getElementById('scoreFilter');
        const semesterFilter = document.getElementById('semesterFilter');

        if (subjectFilter) {
            this.subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                subjectFilter.appendChild(option);
            });
            subjectFilter.addEventListener('change', () => this.applyFilters());
        }

        if (scoreFilter) {
            scoreFilter.addEventListener('change', () => this.applyFilters());
        }

        if (semesterFilter) {
            semesterFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    applyFilters() {
        const subject = document.getElementById('subjectFilter').value;
        const scoreRange = document.getElementById('scoreFilter').value;
        const semester = document.getElementById('semesterFilter').value;

        const rows = document.querySelectorAll('#scoresTableBody tr');
        rows.forEach(row => {
            const rowSubject = row.cells[0].textContent;
            const rowSemester = row.cells[1].textContent;
            const score = parseFloat(row.cells[3].textContent);

            const matchesSubject = !subject || rowSubject === subject;
            const matchesSemester = !semester || rowSemester.includes(semester);
            const matchesScore = !scoreRange || this.matchesScoreRange(score, scoreRange);

            row.style.display = matchesSubject && matchesSemester && matchesScore ? '' : 'none';
        });
    }

    matchesScoreRange(score, range) {
        switch (range) {
            case 'high': return score >= 8;
            case 'medium': return score >= 5 && score < 8;
            case 'low': return score < 5;
            default: return true;
        }
    }
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    window.studentScores = new StudentScores();
}); 