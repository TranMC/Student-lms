class StudentConnection {
    constructor(apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl;
    }

    async loginStudent(username, password) {
        const response = await fetch(`${this.apiBaseUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const student = await response.json();
            localStorage.setItem('currentStudent', JSON.stringify(student));
            return true;
        }
        return false;
    }

    async getStudentScores(studentId) {
        const response = await fetch(`${this.apiBaseUrl}/students/${studentId}/scores`);
        if (response.ok) {
            return await response.json();
        }
        return [];
    }

    async calculateStudentAverage(studentId) {
        const studentScores = await this.getStudentScores(studentId);
        if (studentScores.length === 0) return 0;

        const total = studentScores.reduce((sum, score) => sum + parseFloat(score.score), 0);
        return total / studentScores.length;
    }

    async getStudentRanking(studentId) {
        const average = await this.calculateStudentAverage(studentId);
        if (average >= 8) return 'Giỏi';
        if (average >= 6.5) return 'Khá';
        if (average >= 5) return 'Trung bình';
        return 'Yếu';
    }

    async getStudentDetails(studentId) {
        const response = await fetch(`${this.apiBaseUrl}/students/${studentId}`);
        if (!response.ok) return null;

        const student = await response.json();
        const average = await this.calculateStudentAverage(studentId);
        const ranking = await this.getStudentRanking(studentId);
        const scores = await this.getStudentScores(studentId);

        return {
            ...student,
            average,
            ranking,
            scores
        };
    }
}

// Export để sử dụng trong các file khác
window.studentConnection = new StudentConnection('https://api.example.com'); 