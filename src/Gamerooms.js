const game = require("./GameActions.js");

class gameRoom {
  constructor(name) {
    this.name = name;
    this.maxPlayers = 3;
    this.players = [];
    this.smallBlindPlacement = 0;
    this.bigBlindPlacement = 1;
    this.currentPot = 0;
    this.currentBet = 0;
    this.gameStatus = 0;
    this.smallBlind = 1;
    this.bigBlind = 2;
    this.gameState = 0;
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

this.createRoom = function(name) {
  let room = new gameRoom(name);
  return room;
}

this.addPlayer = function(room, socket) {
  if (room.players.length == room.maxPlayers) {
    return null;
  }
  var player = game.addPlayer(socket.id);
  room.players.push(player);
  return room;
}
