// File theo dõi và hiển thị các thông báo console trong giao diện
console.log('Đã tải dashboard-debugger.js');

// Lưu trữ hàm console gốc
const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn
};

// Mảng lưu trữ log
const logMessages = [];

// Tạo phần tử hiển thị log
function createLogContainer() {
    const container = document.createElement('div');
    container.id = 'debug-log-container';
    container.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        width: 400px;
        height: 300px;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        overflow-y: auto;
        z-index: 9999;
        font-family: monospace;
        padding: 10px;
        border-top-left-radius: 8px;
    `;
    
    // Thêm header
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        border-bottom: 1px solid #555;
        padding-bottom: 5px;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Console Debug';
    title.style.margin = '0';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
    `;
    closeBtn.onclick = function() {
        container.style.display = 'none';
    };
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    container.appendChild(header);
    
    // Thêm nút xóa log
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Xóa log';
    clearBtn.style.cssText = `
        background: #333;
        border: none;
        color: white;
        padding: 5px 10px;
        margin-bottom: 10px;
        border-radius: 4px;
        cursor: pointer;
    `;
    clearBtn.onclick = function() {
        logContainer.innerHTML = '';
        logMessages.length = 0;
    };
    container.appendChild(clearBtn);
    
    // Thêm container cho log
    const logContainer = document.createElement('div');
    logContainer.id = 'debug-logs';
    container.appendChild(logContainer);
    
    document.body.appendChild(container);
    return logContainer;
}

// Hiển thị log trong container
function displayLogs() {
    if (!document.getElementById('debug-logs')) {
        window.logContainer = createLogContainer();
    }
    
    window.logContainer.innerHTML = '';
    logMessages.forEach(msg => {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${msg.type}`;
        logEntry.style.cssText = `
            margin-bottom: 5px;
            padding: 3px 5px;
            border-left: 3px solid ${msg.type === 'error' ? 'red' : msg.type === 'warn' ? 'orange' : 'cyan'};
        `;
        
        const timestamp = document.createElement('span');
        timestamp.textContent = msg.time;
        timestamp.style.cssText = `
            color: #aaa;
            margin-right: 5px;
            font-size: 11px;
        `;
        
        const content = document.createElement('span');
        content.textContent = msg.content;
        
        logEntry.appendChild(timestamp);
        logEntry.appendChild(content);
        window.logContainer.appendChild(logEntry);
        window.logContainer.scrollTop = window.logContainer.scrollHeight;
    });
}

// Ghi đè các phương thức console
console.log = function() {
    originalConsole.log.apply(console, arguments);
    const message = Array.from(arguments).map(arg => {
        if (typeof arg === 'object') return JSON.stringify(arg);
        return arg;
    }).join(' ');
    
    logMessages.push({
        type: 'log',
        content: message,
        time: new Date().toLocaleTimeString()
    });
    
    // Hiển thị log nếu đã tồn tại container
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        displayLogs();
    }
};

console.error = function() {
    originalConsole.error.apply(console, arguments);
    const message = Array.from(arguments).map(arg => {
        if (typeof arg === 'object') return JSON.stringify(arg);
        return arg;
    }).join(' ');
    
    logMessages.push({
        type: 'error',
        content: message,
        time: new Date().toLocaleTimeString()
    });
    
    // Hiển thị log
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        displayLogs();
    }
};

console.warn = function() {
    originalConsole.warn.apply(console, arguments);
    const message = Array.from(arguments).map(arg => {
        if (typeof arg === 'object') return JSON.stringify(arg);
        return arg;
    }).join(' ');
    
    logMessages.push({
        type: 'warn',
        content: message,
        time: new Date().toLocaleTimeString()
    });
    
    // Hiển thị log
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        displayLogs();
    }
};

// Hiển thị log khi trang đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    displayLogs();
    console.log('Debug logger đã được khởi tạo');
}); 