class StudentConnection {
    constructor() {
        this.students = JSON.parse(localStorage.getItem('students') || '[]');
        this.scores = JSON.parse(localStorage.getItem('scores') || '[]');
    }

    // Đăng nhập học sinh
    loginStudent(username, password) {
        const student = this.students.find(s => 
            s.username === username && s.password === password
        );
        
        if (student) {
            localStorage.setItem('currentStudent', JSON.stringify(student));
            return true;
        }
        return false;
    }

    // Lấy điểm của học sinh
    getStudentScores(studentId) {
        return this.scores.filter(score => score.studentId === studentId);
    }

    // Tính điểm trung bình của học sinh
    calculateStudentAverage(studentId) {
        const studentScores = this.getStudentScores(studentId);
        if (studentScores.length === 0) return 0;

        const total = studentScores.reduce((sum, score) => sum + parseFloat(score.score), 0);
        return total / studentScores.length;
    }

    // Lấy xếp loại của học sinh
    getStudentRanking(studentId) {
        const average = this.calculateStudentAverage(studentId);
        if (average >= 8) return 'Giỏi';
        if (average >= 6.5) return 'Khá';
        if (average >= 5) return 'Trung bình';
        return 'Yếu';
    }

    // Lấy thông tin chi tiết học sinh
    getStudentDetails(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return null;

        return {
            ...student,
            average: this.calculateStudentAverage(studentId),
            ranking: this.getStudentRanking(studentId),
            scores: this.getStudentScores(studentId)
        };
    }
}

// Export để sử dụng trong các file khác
window.studentConnection = new StudentConnection(); 