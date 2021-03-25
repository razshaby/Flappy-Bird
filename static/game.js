var socket = io();

//sent to the server - new player joined
socket.emit('new player');

var movement = {
  up: false,
  down: false,
  left: false,
  right: false,
  isplaying: true,
  ready: false,
  team: false,
  playername: "none_client",
  maxScore: 0,
  resetPlace: false,
  finish: false
}

var myPlayer = {
  x: 0,
  y: 0,
  distance: 0,
  id: 0,
  score: 0,
}
var boolPic=true;
var myBackground;

var WinnerBackground;
var LoserBackground;

var startGameBackground;


var myObstacles = [];
var myScore;

var clientrandomNumsArray = {};
var pointer = 0;
var max = 0;

var myid;
var minPlayersToStartAGame = 1;


 //for play
var speed = -4;
var timeToObstacles = 30;

// //for test
// var speed = -1;
// var timeToObstacles = 100;

var canPlay = false;
var showStartBackground = true;
var mybirdpic="https://i.ibb.co/0XWWNDJ/Screenshot-8.png";//downWings


var myGameArea = {
  canvas: document.createElement("canvas"),
  start: function () {
    this.canvas.width = 480;
    this.canvas.height = 270;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.frameNo = 0;
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },

}




function ready() {

  if (document.getElementById("txtbox").value.trim() != "") {
    movement.ready = true;
    movement.playername = document.getElementById("txtbox").value;
    document.getElementById("btnready").disabled = true;

  } else {
    alert("Please Enter Name!")
  }
}


socket.on('randoms', function (randomNumsArray) {
  clientrandomNumsArray = randomNumsArray;
  max = clientrandomNumsArray[0].max
});


function fly() {
  if(boolPic)
  mybirdpic="https://i.ibb.co/0XWWNDJ/Screenshot-8.png";//downWings
  else
  {
    mybirdpic="https://i.ibb.co/ryP06c0/Screenshot-7.png";//upWings
  }
  if(boolPic)
  boolPic=false;
  else
  boolPic=true;
}

setInterval(function () {
  //send to the server the movement var
  fly();
}, 1000 / 3);

document.addEventListener('keydown', function (event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      break;
    case 87: // W
      movement.up = true;
      break;
    case 68: // D
      movement.right = true;
      break;
    case 83: // S
      movement.down = true;
      break;


    case 37: // A
      movement.left = true;
      break;
    case 38: // W
      movement.up = true;
      break;
    case 39: // D
      movement.right = true;
      break;
    case 40: // S
      movement.down = true;
      break;

  }
});

document.addEventListener('keyup', function (event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;


      case 37: // A
      movement.left = false;
      break;
    case 38: // W
      movement.up = false;
      break;
    case 39: // D
      movement.right = false;
      break;
    case 40: // S
      movement.down = false;
      break;
  }
});



//run the inner function 60 times in a second
setInterval(function () {
  //send to the server the movement var
  socket.emit('movement', movement);
}, 1000 / 60);





socket.on('state', function (players) {
  myid = socket.id;



  var TotalNotReadyPlayers = 0;
  var TotalPlayers = 0;
  var TotalFinishedPlayed = 0;
  var TotalTeamPlayer = 0;
  for (var id in players) {
    var player = players[id];
    if (player.ready == false) {
      TotalNotReadyPlayers++;
    }

    if (player.finish == true) {
      TotalFinishedPlayed++;
    }

    if (player.team == true) {
      TotalTeamPlayer++;
    }

    TotalPlayers++;
  }

  if (showStartBackground) {

    drawStartBackGround();
  }


  //there is more then one player online and all players are pressed ready
  if (((TotalPlayers >= minPlayersToStartAGame) && (TotalNotReadyPlayers == 0) && TotalTeamPlayer == 0) || (canPlay)) {
    showStartBackground = false;
    if (movement.isplaying) {
      movement.resetPlace = false;
      updateGameArea(players);
      movement.team = true;
      canPlay = true;
      movement.maxScore = myGameArea.frameNo;
    } else { //if not playing
      updateGameArea(players);
      // movement.resetPlace = true;
      movement.finish = true; //change player.finish
      movement.ready = false; //change player.ready
    }
  }


  //all players done the round
  if ((TotalFinishedPlayed == TotalTeamPlayer) && (TotalFinishedPlayed != 0)) // && (movement.ready == false))
  {
    reset();
    document.getElementById("btnready").disabled = false;
    showWinners(players);
    if (movement.finish == true)
      movement.finish = false;
  }


});

function reset() {
  movement.resetPlace = true;
  myObstacles = [];
  pointer = 0;
  canPlay = false;
  movement.isplaying = true;
  movement.ready = false;
  movement.team = false;

  movement.left = false;
  movement.up = false;
  movement.right = false;
  movement.down = false;

  startGame();
}


function startGame() {



  setBackgrounds();
  myScore = new component("30px", "Consolas", "black", 280, 40, "text");
  myGameArea.start();
}

function component(width, height, color, x, y, type, name) {
  this.type = type;
  if (type == "image" || type == "background") {
    this.image = new Image();
    this.image.src = color;
  }


  this.score = 0;
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;

  this.speedX = 0;
  this.speedY = 0;



  this.update = function () {
    ctx = myGameArea.context;
    if (type == "image" || type == "background") {
      ctx.drawImage(this.image,
        this.x,
        this.y,
        this.width, this.height);
      if (type == "background") {
        ctx.drawImage(this.image,
          this.x + this.width,
          this.y,
          this.width, this.height);
      }

    } else {
      if (this.type == "text") {
        ctx.font = this.width + " " + this.height;
        ctx.fillStyle = color;
        ctx.fillText(this.text, this.x, this.y);
      } else {
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        if (type == "player") {
          ctx.font = "20px" + " Consolas";
          ctx.fillText(name, this.x, this.y + 50);
        }
      }
    }
  }


  this.newPos = function () {

    this.x += this.speedX;
    this.y += this.speedY;
    if (this.type == "background") {
      if (this.x == -(this.width)) {
        this.x = 0;
      }
    }
  }




  this.crashWith = function (otherobj) {
    var myleft = this.x;
    var myright = this.x + (this.width);
    var mytop = this.y;
    var mybottom = this.y + (this.height);
    var otherleft = otherobj.x;
    var otherright = otherobj.x + (otherobj.width);
    var othertop = otherobj.y;
    var otherbottom = otherobj.y + (otherobj.height);
    var crash = true;
    if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
      crash = false;
    }
    return crash;
  }
}

function updateGameArea(players) {
  var x, height, gap, minHeight, maxHeight, minGap, maxGap;



  myGameArea.clear();

  myBackground.speedX = -1;
  myBackground.newPos();
  myBackground.update();



  myGameArea.frameNo += 1;
  if (myGameArea.frameNo == 1 || everyinterval(timeToObstacles)) {

    x = myGameArea.canvas.width;
    gap = clientrandomNumsArray[pointer].height;
    height = clientrandomNumsArray[pointer].gap;
    pointer++;
    if (pointer == max)
      pointer = 0;
    myObstacles.push(new component(10, height, "green", x, 0, "Obstacles"));
    myObstacles.push(new component(10, x - height - gap, "green", x, height + gap, "Obstacles"));
  }
  for (i = 0; i < myObstacles.length; i += 1) {
    myObstacles[i].x += speed;
    myObstacles[i].update();
  }

  //Raise difficulty
  // if(myGameArea.frameNo%10==0)
  // speed-=0.05;


  myScore.text = "SCORE: " + myGameArea.frameNo;
  myScore.update();



  for (var id in players) {
    var player = players[id];

    myGamePiece = new component(30, 30, player.color, player.x, player.y, "player", player.playername);
    myGamePiecebird = new component(26, 26,mybirdpic,10, 120, "image");



    if (myid == player.id) {
      for (i = 0; i < myObstacles.length; i += 1) {

        if (myGamePiece.crashWith(myObstacles[i])) {
          movement.isplaying = false;

        } else {
          if (movement.isplaying) {
            myGamePiece.newPos();
            myGamePiece.update();

            myGamePiecebird.y = myGamePiece.y + 2;
            myGamePiecebird.x = myGamePiece.x + 2;
            myGamePiecebird.newPos();
            myGamePiecebird.update();
          }
        }
      }
    } else {
      if ((player.isplaying) && (player.team)) {
        myGamePiece.newPos();
        myGamePiece.update();
        myGamePiecebird.y = myGamePiece.y + 2;
        myGamePiecebird.x = myGamePiece.x + 2;
        myGamePiecebird.newPos();
        myGamePiecebird.update();
      }
    }


  }
}


function everyinterval(n) {
  if ((myGameArea.frameNo / n) % 1 == 0) {
    return true;
  }
  return false;
}


function showWinners(players) {
  myGameArea.clear();
  var max = 0;
  var name = "none";
  var winID;
  for (var id in players) {
    var player = players[id];

    if (player.maxScore > max) {
      max = player.maxScore;
      name = player.playername;
      winID = player.id;
    }
  }

  if (myid == winID) {

    WinnerBackground.newPos();
    WinnerBackground.update();

    var winner = new component("35px", "Consolas", "black", 10, 100, "text");
    winner.text = "you win with " + max + " points";
    winner.update();

  } else {

    LoserBackground.newPos();
    LoserBackground.update();
    var winner = new component("35px", "Consolas", "black", 10, 100, "text");
    winner.text = "The winner is " + name;
    winner.update();

    winner.y = 140;
    winner.text = "with: " + max + " points";
    winner.update();

    winner.y = 180;
    winner.text = "you got: " + players[myid].maxScore + " points";
    winner.update();
  }
}

function setBackgrounds() {
  myBackground = new component(656, 270,
    "https://i.ibb.co/KWrGn3Y/game-Background.png",
    0, 0, "background");
  startGameBackground = new component(480, 270,
    "https://i.ibb.co/0ftmXpx/flappy.png",
    0, 0, "background");
  WinnerBackground = new component(480, 270,
    "https://i.ibb.co/WtGgrNK/winner.jpg",
    0, 0, "background");

  LoserBackground = new component(480, 270,
    "https://i.ibb.co/YRyw63M/loser.jpg",
    0, 0, "background");
}


function drawStartBackGround() {
  startGameBackground.newPos();
  startGameBackground.update();
}