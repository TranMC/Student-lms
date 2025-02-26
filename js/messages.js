class MessageManager {
    constructor() {
        this.currentChat = null;
        this.messages = [];
        this.contacts = [];
    }

    // Load giao diện tin nhắn
    loadMessageInterface() {
        const pageContent = document.getElementById('pageContent');
        pageContent.innerHTML = `
            <div class="col-span-3">
                <div class="bg-white rounded-lg shadow-sm h-[calc(100vh-12rem)]">
                    <div class="grid grid-cols-4 h-full">
                        <!-- Contacts List -->
                        <div class="border-r border-gray-200">
                            <div class="p-4 border-b border-gray-200">
                                <div class="relative">
                                    <input type="text" placeholder="Tìm kiếm..." class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                    <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                                </div>
                            </div>
                            <div class="overflow-y-auto h-[calc(100%-4rem)]" id="contactsList">
                                <!-- Contacts will be loaded here -->
                            </div>
                        </div>

                        <!-- Chat Area -->
                        <div class="col-span-3 flex flex-col h-full">
                            <!-- Chat Header -->
                            <div class="p-4 border-b border-gray-200 flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="relative">
                                        <img src="https://ui-avatars.com/api/?name=Student&background=0D8ABC&color=fff" alt="Contact" class="w-10 h-10 rounded-full">
                                        <span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <div class="ml-3">
                                        <h3 class="font-semibold" id="chatName">Chọn một cuộc trò chuyện</h3>
                                        <p class="text-sm text-gray-500" id="chatStatus"></p>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-3">
                                    <button class="p-2 text-gray-600 hover:text-gray-800">
                                        <i class="fas fa-phone"></i>
                                    </button>
                                    <button class="p-2 text-gray-600 hover:text-gray-800">
                                        <i class="fas fa-video"></i>
                                    </button>
                                    <button class="p-2 text-gray-600 hover:text-gray-800">
                                        <i class="fas fa-info-circle"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- Messages Area -->
                            <div class="flex-1 overflow-y-auto p-4" id="messagesArea">
                                <!-- Messages will be loaded here -->
                            </div>

                            <!-- Message Input -->
                            <div class="p-4 border-t border-gray-200">
                                <form id="messageForm" class="flex items-center space-x-4">
                                    <button type="button" class="text-gray-500 hover:text-gray-700">
                                        <i class="fas fa-paperclip text-xl"></i>
                                    </button>
                                    <input type="text" placeholder="Nhập tin nhắn..." class="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500">
                                    <button type="submit" class="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">
                                        <i class="fas fa-paper-plane"></i>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initializeMessageHandlers();
        this.loadContacts();
    }

    // Initialize message handlers
    initializeMessageHandlers() {
        const messageForm = document.getElementById('messageForm');
        messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = messageForm.querySelector('input');
            if (input.value.trim()) {
                this.sendMessage(input.value);
                input.value = '';
            }
        });
    }

    // Load contacts
    async loadContacts() {
        try {
            // Simulate API call
            const contacts = [
                {
                    id: 1,
                    name: 'Nguyễn Văn A',
                    class: '10A1',
                    avatar: 'https://ui-avatars.com/api/?name=NVA&background=0D8ABC&color=fff',
                    status: 'online',
                    lastMessage: 'Em có thắc mắc về bài tập thầy ạ',
                    unread: 2,
                    timestamp: '10:30'
                },
                {
                    id: 2,
                    name: 'Trần Thị B',
                    class: '10A2',
                    avatar: 'https://ui-avatars.com/api/?name=TTB&background=4F46E5&color=fff',
                    status: 'offline',
                    lastMessage: 'Dạ em cảm ơn thầy',
                    unread: 0,
                    timestamp: '09:15'
                }
            ];

            this.contacts = contacts;
            this.renderContacts();
        } catch (error) {
            console.error('Lỗi khi tải danh sách liên hệ:', error);
            showToast('Không thể tải danh sách liên hệ', 'error');
        }
    }

    // Render contacts
    renderContacts() {
        const container = document.getElementById('contactsList');
        container.innerHTML = this.contacts.map(contact => `
            <div class="contact-item p-4 hover:bg-gray-50 cursor-pointer ${this.currentChat === contact.id ? 'bg-blue-50' : ''}" 
                 onclick="messageManager.openChat(${contact.id})">
                <div class="flex items-center space-x-3">
                    <div class="relative">
                        <img src="${contact.avatar}" alt="${contact.name}" class="w-12 h-12 rounded-full">
                        <span class="absolute bottom-0 right-0 w-3 h-3 ${contact.status === 'online' ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white rounded-full"></span>
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <h4 class="font-semibold">${contact.name}</h4>
                            <span class="text-xs text-gray-500">${contact.timestamp}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <p class="text-sm text-gray-600 truncate">${contact.lastMessage}</p>
                            ${contact.unread ? `
                                <span class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                    ${contact.unread}
                                </span>
                            ` : ''}
                        </div>
                        <p class="text-xs text-gray-500">${contact.class}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Open chat
    async openChat(contactId) {
        this.currentChat = contactId;
        this.renderContacts(); // Update selected state

        const contact = this.contacts.find(c => c.id === contactId);
        document.getElementById('chatName').textContent = contact.name;
        document.getElementById('chatStatus').textContent = contact.status === 'online' ? 'Đang hoạt động' : 'Không hoạt động';

        try {
            // Simulate API call
            const messages = [
                {
                    id: 1,
                    senderId: contactId,
                    content: 'Em chào thầy ạ',
                    timestamp: '10:25'
                },
                {
                    id: 2,
                    senderId: 'teacher',
                    content: 'Chào em, có gì thầy giúp được không?',
                    timestamp: '10:26'
                },
                {
                    id: 3,
                    senderId: contactId,
                    content: 'Em có thắc mắc về bài tập thầy giao ạ',
                    timestamp: '10:28'
                }
            ];

            this.messages = messages;
            this.renderMessages();
        } catch (error) {
            console.error('Lỗi khi tải tin nhắn:', error);
            showToast('Không thể tải tin nhắn', 'error');
        }
    }

    // Render messages
    renderMessages() {
        const container = document.getElementById('messagesArea');
        container.innerHTML = this.messages.map(message => `
            <div class="flex ${message.senderId === 'teacher' ? 'justify-end' : 'justify-start'} mb-4">
                <div class="flex items-end ${message.senderId === 'teacher' ? 'flex-row-reverse' : ''}">
                    <img src="${message.senderId === 'teacher' ? 
                        'https://ui-avatars.com/api/?name=Teacher&background=4F46E5&color=fff' : 
                        this.contacts.find(c => c.id === message.senderId).avatar
                    }" 
                    alt="Avatar" class="w-8 h-8 rounded-full ${message.senderId === 'teacher' ? 'ml-2' : 'mr-2'}">
                    <div class="${message.senderId === 'teacher' ? 
                        'bg-blue-500 text-white' : 
                        'bg-gray-100 text-gray-800'
                    } rounded-lg p-3 max-w-md">
                        <p>${message.content}</p>
                        <span class="text-xs ${message.senderId === 'teacher' ? 
                            'text-blue-100' : 
                            'text-gray-500'
                        } block mt-1">${message.timestamp}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    // Send message
    async sendMessage(content) {
        if (!this.currentChat) {
            showToast('Vui lòng chọn một cuộc trò chuyện', 'error');
            return;
        }

        try {
            // Simulate API call
            const newMessage = {
                id: this.messages.length + 1,
                senderId: 'teacher',
                content: content,
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            };

            this.messages.push(newMessage);
            this.renderMessages();
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            showToast('Không thể gửi tin nhắn', 'error');
        }
    }
}

// Initialize manager
const messageManager = new MessageManager(); 