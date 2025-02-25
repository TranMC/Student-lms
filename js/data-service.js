// Service để quản lý dữ liệu tập trung
class DataService {
    constructor() {
        // Khởi tạo nếu cần
    }

    dashboardData = null;
    
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
            const statistics = this.calculateStatistics(scores);
            
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
    }
    
    calculateStatistics(scores) {
        if (!scores.length) return {
            average: 0,
            ranking: 'Chưa có điểm',
            passedSubjects: '0/0'
        };

        const average = scores.reduce((sum, score) => sum + parseFloat(score.score), 0) / scores.length;
        const passedCount = scores.filter(score => parseFloat(score.score) >= 5).length;

        return {
            average: average.toFixed(1),
            ranking: this.getRanking(average),
            passedSubjects: `${passedCount}/${scores.length}`
        };
    };
    
    getRanking(average) {
        if (average >= 8.5) return 'Xuất sắc';
        if (average >= 7.0) return 'Giỏi';
        if (average >= 6.5) return 'Khá';
        if (average >= 5.0) return 'Trung bình';
        return 'Yếu';
    };
    
    getRecentScores(scores, students) {
        if (!Array.isArray(scores)) {
            console.error('scores không phải là mảng:', scores);
            return [];
        }

        try {
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
        } catch (error) {
            console.error('Lỗi trong getRecentScores:', error);
            return [];
        }
    };
    
    getTeacherSchedule() {
        return [
            { time: '07:00 - 08:30', class: '12A1', subject: 'Toán' },
            { time: '08:45 - 10:15', class: '12A2', subject: 'Vật lý' },
            { time: '10:30 - 12:00', class: '12A1', subject: 'Hóa học' }
        ];
    };
    
    getDashboardData() {
        return this.dashboardData;
    };
    
    // Cập nhật dữ liệu dashboard và thống kê
    updateData(newData) {
        this.dashboardData = newData;
        // Kích hoạt sự kiện cập nhật
        document.dispatchEvent(new CustomEvent('dashboard-data-updated', {
            detail: newData
        }));
    };

    async getStudentData(studentId) {
        try {
            const scores = JSON.parse(localStorage.getItem('scores') || '[]');
            const studentScores = scores.filter(score => score.studentId === studentId);
            
            return {
                scores: studentScores,
                statistics: this.calculateStatistics(studentScores),
                schedule: this.getStudentSchedule(studentId)
            };
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu học sinh:', error);
            throw error;
        }
    };

    getStudentSchedule(studentId) {
        // Giả lập dữ liệu lịch học
        return [
            {
                day: 'Thứ 2',
                subjects: [
                    { time: '07:00 - 08:30', name: 'Toán', room: 'A101' },
                    { time: '08:45 - 10:15', name: 'Văn', room: 'A102' }
                ]
            },
            // Thêm các ngày khác...
        ];
    }

    getStudentStats(studentId) {
        try {
            const scores = JSON.parse(localStorage.getItem('scores') || '[]');
            const studentScores = scores.filter(score => score.studentId === studentId);
            
            // Tính điểm trung bình
            const averageScore = studentScores.length > 0 
                ? studentScores.reduce((sum, score) => sum + score.score, 0) / studentScores.length 
                : 0;

            // Tỷ lệ hoàn thành (giả định điểm >= 5 là đạt)
            const passedScores = studentScores.filter(score => score.score >= 5);
            const completionRate = studentScores.length > 0 
                ? Math.round((passedScores.length / studentScores.length) * 100) 
                : 0;

            // Số ngày đến kỳ thi gần nhất (giả lập)
            const daysToExam = 15;
            
            // Tính xu hướng điểm số (giả lập)
            // Trong thực tế, bạn sẽ so sánh điểm trung bình hiện tại với kỳ trước
            const scoreTrend = {
                direction: 'up', // 'up' hoặc 'down'
                value: 0.5 // Giá trị thay đổi
            };
            
            // Tính xu hướng tỷ lệ hoàn thành (giả lập)
            const completionTrend = {
                direction: 'up',
                value: 5
            };

            return {
                averageScore,
                completionRate,
                daysToExam,
                scoreTrend,
                completionTrend
            };
        } catch (error) {
            console.error('Lỗi khi lấy thống kê học sinh:', error);
            return {
                averageScore: 0,
                completionRate: 0,
                daysToExam: 0,
                scoreTrend: { direction: 'none', value: 0 },
                completionTrend: { direction: 'none', value: 0 }
            };
        }
    }

    getUpcomingExams(studentId) {
        try {
            // Giả lập dữ liệu kỳ thi sắp tới
            const mockExams = [
                {
                    subject: 'Toán',
                    type: 'Giữa kỳ',
                    date: '2024-05-25',
                    time: '07:30 - 09:00',
                    room: 'A101'
                },
                {
                    subject: 'Vật lý',
                    type: 'Thực hành',
                    date: '2024-05-28',
                    time: '09:30 - 11:00',
                    room: 'B203'
                },
                {
                    subject: 'Ngữ văn',
                    type: 'Cuối kỳ',
                    date: '2024-06-05',
                    time: '07:30 - 09:30',
                    room: 'C305'
                },
                {
                    subject: 'Tiếng Anh',
                    type: 'Thuyết trình',
                    date: '2024-06-10',
                    time: '13:30 - 15:00',
                    room: 'D401'
                }
            ];
            
            // Sắp xếp theo ngày gần nhất
            return mockExams.sort((a, b) => new Date(a.date) - new Date(b.date));
        } catch (error) {
            console.error('Lỗi khi lấy lịch thi:', error);
            return [];
        }
    }

    getSubjectProgress(studentId) {
        try {
            // Giả lập dữ liệu tiến độ học tập
            return [
                {
                    name: 'Toán học',
                    completed: 85,
                    lastUpdate: '15/05/2024'
                },
                {
                    name: 'Vật lý',
                    completed: 72,
                    lastUpdate: '12/05/2024'
                },
                {
                    name: 'Hóa học',
                    completed: 65,
                    lastUpdate: '10/05/2024'
                },
                {
                    name: 'Ngữ văn',
                    completed: 90,
                    lastUpdate: '14/05/2024'
                },
                {
                    name: 'Tiếng Anh',
                    completed: 78,
                    lastUpdate: '13/05/2024'
                }
            ];
        } catch (error) {
            console.error('Lỗi khi lấy tiến độ học tập:', error);
            return [];
        }
    }
} 