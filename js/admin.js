class AdminDashboard {
    constructor() {
        this.currentPage = 'dashboard';
        this.pageContent = document.getElementById('pageContent');
        this.initializeNavigation();
    }

    initializeNavigation() {
        document.querySelectorAll('.sidebar li').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.loadPage(page);
            });
        });
    }

    async loadPage(page) {
        try {
            // Cập nhật active state
            document.querySelectorAll('.sidebar li').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.page === page) {
                    item.classList.add('active');
                }
            });

            // Load nội dung trang
            const response = await fetch(`components/admin-${page}-content.html`);
            const content = await response.text();
            this.pageContent.innerHTML = content;

            // Khởi tạo chức năng cho trang
            this.initializePageFunctions(page);
            this.currentPage = page;
        } catch (error) {
            console.error('Error loading page:', error);
        }
    }

    initializePageFunctions(page) {
        switch(page) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'students':
                this.initializeStudentManagement();
                break;
            case 'teachers':
                this.initializeTeacherManagement();
                break;
            case 'classes':
                this.initializeClassManagement();
                break;
            case 'accounts':
                this.initializeAccountManagement();
                break;
        }
    }

    initializeDashboard() {
        // Hiển thị thống kê tổng quan
        const stats = this.getSystemStats();
        document.getElementById('totalStudents').textContent = stats.students;
        document.getElementById('totalTeachers').textContent = stats.teachers;
        document.getElementById('totalClasses').textContent = stats.classes;
    }

    initializeStudentManagement() {
        this.loadStudents();
        this.setupStudentEventListeners();
    }

    loadStudents() {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const tbody = document.querySelector('#studentTable tbody');
        tbody.innerHTML = students.map(student => `
            <tr>
                <td>${student.studentId}</td>
                <td>${student.fullName}</td>
                <td>${student.class}</td>
                <td>${student.email}</td>
                <td>${student.phone}</td>
                <td>
                    <button onclick="adminDashboard.editStudent('${student.studentId}')" class="btn-edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="adminDashboard.deleteStudent('${student.studentId}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    setupStudentEventListeners() {
        document.getElementById('addStudentBtn')?.addEventListener('click', () => {
            this.openStudentModal();
        });

        document.getElementById('studentForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStudent();
        });

        document.getElementById('searchStudent')?.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            this.filterStudents(searchTerm);
        });
    }

    openStudentModal(studentId = null) {
        const modal = document.getElementById('studentModal');
        const form = document.getElementById('studentForm');
        
        if (studentId) {
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            const student = students.find(s => s.studentId === studentId);
            if (student) {
                Object.keys(student).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input) input.value = student[key];
                });
            }
        } else {
            form.reset();
        }
        
        modal.style.display = 'block';
    }

    saveStudent() {
        const form = document.getElementById('studentForm');
        const formData = new FormData(form);
        const studentData = Object.fromEntries(formData.entries());
        
        try {
            let students = JSON.parse(localStorage.getItem('students') || '[]');
            
            if (studentData.studentId) {
                students = students.map(s => 
                    s.studentId === studentData.studentId ? {...s, ...studentData} : s
                );
            } else {
                studentData.studentId = 'S' + Date.now();
                studentData.role = 'student';
                studentData.status = 'active';
                students.push(studentData);
            }
            
            localStorage.setItem('students', JSON.stringify(students));
            this.closeModal('studentModal');
            this.loadStudents();
            this.showToast('success', 'Đã lưu thông tin học sinh thành công!');
        } catch (error) {
            this.showToast('error', 'Có lỗi xảy ra khi lưu thông tin!');
        }
    }

    deleteStudent(studentId) {
        this.currentDeleteId = studentId;
        this.currentDeleteType = 'student';
        const overlay = document.getElementById('deleteConfirmOverlay');
        const popup = document.getElementById('deleteConfirmPopup');
        if (overlay && popup) {
            overlay.style.display = 'block';
            popup.style.display = 'block';
            popup.querySelector('p').textContent = 'Bạn có chắc chắn muốn xóa học sinh này? Hành động này không thể hoàn tác.';
        } else {
            console.error('Không tìm thấy phần tử popup xác nhận xóa');
        }
    }

    editStudent(studentId) {
        this.openStudentModal(studentId);
    }

    initializeClassManagement() {
        this.loadClasses();
        this.setupClassEventListeners();
        this.loadTeachersForSelect();
    }

    loadClasses() {
        const classes = JSON.parse(localStorage.getItem('classes') || '[]');
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        
        const tbody = document.querySelector('#classTable tbody');
        tbody.innerHTML = classes.map(cls => {
            const teacher = teachers.find(t => t.id === cls.teacherId);
            const studentCount = students.filter(s => s.class === cls.className).length;
            return `
                <tr>
                    <td>${cls.classId}</td>
                    <td>${cls.className}</td>
                    <td>${studentCount}</td>
                    <td>${teacher ? teacher.fullName : 'Chưa phân công'}</td>
                    <td>
                        <button onclick="adminDashboard.editClass('${cls.classId}')" class="btn-edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="adminDashboard.deleteClass('${cls.classId}')" class="btn-delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    setupClassEventListeners() {
        document.getElementById('addClassBtn')?.addEventListener('click', () => {
            this.openClassModal();
        });

        document.getElementById('classForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveClass();
        });
    }

    openClassModal(classId = null) {
        const modal = document.getElementById('classModal');
        const form = document.getElementById('classForm');
        
        if (classId) {
            const classes = JSON.parse(localStorage.getItem('classes') || '[]');
            const classData = classes.find(c => c.classId === classId);
            if (classData) {
                Object.keys(classData).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input) input.value = classData[key];
                });
            }
        } else {
            form.reset();
            // Tạo mã lớp tự động nếu không có mã lớp được nhập
            const classIdInput = form.querySelector('[name="classId"]');
            classIdInput.value = 'C' + Date.now();
        }
        
        modal.style.display = 'block';
    }

    saveClass() {
        const form = document.getElementById('classForm');
        const formData = new FormData(form);
        const classData = Object.fromEntries(formData.entries());
        
        try {
            let classes = JSON.parse(localStorage.getItem('classes') || '[]');
            
            if (classData.classId) {
                classes = classes.map(c => 
                    c.classId === classData.classId ? {...c, ...classData} : c
                );
            } else {
                classData.classId = 'C' + Date.now();
                classData.status = 'active';
                classes.push(classData);
            }
            
            localStorage.setItem('classes', JSON.stringify(classes));
            this.closeModal('classModal');
            this.loadClasses();
            this.showToast('success', 'Đã lưu thông tin lớp học thành công!');
        } catch (error) {
            this.showToast('error', 'Có lỗi xảy ra khi lưu thông tin!');
        }
    }

    deleteClass(classId) {
        this.currentDeleteId = classId;
        this.currentDeleteType = 'class';
        const overlay = document.getElementById('deleteConfirmOverlay');
        const popup = document.getElementById('deleteConfirmPopup');
        if (overlay && popup) {
            overlay.style.display = 'block';
            popup.style.display = 'block';
            popup.querySelector('p').textContent = 'Bạn có chắc chắn muốn xóa lớp học này? Hành động này không thể hoàn tác.';
        } else {
            console.error('Không tìm thấy phần tử popup xác nhận xóa');
        }
    }

    editClass(classId) {
        this.openClassModal(classId);
    }

    initializeAccountManagement() {
        this.loadAccounts();
        this.setupAccountEventListeners();
    }

    loadAccounts() {
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const admins = JSON.parse(localStorage.getItem('admins') || '[]');
        
        const accounts = [
            ...admins.map(a => ({...a, type: 'Admin'})),
            ...teachers.map(t => ({...t, type: 'Giáo viên'})),
            ...students.map(s => ({...s, type: 'Học sinh'}))
        ];
        
        const tbody = document.querySelector('#accountTable tbody');
        if (tbody) {
            tbody.innerHTML = accounts.map(acc => `
                <tr>
                    <td>${acc.username}</td>
                    <td>${acc.type}</td>
                    <td>${acc.fullName || ''}</td>
                    <td>${acc.email || ''}</td>
                    <td><span class="status-${acc.status === 'inactive' ? 'inactive' : 'active'}">${acc.status === 'inactive' ? 'Không hoạt động' : 'Hoạt động'}</span></td>
                    <td>
                        <button onclick="adminDashboard.resetPassword('${acc.username}')" class="btn-edit">
                            <i class="fas fa-key"></i>
                        </button>
                        <button onclick="adminDashboard.toggleAccountStatus('${acc.username}')" class="btn-warning">
                            <i class="fas fa-ban"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    setupAccountEventListeners() {
        document.getElementById('addAccountBtn')?.addEventListener('click', () => {
            this.openAccountModal();
        });

        document.getElementById('accountForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAccount();
        });

        document.getElementById('passwordForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePassword();
        });

        // Thêm sự kiện cho form chỉnh sửa tài khoản
        document.getElementById('editAccountForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAccountChanges();
        });

        // Thêm sự kiện tìm kiếm
        document.getElementById('searchAccount')?.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            this.filterAccounts(searchTerm);
        });
    }

    openAccountModal(username = null) {
        const modal = document.getElementById('accountModal');
        const form = document.getElementById('accountForm');
        
        if (username) {
            const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
            const account = accounts.find(a => a.username === username);
            if (account) {
                Object.keys(account).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input) input.value = account[key];
                });
            }
        } else {
            form.reset();
        }
        
        modal.style.display = 'block';
    }

    saveAccount() {
        const form = document.getElementById('accountForm');
        const formData = new FormData(form);
        const accountData = Object.fromEntries(formData.entries());
        
        try {
            let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
            
            if (accountData.username) {
                accounts = accounts.map(a => 
                    a.username === accountData.username ? {...a, ...accountData} : a
                );
            } else {
                accountData.username = 'U' + Date.now();
                accounts.push(accountData);
            }
            
            localStorage.setItem('accounts', JSON.stringify(accounts));
            this.closeModal('accountModal');
            this.loadAccounts();
            this.showToast('success', 'Đã lưu thông tin tài khoản thành công!');
        } catch (error) {
            this.showToast('error', 'Có lỗi xảy ra khi lưu thông tin!');
        }
    }

    deleteAccount(username) {
        this.currentDeleteUsername = username; // Lưu username cần xóa
        document.getElementById('deleteConfirmOverlay').style.display = 'block';
        document.getElementById('deleteConfirmPopup').style.display = 'block';
    }

    closeDeleteConfirm() {
        const overlay = document.getElementById('deleteConfirmOverlay');
        const popup = document.getElementById('deleteConfirmPopup');
        if (overlay && popup) {
            overlay.style.display = 'none';
            popup.style.display = 'none';
            this.currentDeleteId = null;
            this.currentDeleteType = null;
        }
    }

    confirmDelete() {
        if (!this.currentDeleteId || !this.currentDeleteType) return;

        let success = false;
        switch(this.currentDeleteType) {
            case 'student':
                let students = JSON.parse(localStorage.getItem('students') || '[]');
                students = students.filter(s => s.studentId !== this.currentDeleteId);
                localStorage.setItem('students', JSON.stringify(students));
                this.loadStudents();
                success = true;
                break;

            case 'teacher':
                let teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
                teachers = teachers.filter(t => t.id != this.currentDeleteId);
                localStorage.setItem('teachers', JSON.stringify(teachers));
                this.loadTeachers();
                success = true;
                break;

            case 'class':
                let classes = JSON.parse(localStorage.getItem('classes') || '[]');
                classes = classes.filter(c => c.classId !== this.currentDeleteId);
                localStorage.setItem('classes', JSON.stringify(classes));
                this.loadClasses();
                success = true;
                break;
        }

        this.closeDeleteConfirm();
        
        if (success) {
            this.showToast('success', `Đã xóa ${
                this.currentDeleteType === 'student' ? 'học sinh' : 
                this.currentDeleteType === 'teacher' ? 'giáo viên' : 'lớp học'
            } thành công!`);
        } else {
            this.showToast('error', 'Có lỗi xảy ra khi xóa!');
        }
    }

    showToast(type, message) {
        const container = document.getElementById('toastContainer');
        if (!container) {
            console.error('Không tìm thấy phần tử toastContainer');
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span class="message">${message}</span>
        `;

        container.appendChild(toast);

        // Hiệu ứng slide in
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Tự động ẩn sau 3 giây
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode === container) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    resetPassword(username) {
        const modal = document.getElementById('passwordModal');
        document.querySelector('#passwordForm input[name="username"]').value = username;
        modal.style.display = 'block';
    }

    savePassword() {
        const form = document.getElementById('passwordForm');
        const username = form.querySelector('input[name="username"]').value;
        const newPassword = form.querySelector('input[name="newPassword"]').value;
        const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;
        
        if (newPassword !== confirmPassword) {
            this.showToast('error', 'Mật khẩu xác nhận không khớp!');
            return;
        }
        
        const updatePassword = (key) => {
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            const updated = data.map(item => 
                item.username === username ? {...item, password: newPassword} : item
            );
            localStorage.setItem(key, JSON.stringify(updated));
        };
        
        updatePassword('admins');
        updatePassword('teachers');
        updatePassword('students');
        
        this.closeModal('passwordModal');
        this.showToast('success', 'Đã cập nhật mật khẩu thành công!');
    }

    toggleAccountStatus(username) {
        const overlay = document.getElementById('statusConfirmOverlay');
        const popup = document.getElementById('statusConfirmPopup');
        if (overlay && popup) {
            this.currentUsername = username;
            overlay.style.display = 'block';
            popup.style.display = 'block';
            
            // Kiểm tra trạng thái hiện tại của tài khoản
            const checkStatus = (key) => {
                const data = JSON.parse(localStorage.getItem(key) || '[]');
                const account = data.find(item => item.username === username);
                if (account) return account.status;
                return null;
            };
            
            const currentStatus = checkStatus('admins') || checkStatus('teachers') || checkStatus('students');
            const newStatus = currentStatus === 'inactive' ? 'kích hoạt' : 'vô hiệu hóa';
            
            popup.querySelector('p').textContent = `Bạn có chắc chắn muốn ${newStatus} tài khoản này?`;
        } else {
            console.error('Không tìm thấy phần tử popup xác nhận thay đổi trạng thái');
        }
    }

    confirmStatusChange() {
        if (!this.currentUsername) return;
        
        const updateStatus = (key) => {
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            let updated = false;
            
            const newData = data.map(item => {
                if (item.username === this.currentUsername) {
                    updated = true;
                    const newStatus = item.status === 'inactive' ? 'active' : 'inactive';
                    return {...item, status: newStatus};
                }
                return item;
            });
            
            if (updated) {
                localStorage.setItem(key, JSON.stringify(newData));
                return true;
            }
            return false;
        };
        
        const updated = updateStatus('admins') || updateStatus('teachers') || updateStatus('students');
        
        if (updated) {
            this.loadAccounts();
            this.showToast('success', 'Đã thay đổi trạng thái tài khoản thành công!');
        }
        
        this.closeStatusConfirm();
    }

    closeStatusConfirm() {
        const overlay = document.getElementById('statusConfirmOverlay');
        const popup = document.getElementById('statusConfirmPopup');
        if (overlay && popup) {
            overlay.style.display = 'none';
            popup.style.display = 'none';
            this.currentUsername = null;
        }
    }

    saveAccountChanges() {
        const form = document.getElementById('editAccountForm');
        const formData = new FormData(form);
        const accountData = Object.fromEntries(formData.entries());
        
        const updateAccount = (key) => {
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            const updated = data.map(item => 
                item.username === accountData.username 
                    ? {...item, 
                        fullName: accountData.fullName,
                        email: accountData.email,
                        phone: accountData.phone
                      }
                    : item
            );
            localStorage.setItem(key, JSON.stringify(updated));
        };
        
        updateAccount('admins');
        updateAccount('teachers');
        updateAccount('students');
        
        this.closeModal('editAccountModal');
        this.loadAccounts();
        this.showToast('success', 'Đã cập nhật thông tin tài khoản thành công!');
    }

    getSystemStats() {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const classes = [...new Set(students.map(s => s.class))];

        return {
            students: students.length,
            teachers: teachers.length,
            classes: classes.length
        };
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    initializeTeacherManagement() {
        this.loadTeachers();
        this.setupTeacherEventListeners();
    }

    loadTeachers() {
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const tbody = document.querySelector('#teacherTable tbody');
        tbody.innerHTML = teachers.map(teacher => `
            <tr>
                <td>${teacher.id}</td>
                <td>${teacher.fullName}</td>
                <td>${teacher.subject}</td>
                <td>${teacher.email || ''}</td>
                <td>${teacher.phone || ''}</td>
                <td>
                    <button onclick="adminDashboard.editTeacher('${teacher.id}')" class="btn-edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="adminDashboard.deleteTeacher('${teacher.id}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    setupTeacherEventListeners() {
        document.getElementById('addTeacherBtn')?.addEventListener('click', () => {
            this.openTeacherModal();
        });

        document.getElementById('teacherForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTeacher();
        });
    }

    openTeacherModal(teacherId = null) {
        const modal = document.getElementById('teacherModal');
        const form = document.getElementById('teacherForm');
        
        if (teacherId) {
            const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
            const teacher = teachers.find(t => t.id == teacherId);
            if (teacher) {
                Object.keys(teacher).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input) input.value = teacher[key];
                });
            }
        } else {
            form.reset();
        }
        
        modal.style.display = 'block';
    }

    saveTeacher() {
        const form = document.getElementById('teacherForm');
        const formData = new FormData(form);
        const teacherData = Object.fromEntries(formData.entries());
        
        try {
            let teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
            
            if (teacherData.id) {
                teachers = teachers.map(t => 
                    t.id === teacherData.id ? {...t, ...teacherData} : t
                );
            } else {
                teacherData.id = 'T' + Date.now();
                teacherData.role = 'teacher';
                teacherData.status = 'active';
                teachers.push(teacherData);
            }
            
            localStorage.setItem('teachers', JSON.stringify(teachers));
            this.closeModal('teacherModal');
            this.loadTeachers();
            this.showToast('success', 'Đã lưu thông tin giáo viên thành công!');
        } catch (error) {
            this.showToast('error', 'Có lỗi xảy ra khi lưu thông tin!');
        }
    }

    deleteTeacher(teacherId) {
        this.currentDeleteId = teacherId;
        this.currentDeleteType = 'teacher';
        const overlay = document.getElementById('deleteConfirmOverlay');
        const popup = document.getElementById('deleteConfirmPopup');
        if (overlay && popup) {
            overlay.style.display = 'block';
            popup.style.display = 'block';
            popup.querySelector('p').textContent = 'Bạn có chắc chắn muốn xóa giáo viên này? Hành động này không thể hoàn tác.';
        } else {
            console.error('Không tìm thấy phần tử popup xác nhận xóa');
        }
    }

    editTeacher(teacherId) {
        this.openTeacherModal(teacherId);
    }

    loadTeachersForSelect() {
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const select = document.querySelector('select[name="teacherId"]');
        if (select) {
            select.innerHTML = `
                <option value="">Chọn giáo viên</option>
                ${teachers.map(t => `<option value="${t.id}">${t.fullName}</option>`).join('')}
            `;
        }
    }

    filterStudents(searchTerm) {
        if (!searchTerm) {
            loadStudentList();
            return;
        }
        
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const filteredStudents = students.filter(student => 
            student.studentId.toLowerCase().includes(searchTerm) ||
            student.fullName.toLowerCase().includes(searchTerm) ||
            student.class.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm) ||
            student.phone.toLowerCase().includes(searchTerm)
        );
        
        // Hiển thị danh sách đã lọc
        loadStudentList(filteredStudents);
    }

    filterTeachers(searchTerm) {
        if (!searchTerm) {
            loadTeacherList();
            return;
        }
        
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const filteredTeachers = teachers.filter(teacher => 
            teacher.id.toString().includes(searchTerm) ||
            teacher.fullName.toLowerCase().includes(searchTerm) ||
            teacher.subject.toLowerCase().includes(searchTerm) ||
            (teacher.email && teacher.email.toLowerCase().includes(searchTerm)) ||
            (teacher.phone && teacher.phone.toLowerCase().includes(searchTerm))
        );
        
        // Hiển thị danh sách đã lọc
        loadTeacherList(filteredTeachers);
    }

    filterClasses(searchTerm) {
        if (!searchTerm) {
            loadClassList();
            return;
        }
        
        const classes = JSON.parse(localStorage.getItem('classes') || '[]');
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        
        const filteredClasses = classes.filter(cls => {
            const teacher = teachers.find(t => t.id == cls.teacherId);
            const teacherName = teacher ? teacher.fullName.toLowerCase() : '';
            
            return cls.classId.toLowerCase().includes(searchTerm) ||
                   cls.className.toLowerCase().includes(searchTerm) ||
                   teacherName.includes(searchTerm);
        });
        
        // Hiển thị danh sách đã lọc
        loadClassList(filteredClasses);
    }

    filterAccounts(searchTerm) {
        if (!searchTerm) {
            loadAccountList();
            return;
        }
        
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const admins = JSON.parse(localStorage.getItem('admins') || '[]');
        
        const allAccounts = [
            ...admins.map(a => ({...a, type: 'Admin'})),
            ...teachers.map(t => ({...t, type: 'Giáo viên'})),
            ...students.map(s => ({...s, type: 'Học sinh'}))
        ];
        
        const filteredAccounts = allAccounts.filter(acc => 
            acc.username.toLowerCase().includes(searchTerm) ||
            acc.type.toLowerCase().includes(searchTerm) ||
            (acc.fullName && acc.fullName.toLowerCase().includes(searchTerm)) ||
            (acc.email && acc.email.toLowerCase().includes(searchTerm))
        );
        
        // Hiển thị danh sách đã lọc
        loadAccountList(filteredAccounts);
    }

    editAccount(username) {
        const form = document.getElementById('editAccountForm');
        const modal = document.getElementById('editAccountModal');
        
        // Tìm thông tin tài khoản từ các danh sách
        const findAccount = (key) => {
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            return data.find(item => item.username === username);
        };
        
        let account = findAccount('admins') || findAccount('teachers') || findAccount('students');
        
        if (account) {
            form.querySelector('input[name="username"]').value = account.username;
            form.querySelector('input[name="type"]').value = account.type || '';
            form.querySelector('input[name="fullName"]').value = account.fullName || '';
            form.querySelector('input[name="email"]').value = account.email || '';
            form.querySelector('input[name="phone"]').value = account.phone || '';
            
            modal.style.display = 'block';
        }
    }

    togglePasswordVisibility(button) {
        const input = button.parentElement.querySelector('input');
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

// Khởi tạo dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    // Đảm bảo dữ liệu được khởi tạo
    initializeAdminData();
    
    adminDashboard = new AdminDashboard();
    window.adminDashboard = adminDashboard;
});

// Hàm khởi tạo dữ liệu cho admin dashboard
function initializeAdminData() {
    // Khởi tạo dữ liệu lớp học nếu chưa có
    if (!localStorage.getItem('classes')) {
        const classes = [
            {
                classId: 'L001',
                className: '12A1',
                teacherId: 1,
                status: 'active'
            },
            {
                classId: 'L002',
                className: '12A2',
                teacherId: 1,
                status: 'active'
            },
            {
                classId: 'L003',
                className: '12A3',
                teacherId: 1,
                status: 'active'
            }
        ];
        localStorage.setItem('classes', JSON.stringify(classes));
    }
    
    // Đảm bảo có dữ liệu giáo viên
    if (!localStorage.getItem('teachers')) {
        const teachers = [{
            id: 1,
            username: 'teacher1',
            password: '123456',
            fullName: 'Nguyễn Văn A',
            subject: 'Toán',
            role: 'teacher',
            status: 'active'
        }];
        localStorage.setItem('teachers', JSON.stringify(teachers));
    }
    
    // Đảm bảo có dữ liệu học sinh
    if (!localStorage.getItem('students')) {
        const students = [
            {
                studentId: 'HS001',
                fullName: 'Trần Văn An',
                class: '12A1',
                username: 'student1',
                password: '123456',
                email: 'an@example.com',
                phone: '0123456789',
                role: 'student',
                status: 'active'
            },
            {
                studentId: 'HS002',
                fullName: 'Lê Thị Bình',
                class: '12A1',
                username: 'student2',
                password: '123456',
                email: 'binh@example.com',
                phone: '0123456790',
                role: 'student',
                status: 'active'
            }
        ];
        localStorage.setItem('students', JSON.stringify(students));
    }
}

// Hàm lấy dữ liệu thống kê từ localStorage
async function getDashboardStats() {
    // Lấy dữ liệu từ localStorage
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const teachers = JSON.parse(localStorage.getItem('teachers')) || [];
    const classes = JSON.parse(localStorage.getItem('classes')) || [];

    // Giả lập delay để có animation loading
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
        studentCount: students.length.toString(),
        teacherCount: teachers.length.toString(),
        classCount: classes.length.toString()
    };
}

// Hàm load trang tổng quan
async function loadDashboardPage() {
    try {
        // Load template từ component
        const response = await fetch('components/admin-dashboard-content.html');
        const content = await response.text();
        
        document.getElementById('pageContent').innerHTML = content;
        await loadDashboardStats();
    } catch (error) {
        console.error('Lỗi khi tải trang tổng quan:', error);
        document.getElementById('pageContent').innerHTML = '<p>Có lỗi xảy ra khi tải trang tổng quan</p>';
    }
}

// Hàm load và hiển thị số liệu thống kê chi tiết
async function loadDashboardStats() {
    try {
        const stats = await getDashboardStats();
        
        // Cập nhật số liệu cơ bản
        document.getElementById('studentCount').textContent = stats.studentCount;
        document.getElementById('teacherCount').textContent = stats.teacherCount;
        document.getElementById('classCount').textContent = stats.classCount;

        // Thêm thông tin chi tiết
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const teachers = JSON.parse(localStorage.getItem('teachers')) || [];
        const classes = JSON.parse(localStorage.getItem('classes')) || [];
        const scores = JSON.parse(localStorage.getItem('scores')) || [];

        // Cập nhật chi tiết cho từng card
        document.getElementById('studentDetail').textContent = 
            `Hoạt động: ${students.filter(s => s.status === 'active' || !s.status).length}`;
        document.getElementById('teacherDetail').textContent = 
            `Đang giảng dạy: ${teachers.filter(t => t.status === 'active' || !t.status).length}`;
        document.getElementById('classDetail').textContent = 
            `Đang hoạt động: ${classes.filter(c => c.status === 'active' || !c.status).length}`;

        // Hiển thị thống kê chi tiết
        const detailedStats = document.getElementById('detailedStats');
        if (detailedStats) {
            // Tính điểm trung bình của học sinh
            const avgScore = scores.length > 0 
                ? (scores.reduce((sum, score) => sum + parseFloat(score.score), 0) / scores.length).toFixed(1)
                : 'N/A';
            
            // Tính số lớp mỗi giáo viên phụ trách
            const classesPerTeacher = teachers.length > 0 
                ? (classes.length / teachers.length).toFixed(1) 
                : 'N/A';
            
            // Tính số học sinh mỗi lớp
            const studentsPerClass = classes.length > 0 
                ? (students.length / classes.length).toFixed(1) 
                : 'N/A';
            
            // Tìm lớp có nhiều học sinh nhất
            let maxStudentsClass = '';
            let maxStudents = 0;
            
            classes.forEach(cls => {
                const studentCount = students.filter(s => s.class === cls.className).length;
                if (studentCount > maxStudents) {
                    maxStudents = studentCount;
                    maxStudentsClass = cls.className;
                }
            });
            
            detailedStats.innerHTML = `
                <div class="detailed-stat">
                    <p>Tỷ lệ học sinh/lớp: ${studentsPerClass}</p>
                    <p>Tỷ lệ giáo viên/lớp: ${classesPerTeacher}</p>
                    <p>Điểm trung bình: ${avgScore}</p>
                    <p>Lớp đông nhất: ${maxStudentsClass} (${maxStudents} học sinh)</p>
                </div>
            `;
        }

        // Thêm animation khi load xong
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.classList.add('loaded');
        });

    } catch (error) {
        console.error('Lỗi khi tải thống kê:', error);
        // Hiển thị thông báo lỗi nếu cần
        const errorMessage = 'Không thể tải dữ liệu thống kê';
        document.getElementById('studentCount').textContent = 'Lỗi';
        document.getElementById('teacherCount').textContent = 'Lỗi';
        document.getElementById('classCount').textContent = 'Lỗi';
    }
}

// Thêm vào phần xử lý sự kiện click menu
document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.sidebar li');
    
    // Load trang tổng quan mặc định
    loadDashboardPage();
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const page = this.getAttribute('data-page');
            switch(page) {
                case 'dashboard':
                    loadDashboardPage();
                    break;
                case 'students':
                    loadStudentsPage();
                    break;
                case 'teachers':
                    loadTeachersPage();
                    break;
                case 'classes':
                    loadClassesPage();
                    break;
                case 'accounts':
                    loadAccountsPage();
                    break;
            }
        });
    });
});

// Hàm load trang quản lý học sinh
async function loadStudentsPage() {
    try {
        const response = await fetch('components/admin-students-content.html');
        const content = await response.text();
        document.getElementById('pageContent').innerHTML = content;
        // Khởi tạo các chức năng quản lý học sinh sau khi load content
        initStudentManagement();
    } catch (error) {
        console.error('Lỗi khi tải trang học sinh:', error);
        document.getElementById('pageContent').innerHTML = '<p>Có lỗi xảy ra khi tải trang quản lý học sinh</p>';
    }
}

// Hàm load trang quản lý giáo viên
async function loadTeachersPage() {
    try {
        const response = await fetch('components/admin-teachers-content.html');
        const content = await response.text();
        document.getElementById('pageContent').innerHTML = content;
        // Khởi tạo các chức năng quản lý giáo viên sau khi load content
        initTeacherManagement();
    } catch (error) {
        console.error('Lỗi khi tải trang giáo viên:', error);
        document.getElementById('pageContent').innerHTML = '<p>Có lỗi xảy ra khi tải trang quản lý giáo viên</p>';
    }
}

// Hàm load trang quản lý lớp học
async function loadClassesPage() {
    try {
        const response = await fetch('components/admin-classes-content.html');
        const content = await response.text();
        document.getElementById('pageContent').innerHTML = content;
        // Khởi tạo các chức năng quản lý lớp học sau khi load content
        initClassManagement();
    } catch (error) {
        console.error('Lỗi khi tải trang lớp học:', error);
        document.getElementById('pageContent').innerHTML = '<p>Có lỗi xảy ra khi tải trang quản lý lớp học</p>';
    }
}

// Hàm load trang quản lý tài khoản
async function loadAccountsPage() {
    try {
        const response = await fetch('components/admin-accounts-content.html');
        const content = await response.text();
        document.getElementById('pageContent').innerHTML = content;
        // Khởi tạo các chức năng quản lý tài khoản sau khi load content
        initAccountManagement();
    } catch (error) {
        console.error('Lỗi khi tải trang tài khoản:', error);
        document.getElementById('pageContent').innerHTML = '<p>Có lỗi xảy ra khi tải trang quản lý tài khoản</p>';
    }
}

// Hàm khởi tạo quản lý học sinh
function initStudentManagement() {
    // Hiển thị danh sách học sinh
    loadStudentList();
    
    // Thêm sự kiện cho nút thêm học sinh
    document.getElementById('addStudentBtn')?.addEventListener('click', () => {
        adminDashboard.openStudentModal();
    });
    
    // Thêm sự kiện cho form học sinh
    document.getElementById('studentForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        adminDashboard.saveStudent();
    });
    
    // Thêm sự kiện tìm kiếm
    document.getElementById('searchStudent')?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        adminDashboard.filterStudents(searchTerm);
    });
}

// Hàm tải danh sách học sinh
function loadStudentList(filteredStudents = null) {
    const students = filteredStudents || JSON.parse(localStorage.getItem('students') || '[]');
    const tbody = document.querySelector('#studentTable tbody');
    
    if (tbody) {
        tbody.innerHTML = students.map(student => `
            <tr>
                <td>${student.studentId}</td>
                <td>${student.fullName}</td>
                <td>${student.class}</td>
                <td>${student.email}</td>
                <td>${student.phone}</td>
                <td>
                    <button onclick="adminDashboard.editStudent('${student.studentId}')" class="btn-edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="adminDashboard.deleteStudent('${student.studentId}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Hàm khởi tạo quản lý giáo viên
function initTeacherManagement() {
    // Hiển thị danh sách giáo viên
    loadTeacherList();
    
    // Thêm sự kiện cho nút thêm giáo viên
    document.getElementById('addTeacherBtn')?.addEventListener('click', () => {
        adminDashboard.openTeacherModal();
    });
    
    // Thêm sự kiện cho form giáo viên
    document.getElementById('teacherForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        adminDashboard.saveTeacher();
    });
    
    // Thêm sự kiện tìm kiếm
    document.getElementById('searchTeacher')?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        adminDashboard.filterTeachers(searchTerm);
    });
}

// Hàm tải danh sách giáo viên
function loadTeacherList(filteredTeachers = null) {
    const teachers = filteredTeachers || JSON.parse(localStorage.getItem('teachers') || '[]');
    const tbody = document.querySelector('#teacherTable tbody');
    
    if (tbody) {
        tbody.innerHTML = teachers.map(teacher => `
            <tr>
                <td>${teacher.id}</td>
                <td>${teacher.fullName}</td>
                <td>${teacher.subject}</td>
                <td>${teacher.email || ''}</td>
                <td>${teacher.phone || ''}</td>
                <td>
                    <button onclick="adminDashboard.editTeacher('${teacher.id}')" class="btn-edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="adminDashboard.deleteTeacher('${teacher.id}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Hàm khởi tạo quản lý lớp học
function initClassManagement() {
    // Hiển thị danh sách lớp học
    loadClassList();
    
    // Thêm sự kiện cho nút thêm lớp học
    document.getElementById('addClassBtn')?.addEventListener('click', () => {
        adminDashboard.openClassModal();
    });
    
    // Thêm sự kiện cho form lớp học
    document.getElementById('classForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        adminDashboard.saveClass();
    });
    
    // Thêm sự kiện tìm kiếm
    document.getElementById('searchClass')?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        adminDashboard.filterClasses(searchTerm);
    });
    
    // Cập nhật danh sách giáo viên cho select
    updateTeacherSelect();
}

// Hàm tải danh sách lớp học
function loadClassList(filteredClasses = null) {
    const classes = filteredClasses || JSON.parse(localStorage.getItem('classes') || '[]');
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const tbody = document.querySelector('#classTable tbody');
    
    if (tbody) {
        tbody.innerHTML = classes.map(cls => {
            const teacher = teachers.find(t => t.id == cls.teacherId);
            const studentCount = students.filter(s => s.class === cls.className).length;
            const isAssigned = cls.teacherId && teacher ? true : false;
            
            return `
                <tr class="${isAssigned ? 'assigned' : ''}">
                    <td>${cls.classId}</td>
                    <td>${cls.className}</td>
                    <td>${studentCount}</td>
                    <td>${teacher ? teacher.fullName : 'Chưa phân công'}</td>
                    <td>
                        <button onclick="adminDashboard.editClass('${cls.classId}')" class="btn-edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="adminDashboard.deleteClass('${cls.classId}')" class="btn-delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Hàm cập nhật danh sách giáo viên cho select
function updateTeacherSelect() {
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const teacherSelect = document.querySelector('select[name="teacherId"]');
    if (teacherSelect) {
        teacherSelect.innerHTML = `
            <option value="">Chọn giáo viên</option>
            ${teachers.map(t => `<option value="${t.id}">${t.fullName}</option>`).join('')}
        `;
    }
}

// Hàm khởi tạo quản lý tài khoản
function initAccountManagement() {
    // Hiển thị danh sách tài khoản
    loadAccountList();
    
    // Thêm sự kiện tìm kiếm
    document.getElementById('searchAccount')?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        adminDashboard.filterAccounts(searchTerm);
    });
    
    // Thêm sự kiện cho form đổi mật khẩu
    document.getElementById('passwordForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const username = form.querySelector('input[name="username"]').value;
        const newPassword = form.querySelector('input[name="newPassword"]').value;
        const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;
        
        if (newPassword !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }
        
        // Cập nhật mật khẩu cho tài khoản
        const updatePassword = (key) => {
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            const updated = data.map(item => 
                item.username === username ? {...item, password: newPassword} : item
            );
            localStorage.setItem(key, JSON.stringify(updated));
        };
        
        updatePassword('admins');
        updatePassword('teachers');
        updatePassword('students');
        
        adminDashboard.closeModal('passwordModal');
        alert('Đã cập nhật mật khẩu thành công!');
    });
}

// Hàm tải danh sách tài khoản
function loadAccountList(filteredAccounts = null) {
    let accounts = [];
    
    if (filteredAccounts) {
        accounts = filteredAccounts;
    } else {
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const admins = JSON.parse(localStorage.getItem('admins') || '[]');
        
        accounts = [
            ...admins.map(a => ({...a, type: 'Admin'})),
            ...teachers.map(t => ({...t, type: 'Giáo viên'})),
            ...students.map(s => ({...s, type: 'Học sinh'}))
        ];
    }
    
    const tbody = document.querySelector('#accountTable tbody');
    if (tbody) {
        tbody.innerHTML = accounts.map(acc => `
            <tr>
                <td>${acc.username}</td>
                <td>${acc.type}</td>
                <td>${acc.fullName || ''}</td>
                <td>${acc.email || ''}</td>
                <td><span class="status-${acc.status === 'inactive' ? 'inactive' : 'active'}">${acc.status === 'inactive' ? 'Không hoạt động' : 'Hoạt động'}</span></td>
                <td>
                    <button onclick="adminDashboard.resetPassword('${acc.username}')" class="btn-edit">
                        <i class="fas fa-key"></i>
                    </button>
                    <button onclick="adminDashboard.toggleAccountStatus('${acc.username}')" class="btn-warning">
                        <i class="fas fa-ban"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

async function addClass(formData) {
    try {
        const response = await fetch('/api/classes', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            // Sau khi thêm lớp thành công, cập nhật lại dữ liệu
            await loadClasses();  // Gọi hàm load lại danh sách lớp
            showNotification('Thêm lớp học thành công', 'success');
        }
    } catch (error) {
        console.error('Lỗi khi thêm lớp:', error);
        showNotification('Có lỗi xảy ra khi thêm lớp', 'error');
    }
}

async function loadClasses() {
    try {
        const response = await fetch('/api/classes');
        const classes = await response.json();
        
        // Cập nhật giao diện với dữ liệu mới
        const classesContainer = document.querySelector('#classes-list');
        classesContainer.innerHTML = ''; // Xóa dữ liệu cũ
        
        classes.forEach(classItem => {
            const classElement = createClassElement(classItem);
            classesContainer.appendChild(classElement);
        });
        
        // Cập nhật trạng thái phân công
        updateAssignmentStatus();
    } catch (error) {
        console.error('Lỗi khi tải danh sách lớp:', error);
    }
}

function updateAssignmentStatus() {
    // Cập nhật trạng thái phân công cho từng lớp
    const classItems = document.querySelectorAll('.class-item');
    classItems.forEach(async (item) => {
        const classId = item.dataset.classId;
        const assignmentStatus = await checkAssignmentStatus(classId);
        const statusElement = item.querySelector('.assignment-status');
        statusElement.textContent = assignmentStatus ? 'Đã phân công' : 'Chưa phân công';
    });
}

// Thêm hàm mới để kiểm tra trạng thái phân công
function checkClassAssignment(classId) {
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const classData = classes.find(c => c.classId === classId);
    return classData && classData.teacherId ? true : false;
} 