let compLevels = {
    "qm": "Quals",
    "f": "Finals",
    "sf": "Semi Finals",
    "qf": "Quarter Finals"
}
// key is display  name, x is an arbitrary average amount to calibrate widths of progress bars 
let barStats = {
    "pointContribution": {"key": "Pt. Contribution", "x": 25}, // default 25
    "autoLower": {"key": "Auto Lower", "x": 1},
    "autoOuter": {"key": "Auto Outer", "x": 1},
    "autoInner": {"key": "Tele Inner", "x": 6}, // default: 6
    "teleLower": {"key": "Tele Lower", "x": 6},
    "teleOuter": {"key": "Tele Outer", "x": 3}, // default: 3
    "teleInner": {"key": "Tele Inner", "x": 3}
}

let rateStats = {
    "soloHang": {"key": "Solo Hang"},
    "assistedHang": {"key": "Assisted Climb (Lvl 2/Lvl 3)"},
    "robotDied": {"key": "Robot Died"}
}

let initialized = false;
// initialize matches page
var initMatches = (teamNo, init) => {
    if (initialized && init) return;
    initialized = true;
    $("div#matchesAccordion").empty();
    for (var i = 0; i < 2; i++) {
        var matches;
        if (i == 0) {
            $("div#matchesAccordion").append("Quals<hr>");
            matches = quals;
        } else {
            $("div#matchesAccordion").last().append("Playoffs<hr>");
            matches = playoffs;
        }
        for (var m in matches) {
            let match = matches[m];
            if (teamNo != undefined) {
                let blue = match["alliances"]["blue"]["team_keys"];
                let red = match["alliances"]["red"]["team_keys"];
                if (blue.includes(`frc${teamNo}`) || red.includes(`frc${teamNo}`)) {
                    appendMatch(match);
                }
            } else {
                appendMatch(match);
            }
        }
    }
    $('[data-toggle="tooltip"]').tooltip(); 
}

var filterMatches = (teamNo) => {
    if (data["teams"][teamNo] != undefined) {
        initMatches(teamNo);
    } else {
        // if it's empty, just reset everything
        if (teamNo == "") {
            initMatches();
        } else {
            alert("This team does not exist in this competition.");
        }
    }
}

function appendMatch(match) {
    let key = match["key"];
    // console.log(key);
    let teams = {
        "blue": match["alliances"]["blue"]["team_keys"].map(function (t) { return t.replace('frc', '')}),
        "red": match["alliances"]["red"]["team_keys"].map(function (t) { return t.replace('frc', '')})
    }
    var d = data["teams"];
    let winProb = calculateWinProb(teams["blue"], teams["red"]);
    $("div#matchesAccordion").append(`
    <div class="card" style="margin-top:15px; margin-bottom:15px;">
        <div class="card-header auto" id="match${key}">
            <h5 class="mb-0">
            <button class="btn btn-link" data-toggle="collapse" data-target="#${key}"
                aria-expanded="false" aria-controls="#${key}" style="width:100%; text-align:left;">${compLevels[match["comp_level"]]} ${match["match_number"]}
            </button>
            </h5>
        </div>
    </div>`); 
    $(`#match${key}`).after(`
    <div id="${key}" class="collapse" aria-labelledby="match${key}">
        <div class="card-body" style="padding-top:0px;">
            <hr style="margin-bottom:10px;">
            <div class="col-md-12">
                <div class="row center">
                    <div class="col-6" style="font-weight: bold; color: #409ad6;">
                        <div class="row">
                            <div class="col-6" id="blueTeams">
                            </div>
                            <div class="col-6 right">
                                <h2 style="margin-bottom:0px">${match["alliances"]["blue"]["score"]}</h2>
                            </div>
                        </div>
                    </div>
                    <div class="col-6" style="color: #d64040;">
                        <div class="row">
                            <div class="col-6 left">
                                <h2 style="margin-bottom:0px">${match["alliances"]["red"]["score"]}</h2>
                            </div>
                            <div class="col-6" id="redTeams">
                            </div>
                        </div>
                    </div>
                </div>
                <div id="${key}Bars">
                </div>
            </div>
            <div class="col-md-12">
                <div id="${key}Rates">
                    <hr style="margin-top:0px;">
                </div>
            </div>
        </div>
    </div>
    `);
    // adding teams
    for (var alliance in teams) {
        for (var t in teams[alliance]) {
            var m = data["teams"][teams[alliance][t]]["qm"];
            var str = `<h5 style="margin-bottom:0px;">${teams[alliance][t]}</h5>`;
            try {
                str = "-" in m[match["match_number"]] || match["comp_level"] != "qm" ? str : `<h5 style="margin-bottom:0px;"><b>${teams[alliance][t]}</b></h5>`;
            } catch (error) {}
            // add underline and tool tip toggle if error in match
            if (m[match["match_number"]] != undefined && m[match["match_number"]]["errors"]) {
                str = str.splice(str.indexOf('margin'), 0, "text-decoration: underline; "); // insert underline before margin bottom
                str = str.splice(str.indexOf('style'), 0, `data-toggle="tooltip" data-placement="top" title="${m[match["match_number"]]["errors"][0]}"`)
            }
            $(`#${key}`).find(`#${alliance}Teams`).append(str);
        }
    }
    // --------------------------
    let rateDiv = $(`#${key}Rates`);
    let statDiv = $(`#${key}Bars`);
    for (var stat in rateStats) {
        rateDiv.append(`
        <div class="row center">
            <div class="col-md-4">
                <div class="row" id="${stat}Blue">
                </div>
            </div>
            <div class="col-md-4">
                <h6>${rateStats[stat]["key"]}</h6>
            </div>
            <div class="col-md-4">
                <div class="row" id="${stat}Red">
                </div>
            </div>
        </div>`);
        for (var i = 0; i < teams["blue"].length; i++) {
            let blueStats = d[teams["blue"][i]]["stats"]["avg"];
            let redStats = d[teams["red"][i]]["stats"]["avg"];
            rateDiv.find(`#${stat}Blue`).append(`<div class="col-4"><h5>${blueStats[stat+"Average"].toFixed(2)*100}%</h5></div>`);
            rateDiv.find(`#${stat}Red`).append(`<div class="col-4"><h5>${redStats[stat+"Average"].toFixed(2)*100}%</h5></div>`);    
            
        }
    }
    // progress bar stats
    for (var stat in barStats) {
        if (stat == "autoHatch" || stat == "teleHatch") {
            statDiv.append("<hr style='margin-top:-4px;'>");
        }
        statDiv.append(`
        <div class="row center">
            <div class="col-4">
                <div class="progress justify-content-end" id="${stat}Blue">
                </div>
            </div>
            <div class="col-1">
                <h5 id="${stat}BlueTotal"></h5>
            </div>
            <div class="col-2">
                <h6>${barStats[stat]["key"]}</h6>
            </div>
            <div class="col-1">
                <h5 id="${stat}RedTotal"></h5>
            </div>
            <div class="col-4">
                <div class="progress" id="${stat}Red">
                </div>
            </div>
        </div>`)
        let blueTotal = 0;
        let redTotal = 0;
        for (var i = 0; i < teams["blue"].length; i++) {
            var blueStat = d[teams["blue"][i]]["stats"]["avg"][`${stat}Average`];
            var redStat = d[teams["red"][i]]["stats"]["avg"][`${stat}Average`];
            blueStat = blueStat.countDecimals() > 3 ? parseFloat(blueStat.toFixed(2)) : blueStat;
            redStat = redStat.countDecimals() > 3 ? parseFloat(redStat.toFixed(2)) : redStat;
            blueTotal += blueStat;
            redTotal += redStat;
            let blueWidth = (blueStat/barStats[stat]["x"]) * 33;
            let redWidth = (redStat/barStats[stat]["x"]) * 33;
            // add progress bars
            statDiv.find(`#${stat}Blue`).append(`<div class="progress-bar bg-info" role="progressbar" style="width: ${blueWidth}%;" aria-valuenow="${blueWidth}" aria-valuemin="0" aria-valuemax="100">${blueStat}</div>`)
            statDiv.find(`#${stat}Red`).append(`<div class="progress-bar bg-danger" role="progressbar" style="width: ${redWidth}%;" aria-valuenow="${redWidth}" aria-valuemin="0" aria-valuemax="100">${redStat}</div>`)
        }
        statDiv.find(`#${stat}BlueTotal`).text(blueTotal.countDecimals() > 3 ? blueTotal.toFixed(2) : blueTotal);
        statDiv.find(`#${stat}RedTotal`).text(redTotal.countDecimals() > 3 ? redTotal.toFixed(2) : redTotal);
    }
}

function calculateWinProb(blue, red) {
    let blueTotal = 0;
    let redTotal = 0;
    let blueStdev = 0;
    let redStdev = 0;
    for (var i in blue) {
        var blueStats = data["teams"][blue[i]]["stats"];
        var redStats = data["teams"][red[i]]["stats"];
        blueTotal += blueStats["avg"]["pointContributionAverage"];
        redTotal += redStats["avg"]["pointContributionAverage"];
        blueStdev += Math.pow(blueStats["stDev"]["pointContributionStdev"],2);
        redStdev += Math.pow(redStats["stDev"]["pointContributionStdev"],2);
    }
    var t = (blueTotal-redTotal)/(Math.sqrt(blueStdev/3+redStdev/3))
    t = !isFinite(t) ? (blueTotal-redTotal) : t;
    v = Math.abs((blueTotal-redTotal)/(blueTotal+redTotal))*2+1; // formula to determine what value to use for v.
    return blueTotal > redTotal ? 1-jStat.ttest(t, v, 1) : jStat.ttest(t, v, 1);
}

function compare(a,b) {
    if (a.match_number < b.match_number)
      return -1;
    if (a.match_number > b.match_number)
      return 1;
    return 0;
}
