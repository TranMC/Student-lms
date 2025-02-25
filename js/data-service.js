// Service để quản lý dữ liệu tập trung
class DataService {
    constructor() {
        console.log('DataService đã được khởi tạo');
        this.dashboardData = null;
    }

    async fetchDashboardData() {
        try {
            console.log('Đang lấy dữ liệu dashboard...');
            
            // Lấy dữ liệu teacher từ localStorage
            const teacherData = localStorage.getItem('currentUser');
            let teacher = teacherData ? JSON.parse(teacherData) : null;
            
            if (!teacher || teacher.role !== 'teacher') {
                console.warn('Không tìm thấy thông tin giáo viên hợp lệ trong localStorage.');
                // Tạo dữ liệu mặc định
                teacher = { id: 'default', fullName: 'Giáo viên', role: 'teacher' };
            }

            // Lấy dữ liệu học sinh và điểm số từ localStorage
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            const scores = JSON.parse(localStorage.getItem('scores') || '[]');

            // Tính toán thống kê
            const statistics = this.calculateStatistics(scores, students);
            
            this.dashboardData = {
                teacher,
                students,
                scores,
                statistics,
                recentScores: this.getRecentScores(scores, students),
                schedule: this.getTeacherSchedule()
            };
            
            console.log('Dữ liệu dashboard đã được tải:', this.dashboardData);
            return this.dashboardData;
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu dashboard:', error);
            // Trả về dữ liệu mặc định nếu có lỗi
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
    
    calculateStatistics(scores, students) {
        try {
            // Tính toán các thống kê cơ bản
            const totalStudents = students.length;
            
            // Tính điểm trung bình
            let averageScore = 0;
            if (scores.length > 0) {
                const totalScore = scores.reduce((sum, score) => sum + parseFloat(score.score), 0);
                averageScore = totalScore / scores.length;
            }
            
            // Tính tỷ lệ đạt
            let passRate = 0;
            if (scores.length > 0) {
                const passedScores = scores.filter(score => parseFloat(score.score) >= 5);
                passRate = (passedScores.length / scores.length) * 100;
            }
            
            return {
                totalStudents,
                averageScore: averageScore.toFixed(1),
                passRate: passRate.toFixed(1)
            };
        } catch (error) {
            console.error('Lỗi khi tính toán thống kê:', error);
            return {
                totalStudents: 0,
                averageScore: '0.0',
                passRate: '0.0'
            };
        }
    }
    
    getRecentScores(scores, students) {
        try {
            if (!Array.isArray(scores) || !Array.isArray(students)) {
                console.error('scores hoặc students không phải là mảng:', { scores, students });
                return [];
            }

            // Lấy 5 điểm gần nhất
            return scores
                .map(score => {
                    const student = students.find(s => s.id === score.studentId);
                    return {
                        ...score,
                        studentName: student ? student.fullName : 'Học sinh'
                    };
                })
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5);
        } catch (error) {
            console.error('Lỗi trong getRecentScores:', error);
            return [];
        }
    }
    
    getTeacherSchedule() {
        // Dữ liệu mẫu cho lịch dạy
        return [
            { time: '07:00 - 08:30', class: '12A1', subject: 'Toán' },
            { time: '08:45 - 10:15', class: '12A2', subject: 'Vật lý' },
            { time: '10:30 - 12:00', class: '12A1', subject: 'Hóa học' }
        ];
    }
    
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

// Khởi tạo một instance toàn cục để sử dụng
window.dataService = new DataService(); 