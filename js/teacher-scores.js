class TeacherScores {
    constructor() {
        this.scores = [];
        this.students = [
            { id: 1, name: 'Nguyễn Văn A', class: '10A1' },
            { id: 2, name: 'Trần Thị B', class: '10A1' },
            { id: 3, name: 'Lê Văn C', class: '10A2' }
        ];
        this.currentClass = '';
        this.currentSemester = '';
        this.editingScoreId = null;
    }

    init() {
        this.loadInitialData();
        this.setupEventListeners();
    }

    loadInitialData() {
        // Tải điểm từ localStorage
        const savedScores = localStorage.getItem('scores');
        this.scores = savedScores ? JSON.parse(savedScores) : [];
        
        // Tải danh sách học sinh từ localStorage hoặc sử dụng mẫu
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
            this.students = JSON.parse(savedStudents);
        } else {
            // Lưu danh sách học sinh mẫu vào localStorage
            localStorage.setItem('students', JSON.stringify(this.students));
        }
        
        this.loadClassList();
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

    showAddScoreForm(scoreToEdit = null) {
        const modalHtml = `
            <div id="scoreModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 modal-animation">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">${scoreToEdit ? 'Sửa điểm' : 'Thêm điểm mới'}</h3>
                        <button class="text-gray-500 hover:text-gray-700" onclick="teacherScores.closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="scoreForm" class="space-y-4">
                        <input type="hidden" id="scoreId" value="${scoreToEdit?.id || ''}">
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Học sinh</label>
                            <select id="studentSelect" required class="w-full p-2 border rounded input-animation">
                                <option value="">Chọn học sinh</option>
                                ${this.students.map(s => 
                                    `<option value="${s.id}" ${scoreToEdit && scoreToEdit.studentId == s.id ? 'selected' : ''}>
                                        ${s.name} - ${s.class}
                                    </option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
                            <select id="subjectSelect" required class="w-full p-2 border rounded input-animation">
                                <option value="">Chọn môn học</option>
                                <option value="Toán" ${scoreToEdit?.subject === 'Toán' ? 'selected' : ''}>Toán</option>
                                <option value="Văn" ${scoreToEdit?.subject === 'Văn' ? 'selected' : ''}>Văn</option>
                                <option value="Anh" ${scoreToEdit?.subject === 'Anh' ? 'selected' : ''}>Tiếng Anh</option>
                                <option value="Lý" ${scoreToEdit?.subject === 'Lý' ? 'selected' : ''}>Vật Lý</option>
                                <option value="Hóa" ${scoreToEdit?.subject === 'Hóa' ? 'selected' : ''}>Hóa Học</option>
                                <option value="Sinh" ${scoreToEdit?.subject === 'Sinh' ? 'selected' : ''}>Sinh Học</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Loại điểm</label>
                            <select id="scoreType" required class="w-full p-2 border rounded input-animation">
                                <option value="">Chọn loại điểm</option>
                                <option value="mieng" ${scoreToEdit?.type === 'mieng' ? 'selected' : ''}>Điểm miệng</option>
                                <option value="15p" ${scoreToEdit?.type === '15p' ? 'selected' : ''}>Điểm 15 phút</option>
                                <option value="1t" ${scoreToEdit?.type === '1t' ? 'selected' : ''}>Điểm 1 tiết</option>
                                <option value="hk" ${scoreToEdit?.type === 'hk' ? 'selected' : ''}>Điểm học kỳ</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Điểm số</label>
                            <input type="number" id="scoreValue" required min="0" max="10" step="0.1" 
                                class="w-full p-2 border rounded score-input-animation"
                                value="${scoreToEdit?.score || ''}">
                        </div>
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ngày nhập điểm</label>
                            <input type="date" id="scoreDate" required class="w-full p-2 border rounded input-animation"
                                value="${scoreToEdit?.date || new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="flex justify-end space-x-4 mt-6">
                            <button type="button" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                                onclick="teacherScores.closeModal()">
                                Hủy
                            </button>
                            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 submit-btn-animation">
                                ${scoreToEdit ? 'Cập nhật' : 'Lưu điểm'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const form = document.getElementById('scoreForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            this.saveScore();
        };

        // Add animation classes to form elements
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach((input, index) => {
            input.classList.add('input-animation');
            input.style.animationDelay = `${index * 0.1}s`;
        });
    }

    saveScore() {
        const scoreId = this.editingScoreId || `score_${Date.now()}`;
        const studentId = parseInt(document.getElementById('studentSelect').value);
        const subject = document.getElementById('subjectSelect').value;
        const type = document.getElementById('scoreType').value;
        const score = document.getElementById('scoreValue').value;
        const date = document.getElementById('scoreDate').value;
        
        if (!this.validateScoreData({ studentId, subject, type, score, date })) {
            return;
        }
        
        try {
            // Tạo đối tượng điểm số
            const scoreData = {
                id: scoreId,
                studentId,
                subject,
                type,
                score,
                date,
                semester: this.getCurrentSemester() // Thêm thông tin học kỳ
            };
            
            // Cập nhật hoặc thêm mới điểm số
            let scores = JSON.parse(localStorage.getItem('scores') || '[]');
            
            if (this.currentScoreId) {
                // Cập nhật điểm số hiện có
                scores = scores.map(s => s.id === this.currentScoreId ? scoreData : s);
            } else {
                // Thêm điểm số mới
                scores.push(scoreData);
            }
            
            // Lưu vào localStorage
            localStorage.setItem('scores', JSON.stringify(scores));
            
            // Kích hoạt sự kiện cập nhật điểm
            window.dispatchEvent(new CustomEvent('scoresUpdated'));
            
            // Cập nhật giao diện
            this.loadScores();
            
            // Đóng modal và hiển thị thông báo
            this.closeModal('scoreModal');
            this.showToast('success', 'Đã lưu điểm thành công!');
            
            // Reset form
            this.currentScoreId = null;
            document.getElementById('scoreForm').reset();
        } catch (error) {
            console.error('Lỗi khi lưu điểm:', error);
            this.showToast('error', 'Có lỗi xảy ra khi lưu điểm!');
        }
    }

    getCurrentSemester() {
        const now = new Date();
        const month = now.getMonth() + 1; // getMonth() trả về 0-11
        return month >= 8 || month <= 1 ? '1' : '2';
    }

    deleteScore(scoreId) {
        this.showConfirmPopup(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa điểm này không?',
            () => {
                const index = this.scores.findIndex(s => s.id === scoreId);
                if (index !== -1) {
                    this.scores.splice(index, 1);
                    localStorage.setItem('scores', JSON.stringify(this.scores));
                    this.loadScoreTable();
                    this.showToast('Đã xóa điểm thành công');
                }
            }
        );
    }

    loadScoreTable() {
        let filteredScores = [...this.scores];
        
        if (this.currentClass) {
            filteredScores = filteredScores.filter(score => {
                const student = this.getStudentById(score.studentId);
                return student && student.class === this.currentClass;
            });
        }
        
        if (this.currentSemester) {
            filteredScores = filteredScores.filter(score => 
                score.semester === this.currentSemester
            );
        }

        const tableBody = document.querySelector('.score-table tbody');
        if (tableBody) {
            if (filteredScores.length === 0) {
                tableBody.innerHTML = `
                    <tr class="fade-in">
                        <td colspan="7" class="text-center py-4 text-gray-500">
                            Chưa có dữ liệu điểm số
                        </td>
                    </tr>
                `;
            } else {
                tableBody.innerHTML = filteredScores.map((score, index) => {
                    const student = this.getStudentById(score.studentId);
                    return `
                        <tr class="table-row-animation" 
                            style="animation-delay: ${index * 0.1}s"
                            data-score-id="${score.id}">
                            <td class="px-4 py-2">${student ? student.name : 'N/A'}</td>
                            <td class="px-4 py-2">${student ? student.class : 'N/A'}</td>
                            <td class="px-4 py-2">${score.subject}</td>
                            <td class="px-4 py-2">${this.getScoreTypeName(score.type)}</td>
                            <td class="px-4 py-2">
                                <span class="score-value ${this.getScoreClass(score.score)}">
                                    ${score.score}
                                </span>
                            </td>
                            <td class="px-4 py-2">${new Date(score.date).toLocaleDateString('vi-VN')}</td>
                            <td class="px-4 py-2">
                                <button onclick="teacherScores.editScore('${score.id}')" 
                                    class="text-blue-600 hover:text-blue-800 mr-2 btn-hover-animation">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="teacherScores.deleteScore('${score.id}')" 
                                    class="text-red-600 hover:text-red-800 btn-hover-animation">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }

        this.updateScoreStatistics(filteredScores);
    }

    getScoreTypeName(type) {
        const types = {
            'mieng': 'Điểm miệng',
            '15p': 'Điểm 15 phút',
            '1t': 'Điểm 1 tiết',
            'hk': 'Điểm học kỳ'
        };
        return types[type] || type;
    }

    closeModal() {
        const modal = document.getElementById('scoreModal');
        if (modal) {
            modal.classList.add('fade-out');
            setTimeout(() => modal.remove(), 300);
        }
    }

    validateScoreData(data) {
        if (!data.studentId) {
            this.showToast('Vui lòng chọn học sinh', 'error');
            return false;
        }
        if (!data.subject) {
            this.showToast('Vui lòng chọn môn học', 'error');
            return false;
        }
        if (!data.type) {
            this.showToast('Vui lòng chọn loại điểm', 'error');
            return false;
        }
        if (!data.score || data.score < 0 || data.score > 10) {
            this.showToast('Điểm số phải từ 0 đến 10', 'error');
            return false;
        }
        if (!data.date) {
            this.showToast('Vui lòng chọn ngày nhập điểm', 'error');
            return false;
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

    updateScoreStatistics(scores) {
        const averageScoreElement = document.getElementById('averageScore');
        if (averageScoreElement) {
            if (scores && scores.length > 0) {
                const average = scores.reduce((sum, score) => sum + parseFloat(score.score), 0) / scores.length;
                averageScoreElement.textContent = average.toFixed(1);
                averageScoreElement.classList.add('success-animation');
            } else {
                averageScoreElement.textContent = '0.0';
            }
        }
    }
}

// Khởi tạo khi trang được tải
let teacherScores;
document.addEventListener('DOMContentLoaded', () => {
    teacherScores = new TeacherScores();
    window.teacherScores = teacherScores;
    teacherScores.init();
}); 