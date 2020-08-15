// main.js handles main dashboard stuff
var data, eventKey, teams, quals;
let playoffs = [];
generalTeam = '8';

function init() {
    // read data from meta tag
    var d = $("#data").data();
    data = d["data"];
    teams = d["teams"].split(",");
    matches = d["matches"];
    eventKey = d["event"];
    // separate playoffs and quals matches
    for (var m in matches) {
        if (matches[m].comp_level != "qm") {
            playoffs.push(matches[m]);
            delete matches[m]; 
        }
    }
    quals = matches.sort(compare);
    // console.log(quals)
    displayAutoData(teams[0]);
    switchTeam(teams[0]);
    initCompare(teams);
    initPicklist();
}


var displayAutoData = () => {
    // console.log(generalTeam);
    var d = $("#data").data();
    data = d["data"];
    teams = d["teams"].split(",");
    matches = d["matches"];
    eventKey = d["event"];
    // var team = $("a.navbar-brand").show();
    // console.log(Object.keys(team[0]))

    // alert(JSON.stringify(data["teams"][team]["stats"]["avg"]["autoOuterAverage"]));
    var lowerAvg = data["teams"][generalTeam]["stats"]["avg"]["autoLowerAverage"];
    var outerAvg = data["teams"][generalTeam]["stats"]["avg"]["autoOuterAverage"];
    var innerAvg = data["teams"][generalTeam]["stats"]["avg"]["autoInnerAverage"];

    document.getElementById("autoLowerAverage").innerHTML = lowerAvg;
    document.getElementById("autoOuterAverage").innerHTML = outerAvg;
    document.getElementById("autoInnerAverage").innerHTML = innerAvg;


}

var toggleTeamList = () => {
    $("ul.teams").is(":visible") ? $("ul.teams").hide() : $("ul.teams").show();
    $("#toggleChart").show();
    $("a.navbar-brand").show();
    $("#st").show();
    $("#search").show();
    $("#fm").hide();
    $("#toggleData").hide();
    $("#savePicklist").hide();
}
var changeHeader = (tab) => {
    $("#toggleChart").hide();
    $("#savePicklist").hide();
    $("#toggleData").hide();
    $("a.navbar-brand").hide();
    $("#fm").hide(); // filter match search button
    $("#search").hide(); // search input
    $("#st").hide(); // search teams search button
    if (tab == "matches") {
        $("#fm").show();
        $("#search").show();
    } else if (tab == "picklist") {
        $("#toggleData").show();
        $("#savePicklist").show();
    } 
}
var toggleChart = () => {
    $("div.canvas-wrapper").is(":visible") ? $("div.canvas-wrapper").hide() : $("div.canvas-wrapper").show();
    $("div.canvas-wrapper").is(":visible") ? $("div.content").attr("style", "margin-top: 25px !important") : $("div.content").attr("style", "margin-top: 60px !important")
}

// switches team data in main panel
var switchTeam = (team) => {
    generalTeam = team;
    displayAutoData();
    console.log(team)
    var teamData = data["teams"][team];
    if (teamData == undefined) {
        alert("This team does not exist in this competition.");
        return;
    }
    var teamName = teamData["name"];
    // console.log(team);
    $("a.navbar-brand").text(`Team ${team} - ${teamName}`);
    addNotes(teamData["qm"]); // compiles all notes in table
    setChart(teamData["qm"]); // generates the chart
    setPaths(teamData["qm"]); // generates the auto paths
    // iterate over all stats and set h3 text for each stat
    for (var stat in teamData["stats"]) {
        for (var key in teamData["stats"][stat]) {
            alert(key);
            if ($(`h3#${key}`).length) {
                var value = parseFloat(teamData["stats"][stat][key]);
                if (key.includes("Climb") || key.includes("Rate") || key.includes("Died")) {
                    if (isNaN(value)) {
                        $(`h3#${key}`).text(`0%`);
                    } else {
                        value = (value * 10).countDecimals() > 3 ? (value * 100).toFixed(2) : value * 100;
                        $(`h3#${key}`).text(`${value}%`);
                    }
                } else {
                    value = value.countDecimals() > 3 ? value.toFixed(2) : value;
                    value = value == -1 ? "N/a" : value
                    $(`h3#${key}`).text(value);
                }
            }
        }
    }
}
// populates table with notes
function addNotes(matches) {
    $("tbody#notes").empty(); // clear it first
    for (var m in matches) {
        if (matches[m]["-"]) continue;
        $("tbody#notes").append(`
        <tr>
            <td>${m}</td>
            <td>${matches[m]["name"]}</td>
            <td class="notes">${matches[m]["notes"]}</td>
            <td class="notes">${matches[m]["climbNotes"]}</td>
        </tr>
        `);
    }
}
// generate auto paths images
function setPaths(matches) {
    console.log(matches);
    $("#accordion").empty();
    for (var m in matches) {
        let match = matches[m]
        console.log(m);
        // if (match["-"]) continue;
        $("#accordion").append(`
        <div class="card" style="margin-top:15px; margin-bottom:15px;">
        <div class="card-header auto" id="auto${m}">
            <h5 class="mb-0">
            <button class="btn btn-link" data-toggle="collapse" data-target="#path${m}"
                aria-expanded="false" aria-controls="path${m}" style="width:100%; text-align:left;">Match ${m}
            </button>
            </h5>
        </div></div>`);
        $(`#auto${m}`).after(`
        <div id="path${m}" class="collapse" aria-labelledby="auto${m}" data-parent="#accordion">
            <div class="card-body" style="padding-top:0px;">
                <div class="row" style="height:100%">
                    <div class="col-3">
                        <h6>Starting Position: ${match["startingPosition"]}</h6>
                        <h6>Initiation Line: ${match["habBonus"] == 0 ? "No" : "Yes"}</h6>
                        <h6>Lower: ${match["autoHatch"]}</h6>
                        <h6>Outer: ${match["autoCargo"]}</h6>
                        <h6>Inner: ${match["autoCargo"]}</h6>
                    </div>
                    <div class="col-9">
                        <canvas id="canvasPath${m}" width="1500" height="1050" style = 'width:500px; height:350px;'></canvas>
                    </div>
                </div>
            </div>
        </div>`);
        $(`canvas#canvasPath${m}`).replaceWith(generateImage(match, m)); // replaces canvas with responsive image
    }    
}
// generates image off of canvas to replace canvas
function generateImage(match, m) {
    var canvas = document.getElementById(`canvasPath${m}`);
    var ctx = canvas.getContext("2d");
    let startingPosition = pos[match["startingPosition"]];
    ctx.drawImage(document.getElementById(match["alliance"]),0,0, canvas.width, canvas.height);
    ctx.drawImage(document.getElementById('start'),startingPosition[0],startingPosition[1],70,70);
    ctx.lineWidth = "6";
    ctx.font = "25px Arial";
    for (var e in match["autoEvents"]) {
        let event = match["autoEvents"][e]["event"];
        let x = event.location.includes("Rocket") ? pos[event.location]["x"][event.position[0]] : pos[event.location]["x"][event.position[1]];
        let y = pos[event.location]["y"][event.position[0]];
        ctx.drawImage(document.getElementById(event.itemScored),x,y,90,90);
        ctx.beginPath();
        ctx.strokeStyle = event.success == 1 ? "green" : "red";
        ctx.rect(x, y, 90,90);
        ctx.fillText((match["autoEvents"][e]["time"]/1000).toFixed(2), x, y-10);
        event.location.includes("Rocket") ? ctx.fillText(`Lvl ${event.position[1]}`, x, y+115) : "";
        ctx.stroke();
    }
    var autoImage = `<img src="${canvas.toDataURL()}" class="img-fluid"/>`;
    return autoImage;
}
// counts decimals for rounding if needed
Number.prototype.countDecimals = function () {
    if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0;
}
// for inserting string into string (mainly used in modifying teams with scouted match errors)
String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};
