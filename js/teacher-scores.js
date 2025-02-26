class TeacherScores {
    constructor() {
        this.scores = {};
        this.students = [];
        this.currentClass = '';
        this.currentSemester = '';
        this.editingScoreId = null;
    }

    init() {
        this.loadInitialData();
        this.setupEventListeners();
    }

    loadInitialData() {
        const savedScores = localStorage.getItem('scores');
        this.scores = savedScores ? JSON.parse(savedScores) : {};
        
        const savedStudents = localStorage.getItem('students');
        this.students = savedStudents ? JSON.parse(savedStudents) : [];
        
        this.loadScoreTable();
    }

    setupEventListeners() {
        const addScoreBtn = document.getElementById('addScoreBtn');
        if (addScoreBtn) {
            addScoreBtn.addEventListener('click', () => this.showAddScoreForm());
        }

        const classSelect = document.getElementById('classSelect');
        const semesterSelect = document.getElementById('semesterSelect');

        if (classSelect) {
            classSelect.addEventListener('change', () => {
                this.currentClass = classSelect.value;
                this.loadScoreTable();
            });
        }

        if (semesterSelect) {
            semesterSelect.addEventListener('change', () => {
                this.currentSemester = semesterSelect.value;
                this.loadScoreTable();
            });
        }
    }

    showConfirmPopup(title, message, onConfirm) {
        const popupHtml = `
            <div id="confirmPopup" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 modal-animation">
                    <h3 class="text-xl font-semibold mb-4">${title}</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <div class="flex justify-end space-x-4">
                        <button class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onclick="teacherScores.closeConfirmPopup()">
                            Hủy
                        </button>
                        <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onclick="teacherScores.handleConfirm()">
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', popupHtml);
        this.currentConfirmCallback = onConfirm;
    }

    handleConfirm() {
        if (this.currentConfirmCallback) {
            this.currentConfirmCallback();
        }
        this.closeConfirmPopup();
    }

    closeConfirmPopup() {
        const popup = document.getElementById('confirmPopup');
        if (popup) {
            popup.remove();
        }
        this.currentConfirmCallback = null;
    }

    showAddScoreForm() {
        const modalHtml = `
            <div id="scoreModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">Thêm điểm mới</h3>
                        <button onclick="teacherScores.closeModal()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="scoreForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Học sinh</label>
                            <select id="studentSelect" required class="w-full p-2 border rounded">
                                <option value="">Chọn học sinh</option>
                                ${this.students.map(student => `
                                    <option value="${student.id}">${student.name} - ${student.class}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
                            <select id="subjectSelect" required class="w-full p-2 border rounded">
                                <option value="">Chọn môn học</option>
                                <option value="Toán">Toán</option>
                                <option value="Văn">Văn</option>
                                <option value="Anh">Tiếng Anh</option>
                                <option value="Lý">Vật Lý</option>
                                <option value="Hóa">Hóa Học</option>
                                <option value="Sinh">Sinh Học</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Loại điểm</label>
                            <select id="scoreType" required class="w-full p-2 border rounded">
                                <option value="">Chọn loại điểm</option>
                                <option value="Kiểm tra miệng">Kiểm tra miệng</option>
                                <option value="Kiểm tra 15 phút">Kiểm tra 15 phút</option>
                                <option value="Kiểm tra 1 tiết">Kiểm tra 1 tiết</option>
                                <option value="Kiểm tra học kỳ">Kiểm tra học kỳ</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Điểm số</label>
                            <input type="number" id="scoreValue" required min="0" max="10" step="0.1" 
                                class="w-full p-2 border rounded">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ngày nhập điểm</label>
                            <input type="date" id="scoreDate" required class="w-full p-2 border rounded"
                                value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="flex justify-end space-x-3 mt-6">
                            <button type="button" onclick="teacherScores.closeModal()"
                                class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                                Hủy
                            </button>
                            <button type="submit"
                                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                Lưu điểm
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Thêm event listener cho form
        document.getElementById('scoreForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveScore();
        });
    }

    saveScore() {
        const studentId = document.getElementById('studentSelect').value;
        const subject = document.getElementById('subjectSelect').value;
        const scoreType = document.getElementById('scoreType').value;
        const scoreValue = parseFloat(document.getElementById('scoreValue').value);
        const date = document.getElementById('scoreDate').value;
        
        if (!this.validateScoreData({ studentId, subject, scoreType, scoreValue, date })) {
            return;
        }
        
        try {
            // Khởi tạo cấu trúc điểm cho học sinh nếu chưa có
            if (!this.scores[studentId]) {
                this.scores[studentId] = {};
            }

            // Khởi tạo mảng điểm cho loại điểm nếu chưa có
            const scoreTypeKey = this.getScoreTypeName(scoreType);
            if (!this.scores[studentId][scoreTypeKey]) {
                this.scores[studentId][scoreTypeKey] = [];
            }

            // Thêm điểm mới vào mảng
            this.scores[studentId][scoreTypeKey].push(scoreValue);
            
            // Lưu vào localStorage
            localStorage.setItem('scores', JSON.stringify(this.scores));
            
            // Cập nhật giao diện
            this.loadScoreTable();
            
            // Đóng modal và hiển thị thông báo
            this.closeModal();
            this.showToast('Đã lưu điểm thành công');
        } catch (error) {
            console.error('Lỗi khi lưu điểm:', error);
            this.showToast('Có lỗi xảy ra khi lưu điểm', 'error');
        }
    }

    getCurrentSemester() {
        const now = new Date();
        const month = now.getMonth() + 1; // getMonth() trả về 0-11
        return month >= 8 || month <= 1 ? '1' : '2';
    }

    deleteScore(studentId, scoreType, scoreIndex) {
        this.showConfirmPopup(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa điểm này không?',
            () => {
                try {
                    // Lấy điểm của học sinh
                    const studentScores = this.scores[studentId];
                    if (studentScores && studentScores[scoreType]) {
                        // Xóa điểm tại vị trí index
                        studentScores[scoreType].splice(scoreIndex, 1);
                        
                        // Nếu không còn điểm nào trong loại điểm này, xóa luôn key
                        if (studentScores[scoreType].length === 0) {
                            delete studentScores[scoreType];
                        }
                        
                        // Nếu học sinh không còn điểm nào, xóa luôn học sinh khỏi scores
                        if (Object.keys(studentScores).length === 0) {
                            delete this.scores[studentId];
                        }
                        
                        // Lưu vào localStorage
                        localStorage.setItem('scores', JSON.stringify(this.scores));
                        
                        // Cập nhật giao diện
                        this.loadScoreTable();
                        this.showToast('Đã xóa điểm thành công');
                    }
                } catch (error) {
                    console.error('Lỗi khi xóa điểm:', error);
                    this.showToast('Có lỗi xảy ra khi xóa điểm', 'error');
                }
            }
        );
    }

    editScore(studentId, scoreType, scoreIndex) {
        try {
            const studentScores = this.scores[studentId];
            if (studentScores && studentScores[scoreType]) {
                const score = studentScores[scoreType][scoreIndex];
                const student = this.getStudentById(studentId);
                
                if (!student) {
                    this.showToast('Không tìm thấy thông tin học sinh', 'error');
                    return;
                }

                const modalHtml = `
                    <div id="editScoreModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-xl font-semibold">Sửa điểm</h3>
                                <button onclick="document.getElementById('editScoreModal').remove()" class="text-gray-500 hover:text-gray-700">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                            <div class="mb-4">
                                <p class="text-sm text-gray-600">Học sinh: <span class="font-medium">${student.name}</span></p>
                                <p class="text-sm text-gray-600">Lớp: <span class="font-medium">${student.class}</span></p>
                                <p class="text-sm text-gray-600">Loại điểm: <span class="font-medium">${scoreType}</span></p>
                            </div>
                            <form id="editScoreForm" class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Điểm số mới</label>
                                    <input type="number" id="newScore" required min="0" max="10" step="0.1" 
                                        class="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                                        value="${score}">
                                </div>
                                <div class="flex justify-end space-x-3">
                                    <button type="button" 
                                        onclick="document.getElementById('editScoreModal').remove()"
                                        class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                                        Hủy
                                    </button>
                                    <button type="submit"
                                        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;

                document.body.insertAdjacentHTML('beforeend', modalHtml);

                document.getElementById('editScoreForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const newScore = parseFloat(document.getElementById('newScore').value);
                    
                    if (isNaN(newScore) || newScore < 0 || newScore > 10) {
                        this.showToast('Điểm số phải từ 0 đến 10', 'error');
                        return;
                    }

                    // Cập nhật điểm
                    studentScores[scoreType][scoreIndex] = newScore;
                    localStorage.setItem('scores', JSON.stringify(this.scores));
                    
                    // Cập nhật giao diện
                    this.loadScoreTable();
                    document.getElementById('editScoreModal').remove();
                    this.showToast('Đã cập nhật điểm thành công');
                });
            }
        } catch (error) {
            console.error('Lỗi khi sửa điểm:', error);
            this.showToast('Có lỗi xảy ra khi sửa điểm', 'error');
        }
    }

    loadScoreTable() {
        let filteredStudents = [...this.students];
        
        if (this.currentClass) {
            filteredStudents = filteredStudents.filter(student => student.class === this.currentClass);
        }

        const scoreTable = document.querySelector('.score-table');
        if (!scoreTable) return;

        // Thêm nút sửa và xóa vào phần header
        const headerActions = document.querySelector('.score-header-actions');
        if (!headerActions) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'score-header-actions flex items-center justify-between mb-4';
            actionsDiv.innerHTML = `
                <div class="flex items-center space-x-2">
                    <button onclick="teacherScores.editScoresByType('Kiểm tra miệng')" 
                        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center space-x-2">
                        <i class="fas fa-edit"></i>
                        <span>Sửa điểm</span>
                    </button>
                    <button onclick="teacherScores.deleteScoresByType('Kiểm tra miệng')" 
                        class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center space-x-2">
                        <i class="fas fa-trash"></i>
                        <span>Xóa điểm</span>
                    </button>
                </div>
            `;
            scoreTable.insertAdjacentElement('beforebegin', actionsDiv);
        }

        const tableBody = document.querySelector('.score-table tbody');
        if (!tableBody) return;

        if (filteredStudents.length === 0) {
            tableBody.innerHTML = `
                <tr class="fade-in">
                    <td colspan="7" class="text-center py-4 text-gray-500">
                        Chưa có dữ liệu học sinh
                    </td>
                </tr>
            `;
            return;
        }

        // Cập nhật header của bảng
        const tableHeader = document.querySelector('.score-table thead');
        if (tableHeader) {
            tableHeader.innerHTML = `
                <tr>
                    <th class="px-4 py-2">Học sinh</th>
                    <th class="px-4 py-2">Kiểm tra miệng</th>
                    <th class="px-4 py-2">Kiểm tra 15 phút</th>
                    <th class="px-4 py-2">Kiểm tra 1 tiết</th>
                    <th class="px-4 py-2">Kiểm tra học kỳ</th>
                    <th class="px-4 py-2">Điểm TB</th>
                </tr>
            `;
        }

        tableBody.innerHTML = filteredStudents.map(student => {
            const studentScores = this.scores[student.id] || {};
            const averageScore = this.calculateAverageScore(studentScores);

            // Hàm tạo cột điểm
            const renderScoreColumn = (scoreType) => {
                const scores = studentScores[scoreType] || [];
                return `
                    <td class="px-4 py-2">
                        <div class="flex flex-wrap gap-2">
                            ${scores.map((score, index) => `
                                <span class="inline-flex items-center px-2 py-1 rounded text-sm font-medium ${this.getScoreClass(score)}">
                                    ${score.toFixed(1)}
                                </span>
                            `).join('')}
                        </div>
                    </td>
                `;
            };

            return `
                <tr class="fade-in hover:bg-gray-50">
                    <td class="px-4 py-2">
                        <div class="flex items-center">
                            <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium mr-3">
                                ${student.name ? student.name.charAt(0) : 'N'}
                            </div>
                            <div>
                                <div class="font-medium">${student.name || 'N/A'}</div>
                                <div class="text-sm text-gray-500">${student.class || 'N/A'}</div>
                            </div>
                        </div>
                    </td>
                    ${renderScoreColumn('Kiểm tra miệng')}
                    ${renderScoreColumn('Kiểm tra 15 phút')}
                    ${renderScoreColumn('Kiểm tra 1 tiết')}
                    ${renderScoreColumn('Kiểm tra học kỳ')}
                    <td class="px-4 py-2">
                        <span class="px-2 py-1 inline-flex text-sm font-semibold rounded ${
                            averageScore === 'N/A' ? 'bg-gray-100 text-gray-800' :
                            parseFloat(averageScore) >= 8 ? 'bg-green-100 text-green-800' :
                            parseFloat(averageScore) >= 6.5 ? 'bg-blue-100 text-blue-800' :
                            parseFloat(averageScore) >= 5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }">
                            ${averageScore}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

        this.updateScoreStatistics();
    }

    getScoreTypeName(type) {
        return type;
    }

    closeModal() {
        const modal = document.getElementById('scoreModal');
        if (modal) {
            modal.classList.add('fade-out');
            setTimeout(() => modal.remove(), 300);
        }
    }

    validateScoreData(data) {
        const validations = {
            studentId: 'Vui lòng chọn học sinh',
            subject: 'Vui lòng chọn môn học',
            type: 'Vui lòng chọn loại điểm',
            score: 'Điểm số phải từ 0 đến 10',
            date: 'Vui lòng chọn ngày nhập điểm'
        };

        for (const [field, message] of Object.entries(validations)) {
            if (!data[field] || (field === 'score' && (data[field] < 0 || data[field] > 10))) {
                this.showToast(message, 'error');
                return false;
            }
        }
        return true;
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-4 py-2 rounded-lg shadow-lg z-50 toast-notification`;
        toast.innerHTML = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    getStudentById(studentId) {
        return this.students.find(s => s.id === parseInt(studentId)) || null;
    }

    updateScoreStatistics() {
        const averageScoreElement = document.getElementById('averageScore');
        const highestScoreElement = document.getElementById('highestScore');
        const lowestScoreElement = document.getElementById('lowestScore');
        const passRateElement = document.getElementById('passRate');
        const totalScoresElement = document.getElementById('totalScores');

        // Tính toán thống kê từ tất cả điểm số
        let allScores = [];
        Object.values(this.scores).forEach(studentScores => {
            Object.values(studentScores).forEach(scoreArray => {
                allScores = allScores.concat(scoreArray.map(score => parseFloat(score)));
            });
        });

        if (allScores.length > 0) {
            // Điểm trung bình
            const average = allScores.reduce((a, b) => a + b, 0) / allScores.length;
            if (averageScoreElement) {
                averageScoreElement.textContent = average.toFixed(1);
            }

            // Điểm cao nhất
            const highest = Math.max(...allScores);
            if (highestScoreElement) {
                highestScoreElement.textContent = highest.toFixed(1);
            }

            // Điểm thấp nhất
            const lowest = Math.min(...allScores);
            if (lowestScoreElement) {
                lowestScoreElement.textContent = lowest.toFixed(1);
            }

            // Tỷ lệ đạt (điểm >= 5.0)
            const passCount = allScores.filter(score => score >= 5.0).length;
            const passRate = (passCount / allScores.length) * 100;
            if (passRateElement) {
                passRateElement.textContent = passRate.toFixed(1) + '%';
            }

            // Tổng số điểm
            if (totalScoresElement) {
                totalScoresElement.textContent = allScores.length;
            }
        } else {
            // Nếu không có điểm nào
            if (averageScoreElement) averageScoreElement.textContent = '0.0';
            if (highestScoreElement) highestScoreElement.textContent = '0.0';
            if (lowestScoreElement) lowestScoreElement.textContent = '0.0';
            if (passRateElement) passRateElement.textContent = '0%';
            if (totalScoresElement) totalScoresElement.textContent = '0';
        }
    }

    calculateAverageScore(scores) {
        if (Object.keys(scores).length === 0) {
            return 'N/A';
        }
        const total = Object.values(scores).reduce((sum, scoreArray) => sum + scoreArray.reduce((sum, score) => sum + parseFloat(score), 0), 0);
        const count = Object.values(scores).reduce((sum, scoreArray) => sum + scoreArray.length, 0);
        return count > 0 ? (total / count).toFixed(1) : 'N/A';
    }

    getScoreClass(score) {
        if (parseFloat(score) >= 8) {
            return 'bg-green-100 text-green-800';
        } else if (parseFloat(score) >= 6.5) {
            return 'bg-blue-100 text-blue-800';
        } else if (parseFloat(score) >= 5) {
            return 'bg-yellow-100 text-yellow-800';
        } else {
            return 'bg-red-100 text-red-800';
        }
    }

    editScoresByType(scoreType) {
        const students = this.currentClass ? 
            this.students.filter(s => s.class === this.currentClass) : 
            this.students;

        const studentsWithScores = students.filter(student => 
            this.scores[student.id] && 
            this.scores[student.id][scoreType] && 
            this.scores[student.id][scoreType].length > 0
        );

        if (studentsWithScores.length === 0) {
            this.showToast(`Không có điểm ${scoreType} nào để sửa`, 'error');
            return;
        }

        const modalHtml = `
            <div id="editScoresByTypeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">Sửa điểm ${scoreType}</h3>
                        <button onclick="document.getElementById('editScoresByTypeModal').remove()" 
                            class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="max-h-[70vh] overflow-y-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Học sinh
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lớp
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Điểm số
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${studentsWithScores.map(student => `
                                    ${(this.scores[student.id][scoreType] || []).map((score, index) => `
                                        <tr>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="text-sm font-medium text-gray-900">${student.name}</div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <div class="text-sm text-gray-500">${student.class}</div>
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap">
                                                <input type="number" 
                                                    class="score-input border rounded px-2 py-1 w-20" 
                                                    value="${score}"
                                                    min="0"
                                                    max="10"
                                                    step="0.1"
                                                    data-student-id="${student.id}"
                                                    data-score-index="${index}">
                                            </td>
                                        </tr>
                                    `).join('')}
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="flex justify-end space-x-3 mt-6">
                        <button onclick="document.getElementById('editScoresByTypeModal').remove()"
                            class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                            Hủy
                        </button>
                        <button onclick="teacherScores.saveScoresByType('${scoreType}')"
                            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Lưu thay đổi
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    saveScoresByType(scoreType) {
        const modal = document.getElementById('editScoresByTypeModal');
        const inputs = modal.querySelectorAll('.score-input');
        let hasChanges = false;

        inputs.forEach(input => {
            const studentId = input.dataset.studentId;
            const scoreIndex = parseInt(input.dataset.scoreIndex);
            const newScore = parseFloat(input.value);

            if (isNaN(newScore) || newScore < 0 || newScore > 10) {
                this.showToast('Điểm số phải từ 0 đến 10', 'error');
                return;
            }

            if (this.scores[studentId][scoreType][scoreIndex] !== newScore) {
                this.scores[studentId][scoreType][scoreIndex] = newScore;
                hasChanges = true;
            }
        });

        if (hasChanges) {
            localStorage.setItem('scores', JSON.stringify(this.scores));
            this.loadScoreTable();
            this.showToast('Đã cập nhật điểm thành công');
        }

        modal.remove();
    }

    deleteScoresByType(scoreType) {
        const students = this.currentClass ? 
            this.students.filter(s => s.class === this.currentClass) : 
            this.students;

        const studentsWithScores = students.filter(student => 
            this.scores[student.id] && 
            this.scores[student.id][scoreType] && 
            this.scores[student.id][scoreType].length > 0
        );

        if (studentsWithScores.length === 0) {
            this.showToast(`Không có điểm ${scoreType} nào để xóa`, 'error');
            return;
        }

        this.showConfirmPopup(
            'Xác nhận xóa điểm',
            `Bạn có chắc chắn muốn xóa tất cả điểm ${scoreType} không?`,
            () => {
                let hasChanges = false;

                studentsWithScores.forEach(student => {
                    if (this.scores[student.id] && this.scores[student.id][scoreType]) {
                        delete this.scores[student.id][scoreType];
                        hasChanges = true;

                        // Nếu học sinh không còn điểm nào, xóa luôn học sinh khỏi scores
                        if (Object.keys(this.scores[student.id]).length === 0) {
                            delete this.scores[student.id];
                        }
                    }
                });

                if (hasChanges) {
                    localStorage.setItem('scores', JSON.stringify(this.scores));
                    this.loadScoreTable();
                    this.showToast(`Đã xóa tất cả điểm ${scoreType} thành công`);
                }
            }
        );
    }
}

// Khởi tạo khi trang được tải
let teacherScores;
document.addEventListener('DOMContentLoaded', () => {
    teacherScores = new TeacherScores();
    window.teacherScores = teacherScores;
    teacherScores.init();
}); 