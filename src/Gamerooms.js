const game = require("./GameActions.js");

class gameRoom {
  constructor(name, numPlayers, pass, numAI, difficulty, anteOption, startChips) {
    this.name = name;
    this.maxPlayers = parseInt(numPlayers);
    this.password = pass;
    this.numAI = parseInt(numAI);
    this.startChips = parseInt(startChips);
    this.players = [];
    this.playerQueue = [];
    this.smallBlindPlacement = 0;
    this.bigBlindPlacement = 1;
    this.currentPot = 0;
    this.currentBet = 0;
    this.isGameStarted = false;
    this.smallBlind = 5;
    this.bigBlind = 10;
    this.gameState = 0;
    this.anteFlag = anteOption;
    //var roomArray = new Array(101)
    this.winner = [];

    this.difficulty = difficulty;

    this.currentPlayer = 2;

    this.ignoreList = [];

    this.playerCards = [];

    this.fixedPCards = [];

    this.fixedTCards = [];

    this.tableCards = [];

    this.usernames = {};
    this.sidePot = 0;
    this.mainPot = 0;
    this.idleTimeout = null;
  }
}

this.createRoom = function(name, maxPlayers, password, numAI, difficulty, anteOption, startChips) {
  numAI = parseInt(numAI);
  console.log(password);
  console.log("Start Chips: " + startChips)
  let room;
  if (anteOption == 'on') {
    room = new gameRoom(name, maxPlayers, password, numAI, difficulty, 1, startChips);
  }
  else {
    room = new gameRoom(name, maxPlayers, password, numAI, difficulty, 0, startChips);
  }
  return room;
}

this.addPlayer = function(room, socket) {
  if (room.players.length == room.maxPlayers) {
    return null;
  }
  var player = game.addPlayer(socket.id, room.startChips);
  room.players.push(player);
  return room;
}

this.addPlayerQueue = function(room, socket) {
  var player = game.addPlayer(socket.id, room.startChips);
  room.playerQueue.push(player);
  return room;
}

this.addAi = function(room) {
  var player = game.addAi(room.difficulty, room.startChips)
  room.players.push(player);

  return room;
}
