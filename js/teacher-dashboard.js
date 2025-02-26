class TeacherDashboard {
    constructor() {
        this.currentView = 'overview';
        this.charts = {
            grades: null,
            attendance: null
        };
        this.initializeDashboard();
    }

    async initializeDashboard() {
        try {
            const teacher = JSON.parse(localStorage.getItem('currentTeacher'));
            if (teacher) {
                // Cập nhật tên giáo viên trong dropdown menu
                const teacherNameElement = document.querySelector('#userMenuButton .teacher-name');
                if (teacherNameElement) {
                    teacherNameElement.textContent = teacher.fullName || teacher.name;
                }
                
                // Cập nhật avatar
                const avatar = document.querySelector('#userMenuButton img');
                if (avatar) {
                    avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.fullName || teacher.name)}&background=0D8ABC&color=fff`;
                }
            }
            this.updateDateTime();
            setInterval(() => this.updateDateTime(), 60000);
            await this.loadDashboardOverview();
        } catch (error) {
            console.error('Lỗi khởi tạo dashboard:', error);
            showToast('Không thể tải dữ liệu dashboard', 'error');
        }
    }

    updateDateTime() {
        const dateTimeElement = document.getElementById('currentDateTime');
        if (dateTimeElement) {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            dateTimeElement.textContent = now.toLocaleDateString('vi-VN', options);
        }
    }

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts.grades = null;
        this.charts.attendance = null;
    }

    async loadDashboardOverview() {
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;

        // Đảm bảo hủy các biểu đồ cũ trước khi tạo mới
        this.destroyCharts();

        pageContent.innerHTML = `
            <div class="col-span-3">
                <!-- Thống kê tổng quan -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div class="stat-card bg-white p-6 rounded-lg shadow-sm">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-700">Tổng số lớp</h3>
                                <p class="text-3xl font-bold text-primary-600">5</p>
                            </div>
                            <div class="text-primary-500">
                                <i class="fas fa-chalkboard-teacher text-3xl"></i>
                            </div>
                        </div>
                    </div>
                    <div class="stat-card bg-white p-6 rounded-lg shadow-sm">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-700">Tổng số học sinh</h3>
                                <p class="text-3xl font-bold text-success-600">150</p>
                            </div>
                            <div class="text-success-500">
                                <i class="fas fa-user-graduate text-3xl"></i>
                            </div>
                        </div>
                    </div>
                    <div class="stat-card bg-white p-6 rounded-lg shadow-sm">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-700">Điểm trung bình</h3>
                                <p class="text-3xl font-bold text-warning-600">7.5</p>
                            </div>
                            <div class="text-warning-500">
                                <i class="fas fa-star text-3xl"></i>
                            </div>
                        </div>
                    </div>
                    <div class="stat-card bg-white p-6 rounded-lg shadow-sm">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-700">Bài tập mới</h3>
                                <p class="text-3xl font-bold text-danger-600">3</p>
                            </div>
                            <div class="text-danger-500">
                                <i class="fas fa-book text-3xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Biểu đồ và thông tin chi tiết -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Biểu đồ điểm số -->
                    <div class="bg-white p-6 rounded-lg shadow-sm">
                        <h3 class="text-lg font-semibold mb-4">Phân bố điểm số</h3>
                        <canvas id="gradesChart"></canvas>
                    </div>

                    <!-- Biểu đồ điểm danh -->
                    <div class="bg-white p-6 rounded-lg shadow-sm">
                        <h3 class="text-lg font-semibold mb-4">Thống kê điểm danh</h3>
                        <canvas id="attendanceChart"></canvas>
                    </div>

                    <!-- Lịch dạy gần nhất -->
                    <div class="bg-white p-6 rounded-lg shadow-sm">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">Lịch dạy sắp tới</h3>
                            <a href="#schedule" class="text-sm text-primary-600 hover:text-primary-700">Xem tất cả</a>
                        </div>
                        <div class="space-y-4" id="upcomingSchedule">
                            <!-- Lịch dạy sẽ được thêm vào đây -->
                        </div>
                    </div>

                    <!-- Bài tập gần đây -->
                    <div class="bg-white p-6 rounded-lg shadow-sm">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-semibold">Bài tập gần đây</h3>
                            <a href="#homework" class="text-sm text-primary-600 hover:text-primary-700">Xem tất cả</a>
                        </div>
                        <div class="space-y-4" id="recentHomework">
                            <!-- Bài tập sẽ được thêm vào đây -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Đảm bảo các biểu đồ cũ được hủy trước khi tạo mới
        this.destroyCharts();
        
        await this.loadStatistics();
        this.initializeCharts();
        this.updateRecentData();
    }

    async loadStatistics() {
        try {
            // Giả lập API call
            const stats = {
                totalClasses: 5,
                totalStudents: 150,
                averageGrade: 7.5,
                newHomework: 3,
                gradeDistribution: [10, 25, 45, 35, 20],
                attendanceData: {
                    present: 85,
                    absent: 10,
                    late: 5
                }
            };
            this.updateDashboardStats(stats);
        } catch (error) {
            console.error('Lỗi khi tải thống kê:', error);
            showToast('Không thể tải dữ liệu thống kê', 'error');
        }
    }

    initializeCharts() {
        const gradesCtx = document.getElementById('gradesChart')?.getContext('2d');
        if (gradesCtx) {
            this.charts.grades = new Chart(gradesCtx, {
                type: 'bar',
                data: {
                    labels: ['0-2', '2-4', '4-6', '6-8', '8-10'],
                    datasets: [{
                        label: 'Số học sinh',
                        data: [10, 25, 45, 35, 20],
                        backgroundColor: '#4F46E5'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Phân bố điểm số'
                        }
                    }
                }
            });
        }

        const attendanceCtx = document.getElementById('attendanceChart')?.getContext('2d');
        if (attendanceCtx) {
            this.charts.attendance = new Chart(attendanceCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Có mặt', 'Vắng mặt', 'Đi muộn'],
                    datasets: [{
                        data: [85, 10, 5],
                        backgroundColor: ['#10B981', '#EF4444', '#F59E0B']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    updateDashboardStats(stats) {
        const statCards = document.querySelectorAll('.stat-card p');
        if (statCards.length >= 4) {
            statCards[0].textContent = stats.totalClasses;
            statCards[1].textContent = stats.totalStudents;
            statCards[2].textContent = stats.averageGrade;
            statCards[3].textContent = stats.newHomework;
        }

        if (this.charts.grades) {
            this.charts.grades.data.datasets[0].data = stats.gradeDistribution;
            this.charts.grades.update();
        }

        if (this.charts.attendance) {
            this.charts.attendance.data.datasets[0].data = [
                stats.attendanceData.present,
                stats.attendanceData.absent,
                stats.attendanceData.late
            ];
            this.charts.attendance.update();
        }
    }

    updateRecentData() {
        const upcomingSchedule = document.getElementById('upcomingSchedule');
        if (upcomingSchedule) {
            upcomingSchedule.innerHTML = `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <h4 class="font-semibold">Lớp 10A1 - Toán học</h4>
                        <p class="text-sm text-gray-600">Tiết 1-2</p>
                    </div>
                    <span class="text-sm text-gray-500">Hôm nay</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <h4 class="font-semibold">Lớp 10A2 - Toán học</h4>
                        <p class="text-sm text-gray-600">Tiết 3-4</p>
                    </div>
                    <span class="text-sm text-gray-500">Ngày mai</span>
                </div>
            `;
        }

        const recentHomework = document.getElementById('recentHomework');
        if (recentHomework) {
            recentHomework.innerHTML = `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <h4 class="font-semibold">Bài tập Đại số</h4>
                        <p class="text-sm text-gray-600">Lớp 10A1</p>
                    </div>
                    <span class="text-sm text-gray-500">Hạn: 20/03/2024</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <h4 class="font-semibold">Bài tập Hình học</h4>
                        <p class="text-sm text-gray-600">Lớp 10A2</p>
                    </div>
                    <span class="text-sm text-gray-500">Hạn: 22/03/2024</span>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // Thêm các event listeners nếu cần
    }
}

// Khởi tạo dashboard khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    window.teacherDashboard = new TeacherDashboard();
}); 