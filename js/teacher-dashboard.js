class TeacherDashboard {
    constructor() {
        this.initializeDashboard();
    }

    async initializeDashboard() {
        try {
            // Fetch teacher data from API
            const response = await fetch('/api/teacher');
            const teacher = await response.json();
            console.log('Fetched teacher data:', teacher);

            // If teacher is an array, take the first element
            const teacherInfo = Array.isArray(teacher) ? teacher[0] : teacher;
            console.log('Teacher info to use:', teacherInfo);

            const welcomeElement = document.getElementById('teacherNameWelcome');
            const headerElement = document.getElementById('teacherName');
            
            if (welcomeElement) {
                welcomeElement.textContent = teacherInfo.fullName || 'Giáo viên';
            }
            if (headerElement) {
                headerElement.textContent = teacherInfo.fullName || 'Giáo viên';
            }

            const data = await DataService.fetchDashboardData();
            this.updateDashboardView(data);
            
            // Update time
            this.updateDateTime();
            setInterval(() => this.updateDateTime(), 60000);
            
            // Listen for update events
            document.addEventListener('dashboard-data-updated', (event) => {
                this.updateDashboardView(event.detail);
            });
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            console.error('Error details:', error.message);
        }
    }

    updateDashboardView(data) {
        // Update teacher name
        const welcomeElement = document.getElementById('teacherNameWelcome');
        const headerElement = document.getElementById('teacherName');
        
        if (welcomeElement) welcomeElement.textContent = data.teacher.fullName;
        if (headerElement) headerElement.textContent = data.teacher.fullName;

        // Update statistics
        const { statistics } = data;
        const totalStudentsElement = document.getElementById('totalStudents');
        const averageElement = document.getElementById('averageScore');
        const passRateElement = document.getElementById('passRate');

        if (totalStudentsElement) totalStudentsElement.textContent = statistics.totalStudents;
        if (averageElement) averageElement.textContent = statistics.averageScore;
        if (passRateElement) passRateElement.textContent = `${statistics.passRate}%`;

        // Update recent scores
        this.updateRecentScores(data.recentScores);
        
        // Update schedule
        this.updateSchedule(data.schedule);
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

    updateRecentScores(scores) {
        const recentScoresContainer = document.getElementById('recentScores');
        if (recentScoresContainer) {
            recentScoresContainer.innerHTML = scores.map(score => `
                <div class="score-item">
                    <div class="score-info">
                        <div class="score-student">${score.studentName}</div>
                        <div class="score-details">
                            ${score.subject} - ${score.type} - ${new Date(score.date).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                    <div class="score-value">${score.score}</div>
                </div>
            `).join('');
        }
    }

    updateSchedule(schedule) {
        const scheduleContainer = document.getElementById('todaySchedule');
        if (scheduleContainer) {
            scheduleContainer.innerHTML = schedule.map(item => `
                <div class="schedule-item">
                    <div class="schedule-time">${item.time}</div>
                    <div class="schedule-info">
                        <div class="schedule-class">${item.class}</div>
                        <div class="schedule-subject">${item.subject}</div>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Initialize dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TeacherDashboard();
});
