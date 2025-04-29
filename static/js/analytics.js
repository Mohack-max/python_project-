document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
});

function initializeCharts() {
    // Task Distribution Chart
    const distributionCtx = document.getElementById('taskDistributionChart');
    if (distributionCtx) {
        new Chart(distributionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
                datasets: [{
                    data: taskDistributionData,
                    backgroundColor: ['#28a745', '#ffc107', '#17a2b8', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Weekly Progress Chart
    const weeklyCtx = document.getElementById('weeklyProgressChart');
    if (weeklyCtx) {
        new Chart(weeklyCtx, {
            type: 'line',
            data: {
                labels: weeklyLabels,
                datasets: [{
                    label: 'Tasks Completed',
                    data: weeklyData,
                    borderColor: '#4CAF50',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // Time Analysis Chart
    const timeCtx = document.getElementById('timeAnalysisChart');
    if (timeCtx) {
        new Chart(timeCtx, {
            type: 'bar',
            data: {
                labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
                datasets: [{
                    label: 'Task Completion Time',
                    data: timeAnalysisData,
                    backgroundColor: ['#FF9800', '#2196F3', '#9C27B0', '#607D8B']
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}