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
            // Update active state
            document.querySelectorAll('.sidebar li').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.page === page) {
                    item.classList.add('active');
                }
            });

            // Load page content
            const response = await fetch(`components/admin-${page}-content.html`);
            const content = await response.text();
            this.pageContent.innerHTML = content;

            // Initialize page functions
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

    async initializeDashboard() {
        // Display system stats
        const stats = await this.getSystemStats();
        document.getElementById('totalStudents').textContent = stats.students;
        document.getElementById('totalTeachers').textContent = stats.teachers;
        document.getElementById('totalClasses').textContent = stats.classes;
    }

    async initializeStudentManagement() {
        await this.loadStudents();
        this.setupStudentEventListeners();
    }

    

    async loadStudents() {
        try {
            const response = await fetch('https://localhost:7112/Student/GetAllStudents');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
    
            console.log("API response:", data); // Debug dữ liệu trả về
    
            const students = data.data || []; // Lấy mảng sinh viên từ data.data
    
            console.log("Parsed students:", students); // Kiểm tra xem có phải mảng không
    
            const tbody = document.querySelector('#studentTable tbody');
            tbody.innerHTML = students.map(student => `
                <tr>
                
                    
                    <td>${student.lastName}</td>
                    <td>${student.firstName}</td>
                    <td>${student.email}</td>
                    <td>${student.dateOfBirth}</td>
                    <td>${student.phoneNumber}</td>
                    <td>${student.address}</td>
                    <td>${student.password}</td>
                    <td>
                        <button onclick="adminDashboard.openStudentModal('${student.studentId}')" class="btn-edit" data-id="${student.studentId}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="adminDashboard.deleteStudent('${student.studentId}')" class="btn-delete data-id="${student.studentId}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error("Error loading students:", error);
        }
    }
    

    setupStudentEventListeners() {
        document.getElementById('addStudentBtn')?.addEventListener('click', () => {
            this.openStudentModal();
        });

        document.getElementById('studentForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveStudent();
        });
    }

    async openStudentModal(studentId) {
        const modal = document.getElementById('studentModal');
        const form = document.getElementById('studentForm');
    
        form.reset(); // Reset form trước khi điền dữ liệu mới
    
        if (studentId) {
            const response = await fetch(`https://localhost:7112/Student/GetStudentById?id=${studentId}`);
            const student = await response.json();
            
            Object.keys(student).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) input.value = student[key];
            });
    
            // Đặt ID vào input ẩn để xác định là cập nhật
            form.querySelector("#studentId").value = studentId;
        }
    
        modal.style.display = 'block';
    }
    

    async saveStudent() {
        const form = document.getElementById('studentForm');
        const formData = new FormData(form);
        const studentData = Object.fromEntries(formData.entries());
    
        // Map tên field đúng với API yêu cầu
        const params = new URLSearchParams({
            id: studentData.studentId || "",  // Nếu không có ID thì gửi chuỗi rỗng
            FName: studentData.firstName,
            LName: studentData.lastName,
            email: studentData.email,
            phone: studentData.phone,
            address: studentData.address,
            dob: studentData.dob,
            password: studentData.password
        });
    
        const isUpdating = Boolean(studentData.studentId);
        const url = isUpdating
            ? `https://localhost:7112/Student/UpdateStudent?${params}`
            : `https://localhost:7112/Student/InsertStudent?${params}`;
    
        const method = isUpdating ? "PUT" : "POST";
    
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' }
            });
    
            if (!response.ok) throw new Error(`Failed to ${isUpdating ? "update" : "create"} student`);
    
            this.closeModal('studentModal');
            await this.loadStudents();
        } catch (error) {
            console.error(error);
        }
    }
    
    
    async deleteStudent(studentId) {
        if (!confirm('Bạn có chắc chắn muốn xóa học sinh này?')) return;

    try {
        const response = await fetch(`https://localhost:7112/Student/DeleteStudent?id=${studentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi xóa học sinh: ${response.status}`);
        }

        alert('Xóa học sinh thành công!');
        await this.loadStudents();
    } catch (error) {
        console.error("Lỗi khi xóa học sinh:", error);
        alert("Không thể xóa học sinh. Vui lòng thử lại.");
    }
    }



    async initializeTeacherManagement() {
        await this.loadTeachers();
        this.setupTeacherEventListeners();
    }

    

    async loadTeachers() {
        try {
            const response = await fetch('https://localhost:7112/Teacher/GetAllTeacher');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
    
            console.log("API response:", data); // Debug dữ liệu trả về
    
            const teachers = data.data || []; // Lấy mảng sinh viên từ data.data
    
            console.log("Parsed students:", teachers); // Kiểm tra xem có phải mảng không
    
            const tbody = document.querySelector('#teacherTable tbody');
            tbody.innerHTML = teachers.map(teacher => `
                <tr>
                
                    
                    <td>${teacher.lastName}</td>
                    <td>${teacher.firstName}</td>
                    <td>${teacher.email}</td>
                    <td>${teacher.password}</td>
                    <td>${teacher.phoneNumber}</td>
                    <td>${teacher.department}</td>
                    <td>
                        <button onclick="adminDashboard.openTeacherModal('${teacher.teacherId}')" class="btn-edit" data-id="${teacher.teacherId}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="adminDashboard.deleteTeacher('${teacher.teacherId}')" class="btn-delete" data-id="${teacher.teacherId}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error("Error loading teachers:", error);
        }
    }
    

    setupTeacherEventListeners() {
        document.getElementById('addTeacherBtn')?.addEventListener('click', () => {
            this.openTeacherModal();
        });

        document.getElementById('teacherForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveTeacher();
        });
    }

    async openTeacherModal(teacherId) {
        const modal = document.getElementById('teacherModal');
        const form = document.getElementById('teacherForm');
    
        form.reset(); // Reset form trước khi điền dữ liệu mới
    
        if (teacherId) {
            const response = await fetch(`https://localhost:7112/Teacher/GetTeacherById?id=${teacherId}`);
            const teacher = await response.json();
            
            Object.keys(teacher).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) input.value = teacher[key];
            });
    
            // Đặt ID vào input ẩn để xác định là cập nhật
            form.querySelector("#teacherId").value = teacherId;
        }
    
        modal.style.display = 'block';
    }
    

    async saveTeacher() {
        const form = document.getElementById('teacherForm');
        const formData = new FormData(form);
        const teacherData = Object.fromEntries(formData.entries());
    
        // Map tên field đúng với API yêu cầu
        const params = new URLSearchParams({
            id: teacherData.teacherId || "",  // Nếu không có ID thì gửi chuỗi rỗng
            FName: teacherData.firstName,
            LName: teacherData.lastName,
            email: teacherData.email,
            password: teacherData.password,
            phone: teacherData.phone,
            
            department: teacherData.department
        });
    
        const isUpdating = Boolean(teacherData.teacherId);
        const url = isUpdating
            ? `https://localhost:7112/Teacher/UpdateTeacher?${params}`
            : `https://localhost:7112/Teacher/InsertTeacher?${params}`;
    
        const method = isUpdating ? "PUT" : "POST";
    
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' }
            });
    
            if (!response.ok) throw new Error(`Failed to ${isUpdating ? "update" : "create"} teacher`);
    
            this.closeModal('teacherModal');
            await this.loadTeachers();
        } catch (error) {
            console.error(error);
        }
    }
    
    
    async deleteTeacher(teacherId) {
        if (!confirm('Bạn có chắc chắn muốn xóa giáo viên này?')) return;

    try {
        const response = await fetch(`https://localhost:7112/Teacher/DeleteTeacher?id=${teacherId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Lỗi xóa giáo viên: ${response.status}`);
        }

        alert('Xóa giáo viên thành công!');
        await this.loadTeachers();
    } catch (error) {
        console.error("Lỗi khi xóa giáo viên:", error);
        alert("Không thể xóa giáo viên. Vui lòng thử lại.");
    }
    }

    async initializeClassManagement() {
        await this.loadClasses();
        this.setupClassEventListeners();
        await this.loadTeachersForSelect();
    }

    async loadTeachersForSelect() {
        const response = await fetch('https://localhost:7112/Teacher/GetAllTeacher');
        const data = await response.json();
        const teachers = data.data || [];
    
        const select = document.querySelector('select[name="teacherId"]');
        select.innerHTML = teachers.map(t => 
            `<option value="${t.teacherId}">${t.lastName} ${t.firstName}</option>`
        ).join('');
    }

    async loadClasses() {
    try {
        const response = await fetch('https://localhost:7112/Class/GetAllClasses');
        const data = await response.json();  
        console.log("API Classes Response:", data); // Debug dữ liệu

        const classes = data.data; // Truy cập vào danh sách lớp học

        if (!Array.isArray(classes)) {
            console.error("Lỗi: API không trả về một mảng lớp học!");
            return;
        }

        const teachersResponse = await fetch('https://localhost:7112/Teacher/GetAllTeacher');
        const teachersData = await teachersResponse.json();
        const teachers = teachersData.data; // Truy cập vào danh sách giáo viên
        console.log("API Teachers Response:", teachers); // Debug dữ liệu

        if (!Array.isArray(teachers)) {
            console.error("Lỗi: API không trả về một mảng giáo viên!");
            return;
        }

        const tbody = document.querySelector('#classTable tbody');
        tbody.innerHTML = classes.map(cls => {
            const teacher = teachers.find(t => t.teacherId === cls.teacherId);
            const teacherName = teacher ? `${teacher.lastName} ${teacher.firstName}` : 'Chưa phân công';
            return `
                <tr>
                    
                    <td>${cls.className}</td>
                    <td>${teacher ? teacherName : 'Chưa phân công'}</td>
                    <td>${cls.schedule ? cls.schedule : 'Chưa có lịch'}</td>
                    <td>
                        <button onclick="adminDashboard.openClassModal('${cls.classId}')" class="btn-edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="adminDashboard.deleteClass('${cls.classId}')" class="btn-delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error("Lỗi khi load danh sách lớp:", error);
    }
}


    setupClassEventListeners() {
        document.getElementById('addClassBtn')?.addEventListener('click', () => {
            this.openClassModal();
        });

        document.getElementById('classForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveClass();
        });
    }

    async openClassModal(classId) {
        const modal = document.getElementById('classModal');
        const form = document.getElementById('classForm');
        
        if (classId) {
            const response = await fetch(`https://localhost:7112/Class/GetClassById?classId=${classId}`);
            const classData = await response.json();
            Object.keys(classData).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) input.value = classData[key];
            });
    
            // Ensure classId is set in the hidden input field
            form.querySelector('[name="classId"]').value = classId;
        } else {
            form.reset();
        }
        
        modal.style.display = 'block';
    }
    
    async saveClass() {
        const form = document.getElementById('classForm');
        const formData = new FormData(form);
        const classData = Object.fromEntries(formData.entries());
        
        const params = new URLSearchParams({
            classId: classData.classId || "",
            className: classData.className,
            teacherId: classData.teacherId,
            schedule: classData.schedule
        })

        const isUpdating = Boolean(classData.classId);
        const url = isUpdating
            ? `https://localhost:7112/Class/UpdateClass?${params}`
            : `https://localhost:7112/Class/InsertClass?${params}`;

        const method = isUpdating ? "PUT" : "POST";
        try{
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`Failed to ${isUpdating ? "update" : "create"} class`);
            this.closeModal('classModal');
            await this.loadClasses();
        }
        catch (error) {
            console.error(error);
        }
    }

    async deleteClass(classId) {
        if (!confirm('Bạn có chắc chắn muốn xóa lớp học này?')) return;
        
        await fetch(`https://localhost:7112/Class/DeleteClass?classID=${classId}`, { method: 'DELETE' });
        await this.loadClasses();
    }

    



    async initializeAccountManagement() {
        await this.loadAccounts();
        this.setupAccountEventListeners();
    }

    async loadAccounts() {
        const teachersResponse = await fetch('https://localhost:7112/Teacher/GetAllTeacher');
        const teachersData = await teachersResponse.json();
        const teachers = teachersData.data || [];
        const studentsResponse = await fetch('https://localhost:7112/Student/GetAllStudents');
        const studentsData = await studentsResponse.json();
        const students = studentsData.data || [];
        const adminsResponse = await fetch('https://localhost:7112/Admin/GetAllAdmins');
        const adminsData = await adminsResponse.json();
        const admins = adminsData.data || [];
        
        const accounts = [
            ...admins.map(a => ({...a, type: 'Admin'})),
            ...teachers.map(t => ({...t, type: 'Giáo viên'})),
            ...students.map(s => ({...s, type: 'Học sinh'}))
        ];
        
        const tbody = document.querySelector('#accountTable tbody');
        tbody.innerHTML = accounts.map(acc => `
            <tr>
                <td>${acc.email}</td>
                <td>${acc.type}</td>
                <td>${acc.lastName || ''} ${acc.firstName || ''}</td>
       
                <td>
                    <button onclick="adminDashboard.resetPassword('${acc.email}')" class="btn-edit">
                        <i class="fas fa-key"></i>
                    </button>
                    <button onclick="adminDashboard.toggleAccountStatus('${acc.email}')" class="btn-warning">
                        <i class="fas fa-ban"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    
    async  getSystemStats() {
        try {
            const studentsResponse = await fetch('https://localhost:7112/Student/GetAllStudents');
            const studentsData = await studentsResponse.json();
            const students = studentsData.data || [];
            
            const teachersResponse = await fetch('https://localhost:7112/Teacher/GetAllTeacher');
            const teachersData = await teachersResponse.json();
            const teachers = teachersData.data || [];

            const classesResponse = await fetch('https://localhost:7112/Class/GetAllClasses');
            const classesData = await classesResponse.json();
            const classes = classesData.data || [];
    
            return {
                students: students.length,
                teachers: teachers.length,
                classes: classes.length
            };
        } catch (error) {
            console.error("Error fetching system stats:", error);
            return { students: 0, teachers: 0, classes: 0 };
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
}

// Initialize dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
    window.adminDashboard = adminDashboard;
});