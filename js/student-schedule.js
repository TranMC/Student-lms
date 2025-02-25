class StudentSchedule {
    constructor() {
        this.student = JSON.parse(localStorage.getItem('currentStudent'));
        this.init();
    }

    init() {
        this.loadSchedule();
        this.updateDateTime();
        this.initializeFilters();
    }

    loadSchedule() {
        // Giả lập dữ liệu lịch học (sau này có thể lấy từ API)
        const schedule = [
            {
                day: 'Thứ 2',
                subjects: [
                    { time: '07:00 - 08:30', name: 'Toán học', room: 'A101', teacher: 'Nguyễn Văn A' },
                    { time: '08:45 - 10:15', name: 'Vật lý', room: 'A102', teacher: 'Trần Thị B' },
                    { time: '10:30 - 12:00', name: 'Hóa học', room: 'A103', teacher: 'Lê Văn C' }
                ]
            },
            {
                day: 'Thứ 3',
                subjects: [
                    { time: '07:00 - 08:30', name: 'Ngữ văn', room: 'B201', teacher: 'Phạm Thị D' },
                    { time: '08:45 - 10:15', name: 'Tiếng Anh', room: 'B202', teacher: 'Trần Văn E' },
                    { time: '10:30 - 12:00', name: 'Sinh học', room: 'B203', teacher: 'Nguyễn Thị F' }
                ]
            },
            {
                day: 'Thứ 4',
                subjects: [
                    { time: '07:00 - 08:30', name: 'Địa lý', room: 'C301', teacher: 'Lê Thị G' },
                    { time: '08:45 - 10:15', name: 'Lịch sử', room: 'C302', teacher: 'Phạm Văn H' },
                    { time: '10:30 - 12:00', name: 'GDCD', room: 'C303', teacher: 'Trần Thị I' }
                ]
            },
            {
                day: 'Thứ 5',
                subjects: [
                    { time: '07:00 - 08:30', name: 'Toán học', room: 'A101', teacher: 'Nguyễn Văn A' },
                    { time: '08:45 - 10:15', name: 'Tin học', room: 'D401', teacher: 'Lê Văn J' },
                    { time: '10:30 - 12:00', name: 'Thể dục', room: 'Sân trường', teacher: 'Nguyễn Văn K' }
                ]
            },
            {
                day: 'Thứ 6',
                subjects: [
                    { time: '07:00 - 08:30', name: 'Vật lý', room: 'A102', teacher: 'Trần Thị B' },
                    { time: '08:45 - 10:15', name: 'Hóa học', room: 'A103', teacher: 'Lê Văn C' },
                    { time: '10:30 - 12:00', name: 'Tiếng Anh', room: 'B202', teacher: 'Trần Văn E' }
                ]
            }
        ];

        this.renderSchedule(schedule);
    }

    renderSchedule(schedule) {
        const container = document.querySelector('.schedule-container');
        if (container) {
            container.innerHTML = `
                <div class="schedule-header">
                    <h2>Lịch học trong tuần</h2>
                </div>
                ${schedule.map(day => this.renderDay(day)).join('')}
            `;
        }
    }

    renderDay(day) {
        return `
            <div class="day-schedule">
                <h3 class="day-header">${day.day}</h3>
                <div class="class-list">
                    ${day.subjects.map(subject => this.renderSubject(subject)).join('')}
                </div>
            </div>
        `;
    }

    renderSubject(subject) {
        return `
            <div class="class-slot">
                <span class="class-time">${subject.time}</span>
                <div class="class-details">
                    <span class="class-name">${subject.name}</span>
                    <div class="class-info-row">
                        <span class="class-info"><i class="fas fa-door-open"></i> ${subject.room}</span>
                        <span class="class-teacher"><i class="fas fa-chalkboard-teacher"></i> ${subject.teacher}</span>
                    </div>
                </div>
            </div>
        `;
    }

    updateDateTime() {
        const dateTimeElement = document.getElementById('currentDateTime');
        if (dateTimeElement) {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            dateTimeElement.textContent = now.toLocaleDateString('vi-VN', options);
        }
    }

    initializeFilters() {
        // Thêm logic lọc theo tuần/tháng nếu cần
    }

    renderClassSlot(lesson) {
        return `
            <div class="class-slot">
                <div class="class-name">
                    ${lesson.subject}
                </div>
                <div class="class-time">
                    ${lesson.startTime} - ${lesson.endTime}
                </div>
                <div class="class-info">
                    <div class="class-room">
                        <i class="fas fa-door-open"></i>
                        Phòng: ${lesson.room}
                    </div>
                    <div class="class-teacher">
                        <i class="fas fa-chalkboard-teacher"></i>
                        GV: ${lesson.teacher}
                    </div>
                </div>
            </div>
        `;
    }
} 