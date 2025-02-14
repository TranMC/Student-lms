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
                    { time: '08:45 - 10:15', name: 'Vật lý', room: 'A102', teacher: 'Trần Thị B' }
                ]
            },
            // Thêm các ngày khác...
        ];

        this.renderSchedule(schedule);
    }

    renderSchedule(schedule) {
        const container = document.querySelector('.schedule-container');
        if (container) {
            container.innerHTML = `
                <div class="schedule-grid">
                    ${schedule.map(day => this.renderDay(day)).join('')}
                </div>
            `;
        }
    }

    renderDay(day) {
        return `
            <div class="schedule-day">
                <h3>${day.day}</h3>
                <div class="schedule-subjects">
                    ${day.subjects.map(subject => this.renderSubject(subject)).join('')}
                </div>
            </div>
        `;
    }

    renderSubject(subject) {
        return `
            <div class="schedule-item">
                <div class="time">${subject.time}</div>
                <div class="subject-info">
                    <h4>${subject.name}</h4>
                    <p>Phòng: ${subject.room}</p>
                    <p>GV: ${subject.teacher}</p>
                </div>
            </div>
        `;
    }

    updateDateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDateTime').textContent = 
            now.toLocaleDateString('vi-VN', options);
    }

    initializeFilters() {
        // Thêm logic lọc theo tuần/tháng nếu cần
    }
} 