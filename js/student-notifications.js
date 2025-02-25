class StudentNotifications {
    constructor() {
        this.student = null; // Assuming student data will be fetched from an API as well
        this.init();
    }

    async init() {
        await this.loadStudentData();
        await this.loadNotifications();
    }

    async loadStudentData() {
        try {
            const response = await fetch('https://api.example.com/currentStudent');
            if (response.ok) {
                this.student = await response.json();
            } else {
                console.error('Failed to load student data');
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        }
    }

    async loadNotifications() {
        try {
            const response = await fetch('https://api.example.com/notifications');
            if (response.ok) {
                const notifications = await response.json();
                this.renderNotifications(notifications);
            } else {
                console.error('Failed to load notifications');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }

    renderNotifications(notifications) {
        const container = document.querySelector('.notifications-container');
        if (container) {
            container.innerHTML = `
                <div class="notifications-list">
                    ${notifications.map(notif => this.renderNotification(notif)).join('')}
                </div>
            `;
        }
    }

    renderNotification(notification) {
        return `
            <div class="notification-item ${notification.isRead ? 'read' : 'unread'}">
                <div class="notification-content">
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <small>${new Date(notification.date).toLocaleDateString('vi-VN')}</small>
                </div>
                <div class="notification-actions">
                    <button class="btn btn-sm btn-primary" onclick="studentNotifications.markAsRead(${notification.id})">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            </div>
        `;
    }

    async markAsRead(notificationId) {
        try {
            const response = await fetch(`https://api.example.com/notifications/${notificationId}/markAsRead`, {
                method: 'POST'
            });
            if (response.ok) {
                // Update the UI or re-fetch notifications if needed
                await this.loadNotifications();
            } else {
                console.error('Failed to mark notification as read');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }
}

const studentNotifications = new StudentNotifications();