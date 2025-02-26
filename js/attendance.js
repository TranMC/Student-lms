class AttendanceManager {
    constructor() {
        this.currentClass = null;
        this.currentDate = new Date();
        this.students = [];
        this.chart = null;
    }

    // Load giao diện điểm danh
    loadAttendanceInterface() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="col-span-3">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold">Điểm danh lớp học</h2>
                        <div class="flex space-x-4">
                            <select id="classSelect" class="form-input w-48">
                                <option value="">Chọn lớp</option>
                                <option value="10A1">Lớp 10A1</option>
                                <option value="10A2">Lớp 10A2</option>
                            </select>
                            <input type="text" id="attendanceDate" class="form-input w-48 date-picker" placeholder="Chọn ngày">
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th class="w-16">STT</th>
                                    <th>Họ và tên</th>
                                    <th class="w-32">Trạng thái</th>
                                    <th class="w-48">Ghi chú</th>
                                    <th class="w-32">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody id="attendanceList">
                                <!-- Danh sách học sinh sẽ được thêm vào đây -->
                            </tbody>
                        </table>
                    </div>
                    <div class="mt-6 flex justify-between items-center">
                        <div class="flex space-x-4">
                            <button id="markAllPresent" class="btn-secondary">
                                <i class="fas fa-check-circle mr-2"></i>Có mặt tất cả
                            </button>
                            <button id="resetAttendance" class="btn-secondary">
                                <i class="fas fa-redo mr-2"></i>Đặt lại
                            </button>
                        </div>
                        <button id="saveAttendance" class="btn-primary">
                            <i class="fas fa-save mr-2"></i>Lưu điểm danh
                        </button>
                    </div>
                </div>

                <!-- Thống kê điểm danh -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div class="bg-white p-6 rounded-lg shadow-sm">
                        <h3 class="text-lg font-semibold mb-4">Thống kê điểm danh tháng</h3>
                        <canvas id="attendanceChart"></canvas>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-sm">
                        <h3 class="text-lg font-semibold mb-4">Danh sách vắng mặt gần đây</h3>
                        <div id="recentAbsences" class="space-y-4">
                            <!-- Danh sách vắng mặt sẽ được thêm vào đây -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initializeAttendanceHandlers();
        this.loadAttendanceData();
    }

    // Khởi tạo các event handlers
    initializeAttendanceHandlers() {
        const classSelect = document.getElementById('classSelect');
        const attendanceDate = document.getElementById('attendanceDate');
        const markAllPresent = document.getElementById('markAllPresent');
        const resetAttendance = document.getElementById('resetAttendance');
        const saveAttendance = document.getElementById('saveAttendance');

        classSelect.addEventListener('change', () => this.loadClassStudents(classSelect.value));
        markAllPresent.addEventListener('click', () => this.markAllStudentsPresent());
        resetAttendance.addEventListener('click', () => this.resetAttendanceData());
        saveAttendance.addEventListener('click', () => this.saveAttendanceData());

        // Khởi tạo date picker
        flatpickr(attendanceDate, {
            defaultDate: 'today',
            dateFormat: 'd/m/Y',
            locale: 'vn'
        });
    }

    // Load dữ liệu học sinh của lớp
    async loadClassStudents(className) {
        try {
            // Giả lập API call
            const students = [
                { id: 1, name: 'Nguyễn Văn A' },
                { id: 2, name: 'Trần Thị B' },
                { id: 3, name: 'Lê Văn C' }
            ];

            this.students = students;
            this.renderAttendanceList();
        } catch (error) {
            console.error('Lỗi khi tải danh sách học sinh:', error);
            showToast('Không thể tải danh sách học sinh', 'error');
        }
    }

    // Render danh sách điểm danh
    renderAttendanceList() {
        const attendanceList = document.getElementById('attendanceList');
        attendanceList.innerHTML = this.students.map((student, index) => `
            <tr>
                <td class="text-center">${index + 1}</td>
                <td>${student.name}</td>
                <td>
                    <select class="form-input w-full" data-student-id="${student.id}">
                        <option value="present">Có mặt</option>
                        <option value="absent">Vắng mặt</option>
                        <option value="late">Đi muộn</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="form-input w-full" placeholder="Ghi chú">
                </td>
                <td class="text-center">
                    <button class="text-blue-600 hover:text-blue-800" onclick="viewStudentHistory(${student.id})">
                        <i class="fas fa-history"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Đánh dấu tất cả học sinh có mặt
    markAllStudentsPresent() {
        const selects = document.querySelectorAll('#attendanceList select');
        selects.forEach(select => select.value = 'present');
        showToast('Đã đánh dấu tất cả học sinh có mặt', 'success');
    }

    // Reset dữ liệu điểm danh
    resetAttendanceData() {
        const selects = document.querySelectorAll('#attendanceList select');
        const notes = document.querySelectorAll('#attendanceList input[type="text"]');
        
        selects.forEach(select => select.value = 'present');
        notes.forEach(note => note.value = '');
        
        showToast('Đã đặt lại dữ liệu điểm danh', 'success');
    }

    // Lưu dữ liệu điểm danh
    async saveAttendanceData() {
        try {
            const attendanceData = this.collectAttendanceData();
            // Giả lập API call để lưu dữ liệu
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            showToast('Đã lưu dữ liệu điểm danh thành công', 'success');
            this.updateAttendanceChart();
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu điểm danh:', error);
            showToast('Không thể lưu dữ liệu điểm danh', 'error');
        }
    }

    // Thu thập dữ liệu điểm danh
    collectAttendanceData() {
        const rows = document.querySelectorAll('#attendanceList tr');
        const data = [];

        rows.forEach(row => {
            const studentId = row.querySelector('select').dataset.studentId;
            const status = row.querySelector('select').value;
            const note = row.querySelector('input[type="text"]').value;

            data.push({ studentId, status, note });
        });

        return data;
    }

    // Thêm phương thức destroyCharts
    destroyCharts() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }

    // Cập nhật phương thức updateAttendanceChart
    updateAttendanceChart() {
        this.destroyCharts();
        const ctx = document.getElementById('attendanceChart')?.getContext('2d');
        if (ctx) {
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['1/3', '2/3', '3/3', '4/3', '5/3', '6/3', '7/3'],
                    datasets: [{
                        label: 'Tỷ lệ có mặt',
                        data: [95, 92, 88, 90, 85, 89, 91],
                        borderColor: '#4F46E5',
                        tension: 0.4
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
                            text: 'Thống kê điểm danh 7 ngày gần đây'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    }

    // Load dữ liệu điểm danh
    async loadAttendanceData() {
        try {
            // Giả lập API call
            const recentAbsences = [
                { name: 'Nguyễn Văn A', date: '05/03/2024', reason: 'Ốm' },
                { name: 'Trần Thị B', date: '04/03/2024', reason: 'Việc gia đình' }
            ];

            this.renderRecentAbsences(recentAbsences);
            this.updateAttendanceChart();
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu điểm danh:', error);
        }
    }

    // Render danh sách vắng mặt gần đây
    renderRecentAbsences(absences) {
        const container = document.getElementById('recentAbsences');
        container.innerHTML = absences.map(absence => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                    <h4 class="font-semibold">${absence.name}</h4>
                    <p class="text-sm text-gray-600">${absence.reason}</p>
                </div>
                <span class="text-sm text-gray-500">${absence.date}</span>
            </div>
        `).join('');
    }
}

// Khởi tạo manager khi tải trang
const attendanceManager = new AttendanceManager(); 