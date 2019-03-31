const game = require("./GameActions.js");

class gameRoom {
  constructor(name, numPlayers, pass, numAI, anteOption, startChips) {
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
    this.gameStatus = 0;
    this.smallBlind = 5;
    this.bigBlind = 10;
    this.gameState = 0;
    this.anteFlag = anteOption;
    //var roomArray = new Array(101)
    this.winner = [];

    this.currentPlayer = 2;

    this.ignoreList = [];

    this.playerCards = [];

    this.fixedPCards = [];

    this.fixedTCards = [];

    this.tableCards = [];

    this.usernames = {};
    this.sidePot = 0;
    this.mainPot = 0;
  }
}

this.createRoom = function(name, maxPlayers, password, numAI, anteOption, startChips) {
  console.log("Start Chips: " + startChips)
  let room;
  if (anteOption == 'on') {
    room = new gameRoom(name, maxPlayers, password, numAI, 1, startChips);
  }
  else {
    room = new gameRoom(name, maxPlayers, password, numAI, 0, startChips);
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
