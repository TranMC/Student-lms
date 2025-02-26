class StudentScores {
    constructor() {
        this.student = JSON.parse(localStorage.getItem('currentStudent'));
        this.subjects = ['Toán', 'Văn', 'Anh', 'Lý', 'Hóa', 'Sinh'];
        this.scoreTypes = ['Kiểm tra miệng', 'Kiểm tra 15 phút', 'Kiểm tra 1 tiết', 'Kiểm tra học kỳ'];
        this.setupStorageListener();
        
        // Đợi DOM được tải xong
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initializing StudentScores...');
        console.log('Current student:', this.student);
        
        // Đợi một chút để đảm bảo HTML đã được tải
        setTimeout(() => {
            this.setupFilters();
            this.loadScores();
        }, 100);
    }

    setupStorageListener() {
        // Lắng nghe sự kiện storage change
        window.addEventListener('storage', (e) => {
            if (e.key === 'scores') {
                console.log('Scores updated in storage, reloading...');
                this.loadScores();
            }
        });

        // Lắng nghe sự kiện scoresUpdated
        window.addEventListener('scoresUpdated', () => {
            console.log('Scores updated event received, reloading...');
            this.loadScores();
        });

        // Lắng nghe sự kiện khi nội dung HTML được tải
        window.addEventListener('studentScoresContentLoaded', () => {
            console.log('Student scores content loaded, initializing...');
            this.setupFilters();
            this.loadScores();
        });
    }

    loadScores() {
        console.log('Loading scores...');
        if (!this.student || !this.student.studentId) {
            console.error('No student information found');
            return;
        }

        const studentId = this.student.studentId;
        console.log('Loading scores for student ID:', studentId);
        
        const allScores = JSON.parse(localStorage.getItem('scores')) || [];
        console.log('All scores from localStorage:', allScores);
        
        const studentScores = allScores.filter(score => score.studentId === studentId);
        console.log('Filtered student scores:', studentScores);

        // Kiểm tra xem các phần tử cần thiết đã tồn tại chưa
        const scoreTableBody = document.getElementById('scoresTableBody');
        const statsContainer = document.getElementById('scoreStats');
        
        if (!scoreTableBody) {
            console.warn('Score table body not found, waiting for content to load...');
            return;
        }

        this.updateScoreTable(studentScores);
        this.updateScoreStatistics(studentScores);
        this.updateAverageDisplay(studentScores);

        // Phát sự kiện cập nhật điểm
        window.dispatchEvent(new CustomEvent('studentScoresLoaded', { 
            detail: { scores: studentScores }
        }));
    }

    updateScoreTable(studentScores) {
        const scoreTableBody = document.getElementById('scoresTableBody');
        if (!scoreTableBody) {
            console.error('Score table body element not found');
            return;
        }

        scoreTableBody.innerHTML = studentScores.map(score => {
            return `
                <tr>
                    <td>${score.subject}</td>
                    <td>Học kỳ ${score.semester || '1'}</td>
                    <td>${score.type}</td>
                    <td>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getScoreClass(score.score)}">
                            ${score.score.toFixed(1)}
                        </span>
                    </td>
                    <td>${new Date(score.date).toLocaleDateString('vi-VN')}</td>
                    <td>${score.comment || '-'}</td>
                </tr>
            `;
        }).join('');
    }

    updateAverageDisplay(studentScores) {
        if (studentScores.length > 0) {
            const avgScore = studentScores.reduce((sum, score) => sum + score.score, 0) / studentScores.length;
            
            // Cập nhật các phần tử hiển thị điểm trung bình
            const averageElements = [
                document.getElementById('averageGrade'),
                document.getElementById('averageScore')
            ];

            averageElements.forEach(element => {
                if (element) {
                    element.textContent = avgScore.toFixed(1);
                }
            });

            // Cập nhật xếp loại học lực
            const rankingElement = document.getElementById('academicRanking');
            if (rankingElement) {
                rankingElement.textContent = this.getAcademicRanking(avgScore);
            }
        }
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

    getAcademicRanking(score) {
        if (score >= 8) return 'Giỏi';
        if (score >= 6.5) return 'Khá';
        if (score >= 5) return 'Trung bình';
        return 'Yếu';
    }
}

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', () => {
    window.studentScores = new StudentScores();
}); 