document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const inputs = [
        'initialSavings', 'monthlyContribution', 'annualReturn', 
        'annualWithdrawal', 'currentAge', 'inflationRate'
    ];
    
    const elements = {};
    inputs.forEach(id => {
        elements[id] = document.getElementById(id);
        elements[`${id}Val`] = document.getElementById(`${id}Val`);
    });

    const fireAgeEl = document.getElementById('fireAge');
    const yearsToFireEl = document.getElementById('yearsToFire');
    const targetNetWorthEl = document.getElementById('targetNetWorth');
    const ctx = document.getElementById('fireChart').getContext('2d');

    let fireChart;

    // Initialize Chart
    function initChart() {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        fireChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: '総資産 (万円)',
                        data: [],
                        borderColor: '#10b981',
                        borderWidth: 3,
                        backgroundColor: gradient,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                    },
                    {
                        label: 'FIRE目標額 (万円)',
                        data: [],
                        borderColor: '#fbbf24',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                        },
                        ticks: {
                            color: '#94a3b8',
                            callback: value => value.toLocaleString() + '万'
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: '#94a3b8',
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 10
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#f8fafc',
                            usePointStyle: true,
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#f8fafc',
                        bodyColor: '#f8fafc',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y.toLocaleString() + ' 万円';
                            }
                        }
                    }
                }
            }
        });
    }

    function calculate() {
        const initial = parseFloat(elements.initialSavings.value);
        const monthly = parseFloat(elements.monthlyContribution.value);
        const rate = parseFloat(elements.annualReturn.value) / 100 / 12;
        const withdrawal = parseFloat(elements.annualWithdrawal.value);
        const startAge = parseInt(elements.currentAge.value);
        const inflation = parseFloat(elements.inflationRate.value) / 100 / 12;

        let currentWealth = initial;
        let labels = [];
        let wealthData = [];
        let targetData = [];
        
        let fireYear = -1;
        let targetNetWorth = withdrawal * 25; // 4% rule baseline

        // Simulate up to 100 years old
        for (let month = 0; month <= (100 - startAge) * 12; month++) {
            const year = Math.floor(month / 12);
            const age = startAge + year;

            // Update Target Net Worth for Inflation
            const currentTarget = targetNetWorth * Math.pow(1 + inflation, month);

            if (month % 12 === 0) {
                labels.push(`${age}歳`);
                wealthData.push(Math.round(currentWealth));
                targetData.push(Math.round(currentTarget));
            }

            // Check for FIRE
            if (fireYear === -1 && currentWealth >= currentTarget) {
                fireYear = year;
                fireAgeEl.textContent = `${age}歳`;
                yearsToFireEl.textContent = `${year}年`;
                targetNetWorthEl.textContent = `${Math.round(currentTarget).toLocaleString()}万円`;
            }

            // Compound Interest + Contribution
            currentWealth = (currentWealth + monthly) * (1 + rate);
        }

        if (fireYear === -1) {
            fireAgeEl.textContent = '未達成';
            yearsToFireEl.textContent = '---';
            targetNetWorthEl.textContent = `${Math.round(targetNetWorth * Math.pow(1 + (parseFloat(elements.inflationRate.value)/100), 100-startAge)).toLocaleString()}万円`;
        }

        // Update Chart
        fireChart.data.labels = labels;
        fireChart.data.datasets[0].data = wealthData;
        fireChart.data.datasets[1].data = targetData;
        fireChart.update('none'); // Update without animation for smoother real-time dragging
    }

    // Update display values and recalculate
    function handleInput(e) {
        const id = e.target.id;
        if (elements[`${id}Val`]) {
            elements[`${id}Val`].textContent = e.target.value;
        }
        calculate();
    }

    // Event Listeners
    inputs.forEach(id => {
        elements[id].addEventListener('input', handleInput);
    });

    // Initial Run
    initChart();
    calculate();
});
