class HomeworkManager {
    constructor() {
        this.currentClass = null;
        this.currentSubject = null;
    }

    // Load giao diện bài tập về nhà
    loadHomeworkInterface() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="col-span-3">
                <!-- Filters and Actions -->
                <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
                    <div class="flex flex-wrap gap-4 items-center justify-between">
                        <div class="flex gap-4">
                            <select id="classSelect" class="form-input w-48">
                                <option value="">Chọn lớp</option>
                                <option value="10A1">Lớp 10A1</option>
                                <option value="10A2">Lớp 10A2</option>
                            </select>
                            <select id="subjectSelect" class="form-input w-48">
                                <option value="">Chọn môn học</option>
                                <option value="math">Toán học</option>
                                <option value="physics">Vật lý</option>
                                <option value="chemistry">Hóa học</option>
                            </select>
                            <input type="text" id="homeworkDate" class="form-input w-48 date-picker" placeholder="Ngày giao">
                        </div>
                        <button id="addHomework" class="btn-primary">
                            <i class="fas fa-plus mr-2"></i>Thêm bài tập mới
                        </button>
                    </div>
                </div>

                <!-- Homework List -->
                <div class="bg-white rounded-lg shadow-sm">
                    <div class="p-6">
                        <h2 class="text-xl font-semibold mb-4">Danh sách bài tập</h2>
                        <div id="homeworkList" class="space-y-4">
                            <!-- Homework items will be loaded here -->
                        </div>
                    </div>
                </div>

                <!-- Statistics -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div class="bg-white p-6 rounded-lg shadow-sm">
                        <h3 class="text-lg font-semibold mb-4">Thống kê nộp bài</h3>
                        <canvas id="submissionChart"></canvas>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow-sm">
                        <h3 class="text-lg font-semibold mb-4">Tình trạng bài tập</h3>
                        <div id="homeworkStatus" class="space-y-4">
                            <!-- Status items will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize components
        this.initializeHandlers();
        this.loadHomeworkData();
    }

    // Initialize event handlers
    initializeHandlers() {
        const classSelect = document.getElementById('classSelect');
        const subjectSelect = document.getElementById('subjectSelect');
        const addHomework = document.getElementById('addHomework');

        classSelect.addEventListener('change', () => this.filterHomework());
        subjectSelect.addEventListener('change', () => this.filterHomework());
        addHomework.addEventListener('click', () => this.showAddHomeworkModal());

        // Initialize date picker
        flatpickr('#homeworkDate', {
            dateFormat: 'd/m/Y',
            locale: 'vn'
        });
    }

    // Load homework data
    async loadHomeworkData() {
        try {
            // Simulate API call
            const homeworkData = [
                {
                    id: 1,
                    class: '10A1',
                    subject: 'Toán học',
                    title: 'Bài tập về hàm số',
                    description: 'Giải các bài tập từ trang 45-47',
                    dueDate: '10/03/2024',
                    status: 'active',
                    submissions: 25,
                    totalStudents: 30
                },
                {
                    id: 2,
                    class: '10A2',
                    subject: 'Vật lý',
                    title: 'Bài tập về chuyển động',
                    description: 'Làm các bài tập 1-5 trang 32',
                    dueDate: '12/03/2024',
                    status: 'active',
                    submissions: 18,
                    totalStudents: 32
                }
            ];

            this.renderHomeworkList(homeworkData);
            this.updateSubmissionChart();
            this.updateHomeworkStatus(homeworkData);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu bài tập:', error);
            showToast('Không thể tải dữ liệu bài tập', 'error');
        }
    }

    // Render homework list
    renderHomeworkList(homeworkData) {
        const container = document.getElementById('homeworkList');
        container.innerHTML = homeworkData.map(homework => `
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <div>
                        <h4 class="font-semibold text-lg">${homework.title}</h4>
                        <p class="text-sm text-gray-600">${homework.class} - ${homework.subject}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-500">Hạn nộp: ${homework.dueDate}</span>
                        <div class="flex gap-2">
                            <button class="p-2 text-blue-600 hover:text-blue-800" onclick="homeworkManager.editHomework(${homework.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="p-2 text-red-600 hover:text-red-800" onclick="homeworkManager.deleteHomework(${homework.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <p class="text-gray-700 mb-3">${homework.description}</p>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <span class="text-sm text-gray-600">
                            <i class="fas fa-user-check mr-1"></i>
                            ${homework.submissions}/${homework.totalStudents} đã nộp
                        </span>
                        <div class="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div class="h-full bg-green-500" style="width: ${(homework.submissions/homework.totalStudents*100)}%"></div>
                        </div>
                    </div>
                    <button class="btn-secondary" onclick="homeworkManager.viewSubmissions(${homework.id})">
                        Xem bài nộp
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Show add homework modal
    showAddHomeworkModal() {
        const modalContent = `
            <div class="bg-white rounded-lg p-6 max-w-2xl w-full">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-semibold">Thêm bài tập mới</h3>
                    <button class="text-gray-500 hover:text-gray-700" onclick="document.getElementById('modalContainer').classList.add('hidden')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="homeworkForm" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Lớp</label>
                            <select class="form-input w-full" required>
                                <option value="">Chọn lớp</option>
                                <option value="10A1">Lớp 10A1</option>
                                <option value="10A2">Lớp 10A2</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Môn học</label>
                            <select class="form-input w-full" required>
                                <option value="">Chọn môn học</option>
                                <option value="math">Toán học</option>
                                <option value="physics">Vật lý</option>
                                <option value="chemistry">Hóa học</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="form-label">Tiêu đề bài tập</label>
                        <input type="text" class="form-input w-full" required>
                    </div>
                    <div>
                        <label class="form-label">Mô tả bài tập</label>
                        <textarea class="form-input w-full h-32" required></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="form-label">Ngày giao</label>
                            <input type="text" class="form-input w-full date-picker" required>
                        </div>
                        <div>
                            <label class="form-label">Hạn nộp</label>
                            <input type="text" class="form-input w-full date-picker" required>
                        </div>
                    </div>
                    <div class="flex justify-end gap-4 mt-6">
                        <button type="button" class="btn-secondary" onclick="document.getElementById('modalContainer').classList.add('hidden')">
                            Hủy
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save mr-2"></i>Lưu bài tập
                        </button>
                    </div>
                </form>
            </div>
        `;

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = modalContent;
        modalContainer.classList.remove('hidden');

        // Initialize date pickers in modal
        flatpickr('.date-picker', {
            dateFormat: 'd/m/Y',
            locale: 'vn'
        });

        // Handle form submission
        document.getElementById('homeworkForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveHomework(e.target);
        });
    }

    // Save homework
    async saveHomework(form) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            document.getElementById('modalContainer').classList.add('hidden');
            showToast('Đã lưu bài tập thành công', 'success');
            this.loadHomeworkData();
        } catch (error) {
            console.error('Lỗi khi lưu bài tập:', error);
            showToast('Không thể lưu bài tập', 'error');
        }
    }

    // Update submission chart
    updateSubmissionChart() {
        const ctx = document.getElementById('submissionChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['10A1', '10A2'],
                datasets: [{
                    label: 'Tỷ lệ nộp bài (%)',
                    data: [83, 56],
                    backgroundColor: '#4F46E5'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Tỷ lệ nộp bài theo lớp'
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

    // Update homework status
    updateHomeworkStatus(homeworkData) {
        const container = document.getElementById('homeworkStatus');
        const stats = {
            active: homeworkData.filter(hw => hw.status === 'active').length,
            completed: homeworkData.filter(hw => hw.status === 'completed').length,
            overdue: homeworkData.filter(hw => hw.status === 'overdue').length
        };

        container.innerHTML = `
            <div class="grid grid-cols-3 gap-4">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-blue-700">Đang thực hiện</h4>
                    <p class="text-2xl font-bold text-blue-600">${stats.active}</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-green-700">Đã hoàn thành</h4>
                    <p class="text-2xl font-bold text-green-600">${stats.completed}</p>
                </div>
                <div class="bg-red-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-red-700">Quá hạn</h4>
                    <p class="text-2xl font-bold text-red-600">${stats.overdue}</p>
                </div>
            </div>
        `;
    }

    // Filter homework
    filterHomework() {
        // Implementation for filtering homework
        this.loadHomeworkData();
    }

    // Edit homework
    editHomework(id) {
        // Implementation for editing homework
        console.log('Editing homework:', id);
    }

    // Delete homework
    async deleteHomework(id) {
        if (confirm('Bạn có chắc chắn muốn xóa bài tập này?')) {
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                showToast('Đã xóa bài tập thành công', 'success');
                this.loadHomeworkData();
            } catch (error) {
                console.error('Lỗi khi xóa bài tập:', error);
                showToast('Không thể xóa bài tập', 'error');
            }
        }
    }

    // View submissions
    viewSubmissions(id) {
        // Implementation for viewing submissions
        console.log('Viewing submissions for homework:', id);
    }
}

// Initialize manager
const homeworkManager = new HomeworkManager(); 