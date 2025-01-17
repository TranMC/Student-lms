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