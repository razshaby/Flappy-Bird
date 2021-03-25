// Dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function (request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

// Starts the server.
server.listen(5000, function () {
  console.log('Starting server on port 5000');
});

//create array of players
var players = {};

var randomNumsArray = {};


SetRandomnumbers();

function SetRandomnumbers() {
  var minHeight, maxHeight, minGap, maxGap;

  minHeight = 50;
  maxHeight = 200;
  minGap = 100;
  maxGap = 200;
  var max = 300;
  for (var i = 0; i < max; i++) {

    randomNumsArray[i] = {
      height: 0,
      gap: 0,
    }
    if (i == 0)

    {
      randomNumsArray[i] = {
        height: 0,
        gap: 0,
        max: max,
      }
    }
    randomNumsArray[i].height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
    randomNumsArray[i].gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
  }

}


io.on('connection', function (socket) {

  socket.on('disconnect', function () {
    console.log(socket.id + " disconnect!");
    delete players[socket.id];
  });


  //waiting to the client to send new player
  socket.on('new player', function () {
    players[socket.id] = {
      //set the position of the player and id
      x: 50,
      y: 100,
      id: socket.id,
      color: "#" + ((1 << 24) * Math.random() | 0).toString(16),
      isplaying: true,
      ready: false,
      playername: "none_server",
      maxScore: 0,
      finish: false
    };

    console.log(socket.id + ' Connected!');

  });

  socket.emit('randoms', randomNumsArray);

  //waiting to the client to send his movement
  socket.on('movement', function (data) {
    var player = players[socket.id] || {};
    if (data.isplaying) {
      if (data.left && player.x >= 0) {
        player.x -= 3;
      }
      if (data.up && player.y >= 0) {
        player.y -= 3;
      }
      if (data.right && (player.x < 450)) {
        player.x += 3;
      }
      if (data.down && (player.y < 270 - 30)) {
        player.y += 3;
      }
    }
    player.ready = data.ready;
    player.isplaying = data.isplaying;
    player.team = data.team;
    player.playername = data.playername;
    player.finish = data.finish;
    player.maxScore = data.maxScore;


    if (data.resetPlace) {
      player.x = 30;
      player.y = 100;

    }
  });

});

//send to clients 60 times in sec the players arrays
setInterval(function () {
  io.sockets.emit('state', players);
}, 1000 / 60);