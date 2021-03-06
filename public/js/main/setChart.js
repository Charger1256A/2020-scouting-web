// populates the main line chart
function setChart(matches) {
    $("canvas#stats").remove();
    $(".canvas-wrapper").append(`<canvas id="stats"></canvas>`)
    var ctx = document.getElementById("stats").getContext('2d');
    let data = {
        labels: [],
        datasets: [{
                label: "Tele Lower",
                backgroundColor: "#349baf",
                borderColor: "#349baf",
                data: [],
            },
            {
                label: "Tele Outer",
                backgroundColor: "#c64d4d",
                borderColor: "#c64d4d",
                data: [],
            },
            {
                label: "Tele Inner",
                backgroundColor: "#03572C",
                borderColor: "#03572C",
                data: [],
            },
            {
                label: "Point Contribution",
                backgroundColor: "#ffc823",
                borderColor: "#ffc823",
                data: [],
            }
        ]
    };
    for (var match in matches) {
        data.labels.push(`Q${match}`);
        data.datasets[0].data.push(matches[match]["teleLower"]);
        data.datasets[1].data.push(matches[match]["teleOuter"]);
        data.datasets[2].data.push(matches[match]["teleInner"]);
        data.datasets[3].data.push(matches[match]["pointContribution"]);
    }
    for (var s in data.datasets) {
        let set = data.datasets[s];
        set.pointRadius = 4;
        set.fill = false;
        set.label.includes("Point") ? set.yAxisID = "points" : set.yAxisID = 'items';
    }
    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            title: {
                display: true,
            },
            maintainAspectRatio: false,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: '# Powercells'
                    },
                    position: 'left',
                    id: 'items',
                    ticks: {
                        beginAtZero: true,
                        suggestedMax: 15
                    }
                }, {
                    scaleLabel: {
                        display: true,
                        labelString: 'Points'
                    },
                    position: 'right',
                    id: 'points',
                    ticks: {
                        beginAtZero: true,
                        suggestedMax: 30
                    },
                    gridLines: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                }],
            }
        }
    });
}