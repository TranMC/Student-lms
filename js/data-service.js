// Service để quản lý dữ liệu tập trung
const DataService = {
    dashboardData: null,
    
    async fetchDashboardData() {
        try {
            // Lấy dữ liệu teacher từ sessionStorage
            const teacherData = sessionStorage.getItem('teacherData');
            let teacher = teacherData ? JSON.parse(teacherData) : null;
            if (!teacher) {
                console.error('Không tìm thấy thông tin giáo viên trong sessionStorage.');
                // Bạn có thể tạo dữ liệu mặc định hoặc chuyển hướng người dùng đến trang login.
                teacher = { id: 'default', fullName: 'Giáo viên' };
            }

            // Lấy dữ liệu học sinh và điểm số từ localStorage
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            const scores = JSON.parse(localStorage.getItem('scores') || '[]');
            
            // Tính toán thống kê
            const statistics = this.calculateStatistics(students, scores);
            
            this.dashboardData = {
                teacher,
                students,
                scores,
                statistics,
                recentScores: this.getRecentScores(scores, students),
                schedule: this.getTeacherSchedule()
            };
            
            console.log('Dashboard Data:', this.dashboardData); // Debug
            return this.dashboardData;
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
            return {
                teacher: { fullName: 'Giáo viên' },
                students: [],
                scores: [],
                statistics: { totalStudents: 0, averageScore: '0.0', passRate: '0.0' },
                recentScores: [],
                schedule: []
            };
        }
    },
    
    calculateStatistics(students, scores) {
        const totalStudents = students.length;
        let averageScore = 0;
        let passRate = 0;
        
        if (scores && scores.length > 0) {
            const validScores = scores.filter(score => !isNaN(parseFloat(score.score)));
            if (validScores.length > 0) {
                averageScore = validScores.reduce((sum, score) => sum + parseFloat(score.score), 0) / validScores.length;
                const passCount = validScores.filter(score => parseFloat(score.score) >= 5).length;
                passRate = (passCount / validScores.length) * 100;
            }
        }
        
        return {
            totalStudents,
            averageScore: averageScore.toFixed(1),
            passRate: passRate.toFixed(1)
        };
    },
    
    getRecentScores(scores, students) {
        return scores
            .map(score => {
                const student = students.find(s => s.id === score.studentId || s.studentId === score.studentId);
                return {
                    ...score,
                    studentName: student ? student.name || student.fullName : 'Học sinh'
                };
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
    },
    
    getTeacherSchedule() {
        return [
            { time: '07:00 - 08:30', class: '12A1', subject: 'Toán' },
            { time: '08:45 - 10:15', class: '12A2', subject: 'Vật lý' },
            { time: '10:30 - 12:00', class: '12A1', subject: 'Hóa học' }
        ];
    },
    
    getDashboardData() {
        return this.dashboardData;
    },
    
    // Cập nhật dữ liệu dashboard và thống kê
    updateData(newData) {
        this.dashboardData = newData;
        // Kích hoạt sự kiện cập nhật
        document.dispatchEvent(new CustomEvent('dashboard-data-updated', {
            detail: newData
        }));
    }
}; 