class StudentNotifications {
    constructor() {
        this.student = JSON.parse(localStorage.getItem('currentStudent'));
        this.init();
    }

    init() {
        this.loadNotifications();
    }

    loadNotifications() {
        // Giả lập dữ liệu thông báo (sau này có thể lấy từ API)
        const notifications = [
            {
                id: 1,
                title: 'Lịch kiểm tra giữa kỳ',
                message: 'Lịch kiểm tra giữa kỳ học kỳ 2 đã được cập nhật',
                date: '2024-03-15',
                isRead: false
            },
            // Thêm các thông báo khác...
        ];

        this.renderNotifications(notifications);
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

    markAsRead(notificationId) {
        // Cập nhật trạng thái đã đọc
        // Sau này có thể gọi API để cập nhật
    }
} 