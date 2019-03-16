const game = require("./GameActions.js");



class gameRoom {
  constructor() {
    var name = "";
    var maxPlayers = 8;
    var players = [];
    var smallBlindPlacement = 0;
    var bigBlindPlacement = 1;
    var currentPot = 0;
    var currentBet = 0;
    var gameStatus = 0;
    var smallBlind = 1;
    var bigBlind = 2;
    var gameState = 0;
    //var roomArray = new Array(101)
    var winner = [];

    var currentPlayer = 2;

    var ignoreList = [];

    var playerCards = [];

    var fixedPCards = [];

    var fixedTCards = [];

    var tableCards = [];

    var usernames = {};
  }
}

this.createRoom = function() {
  var room = new gameRoom();
  return room;
}

this.addPlayer = function(room, socket, username) {
  var player = game.addPlayer(socket);
  return room;
}
