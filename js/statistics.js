// Kiểm tra đăng nhập
const teacher = checkTeacherAuth();

// Khởi tạo biểu đồ
let distributionChart, trendChart, passRatioChart;

// Hàm lấy dữ liệu điểm từ localStorage
function getScoreData(classFilter = '', subjectFilter = '') {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    return scores.filter(score => {
        const classMatch = !classFilter || score.class === classFilter;
        const subjectMatch = !subjectFilter || score.subject === subjectFilter;
        return classMatch && subjectMatch && score.teacherId === teacher.username;
    });
}

// Hàm tính toán thống kê
function calculateStatistics(scores) {
    if (scores.length === 0) {
        return {
            average: 0,
            highest: 0,
            lowest: 0,
            passRate: 0,
            distribution: Array(10).fill(0),
            trend: { dates: [], averages: [] }
        };
    }

    const numericScores = scores.map(s => parseFloat(s.score));
    
    // Tính phân bố điểm
    const distribution = Array(10).fill(0);
    numericScores.forEach(score => {
        const index = Math.min(Math.floor(score), 9);
        distribution[index]++;
    });

    // Tính xu hướng điểm theo thời gian
    const scoresByDate = {};
    scores.forEach(score => {
        const date = score.date.split('T')[0];
        if (!scoresByDate[date]) {
            scoresByDate[date] = [];
        }
        scoresByDate[date].push(parseFloat(score.score));
    });

    const trend = {
        dates: Object.keys(scoresByDate).sort(),
        averages: []
    };

    trend.dates.forEach(date => {
        const avg = scoresByDate[date].reduce((a, b) => a + b) / scoresByDate[date].length;
        trend.averages.push(avg);
    });

    return {
        average: numericScores.reduce((a, b) => a + b) / numericScores.length,
        highest: Math.max(...numericScores),
        lowest: Math.min(...numericScores),
        passRate: (numericScores.filter(score => score >= 5).length / numericScores.length) * 100,
        distribution: distribution,
        trend: trend
    };
}

// Hàm cập nhật biểu đồ phân bố điểm
function updateDistributionChart(distribution) {
    if (distributionChart) distributionChart.destroy();
    
    distributionChart = new Chart(document.getElementById('scoreDistribution'), {
        type: 'bar',
        data: {
            labels: ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10'],
            datasets: [{
                label: 'Số học sinh',
                data: distribution,
                backgroundColor: '#1a73e8'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Phân bố điểm số'
                }
            }
        }
    });
}

// Hàm cập nhật biểu đồ xu hướng điểm
function updateTrendChart(trend) {
    if (trendChart) trendChart.destroy();
    
    const dates = trend.map(score => score.date);
    const scores = trend.map(score => score.score);
    
    trendChart = new Chart(document.getElementById('scoreTrend'), {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Điểm số',
                data: scores,
                borderColor: '#34c759',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Xu hướng điểm theo thời gian'
                }
            }
        }
    });
}

// Hàm cập nhật biểu đồ tỷ lệ đạt/không đạt
function updatePassRatioChart(passRate) {
    if (passRatioChart) passRatioChart.destroy();
    
    passRatioChart = new Chart(document.getElementById('passRatio'), {
        type: 'doughnut',
        data: {
            labels: ['Đạt', 'Không đạt'],
            datasets: [{
                data: [passRate, 100 - passRate],
                backgroundColor: ['#34c759', '#ff3b30']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Tỷ lệ đạt/không đạt'
                }
            }
        }
    });
}

// Hàm cập nhật tất cả thống kê
function updateStatistics() {
    const classFilter = document.getElementById('classFilter').value;
    const subjectFilter = document.getElementById('subjectFilter').value;
    
    // Lấy dữ liệu điểm từ localStorage
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    const filteredScores = scores.filter(score => {
        const classMatch = !classFilter || score.class === classFilter;
        const subjectMatch = !subjectFilter || score.subject === subjectFilter;
        return classMatch && subjectMatch;
    });

    // Tính toán thống kê
    const stats = calculateStatistics(filteredScores);
    
    // Cập nhật UI
    updateCharts(stats);
    updateSummary(stats);
}

// Xử lý sự kiện lọc
document.getElementById('filterBtn').addEventListener('click', updateStatistics);

// Khởi tạo thống kê ban đầu
updateStatistics();

function initializeStatisticsPage() {
    // Khởi tạo biểu đồ
    initializeCharts();
    
    // Xử lý sự kiện lọc
    document.getElementById('filterBtn').addEventListener('click', updateStatistics);
    
    // Load dữ liệu ban đầu
    updateStatistics();
}

function initializeCharts() {
    // Khởi tạo biểu đồ phân bố điểm
    const distributionCtx = document.getElementById('scoreDistribution').getContext('2d');
    window.distributionChart = new Chart(distributionCtx, {
        type: 'bar',
        data: {
            labels: ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10'],
            datasets: [{
                label: 'Số học sinh',
                data: Array(10).fill(0),
                backgroundColor: '#1a73e8'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Phân bố điểm số'
                }
            }
        }
    });

    // Khởi tạo biểu đồ xu hướng điểm
    const trendCtx = document.getElementById('scoreTrend').getContext('2d');
    window.trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Điểm trung bình',
                data: [],
                borderColor: '#34c759',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Xu hướng điểm theo thời gian'
                }
            }
        }
    });

    // Khởi tạo biểu đồ tỷ lệ đạt/không đạt
    const ratioCtx = document.getElementById('passRatio').getContext('2d');
    window.passRatioChart = new Chart(ratioCtx, {
        type: 'doughnut',
        data: {
            labels: ['Đạt', 'Không đạt'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#34c759', '#ff3b30']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Tỷ lệ đạt/không đạt'
                }
            }
        }
    });
}

function updateCharts(stats) {
    // Cập nhật biểu đồ phân bố
    window.distributionChart.data.datasets[0].data = stats.distribution;
    window.distributionChart.update();

    // Cập nhật biểu đồ xu hướng
    window.trendChart.data.labels = stats.trend.dates;
    window.trendChart.data.datasets[0].data = stats.trend.averages;
    window.trendChart.update();

    // Cập nhật biểu đồ tỷ lệ đạt/không đạt
    window.passRatioChart.data.datasets[0].data = [
        stats.passRate,
        100 - stats.passRate
    ];
    window.passRatioChart.update();
}

function updateSummary(stats) {
    document.getElementById('averageScore').textContent = stats.average.toFixed(2);
    document.getElementById('highestScore').textContent = stats.highest.toFixed(2);
    document.getElementById('lowestScore').textContent = stats.lowest.toFixed(2);
    document.getElementById('passRate').textContent = `${stats.passRate.toFixed(1)}%`;
}

// Định nghĩa class trước khi sử dụng
window.StatisticsManager = class StatisticsManager {
    constructor() {
        console.log('StatisticsManager initialized');
        // Đợi một chút để DOM được cập nhật
        setTimeout(() => {
            this.initializeCharts();
            this.setupEventListeners();
            this.updateStatistics();
        }, 100);
    }

    setupEventListeners() {
        const filterBtn = document.getElementById('filterBtn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.updateStatistics());
        }
    }

    initializeCharts() {
        try {
            console.log('Initializing charts...');
            
            // Phân bố điểm
            const distributionCtx = document.getElementById('scoreDistribution');
            if (distributionCtx) {
                console.log('Creating score distribution chart');
                this.scoreDistribution = new Chart(distributionCtx, {
                    type: 'bar',
                    data: {
                        labels: ['0-2', '2-4', '4-6', '6-8', '8-10'],
                        datasets: [{
                            label: 'Số học sinh',
                            data: [0, 0, 0, 0, 0],
                            backgroundColor: '#3b82f6'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
            }

            // Xu hướng điểm
            const trendCtx = document.getElementById('scoreTrend');
            if (trendCtx) {
                console.log('Creating score trend chart');
                this.scoreTrend = new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Điểm trung bình',
                            data: [],
                            borderColor: '#3b82f6',
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
            }

            // Tỷ lệ đạt/không đạt
            const ratioCtx = document.getElementById('passRatio');
            if (ratioCtx) {
                console.log('Creating pass ratio chart');
                this.passRatio = new Chart(ratioCtx, {
                    type: 'pie',
                    data: {
                        labels: ['Đạt', 'Không đạt'],
                        datasets: [{
                            data: [0, 0],
                            backgroundColor: ['#22c55e', '#ef4444']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                });
            }

            console.log('Charts initialized successfully');
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    updateStatistics() {
        try {
            console.log('Updating statistics...');
            const scores = JSON.parse(localStorage.getItem('scores') || '[]');
            const students = JSON.parse(localStorage.getItem('students') || '[]');

            console.log('Found scores:', scores.length);
            console.log('Found students:', students.length);

            // Lọc điểm theo lớp và môn học
            let filteredScores = [...scores];
            const classFilter = document.getElementById('classFilter')?.value;
            const subjectFilter = document.getElementById('subjectFilter')?.value;

            if (classFilter) {
                filteredScores = filteredScores.filter(score => {
                    const student = students.find(s => s.studentId === score.studentId);
                    return student && student.class === classFilter;
                });
            }

            if (subjectFilter) {
                filteredScores = filteredScores.filter(score => score.subject === subjectFilter);
            }

            console.log('Filtered scores:', filteredScores.length);

            this.updateScoreDistribution(filteredScores);
            this.updateScoreTrend(filteredScores);
            this.updatePassRatio(filteredScores);
            this.updateSummary(filteredScores);
        } catch (error) {
            console.error('Error updating statistics:', error);
        }
    }

    updateScoreDistribution(scores) {
        if (!this.scoreDistribution) {
            console.error('Score distribution chart not initialized');
            return;
        }

        const distribution = [0, 0, 0, 0, 0];
        scores.forEach(score => {
            const value = parseFloat(score.score);
            if (value >= 0 && value < 2) distribution[0]++;
            else if (value < 4) distribution[1]++;
            else if (value < 6) distribution[2]++;
            else if (value < 8) distribution[3]++;
            else if (value <= 10) distribution[4]++;
        });

        this.scoreDistribution.data.datasets[0].data = distribution;
        this.scoreDistribution.update();
        console.log('Score distribution updated:', distribution);
    }

    updateScoreTrend(scores) {
        if (!this.scoreTrend) {
            console.error('Score trend chart not initialized');
            return;
        }

        const sortedScores = scores.sort((a, b) => new Date(a.date) - new Date(b.date));
        const dailyAverages = {};

        sortedScores.forEach(score => {
            const date = score.date.split('T')[0];
            if (!dailyAverages[date]) {
                dailyAverages[date] = { sum: 0, count: 0 };
            }
            dailyAverages[date].sum += parseFloat(score.score);
            dailyAverages[date].count++;
        });

        const labels = Object.keys(dailyAverages);
        const data = labels.map(date => 
            (dailyAverages[date].sum / dailyAverages[date].count).toFixed(1)
        );

        this.scoreTrend.data.labels = labels;
        this.scoreTrend.data.datasets[0].data = data;
        this.scoreTrend.update();
        console.log('Score trend updated:', data);
    }

    updatePassRatio(scores) {
        if (!this.passRatio) {
            console.error('Pass ratio chart not initialized');
            return;
        }

        const passCount = scores.filter(score => parseFloat(score.score) >= 5).length;
        const failCount = scores.length - passCount;

        this.passRatio.data.datasets[0].data = [passCount, failCount];
        this.passRatio.update();
        console.log('Pass ratio updated:', [passCount, failCount]);
    }

    updateSummary(scores) {
        try {
            const average = scores.length > 0 
                ? (scores.reduce((sum, score) => sum + parseFloat(score.score), 0) / scores.length).toFixed(1)
                : 0;

            const scoreValues = scores.map(score => parseFloat(score.score));
            const highest = scores.length > 0 ? Math.max(...scoreValues) : 0;
            const lowest = scores.length > 0 ? Math.min(...scoreValues) : 0;
            const passCount = scores.filter(score => parseFloat(score.score) >= 5).length;
            const passRate = scores.length > 0 ? ((passCount / scores.length) * 100).toFixed(1) : 0;

            document.getElementById('averageScore').textContent = average;
            document.getElementById('highestScore').textContent = highest.toFixed(1);
            document.getElementById('lowestScore').textContent = lowest.toFixed(1);
            document.getElementById('passRate').textContent = `${passRate}%`;

            console.log('Summary updated:', { average, highest, lowest, passRate });
        } catch (error) {
            console.error('Error updating summary:', error);
        }
    }
}

// Không tự động khởi tạo ở đây nữa
console.log('StatisticsManager defined');

function initializeStatistics() {
    // Lắng nghe sự kiện cập nhật dữ liệu
    document.addEventListener('dashboard-data-updated', (event) => {
        updateStatisticsView(event.detail);
    });
    
    // Lấy dữ liệu ban đầu
    const data = DataService.getDashboardData();
    if (data) {
        updateStatisticsView(data);
    }
}

function updateStatisticsView(data) {
    // Cập nhật giao diện thống kê với dữ liệu mới
    // ... code cập nhật biểu đồ và bảng thống kê
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Kiểm tra thông tin giáo viên trong sessionStorage
        const teacherData = sessionStorage.getItem('teacherData');
        if (!teacherData) {
            window.location.href = 'teacher-login.html';
            return;
        }
        // Lấy dữ liệu dashboard từ DataService
        const data = await DataService.fetchDashboardData();
        console.log("Data loaded for statistics:", data);
        
        // Cập nhật nội dung thống kê
        updateStatisticsView(data.statistics);
        
        // Tạo biểu đồ thống kê với dữ liệu
        initializeCharts(data);
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu thống kê:", error);
    }
});

function updateStatisticsView(statistics) {
    if (!statistics) return;
    const totalStudentsElement = document.getElementById('totalStudents');
    const averageElement = document.getElementById('averageScore');
    const passRateElement = document.getElementById('passRate');

    if (totalStudentsElement) {
        totalStudentsElement.textContent = statistics.totalStudents;
    }
    if (averageElement) {
        averageElement.textContent = statistics.averageScore;
    }
    if (passRateElement) {
        passRateElement.textContent = `${statistics.passRate}%`;
    }
}

function initializeCharts(data) {
    // Lấy danh sách điểm từ data, nếu không có thì dùng mảng rỗng
    const scores = data.scores || [];

    // ---------------------------
    // Biểu đồ phân bố điểm
    // ---------------------------
    const distributionCtx = document.getElementById('scoreDistribution');
    const distribution = Array(10).fill(0);
    scores.forEach(s => {
        const scoreValue = parseFloat(s.score);
        if (!isNaN(scoreValue)) {
            const idx = Math.min(Math.floor(scoreValue), 9);
            distribution[idx]++;
        }
    });
    if (distributionCtx) {
        new Chart(distributionCtx, {
            type: 'bar',
            data: {
                labels: distribution.map((_, i) => `${i}-${i+1}`),
                datasets: [{
                    label: 'Phân bố điểm',
                    data: distribution,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // ---------------------------
    // Biểu đồ xu hướng điểm theo ngày
    // ---------------------------
    const trendCtx = document.getElementById('scoreTrend');
    const scoresByDate = {};
    scores.forEach(s => {
        const date = s.date;
        const scoreValue = parseFloat(s.score);
        if (!isNaN(scoreValue)) {
            if (!scoresByDate[date]) scoresByDate[date] = [];
            scoresByDate[date].push(scoreValue);
        }
    });
    const trendDates = Object.keys(scoresByDate).sort();
    const trendAverages = trendDates.map(date => {
        const list = scoresByDate[date];
        return (list.reduce((sum, val) => sum + val, 0) / list.length).toFixed(1);
    });
    if (trendCtx) {
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: trendDates,
                datasets: [{
                    label: 'Xu hướng điểm',
                    data: trendAverages,
                    fill: false,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    tension: 0.1
                }]
            },
            options: {}
        });
    }

    // ---------------------------
    // Biểu đồ tỷ lệ đạt/không đạt
    // ---------------------------
    const passRatioCtx = document.getElementById('passRatioChart'); // Đảm bảo có thẻ canvas có ID này trong HTML
    const validScores = scores.filter(s => !isNaN(parseFloat(s.score)));
    const passCount = validScores.filter(s => parseFloat(s.score) >= 5).length;
    const failCount = validScores.length - passCount;
    if (passRatioCtx) {
        new Chart(passRatioCtx, {
            type: 'doughnut',
            data: {
                labels: ['Đạt', 'Không đạt'],
                datasets: [{
                    data: [passCount, failCount],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 99, 132, 0.2)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {}
        });
    }
} 