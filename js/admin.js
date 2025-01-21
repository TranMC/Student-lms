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
        
        let students = JSON.parse(localStorage.getItem('students') || '[]');
        
        if (studentData.studentId) {
            students = students.map(s => 
                s.studentId === studentData.studentId ? {...s, ...studentData} : s
            );
        } else {
            studentData.studentId = 'HS' + Date.now();
            studentData.role = 'student';
            students.push(studentData);
        }
        
        localStorage.setItem('students', JSON.stringify(students));
        this.closeModal('studentModal');
        this.loadStudents();
    }

    deleteStudent(studentId) {
        if (!confirm('Bạn có chắc chắn muốn xóa học sinh này?')) return;
        
        let students = JSON.parse(localStorage.getItem('students') || '[]');
        students = students.filter(s => s.studentId !== studentId);
        localStorage.setItem('students', JSON.stringify(students));
        
        this.loadStudents();
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
        }
        
        modal.style.display = 'block';
    }

    saveClass() {
        const form = document.getElementById('classForm');
        const formData = new FormData(form);
        const classData = Object.fromEntries(formData.entries());
        
        let classes = JSON.parse(localStorage.getItem('classes') || '[]');
        
        if (classData.classId) {
            classes = classes.map(c => 
                c.classId === classData.classId ? {...c, ...classData} : c
            );
        } else {
            classData.classId = 'L' + Date.now();
            classes.push(classData);
        }
        
        localStorage.setItem('classes', JSON.stringify(classes));
        this.closeModal('classModal');
        this.loadClasses();
    }

    deleteClass(classId) {
        if (!confirm('Bạn có chắc chắn muốn xóa lớp học này?')) return;
        
        let classes = JSON.parse(localStorage.getItem('classes') || '[]');
        classes = classes.filter(c => c.classId !== classId);
        localStorage.setItem('classes', JSON.stringify(classes));
        
        this.loadClasses();
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
        tbody.innerHTML = accounts.map(acc => `
            <tr>
                <td>${acc.username}</td>
                <td>${acc.type}</td>
                <td>${acc.fullName || ''}</td>
                <td>${acc.email || ''}</td>
                <td><span class="status-active">Hoạt động</span></td>
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

    setupAccountEventListeners() {
        document.getElementById('addAccountBtn')?.addEventListener('click', () => {
            this.openAccountModal();
        });

        document.getElementById('accountForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAccount();
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
    }

    deleteAccount(username) {
        if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
        
        let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
        accounts = accounts.filter(a => a.username !== username);
        localStorage.setItem('accounts', JSON.stringify(accounts));
        
        this.loadAccounts();
    }

    resetPassword(username) {
        const modal = document.getElementById('passwordModal');
        document.querySelector('#passwordForm input[name="username"]').value = username;
        modal.style.display = 'block';
    }

    toggleAccountStatus(username) {
        let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
        accounts = accounts.map(a => 
            a.username === username ? {...a, status: a.status === 'active' ? 'inactive' : 'active'} : a
        );
        localStorage.setItem('accounts', JSON.stringify(accounts));
        this.loadAccounts();
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
}

// Khởi tạo dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
    window.adminDashboard = adminDashboard;
}); 