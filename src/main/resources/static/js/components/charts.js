//==========================
// Chart Rendering Module
//==========================

export function renderChart(chartCanvasElement, labels, eatenData, burnedData) {
    const ctx = chartCanvasElement.getContext('2d');
    let calorieTrendChart = null; // Declare the chart variable in a broader scope
    if (!ctx) return;

    // Destroy the previous chart instance if it exists to prevent glitching on re-loads
    if (calorieTrendChart) {
        calorieTrendChart.Chart.destroy();
    }

    calorieTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Calories Consumed',
                    data: eatenData,
                    borderColor: '#2ecc71', // Healthy Green
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3 // Adds a smooth curve to the line
                },
                {
                    label: 'Calories Burned',
                    data: burnedData,
                    borderColor: '#e74c3c', // Active Red
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5], // Dashed line for burned calories
                    fill: false,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 2500
                }
            }
        }
    });
}