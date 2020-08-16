let rankStats = {
    "pointContribution": "Point Contribution",
    "teleLower": "Lower",
    "teleOuter": "Outer",
    "teleInner": "Inner",
    "telePowercell": "Powercells", 
    "positionControl": "Position Control",
    // "robotDied": "Robot Died",
    "driverRating": "Driver Rating"
}
let rankData = [];
let sortKey = "pointContribution";
var initCompare = (teams) => {
    for (var team in teams) {
        let teamData = {"team": teams[team]};
        for (var stat in rankStats) {
            if (data["teams"][teams[team]]["stats"] != undefined) {
                let teamStat = data["teams"][teams[team]]["stats"]["avg"][`${stat}Average`];
                teamData[stat] = teamStat.countDecimals() > 3 ? teamStat.toFixed(2) : teamStat;
            }
        }
        rankData.push(teamData);
    }
    for (var stat in rankStats) {
        $("table#rankTable").find("thead").find("tr").append(`<th id="${stat}" onclick="changeRank(this.id)">${rankStats[stat]}</th>`);
    }
    changeRank(sortKey);
}

// init the rank table
var changeRank = (key) => {
    sortKey = key;
    $("table#rankTable").find("tr").children().css("border-bottom-color", "#DDDDDD");
    $("table#rankTable").find("tr").find(`th#${key}`).css("border-bottom-color", "#03572C");
    $("table#rankTable").find("tbody").empty();
    for (var r in rankData.sort(compareRank)) {
        $("table#rankTable").find("tbody").append(`<tr></tr>`);
        $("table#rankTable").find("tbody").last().append(`<td>${parseInt(r)+1}</td>`);
        let teamData = rankData[r];
        for (key in teamData) {
            $("table#rankTable").find("tbody").last().append(`
                <td>${teamData[key]}</td>
            `);
        }
    }
}

var compareRank = (a,b) => {
    if (sortKey == "team") {
        return a[sortKey] - b[sortKey];
    } else {
        if (b[sortKey] - a[sortKey] != 0) return b[sortKey] - a[sortKey];
        else {
            return a["team"] - b["team"]; // if equal, rank based on teams.
        }
    }
}
