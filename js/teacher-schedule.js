class TeacherSchedule {
    constructor() {
        this.currentWeek = true;
        this.scheduleData = {
            current: [
                {
                    day: '05/02/2025',
                    startTime: '13:00',
                    endTime: '15:40',
                    name: 'Học máy và ứng dụng',
                    room: 'VPC2-601',
                    teacher: 'Phạm Tuấn',
                    type: 'học-máy',
                    class: '24(N09)/23CS-GM'
                },
                {
                    day: '05/02/2025',
                    startTime: '15:45',
                    endTime: '18:25',
                    name: 'Phương pháp NCKH',
                    room: 'VPC2-601',
                    teacher: 'Nguyễn Quang Trường',
                    type: 'phương-pháp',
                    class: '24(N03)/23CS-GM'
                },
                {
                    day: '06/02/2025',
                    startTime: '13:00',
                    endTime: '15:40',
                    name: 'Công nghệ phần mềm',
                    room: 'VPC2-601',
                    teacher: 'Phạm Thị Kim',
                    type: 'công-nghệ',
                    class: '24(N09)/23CS-GM'
                },
                {
                    day: '07/02/2025',
                    startTime: '13:55',
                    endTime: '15:40',
                    name: 'Học máy và ứng dụng',
                    room: 'VPC2-601',
                    teacher: 'Phạm Tuấn',
                    type: 'học-máy',
                    class: '24(N09)/23CS-GM'
                },
                {
                    day: '07/02/2025',
                    startTime: '15:45',
                    endTime: '18:25',
                    name: 'Công nghệ Web',
                    room: 'VPC2-601',
                    teacher: 'Đặng Quốc Hiển',
                    type: 'công-nghệ',
                    class: '24(N09)/23CS-GM'
                }
            ],
            next: [] // Dữ liệu tuần sau
        };
        this.init();
    }

    init() {
        this.updateDateTime();
        this.renderSchedule();
        this.initializeEvents();
        this.updateTeacherName();
    }

    updateTeacherName() {
        const welcomeElement = document.getElementById('teacherNameWelcome');
        if (welcomeElement) {
            // Đọc và parse dữ liệu từ localStorage
            const teacherData = localStorage.getItem('teacher');
            if (teacherData) {
                const teachers = JSON.parse(teacherData);
                if (Array.isArray(teachers) && teachers.length > 0) {
                    welcomeElement.textContent = teachers[0].fullName;
                    return;
                }
            }
            welcomeElement.textContent = 'Giáo viên'; // Fallback nếu không tìm thấy dữ liệu
        }
    }

    updateDateTime() {
        const dateElement = document.getElementById('currentDateTime');
        if (dateElement) {
            const now = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            dateElement.textContent = now.toLocaleDateString('vi-VN', options);
        }
    }

    initializeEvents() {
        const weekFilter = document.getElementById('weekFilter');
        if (weekFilter) {
            weekFilter.addEventListener('change', (e) => {
                this.currentWeek = e.target.value === 'current';
                this.renderSchedule();
            });
        }
    }

    renderSchedule() {
        // Xóa tất cả các slot cũ
        const cells = document.querySelectorAll('.schedule-table td:not(.time-cell)');
        cells.forEach(cell => cell.innerHTML = '');

        const schedule = this.currentWeek ? this.scheduleData.current : this.scheduleData.next;
        
        schedule.forEach(lesson => {
            const cell = this.findCell(lesson.day, lesson.startTime);
            if (cell) {
                const slot = document.createElement('div');
                slot.className = `class-slot type-${lesson.type}`;
                
                // Tính toán chiều cao của slot dựa trên thời gian
                const duration = this.calculateDuration(lesson.startTime, lesson.endTime);
                slot.style.height = `${duration * 60 - 10}px`; // Trừ đi padding
                slot.style.top = this.calculateTopPosition(lesson.startTime);
                
                slot.innerHTML = `
                    <div class="class-name">${lesson.name}</div>
                    <div class="class-info">
                        ${lesson.startTime} - ${lesson.endTime}<br>
                        Lớp: ${lesson.class}<br>
                        Phòng: ${lesson.room}
                    </div>
                `;
                cell.appendChild(slot);
            }
        });
    }

    findCell(date, time) {
        const colIndex = this.getDayIndex(date);
        const rowIndex = this.getRowIndex(time);
        const tbody = document.querySelector('.schedule-table tbody');
        if (tbody && tbody.rows[rowIndex]) {
            return tbody.rows[rowIndex].cells[colIndex];
        }
        return null;
    }

    getDayIndex(date) {
        const days = ['03/02/2025', '04/02/2025', '05/02/2025', '06/02/2025', '07/02/2025', '08/02/2025', '09/02/2025'];
        return days.indexOf(date) + 1; // +1 vì cột đầu tiên là thời gian
    }

    getRowIndex(time) {
        const hour = parseInt(time.split(':')[0]);
        return hour - 13; // 13:00 là hàng đầu tiên (index 0)
    }

    calculateDuration(start, end) {
        const [startHour, startMin] = start.split(':').map(Number);
        const [endHour, endMin] = end.split(':').map(Number);
        return (endHour - startHour) + (endMin - startMin) / 60;
    }

    calculateTopPosition(time) {
        const [hour, minute] = time.split(':').map(Number);
        const hourOffset = hour - 13; // 13:00 là điểm bắt đầu
        const minuteOffset = minute / 60;
        return `${(hourOffset + minuteOffset) * 60}px`;
    }
}

// Khởi tạo khi document ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.schedule-section')) {
        new TeacherSchedule();
    }
});