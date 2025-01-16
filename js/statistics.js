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
    if (scores.length === 0) return {
        average: 0,
        highest: 0,
        lowest: 0,
        passRate: 0,
        distribution: Array(10).fill(0),
        trend: []
    };

    const numericScores = scores.map(s => parseFloat(s.score));
    
    return {
        average: numericScores.reduce((a, b) => a + b) / scores.length,
        highest: Math.max(...numericScores),
        lowest: Math.min(...numericScores),
        passRate: (numericScores.filter(score => score >= 5).length / scores.length) * 100,
        distribution: Array(10).fill(0).map((_, i) => 
            numericScores.filter(score => score >= i && score < i + 1).length
        ),
        trend: scores.sort((a, b) => new Date(a.date) - new Date(b.date))
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
    
    const scores = getScoreData(classFilter, subjectFilter);
    const stats = calculateStatistics(scores);
    
    // Cập nhật số liệu tổng quan
    document.getElementById('averageScore').textContent = stats.average.toFixed(2);
    document.getElementById('highestScore').textContent = stats.highest.toFixed(2);
    document.getElementById('lowestScore').textContent = stats.lowest.toFixed(2);
    document.getElementById('passRate').textContent = `${stats.passRate.toFixed(1)}%`;
    
    // Cập nhật biểu đồ
    updateDistributionChart(stats.distribution);
    updateTrendChart(stats.trend);
    updatePassRatioChart(stats.passRate);
}

// Xử lý sự kiện lọc
document.getElementById('filterBtn').addEventListener('click', updateStatistics);

// Khởi tạo thống kê ban đầu
updateStatistics(); 