// populates the main line chart
function setChart(matches) {
    $("canvas#stats").remove();
    $(".canvas-wrapper").append(`<canvas id="stats"></canvas>`)
    var ctx = document.getElementById("stats").getContext('2d');
    let data = {
        labels: [],
        datasets: [{
                label: "Tele Hatch",
                backgroundColor: "#349baf",
                borderColor: "#349baf",
                data: [],
            },
            {
                label: "Tele Cargo",
                backgroundColor: "#c64d4d",
                borderColor: "#c64d4d",
                data: [],
            },
            {
                label: "Tele Upper Hatch",
                backgroundColor: "#03572C",
                borderColor: "#03572C",
                data: [],
            },
            {
                label: "Tele Upper Cargo",
                backgroundColor: "#9977d1",
                borderColor: "#9977d1",
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
        data.datasets[0].data.push(matches[match]["teleHatch"]);
        data.datasets[1].data.push(matches[match]["teleCargo"]);
        data.datasets[2].data.push(matches[match]["teleUpperHatch"]);
        data.datasets[3].data.push(matches[match]["teleUpperCargo"]);
        data.datasets[4].data.push(matches[match]["pointContribution"]);
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
                        labelString: '# Hatch/Cargo'
                    },
                    position: 'left',
                    id: 'items',
                    ticks: {
                        beginAtZero: true,
                        suggestedMax: 8
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