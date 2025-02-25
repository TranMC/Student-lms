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

    async loadSchedule() {
        try {
            const response = await fetch('https://api.example.com/schedule'); // Replace with your API endpoint
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const schedule = await response.json();
            this.renderSchedule(schedule);
        } catch (error) {
            console.error('Failed to load schedule:', error);
        }
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
