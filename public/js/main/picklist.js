var initPicklist = () => {
    teams.forEach(function (team) {
        addTeamStats(team);
    });
}


function addTeamStats(team) {
    var cardbody = $(".drag-container").find(`#${team}`).find(".card-body");
    let avg = data["teams"][team]["stats"]["avg"];
    for (var s in barStats) {
        let stat = avg[`${s}Average`];
        stat = stat.countDecimals() > 3 ? stat.toFixed(2) : stat;
        cardbody.find(`#${s}`).append(stat)
    }
    cardbody.find("#soloHang").append(`${avg["soloHangAverage"].toFixed(3)*100}/${avg["balancedHangAverage"].toFixed(3)*100}%`);
    cardbody.find("#assistedHang").append(`${avg["assistedHangAverage"].toFixed(3)*100}/${avg["assistedBalancedHangAverage"].toFixed(3)*100}%`)
}

// makes a fetch request to save the picklist to firebase server
var savePicklist = () => {
    let teams = [];
    $(".drag-container").children().each(function () {
        var disabled = $(this).hasClass("disabled") ? "disabled" : "";
        teams.push({"team": this.id, "disabled": disabled});
    });
    console.log(teams)
    var pwd = prompt("Please enter the admin password:", "");
    if (pwd == "bluebannerorbust") {
        fetch(`/savePicklist/${eventKey}`, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify(teams), // body data type must match "Content-Type" header
        }).then(function(response) {
            return response.text().then(function(text){
                alert(text);
            });
        })
    } else {
        alert("Wrong password. Please try again.")
    }
}

let dataHidden = false;
var toggleData = () => {
    if (dataHidden) {
        $("#toggleData").text("Hide Data");
        teams.forEach(function (team) {
            $(".drag-container").find(`#${team}`).find(".card-body").show();
        });
    } else {
        $("#toggleData").text("Show Data");
        teams.forEach(function (team) {
            $(".drag-container").find(`#${team}`).find(".card-body").hide();
        });
    }
    dataHidden = !dataHidden;
}

var toggleDisabled = (team) => {
    let card = $(`div#${team}.card`);
    if (card.find("i").text() == "block") {
        card.addClass("disabled");
        card.find("i").text("undo");
    } else if (card.find("i").text() == "undo") {
        card.removeClass("disabled");
        card.find("i").text("block");
    } 
    // update sortable list
    $('div.drag-container').sortable({
        items: ':not(.disabled)'
    });
}

