class TeacherNavigation {
    constructor() {
        this.currentPage = 'dashboard';
        this.managers = {
            dashboard: null,
            attendance: null,
            homework: null,
            messages: null
        };
        this.loadedScripts = new Set();
        this.initialize();
    }

    async initialize() {
        try {
            await this.initializeNavigation();
            await this.initializeUserDropdown();
            await this.initializeNotifications();

            // Thêm hàm logout vào window object
            window.logout = () => {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('currentTeacher');
                window.location.href = 'login.html';
            };
        } catch (error) {
            console.error('Lỗi khởi tạo:', error);
            showToast('Có lỗi xảy ra khi khởi tạo ứng dụng', 'error');
        }
    }

    async initializeNavigation() {
        try {
            const sidebarLinks = document.querySelectorAll('.sidebar a, nav a');
            sidebarLinks.forEach(link => {
                link.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const page = link.getAttribute('href').replace('#', '');
                    await this.navigateToPage(page);
                });
            });

            // Khởi tạo trạng thái ban đầu
            const hash = window.location.hash.replace('#', '') || 'dashboard';
            await this.navigateToPage(hash);
        } catch (error) {
            console.error('Lỗi khởi tạo navigation:', error);
            throw error;
        }
    }

    async navigateToPage(page) {
        try {
            // Cập nhật URL hash
            window.location.hash = page;
            
            // Cập nhật menu active
            this.updateActiveMenu(page);
            
            // Cập nhật tiêu đề trang
            this.updatePageTitle(page);
            
            // Load nội dung trang
            await this.loadPageContent(page);
            
            this.currentPage = page;
        } catch (error) {
            console.error('Lỗi khi chuyển trang:', error);
            showToast('Không thể tải trang', 'error');
        }
    }

    updateActiveMenu(page) {
        // Xóa active class từ tất cả các links
        document.querySelectorAll('nav a, .sidebar a').forEach(link => {
            link.classList.remove('bg-blue-50', 'text-blue-600');
        });

        // Thêm active class cho link hiện tại
        const currentLink = document.querySelector(`[href="#${page}"]`);
        if (currentLink) {
            currentLink.classList.add('bg-blue-50', 'text-blue-600');
        }
    }

    updatePageTitle(page) {
        const titles = {
            dashboard: 'Bảng điều khiển',
            scores: 'Quản lý điểm',
            schedule: 'Lịch giảng dạy',
            students: 'Danh sách học sinh',
            attendance: 'Điểm danh',
            homework: 'Bài tập về nhà',
            reports: 'Báo cáo',
            messages: 'Tin nhắn',
            notifications: 'Thông báo',
            profile: 'Thông tin giáo viên'
        };

        const headerTitle = document.querySelector('header h1');
        if (headerTitle) {
            headerTitle.textContent = titles[page] || 'Bảng điều khiển';
        }
    }

    async loadPageContent(page) {
        try {
            // Xóa manager hiện tại nếu có
            if (this.managers[this.currentPage]) {
                // Hủy các charts nếu là dashboard
                if (this.currentPage === 'dashboard' && this.managers[this.currentPage].destroyCharts) {
                    this.managers[this.currentPage].destroyCharts();
                }
                this.managers[this.currentPage] = null;
            }

            const pageContent = document.getElementById('pageContent');
            if (!pageContent) return;

            // Load nội dung trang mới
            switch (page) {
                case 'dashboard':
                    this.managers.dashboard = new TeacherDashboard();
                    break;
                case 'attendance':
                    this.managers.attendance = new AttendanceManager();
                    this.managers.attendance.loadAttendanceInterface();
                    break;
                case 'homework':
                    this.managers.homework = new HomeworkManager();
                    this.managers.homework.loadHomeworkInterface();
                    break;
                case 'messages':
                    this.managers.messages = new MessageManager();
                    this.managers.messages.loadMessageInterface();
                    break;
                case 'scores':
                    await this.loadScoresInterface();
                    break;
                case 'schedule':
                    await this.loadScheduleInterface();
                    break;
                case 'students':
                    await this.loadStudentsInterface();
                    break;
                case 'reports':
                    await this.loadReportsInterface();
                    break;
                case 'notifications':
                    await this.loadNotificationsInterface();
                    break;
                case 'profile':
                    await this.loadProfileInterface();
                    break;
                default:
                    throw new Error('Trang không tồn tại');
            }
        } catch (error) {
            console.error(`Lỗi khi tải nội dung trang ${page}:`, error);
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                this.showErrorMessage(pageContent);
            }
        }
    }

    initializeUserDropdown() {
        const userMenuButton = document.getElementById('userMenuButton');
        const userDropdown = document.querySelector('.user-dropdown');
        let isDropdownOpen = false;

        // Xử lý click vào nút menu
        userMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            isDropdownOpen = !isDropdownOpen;
            
            if (isDropdownOpen) {
                userDropdown.classList.remove('hidden');
                userDropdown.classList.add('show');
                userDropdown.classList.remove('hide');
                userMenuButton.classList.add('active');
            } else {
                this.closeDropdown();
            }
        });

        // Xử lý click ra ngoài để đóng dropdown
        document.addEventListener('click', (e) => {
            if (!userDropdown.contains(e.target) && !userMenuButton.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Xử lý các item trong dropdown
        const dropdownItems = userDropdown.querySelectorAll('a, button');
        dropdownItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.id === 'logoutButton') {
                    this.handleLogout();
                }
                this.closeDropdown();
            });
        });

        // Cập nhật thông tin giáo viên trong dropdown
        const teacherData = JSON.parse(localStorage.getItem('teacherData'));
        if (teacherData) {
            const teacherName = document.querySelector('#userMenuButton .teacher-name');
            const teacherAvatar = document.querySelector('#userMenuButton img');
            
            if (teacherName) {
                teacherName.textContent = teacherData.name || 'Giáo viên';
            }
            
            if (teacherAvatar && teacherData.avatar) {
                teacherAvatar.src = teacherData.avatar;
            }
        }
    }

    initializeNotifications() {
        const notificationButton = document.querySelector('.notification-button');
        const notificationDropdown = document.querySelector('.notification-dropdown');

        if (notificationButton && notificationDropdown) {
            notificationButton.addEventListener('click', () => {
                notificationDropdown.classList.toggle('hidden');
                this.loadNotifications();
            });

            // Đóng dropdown khi click ra ngoài
            document.addEventListener('click', (e) => {
                if (!notificationButton.contains(e.target)) {
                    notificationDropdown.classList.add('hidden');
                }
            });
        }
    }

    async loadNotifications() {
        const dropdown = document.querySelector('.notification-dropdown');
        if (!dropdown) return;

        try {
            // Giả lập API call
            const notifications = [
                {
                    id: 1,
                    title: 'Bài tập mới',
                    message: 'Có 3 học sinh nộp bài tập môn Toán',
                    time: '5 phút trước',
                    type: 'homework'
                },
                {
                    id: 2,
                    title: 'Tin nhắn mới',
                    message: 'Nguyễn Văn A đã gửi tin nhắn cho bạn',
                    time: '10 phút trước',
                    type: 'message'
                },
                {
                    id: 3,
                    title: 'Nhắc nhở',
                    message: 'Sắp đến giờ dạy lớp 10A1',
                    time: '15 phút trước',
                    type: 'schedule'
                }
            ];

            dropdown.innerHTML = `
                <div class="p-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold">Thông báo</h3>
                </div>
                <div class="max-h-80 overflow-y-auto">
                    ${notifications.map(notification => `
                        <div class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                            <div class="flex items-start">
                                <div class="flex-shrink-0">
                                    <i class="fas ${this.getNotificationIcon(notification.type)} text-${this.getNotificationColor(notification.type)}-500"></i>
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm font-medium text-gray-900">${notification.title}</p>
                                    <p class="text-sm text-gray-500">${notification.message}</p>
                                    <p class="text-xs text-gray-400 mt-1">${notification.time}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="p-4 text-center border-t border-gray-200">
                    <a href="#notifications" class="text-sm text-blue-600 hover:text-blue-800">Xem tất cả thông báo</a>
                </div>
            `;
        } catch (error) {
            console.error('Lỗi khi tải thông báo:', error);
            dropdown.innerHTML = '<div class="p-4 text-red-500">Không thể tải thông báo</div>';
        }
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'homework': return 'fa-book';
            case 'message': return 'fa-envelope';
            case 'schedule': return 'fa-calendar';
            default: return 'fa-bell';
        }
    }

    getNotificationColor(type) {
        switch (type) {
            case 'homework': return 'blue';
            case 'message': return 'green';
            case 'schedule': return 'yellow';
            default: return 'gray';
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (this.loadedScripts.has(src)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;

            script.onload = () => {
                this.loadedScripts.add(src);
                resolve();
            };

            script.onerror = () => {
                reject(new Error(`Không thể tải script: ${src}`));
            };

            document.head.appendChild(script);
        });
    }

    async loadScoresInterface() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="col-span-3">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold">Quản lý điểm số</h2>
                        <div class="flex space-x-4">
                            <select id="classFilter" class="form-input w-48">
                                <option value="">Tất cả lớp</option>
                                <option value="10A1">Lớp 10A1</option>
                                <option value="10A2">Lớp 10A2</option>
                            </select>
                            <select id="subjectFilter" class="form-input w-48">
                                <option value="">Tất cả môn</option>
                                <option value="Toán">Toán</option>
                                <option value="Văn">Văn</option>
                                <option value="Anh">Anh</option>
                                <option value="Lý">Lý</option>
                                <option value="Hóa">Hóa</option>
                                <option value="Sinh">Sinh</option>
                            </select>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Học sinh
                                    </th>
                                    <th class="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Điểm miệng
                                        <button onclick="teacherNavigation.openAddScoreModal(null, 'Kiểm tra miệng')" class="ml-2 text-blue-600 hover:text-blue-800">
                                            <i class="fas fa-plus-circle"></i>
                                        </button>
                                    </th>
                                    <th class="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Điểm 15 phút
                                        <button onclick="teacherNavigation.openAddScoreModal(null, 'Kiểm tra 15 phút')" class="ml-2 text-blue-600 hover:text-blue-800">
                                            <i class="fas fa-plus-circle"></i>
                                        </button>
                                    </th>
                                    <th class="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Điểm 1 tiết
                                        <button onclick="teacherNavigation.openAddScoreModal(null, 'Kiểm tra 1 tiết')" class="ml-2 text-blue-600 hover:text-blue-800">
                                            <i class="fas fa-plus-circle"></i>
                                        </button>
                                    </th>
                                    <th class="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Điểm học kỳ
                                        <button onclick="teacherNavigation.openAddScoreModal(null, 'Kiểm tra học kỳ')" class="ml-2 text-blue-600 hover:text-blue-800">
                                            <i class="fas fa-plus-circle"></i>
                                        </button>
                                    </th>
                                    <th class="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Điểm TB
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200" id="scoresList">
                                <!-- Danh sách điểm sẽ được thêm vào đây -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Thêm event listeners cho bộ lọc
        document.getElementById('classFilter').addEventListener('change', () => this.filterScores());
        document.getElementById('subjectFilter').addEventListener('change', () => this.filterScores());

        // Load dữ liệu điểm
        await this.loadScoresData();
    }

    async loadScoresData() {
        const selectedClass = document.getElementById('classFilter')?.value;
        const selectedSubject = document.getElementById('subjectFilter')?.value;
        
        // Lấy danh sách học sinh và điểm
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const scores = JSON.parse(localStorage.getItem('scores')) || {};
        
        // Lọc học sinh theo lớp nếu có
        const filteredStudents = selectedClass 
            ? students.filter(student => student.class === selectedClass)
            : students;

        const scoresList = document.getElementById('scoresList');
        if (!scoresList) return;

        scoresList.innerHTML = filteredStudents.map(student => {
            const studentScores = scores[student.id] || {};
            const average = this.calculateAverageScore(studentScores);
            const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'Student')}&background=random`;
            const avatarUrl = student.avatar || defaultAvatar;

            return `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="h-10 w-10 flex-shrink-0">
                                <img class="h-10 w-10 rounded-full" 
                                    src="${avatarUrl}" 
                                    alt="${student.name || 'Student'}"
                                    onerror="this.src='${defaultAvatar}'">
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">
                                    ${student.name || 'N/A'}
                                </div>
                                <div class="text-sm text-gray-500">
                                    ${student.email || ''}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        ${this.renderScores(studentScores['Kiểm tra miệng'] || [])}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        ${this.renderScores(studentScores['Kiểm tra 15 phút'] || [])}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        ${this.renderScores(studentScores['Kiểm tra 1 tiết'] || [])}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        ${this.renderScores(studentScores['Kiểm tra học kỳ'] || [])}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            average === 'N/A' ? 'bg-gray-100 text-gray-800' :
                            parseFloat(average) >= 8 ? 'bg-green-100 text-green-800' :
                            parseFloat(average) >= 6.5 ? 'bg-blue-100 text-blue-800' :
                            parseFloat(average) >= 5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }">
                            ${average}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderScores(scores) {
        if (!scores || scores.length === 0) {
            return '<span class="text-gray-400">-</span>';
        }

        return scores.map(score => `
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getScoreClass(score)}">
                ${score.toFixed(1)}
            </span>
        `).join(' ');
    }

    calculateAverageScore(studentScores) {
        if (!studentScores || Object.keys(studentScores).length === 0) {
            return 'N/A';
        }

        let totalWeightedScore = 0;
        let totalWeight = 0;

        // Trọng số cho từng loại điểm
        const weights = {
            'Kiểm tra miệng': 1,
            'Kiểm tra 15 phút': 1,
            'Kiểm tra 1 tiết': 2,
            'Kiểm tra học kỳ': 3
        };

        Object.entries(studentScores).forEach(([type, scores]) => {
            if (Array.isArray(scores) && scores.length > 0) {
                const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                const weight = weights[type] || 1;
                totalWeightedScore += avgScore * weight;
                totalWeight += weight;
            }
        });

        return totalWeight > 0 
            ? (totalWeightedScore / totalWeight).toFixed(1) 
            : 'N/A';
    }

    getScoreClass(score) {
        if (score >= 8) return 'bg-green-100 text-green-800';
        if (score >= 6.5) return 'bg-blue-100 text-blue-800';
        if (score >= 5) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    }

    getScoreWeight(type) {
        switch (type) {
            case 'Kiểm tra miệng': return 1;
            case 'Kiểm tra 15 phút': return 1;
            case 'Kiểm tra 1 tiết': return 2;
            case 'Kiểm tra học kỳ': return 3;
            default: return 1;
        }
    }

    openAddScoreModal(studentId = null, scoreType = null) {
        const modalContent = `
            <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4">
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-6">
                            <h3 class="text-lg font-semibold">Thêm điểm mới</h3>
                            <button onclick="document.getElementById('modalContainer').classList.add('hidden')" 
                                class="text-gray-400 hover:text-gray-500">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="addScoreForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Học sinh</label>
                                <select id="studentSelect" class="form-input w-full" required>
                                    <option value="">Chọn học sinh</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
                                <select id="subjectSelect" class="form-input w-full" required>
                                    <option value="">Chọn môn học</option>
                                    <option value="Toán">Toán</option>
                                    <option value="Văn">Văn</option>
                                    <option value="Anh">Anh</option>
                                    <option value="Lý">Lý</option>
                                    <option value="Hóa">Hóa</option>
                                    <option value="Sinh">Sinh</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Loại điểm</label>
                                <select id="scoreTypeSelect" class="form-input w-full" required>
                                    <option value="">Chọn loại điểm</option>
                                    <option value="Kiểm tra miệng">Kiểm tra miệng</option>
                                    <option value="Kiểm tra 15 phút">Kiểm tra 15 phút</option>
                                    <option value="Kiểm tra 1 tiết">Kiểm tra 1 tiết</option>
                                    <option value="Kiểm tra học kỳ">Kiểm tra học kỳ</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Điểm số</label>
                                <input type="number" id="scoreInput" class="form-input w-full" min="0" max="10" step="0.1" required>
                            </div>
                            <div class="flex justify-end space-x-3 mt-6">
                                <button type="button" class="btn-secondary" onclick="document.getElementById('modalContainer').classList.add('hidden')">
                                    Hủy
                                </button>
                                <button type="submit" class="btn-primary">
                                    <i class="fas fa-save mr-2"></i>Lưu điểm
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = modalContent;
        modalContainer.classList.remove('hidden');

        // Populate student select
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const selectedClass = document.getElementById('classFilter')?.value;
        const filteredStudents = selectedClass ? 
            students.filter(student => student.class === selectedClass) : 
            students;

        const studentSelect = document.getElementById('studentSelect');
        filteredStudents.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = `${student.name} - ${student.class}`;
            studentSelect.appendChild(option);
        });

        // Set pre-selected values if provided
        if (studentId) {
            document.getElementById('studentSelect').value = studentId;
        }
        if (scoreType) {
            document.getElementById('scoreTypeSelect').value = scoreType;
        }

        // Add form submit handler
        document.getElementById('addScoreForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveScore();
            await this.loadScoresData(); // Tự động tải lại dữ liệu sau khi thêm điểm
        });
    }

    async saveScore() {
        const studentId = document.getElementById('studentSelect').value;
        const subject = document.getElementById('subjectSelect').value;
        const scoreType = document.getElementById('scoreTypeSelect').value;
        const scoreValue = parseFloat(document.getElementById('scoreInput').value);

        if (!studentId || !subject || !scoreType || isNaN(scoreValue)) {
            showToast('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }

        if (scoreValue < 0 || scoreValue > 10) {
            showToast('Điểm số phải từ 0 đến 10', 'error');
            return;
        }

        try {
            // Lấy điểm từ localStorage
            let scores = JSON.parse(localStorage.getItem('scores')) || {};
            
            // Khởi tạo cấu trúc điểm cho học sinh nếu chưa có
            if (!scores[studentId]) {
                scores[studentId] = {};
            }
            
            // Khởi tạo mảng điểm cho loại điểm nếu chưa có
            if (!scores[studentId][scoreType]) {
                scores[studentId][scoreType] = [];
            }
            
            // Thêm điểm mới vào mảng điểm tương ứng
            scores[studentId][scoreType].push(scoreValue);

            // Lưu vào localStorage
            localStorage.setItem('scores', JSON.stringify(scores));

            // Đóng modal
            document.getElementById('modalContainer').classList.add('hidden');
            
            showToast('Đã lưu điểm thành công', 'success');
            
            // Tự động tải lại dữ liệu
            await this.loadScoresData();
        } catch (error) {
            console.error('Lỗi khi lưu điểm:', error);
            showToast('Có lỗi xảy ra khi lưu điểm', 'error');
        }
    }

    async loadScheduleInterface() {
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;

        // Load lịch giảng dạy từ localStorage
        const schedule = JSON.parse(localStorage.getItem('teachingSchedule')) || [];

        pageContent.innerHTML = `
            <div class="col-span-3">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold">Lịch giảng dạy</h2>
                        <div class="flex space-x-4">
                            <select id="weekSelect" class="form-input">
                                <option value="current">Tuần này</option>
                                <option value="next">Tuần sau</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-7 gap-4 mb-6">
                        ${['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map(day => `
                            <div class="text-center font-semibold text-gray-600">${day}</div>
                        `).join('')}
                    </div>
                    <div class="grid grid-cols-7 gap-4">
                        ${schedule.map(day => `
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <div class="text-sm font-semibold text-gray-600 mb-2">${day.date}</div>
                                ${day.classes.map(cls => `
                                    <div class="bg-white p-3 rounded shadow-sm mb-2">
                                        <div class="font-semibold text-gray-800">${cls.className}</div>
                                        <div class="text-sm text-gray-600">Tiết ${cls.period}</div>
                                        <div class="text-sm text-gray-600">${cls.subject}</div>
                                    </div>
                                `).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Thêm event listener cho weekSelect
        const weekSelect = document.getElementById('weekSelect');
        if (weekSelect) {
            weekSelect.addEventListener('change', this.loadScheduleForWeek.bind(this));
        }
    }

    async loadScheduleForWeek(event) {
        const week = event.target.value;
        // Implement loading schedule for selected week
        console.log('Loading schedule for:', week);
    }

    async loadStudentsInterface() {
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;

        // Lấy dữ liệu từ localStorage
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const scores = JSON.parse(localStorage.getItem('scores')) || {};

        // Lấy danh sách lớp học
        const classes = [...new Set(students.map(student => student.class))].sort();

        pageContent.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">Quản lý học sinh</h2>
                    <div class="flex space-x-4">
                        <div class="relative">
                            <select id="classFilter" class="form-select">
                                <option value="">Tất cả lớp</option>
                                ${classes.map(cls => `<option value="${cls}">${cls}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mã học sinh
                                </th>
                                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thông tin
                                </th>
                                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lớp
                                </th>
                                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Điểm trung bình
                                </th>
                                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${students.map(student => {
                                const studentScores = scores[student.id] || {};
                                const averageScore = this.calculateAverageScore(studentScores);
                                
                                return `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${student.id}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <div class="h-10 w-10 flex-shrink-0">
                                                    <img class="h-10 w-10 rounded-full" 
                                                        src="${student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`}" 
                                                        alt="${student.name}">
                                                </div>
                                                <div class="ml-4">
                                                    <div class="text-sm font-medium text-gray-900">
                                                        ${student.name}
                                                    </div>
                                                    <div class="text-sm text-gray-500">
                                                        ${student.email || ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${student.class}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                averageScore === 'N/A' ? 'bg-gray-100 text-gray-800' :
                                                parseFloat(averageScore) >= 8 ? 'bg-green-100 text-green-800' :
                                                parseFloat(averageScore) >= 6.5 ? 'bg-blue-100 text-blue-800' :
                                                parseFloat(averageScore) >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }">
                                                ${averageScore}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button onclick="viewStudentDetails('${student.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button onclick="editStudent('${student.id}')" class="text-indigo-600 hover:text-indigo-900 mr-3">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="deleteStudent('${student.id}')" class="text-red-600 hover:text-red-900">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Thêm event listener cho bộ lọc
        const classFilter = document.getElementById('classFilter');
        if (classFilter) {
            classFilter.addEventListener('change', (e) => {
                this.filterStudentsByClass(e.target.value);
            });
        }
    }

    calculateAverageScore(studentScores) {
        if (!studentScores || Object.keys(studentScores).length === 0) {
            return 'N/A';
        }

        let totalWeightedScore = 0;
        let totalWeight = 0;

        // Trọng số cho từng loại điểm
        const weights = {
            'Kiểm tra miệng': 1,
            'Kiểm tra 15 phút': 1,
            'Kiểm tra 1 tiết': 2,
            'Kiểm tra học kỳ': 3
        };

        Object.entries(studentScores).forEach(([type, scores]) => {
            if (Array.isArray(scores) && scores.length > 0) {
                const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                const weight = weights[type] || 1;
                totalWeightedScore += avgScore * weight;
                totalWeight += weight;
            }
        });

        return totalWeight > 0 
            ? (totalWeightedScore / totalWeight).toFixed(1) 
            : 'N/A';
    }

    async loadReportsInterface() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="col-span-3">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-xl font-semibold">Báo cáo và thống kê</h2>
                        <div class="flex space-x-4">
                            <button class="btn-primary">
                                <i class="fas fa-download mr-2"></i>Xuất báo cáo
                            </button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-6">
                        <div class="chart-container">
                            <h3 class="text-lg font-semibold mb-4">Xu hướng điểm số</h3>
                            <canvas id="trendsChart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3 class="text-lg font-semibold mb-4">So sánh lớp</h3>
                            <canvas id="classComparisonChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async loadNotificationsInterface() {
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;

        pageContent.innerHTML = `
            <div class="col-span-3">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <h2 class="text-xl font-semibold mb-6">Thông báo</h2>
                    <div class="space-y-4" id="notificationsList">
                        <!-- Thông báo sẽ được thêm vào đây -->
                    </div>
                </div>
            </div>
        `;

        // Load và hiển thị thông báo
        await this.loadNotifications();
    }

    filterStudentsByClass(selectedClass) {
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const className = row.querySelector('td:nth-child(3)').textContent;
            const matchesClass = !selectedClass || className === selectedClass;
            row.style.display = matchesClass ? '' : 'none';
        });
    }

    async showErrorMessage(container) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="col-span-3">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="text-center text-red-500">
                        <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
                        <h2 class="text-xl font-semibold mb-2">Đã xảy ra lỗi</h2>
                        <p>Không thể tải nội dung trang. Vui lòng thử lại sau.</p>
                        <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Tải lại trang
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    viewStudentDetails(studentId) {
        const student = this.getStudentById(studentId);
        if (!student) return;

        const scores = JSON.parse(localStorage.getItem('scores')) || {};
        const studentScores = scores[student.id] || {};
        const averageScore = this.calculateAverageScore(studentScores);

        const modalContent = `
            <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 p-6">
                    <div class="flex justify-between items-start mb-6">
                        <div class="flex items-center">
                            <img class="h-16 w-16 rounded-full border-4 border-blue-100" 
                                src="${student.avatar}" 
                                alt="${student.name}">
                            <div class="ml-4">
                                <h3 class="text-2xl font-bold text-gray-900">${student.name}</h3>
                                <p class="text-sm text-gray-500">${student.email}</p>
                            </div>
                        </div>
                        <button onclick="document.getElementById('modalContainer').classList.add('hidden')" 
                            class="text-gray-400 hover:text-gray-500 transition-colors">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <div class="grid grid-cols-2 gap-6 mb-6">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <p class="text-sm text-gray-600 mb-1">Mã học sinh</p>
                            <p class="font-semibold text-gray-900">${student.id}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <p class="text-sm text-gray-600 mb-1">Lớp</p>
                            <p class="font-semibold text-gray-900">${student.class}</p>
                        </div>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <p class="text-sm text-gray-600 mb-1">Điểm trung bình</p>
                            <p class="font-semibold">
                                <span class="px-2 py-1 text-sm rounded-full ${
                                    averageScore === 'N/A' ? 'bg-gray-200 text-gray-800' :
                                    parseFloat(averageScore) >= 8 ? 'bg-green-100 text-green-800' :
                                    parseFloat(averageScore) >= 6.5 ? 'bg-blue-100 text-blue-800' :
                                    parseFloat(averageScore) >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }">${averageScore}</span>
                            </p>
                        </div>
                    </div>

                    <div class="border-t border-gray-200 pt-6">
                        <h4 class="text-lg font-semibold mb-4">Bảng điểm chi tiết</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${Object.entries(studentScores).map(([type, scores]) => `
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <p class="text-sm font-medium text-gray-600 mb-2">${type}</p>
                                    <div class="flex flex-wrap gap-2">
                                        ${scores.map(score => `
                                            <span class="px-2 py-1 text-sm rounded-full ${
                                                score >= 8 ? 'bg-green-100 text-green-800' :
                                                score >= 6.5 ? 'bg-blue-100 text-blue-800' :
                                                score >= 5 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }">${score.toFixed(1)}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = modalContent;
        modalContainer.classList.remove('hidden');
    }

    editStudent(studentId) {
        const student = this.getStudentById(studentId);
        if (!student) return;

        const modalContent = `
            <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-6">
                            <h3 class="text-2xl font-bold text-gray-900">Chỉnh sửa thông tin học sinh</h3>
                            <button onclick="document.getElementById('modalContainer').classList.add('hidden')" 
                                class="text-gray-400 hover:text-gray-500 transition-colors">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        <form id="editStudentForm" class="space-y-6">
                            <div class="flex items-center space-x-6 mb-6">
                                <img class="h-16 w-16 rounded-full border-4 border-blue-100" 
                                    src="${student.avatar}" 
                                    alt="${student.name}">
                                <div class="flex-1">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Họ và tên
                                    </label>
                                    <input type="text" name="name" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                                        value="${student.name}" required>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Mã học sinh
                                    </label>
                                    <input type="text" name="id" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50" 
                                        value="${student.id}" readonly>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Lớp
                                    </label>
                                    <select name="class" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                        <option value="12A1" ${student.class === '12A1' ? 'selected' : ''}>12A1</option>
                                        <option value="12A2" ${student.class === '12A2' ? 'selected' : ''}>12A2</option>
                                        <option value="11A1" ${student.class === '11A1' ? 'selected' : ''}>11A1</option>
                                        <option value="11A2" ${student.class === '11A2' ? 'selected' : ''}>11A2</option>
                                    </select>
                                </div>
                                <div class="col-span-2">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input type="email" name="email" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                                        value="${student.email}">
                                </div>
                            </div>

                            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                <button type="button" 
                                    onclick="document.getElementById('modalContainer').classList.add('hidden')"
                                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Hủy
                                </button>
                                <button type="submit"
                                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <i class="fas fa-save mr-2"></i>Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = modalContent;
        modalContainer.classList.remove('hidden');

        const form = document.getElementById('editStudentForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStudentChanges(studentId, form);
        });
    }

    deleteStudent(studentId) {
        const student = this.getStudentById(studentId);
        if (!student) return;

        const modalContent = `
            <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4 p-6">
                    <div class="flex justify-between items-start mb-6">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                            </div>
                            <div class="ml-3">
                                <h3 class="text-lg font-medium text-gray-900">
                                    Xác nhận xóa học sinh
                                </h3>
                            </div>
                        </div>
                        <button onclick="document.getElementById('modalContainer').classList.add('hidden')" 
                            class="text-gray-400 hover:text-gray-500 transition-colors">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <div class="mt-2">
                        <p class="text-sm text-gray-500">
                            Bạn có chắc chắn muốn xóa học sinh <span class="font-medium text-gray-900">${student.name}</span>? 
                            Hành động này không thể hoàn tác.
                        </p>
                    </div>

                    <div class="flex justify-end space-x-3 mt-6">
                        <button type="button" 
                            onclick="document.getElementById('modalContainer').classList.add('hidden')"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Hủy
                        </button>
                        <button type="button"
                            onclick="confirmDeleteStudent('${student.id}')"
                            class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                            <i class="fas fa-trash mr-2"></i>Xóa học sinh
                        </button>
                    </div>
                </div>
            </div>
        `;

        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = modalContent;
        modalContainer.classList.remove('hidden');
    }

    confirmDeleteStudent(studentId) {
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const updatedStudents = students.filter(s => s.id !== studentId);
        localStorage.setItem('students', JSON.stringify(updatedStudents));
        
        // Xóa điểm của học sinh
        const scores = JSON.parse(localStorage.getItem('scores')) || {};
        delete scores[studentId];
        localStorage.setItem('scores', JSON.stringify(scores));

        document.getElementById('modalContainer').classList.add('hidden');
        this.loadStudentsInterface();
        showToast('Đã xóa học sinh thành công', 'success');
    }

    getStudentById(studentId) {
        const students = JSON.parse(localStorage.getItem('students')) || [];
        return students.find(s => s.id === studentId);
    }

    getStudentScores(studentId) {
        const scores = JSON.parse(localStorage.getItem('scores')) || {};
        const studentScores = scores[studentId] || [];
        
        if (studentScores.length === 0) {
            return '<p class="text-gray-500">Chưa có điểm</p>';
        }

        return studentScores.map((score, index) => `
            <div class="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span>Điểm ${index + 1}</span>
                <span class="font-semibold">${score}</span>
            </div>
        `).join('');
    }

    saveStudentChanges(studentId, form) {
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const studentIndex = students.findIndex(s => s.id === studentId);
        
        if (studentIndex !== -1) {
            students[studentIndex] = {
                ...students[studentIndex],
                name: form.elements[0].value,
                class: form.elements[1].value,
                email: form.elements[2].value
            };
            
            localStorage.setItem('students', JSON.stringify(students));
            this.loadStudentsInterface();
            document.getElementById('modalContainer').classList.add('hidden');
            showToast('Đã cập nhật thông tin học sinh', 'success');
        }
    }

    async loadProfileInterface() {
        const pageContent = document.getElementById('pageContent');
        const teacher = JSON.parse(localStorage.getItem('currentTeacher'));

        if (!pageContent) return;

        pageContent.innerHTML = `
            <div class="col-span-3">
                <div class="bg-white p-6 rounded-lg shadow-sm">
                    <div class="flex items-center space-x-6 mb-6">
                        <img class="h-24 w-24 rounded-full border-4 border-blue-500" 
                             src="https://ui-avatars.com/api/?name=${encodeURIComponent(teacher?.name || 'Teacher')}&background=0D8ABC&color=fff" 
                             alt="Profile">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800">${teacher?.name || 'Giáo viên'}</h2>
                            <p class="text-gray-600">${teacher?.subject || 'Môn học chưa được thiết lập'}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold">Thông tin cá nhân</h3>
                            <div class="space-y-2">
                                <div class="flex items-center">
                                    <span class="w-32 text-gray-600">Email:</span>
                                    <span>${teacher?.email || 'Chưa thiết lập'}</span>
                                </div>
                                <div class="flex items-center">
                                    <span class="w-32 text-gray-600">Số điện thoại:</span>
                                    <span>${teacher?.phone || 'Chưa thiết lập'}</span>
                                </div>
                                <div class="flex items-center">
                                    <span class="w-32 text-gray-600">Địa chỉ:</span>
                                    <span>${teacher?.address || 'Chưa thiết lập'}</span>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold">Thống kê giảng dạy</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="bg-blue-50 p-4 rounded-lg">
                                    <h4 class="text-sm text-blue-600 mb-1">Số lớp phụ trách</h4>
                                    <p class="text-2xl font-bold text-blue-700">5</p>
                                </div>
                                <div class="bg-green-50 p-4 rounded-lg">
                                    <h4 class="text-sm text-green-600 mb-1">Tổng số học sinh</h4>
                                    <p class="text-2xl font-bold text-green-700">150</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6">
                        <button class="btn-primary" onclick="editProfile()">
                            <i class="fas fa-edit mr-2"></i>Chỉnh sửa thông tin
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    closeDropdown() {
        const userDropdown = document.querySelector('.user-dropdown');
        if (userDropdown) {
            userDropdown.classList.add('hidden');
            userDropdown.classList.remove('show', 'hide');
        }
        const userMenuButton = document.getElementById('userMenuButton');
        if (userMenuButton) {
            userMenuButton.classList.remove('active');
        }
    }

    handleLogout() {
        localStorage.removeItem('teacherData');
        window.location.href = 'login.html';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            // Thêm animation fade-out
            modal.classList.add('fade-out');
            // Đợi animation hoàn thành rồi mới ẩn modal
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('fade-out');
            }, 300);
        }
    }

    async openModal(modalId, content) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.innerHTML = content;
            modal.classList.remove('hidden');
            // Thêm animation fade-in
            modal.classList.add('fade-in');
            setTimeout(() => {
                modal.classList.remove('fade-in');
            }, 300);
        }
    }
}

// Khởi tạo navigation khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo dữ liệu giáo viên mẫu nếu chưa có
    if (!localStorage.getItem('currentTeacher')) {
        const sampleTeacher = {
            name: 'Nguyễn Văn Giáo',
            subject: 'Toán học',
            email: 'giao.nguyen@example.com',
            phone: '0123456789',
            address: 'Hà Nội, Việt Nam'
        };
        localStorage.setItem('currentTeacher', JSON.stringify(sampleTeacher));
    }

    window.teacherNavigation = new TeacherNavigation();
    
    // Thêm các hàm xử lý sự kiện vào window object
    window.viewStudentDetails = (studentId) => {
        window.teacherNavigation.viewStudentDetails(studentId);
    };
    
    window.editStudent = (studentId) => {
        window.teacherNavigation.editStudent(studentId);
    };
    
    window.deleteStudent = (studentId) => {
        window.teacherNavigation.deleteStudent(studentId);
    };

    window.editProfile = () => {
        const modalContainer = document.getElementById('modalContainer');
        const teacher = JSON.parse(localStorage.getItem('currentTeacher')) || {};
        
        if (modalContainer) {
            modalContainer.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-2xl w-full">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">Chỉnh sửa thông tin cá nhân</h3>
                        <button onclick="document.getElementById('modalContainer').classList.add('hidden')" 
                            class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="editProfileForm" class="space-y-4">
                        <div>
                            <label class="form-label">Họ và tên</label>
                            <input type="text" name="name" class="form-input w-full" 
                                value="${teacher.name || ''}" required>
                        </div>
                        <div>
                            <label class="form-label">Môn học</label>
                            <input type="text" name="subject" class="form-input w-full" 
                                value="${teacher.subject || ''}" required>
                        </div>
                        <div>
                            <label class="form-label">Email</label>
                            <input type="email" name="email" class="form-input w-full" 
                                value="${teacher.email || ''}" required>
                        </div>
                        <div>
                            <label class="form-label">Số điện thoại</label>
                            <input type="tel" name="phone" class="form-input w-full" 
                                value="${teacher.phone || ''}">
                        </div>
                        <div>
                            <label class="form-label">Địa chỉ</label>
                            <textarea name="address" class="form-input w-full" 
                                rows="3">${teacher.address || ''}</textarea>
                        </div>
                        <div class="flex justify-end gap-4">
                            <button type="button" 
                                onclick="document.getElementById('modalContainer').classList.add('hidden')" 
                                class="btn-secondary">
                                Hủy
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save mr-2"></i>Lưu thay đổi
                            </button>
                        </div>
                    </form>
                </div>
            `;
            modalContainer.classList.remove('hidden');

            const form = document.getElementById('editProfileForm');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const updatedTeacher = {
                    ...teacher,
                    name: formData.get('name'),
                    subject: formData.get('subject'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    address: formData.get('address')
                };
                localStorage.setItem('currentTeacher', JSON.stringify(updatedTeacher));
                window.teacherNavigation.loadProfileInterface();
                modalContainer.classList.add('hidden');
                showToast('Đã cập nhật thông tin cá nhân', 'success');
            });
        }
    };
}); 