var express = require('express');
var router = express.Router();
var firebase = require('firebase');
var request = require('request');

firebase.initializeApp({
  apiKey: "AIzaSyBDvxiLJvHh-dEvNQph1hys0oSovX7bWGI",
  authDomain: "scouting-backend.firebaseapp.com",
  databaseURL: "https://scouting-backend.firebaseio.com",
  projectId: "scouting-backend",
  storageBucket: "scouting-backend.appspot.com",
  messagingSenderId: "78773607889",
  appId: "1:78773607889:web:9d6252eaa0939bb2d114f0",
  measurementId: "G-9YDWE6V65K"
});

firebase.auth().signInAnonymously().catch(function(error) {
  console.log(error);
});

var db = firebase.database();

let tbaKey = "k96vBSTEaDpRyBQp31cvIpTtAJnt2ipF4FzUKY55UGKYi4pEpYRKHX23U6pm0DYx	";
let matchesURL = `http://www.thebluealliance.com/api/v3/event/eventKey/matches/simple`;
let possibleEvents = ["2019cadm", "2019casj", "2019ndgf", "2019week0", "2018casj", "2019mttd", "2020utwv"];

router.get('/:eventKey', function(req, res, next) {
  let eventKey = req.params.eventKey;
  if (possibleEvents.includes(eventKey)) {
    db.ref(`/${eventKey}`).once('value').then(function(snapshot) {
      let teamList = Object.keys(snapshot.val()["teams"]);
      request({headers: {"X-TBA-AUTH-KEY": tbaKey}, url: matchesURL.replace("eventKey", eventKey)}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(snapshot.val().teams['8']);
            // console.log(teamList);
            res.render('index', { eventKey: eventKey, teams: teamList, data: snapshot.val(), possibleEvents: possibleEvents, matches: body});
        } else {
          res.send('error', {"error": "Unable to get TBA data."})
        }
      })
    }).catch(function (error) {
      console.log(error);
      res.render('error', {"error": `Error with firebase: ${error}. TRY RELOADING.`});
    });
  } else {
    res.render('error');
  }
});

router.post('/savePicklist/:eventKey', function(req, res, next) {
  db.ref(`/${req.params.eventKey}`).update({
    picklist: req.body
  }, function(error) {
    if (error) {
      res.send(error);
    } else {
      res.send(`Successfully saved picklist for ${req.params.eventKey}`)
    }
  });
});

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
