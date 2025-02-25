class StudentManager {
    constructor() {
        this.apiBaseUrl = 'https://api.example.com'; // Replace with your actual API base URL
        this.setupEventListeners();
        this.loadStudents();
    }

    async loadStudents() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/students`);
            const students = await response.json();
            this.renderStudents(students);
        } catch (error) {
            console.error('Failed to load students:', error);
        }
    }

    renderStudents(students) {
        const tbody = document.querySelector('#studentTable tbody');
        if (!tbody) return;

        tbody.innerHTML = students.map(student => `
            <tr>
                <td>${student.studentId}</td>
                <td>${student.fullName}</td>
                <td>${student.class}</td>
                <td>${this.calculateAverage(student.studentId)}</td>
                <td>${this.getGradeLevel(this.calculateAverage(student.studentId))}</td>
                <td>
                    <button class="btn btn-edit" onclick="studentManager.editStudent('${student.studentId}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-delete" onclick="studentManager.deleteStudent('${student.studentId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async calculateAverage(studentId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/students/${studentId}/scores`);
            const scores = await response.json();

            if (scores.length === 0) return 0;

            const weightedScores = scores.map(score => {
                let weight = 1;
                switch(score.type) {
                    case 'Miệng': weight = 1; break;
                    case '15 phút': weight = 1; break;
                    case '1 tiết': weight = 2; break;
                    case 'Giữa kỳ': weight = 2; break;
                    case 'Cuối kỳ': weight = 3; break;
                    default: weight = 1;
                }
                return { score: parseFloat(score.score), weight };
            });

            const totalWeight = weightedScores.reduce((sum, item) => sum + item.weight, 0);
            const weightedSum = weightedScores.reduce((sum, item) => sum + (item.score * item.weight), 0);

            return (weightedSum / totalWeight).toFixed(1);
        } catch (error) {
            console.error('Failed to calculate average:', error);
            return 0;
        }
    }

    getGradeLevel(average) {
        if (average >= 8.5) return 'Giỏi';
        if (average >= 7.0) return 'Khá';
        if (average >= 5.0) return 'Trung bình';
        return 'Yếu';
    }

    async filterStudents(searchText, classFilter) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/students`);
            const students = await response.json();
            const filtered = students.filter(student => {
                const matchSearch = student.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
                                  student.studentId.toLowerCase().includes(searchText.toLowerCase());
                const matchClass = !classFilter || student.class === classFilter;
                return matchSearch && matchClass;
            });
            this.renderStudents(filtered);
        } catch (error) {
            console.error('Failed to filter students:', error);
        }
    }

    async saveStudent() {
        const studentId = document.getElementById('studentId').value;
        const studentData = {
            studentId: studentId,
            fullName: document.getElementById('fullName').value,
            class: document.getElementById('class').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };

        try {
            const method = studentId ? 'PUT' : 'POST';
            const response = await fetch(`${this.apiBaseUrl}/students${studentId ? `/${studentId}` : ''}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            });
            if (!response.ok) throw new Error('Failed to save student');
            this.closeModal();
            this.loadStudents();
        } catch (error) {
            console.error('Failed to save student:', error);
        }
    }

    async deleteStudent(studentId) {
        if (!confirm('Bạn có chắc chắn muốn xóa học sinh này? Tất cả điểm của học sinh này cũng sẽ bị xóa.')) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/students/${studentId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete student');
            this.loadStudents();
        } catch (error) {
            console.error('Failed to delete student:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('searchStudent')?.addEventListener('input', (e) => {
            this.filterStudents(e.target.value, document.getElementById('classFilter').value);
        });

        document.getElementById('classFilter')?.addEventListener('change', (e) => {
            this.filterStudents(document.getElementById('searchStudent').value, e.target.value);
        });

        document.getElementById('studentForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStudent();
        });

        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
    }

    openAddStudentModal() {
        document.getElementById('modalTitle').textContent = 'Thêm Học Sinh Mới';
        document.getElementById('studentForm').reset();
        document.getElementById('studentId').disabled = false;
        document.getElementById('studentModal').style.display = 'block';
    }

    async editStudent(studentId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/students/${studentId}`);
            const student = await response.json();
            if (!student) return;

            document.getElementById('modalTitle').textContent = 'Sửa Thông Tin Học Sinh';
            document.getElementById('studentId').value = student.studentId;
            document.getElementById('studentId').disabled = true;
            document.getElementById('fullName').value = student.fullName;
            document.getElementById('class').value = student.class;
            document.getElementById('username').value = student.username;
            document.getElementById('email').value = student.email;
            document.getElementById('phone').value = student.phone || '';

            document.getElementById('studentModal').style.display = 'block';
        } catch (error) {
            console.error('Failed to edit student:', error);
        }
    }

    closeModal() {
        document.getElementById('studentModal').style.display = 'none';
    }
}

let studentManager;
document.addEventListener('DOMContentLoaded', () => {
    studentManager = new StudentManager();
    window.studentManager = studentManager;
    window.openAddStudentModal = () => studentManager.openAddStudentModal();
    window.closeModal = () => studentManager.closeModal();
});
