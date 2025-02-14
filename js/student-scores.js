class StudentScores {
    constructor() {
        this.student = JSON.parse(localStorage.getItem('currentStudent'));
        this.init();
    }

    init() {
        this.loadScores();
        this.initializeFilters();
    }

    loadScores() {
        const scores = JSON.parse(localStorage.getItem('scores') || '[]');
        const studentScores = scores.filter(score => 
            score.studentId === this.student.studentId
        );
        
        this.renderScoresTable(studentScores);
        this.updateStatistics(studentScores);
    }

    renderScoresTable(scores) {
        const tbody = document.querySelector('#scoresTable tbody');
        if (tbody) {
            tbody.innerHTML = scores.map(score => `
                <tr>
                    <td>${score.subject}</td>
                    <td>${score.type}</td>
                    <td>${score.score}</td>
                    <td>${new Date(score.date).toLocaleDateString('vi-VN')}</td>
                    <td><span class="status ${this.getScoreStatus(score.score)}">
                        ${this.getScoreLabel(score.score)}
                    </span></td>
                </tr>
            `).join('');
        }
    }

    initializeFilters() {
        // Implement filters for subject, score type, etc.
    }

    // Helper methods from StudentDashboard can be reused here
} 