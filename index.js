'use strict';

const express = require('express');
const game = require('./src/GameActions.js');
const validator = require('validator');
const port = process.env.PORT || 80;
const path = require('path')
const sio = require('socket.io')
const pg = require('pg');
const hf = require('./src/handFinder.js')
const pool = new pg.Pool({
  user: 'uvqmfjuwtlhurl',
  host: 'ec2-54-227-246-152.compute-1.amazonaws.com',
  database: 'dajkjt3t4o0mtt',
  password: 'aeae6293fd321e7d1eb3b1c95b3dcc93dd9878948aba3f1271b83a52472068b0',
  port: '5432',
  ssl: true
});

const server = express()
  .use((req, res) => res.sendFile(path.join(__dirname, 'src/pages/chat.html')))
  .listen(port, () => console.log(`Listening on ${ port }`));

const io = sio(server);


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

var playerCards = [];

var fixedPCards = [];

var fixedTCards = [];

var tableCards = [];

var usernames = {};

// rooms which are currently available in chat
var rooms = ['room1'];
io.sockets.on('connection', function (socket) {
	// when the client emits 'adduser', this listesns and executes
	socket.on('adduser', function(username){
    if (username != null) {
      username = validator.escape(username);
    }
    else {
      username = "Player " + players.length;
    }
		// store the username in the socket session for this client
    var player = game.addPlayer(socket.id);

    players.push(player);

		socket.username = username;
		// store the room name in the socket session for this client
		socket.room = 'room1';
		// add the client's username to the global list
		usernames[username] = username;
    player.username = username;
    //console.log(player);
		// send client to room 1
		socket.join('room1');
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected to room1');
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
		socket.emit('updaterooms', rooms, 'room1');
	});

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
    var parsed = data.split(" ");
    if (parsed == "/start") {
      //console.log(players);
      if (gameStatus == 1) {
        io.to(socket.id).emit('updatechat', "Server", "There is already a game going on.");
        return;
      }
      if (players.length == 1) {
        io.to(socket.id).emit('updatechat', "Server", "You cannot play a game with one person.");
        return;
      }
      gameStatus = 1;
      smallBlindPlacement = 0;
      bigBlindPlacement = 1;
      currentPlayer = (bigBlindPlacement + 1) % players.length;

      beginRound(socket);
      //io.sockets.in(socket.room).emit('updatechat', "Player Cards: ", playerCards);
      //io.sockets.in(socket.room).emit('updatechat', "Table Cards: ", tableCards)
    }
    else if (parsed[0] == "/raise") {
      if (gameStatus == 0) {
        io.to(socket.id).emit('updatechat', "Server", "A game has not started yet");
        return;
      }
      if (!validatePlayer(socket)) {
        return;
      }
      var raiseTo = parsed[1];
      var currPlayer = players[currentPlayer];
      var retArray = game.playerRaise(currPlayer, currentBet, raiseTo);
      if (retArray == -1) {
        io.to(socket.id).emit('updatechat', "Server", "You cannot raise more than your current chips.")
        return;
      }
      currentPot += retArray[1];
      currentBet = raiseTo;
      players[currentPlayer] = retArray[0];
      for (var i = 0; i < players.length; i++) {
        if (players[i].state == "READY") {
          players[i].state = "NOTREADY";
        }
        console.log(players[i]);
      }
      players[currentPlayer].state = "READY";
      io.sockets.in(socket.room).emit('updatechat', "Server", socket.username + " raised " + raiseTo + ". The Pot is now " + currentPot + ".");
      checkReadyState(socket)
    }
    else if (parsed[0] == "/call") {
      if (gameStatus == 0) {
        io.to(socket.id).emit('updatechat', "Server", "A game has not started yet");
        return;
      }
      if (!validatePlayer(socket)) {
        return;
      }
      if (currentBet == 0) {
        players[currentPlayer].state = "READY";
        io.sockets.in(socket.room).emit('updatechat', "Server", socket.username + " checked " + ". The Pot is now " + currentPot + ".");
      }
      else {
        var amount = currentBet;
        var retArray = game.playerCall(players[currentPlayer], currentBet);
        if (retArray == -1) {
          currentPot += players[currentPlayer].chips;
          players[currentPlayer].chips = 0;
          players[currentPlayer].state = "ALLIN";
        }
        else {
          currentPot += retArray[1];
          players[currentPlayer] = retArray[0];
          io.sockets.in(socket.room).emit('updatechat', "Server", socket.username + " called " + ". The Pot is now " + currentPot + ".");
        }
      }
      checkReadyState(socket)
    }
    else if (parsed[0] == "/fold") {
      if (gameStatus == 0) {
        io.to(socket.id).emit('updatechat', "Server", "A game has not started yet");
        return;
      }
      if (!validatePlayer(socket)) {
        return;
      }
      players[currentPlayer].state = "FOLDED";
      var counter = 0;
      for (var i = 0; i < players.length; i++) {
        if (players[i].state == "FOLDED") {
          counter++;
        }
      }
      if (counter == players.length-1) {
        gameState = 3;
        progressGame(socket);
      }
      checkReadyState(socket);
    }
    else if (parsed[0] == "/check") {
      if (gameStatus == 0) {
        io.to(socket.id).emit('updatechat', "Server", "A game has not started yet");
        return;
      }
      if (!validatePlayer(socket)) {
        console.log("vadlidate player")
        return;
      }
      console.log("Validate player succeeds.");
      if (currentBet != 0 && currentPlayer != bigBlindPlacement && gameState != 0 && players[bigBlindPlacement].lastBet == bigBlind) {
        io.to(socket.id).emit("You cannoy check when the current bet is higher than 0");
      }
      else{ console.log("Can check"); }
      players[currentPlayer].state = "READY";
      console.log(players[currentPlayer].state);
      checkReadyState(socket);
    }
    else {
      if (data != "") {
        var newdata = validator.escape(data)
        io.sockets.in(socket.room).emit('updatechat', socket.username, newdata);
        return;
      }
      return;
    }
    printInfo(socket)
	});


	// when the user disconnects.. perform this
	socket.on('disconnect', function() {
		// remove the username from global usernames list
		delete usernames[socket.username];
    for (var i = 0; i < players.length; i++) {
      if (players[i].playerID == socket.id) {
        players.splice(i, 1);
      }
    }
    if (players.length <= 1) {
      gameStatus = 0;
    }
    console.log(players);
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});

function checkReadyState(socket) {
  var k = 0;
  for (var i = currentPlayer; k < players.length; i++) {
    if (i >= players.length) {
      i = 0;
    }
    if (players[i].state == "NOTREADY") {
      currentPlayer = i;
      break;
    }
    k++;
  }
  if (k == players.length) {
    progressGame(socket)
  }
}

function beginRound(socket) {
  console.log("Hello world")
  var cards = game.startGame(players.length);
  playerCards = cards[0];
  tableCards = cards[1];
  console.log(playerCards);
  console.log(tableCards);
  var fixedCards = fixCards(playerCards, tableCards);
  fixedPCards = fixedCards[0];
  fixedTCards = fixedCards[1];
  for (var i = 0; i < players.length; i++) {
    players[i].cards = playerCards[i];
  }
  var temp = game.blind(players[smallBlindPlacement], 1);
  currentPot += 1
  players[smallBlindPlacement] = temp;
  temp = game.blind(players[bigBlindPlacement], 2);
  currentPot += 2;
  currentBet = 2;
  players[bigBlindPlacement] = temp;
  //printInfo(socket);
  console.log(players)
}

function progressGame(socket) {
  if (gameState == 0) {
    var flop = [fixedTCards[0], fixedTCards[1], fixedTCards[2]]
    console.log("Players At State 1: ")
    console.log(players);
    for (var i = 0; i < players.length; i++) {
      if (players[i].state != "FOLDED") {
        players[i].state = "NOTREADY"
        players[i].lastBet = 0;
      }
    }
    currentPlayer = (currentPlayer + 1) % players.length;
    checkReadyState(socket);
    gameState++;
    currentBet = 0;
  }
  else if (gameState == 1) {

    for (var i = 0; i < players.length; i++) {
      if (players[i].state != "FOLDED") {
        players[i].state = "NOTREADY"
        players[i].lastBet = 0;
      }
    }
    currentPlayer = (currentPlayer + 1) % players.length;
    checkReadyState(socket);
    gameState++;
    currentBet = 0;
  }
  else if (gameState == 2) {

    for (var i = 0; i < players.length; i++) {
      if (players[i].state != "FOLDED") {
        players[i].state = "NOTREADY"
        players[i].lastBet = 0;
      }
    }
    currentPlayer = (currentPlayer + 1) % players.length;
    checkReadyState(socket);
    gameState++;
    currentBet = 0;
  }
  else if (gameState == 3) {
    console.log("IN GAME STATE 3")
    var handRanks = [];
    for (var i = 0; i < playerCards.length; i++) {
      if (players[i].state != "FOLDED") {
        var hand = hf.finalhand(playerCards[i], tableCards)
        var matchArray = hf.match(hand);
        var handArray0 = hf.kinds(matchArray);
        var handArray1 = hf.flushAndStraight(hand,matchArray);
        if(handArray0[0]>handArray1[0]){
          handRanks.push(handArray0);
          players[i].handRank = handArray0;
        }
        else {
          handRanks.push(handArray1);
          players[i].handRank = handArray1;
        }
      }
    }
    console.log("WINNER HAS BEEN CALCULATED")
    winner = hf.findWinner(handRanks)

    var winnersArr = []
    var winString = winner.toString();
    console.log(winString);

    for (var i = 0; i < players.length; i++) {
      if (players[i].state != "FOLDED") {
       var handRankString = players[i].handRank.toString();
       console.log(handRankString);
       if (handRankString == winString) {
         console.log("WINNER FOUND");
          winnersArr.push(players[i].username);
          delete players[i].handRank
       }
      }
    }
    //Modulo the hand winnings add that to whatever players
    var winnings = Math.floor((currentPot / winnersArr.length));
    for (var i = 0; i < winnersArr.length; i++) {
      io.sockets.in(socket.room).emit('updatechat', "Server", winnersArr[i] + " won. They win " + winnings + " chips.")
    }
    for (var i = 0; i < players.length; i++) {
      for (var j = 0; j < winnersArr.length; j++) {
        if (players[i].username == winnersArr[j]) {
          players[i].chips += winnings;
        }
      }
      players[i].state = "NOTREADY";
      players[i].lastBet = 0;
    }
    console.log("Players After Winnings");
    console.log(players);

    for (var i = 0; i < players.length; i++) {
      if (players[i].chips == 0) {
        io.sockets.in(socket.room).emit('updatechat', "Server", players[i].username + " is out.");
        players.splice(i, 1);
      }
    }
    if (players.length == 1) {
      io.sockets.in(socket.room).emit('updatechat', "Server", players[0].username + " is the winner!!");
      gameStatus = 0;
      return;
    }
    gameState = 0;
    currentPot = 0;
    currentBet = 0;
    smallBlindPlacement = bigBlindPlacement;
    bigBlindPlacement = (bigBlindPlacement + 1) % players.length;
    currentPlayer = (bigBlindPlacement + 1) % players.length;
    beginRound(socket);
    console.log("Made it to here");
  }
}

function printInfo(socket) {
  io.sockets.in(socket.room).emit('updatechat', "Server", "Pot: " + currentPot);
  io.sockets.in(socket.room).emit('updatechat', "Server", "Current Bet: " + currentBet);
  for (var i = 0; i < players.length; i++) {
    var variable = players[i];
    io.sockets.in(socket.room).emit('updatechat', "Chips: ", variable.username + ": " + variable.chips);
  }
  for (var i = 0; i < players.length; i++) {
    io.to(players[i].playerID).emit('updatechat', 'Your Cards: ', fixedPCards[i]);
  }
  if (gameState >= 1) {
    var flop = [fixedTCards[0], fixedTCards[1], fixedTCards[2]]
    io.sockets.in(socket.room).emit('updatechat', "Server", "Flop: " + flop)
  }
  if (gameState >= 2) {
    var turn = fixedTCards[3];
    io.sockets.in(socket.room).emit('updatechat', "Server", "Turn: " + turn)
  }
  if (gameState >= 3) {
    var river = fixedTCards[4];
    io.sockets.in(socket.room).emit('updatechat', "Server", "River: " + river);
  }
  io.sockets.in(socket.room).emit('updatechat', "Server", "It is now " + players[currentPlayer].username + "\'s turn.");
}

function validatePlayer(socket) {
  for (var i = 0; i < players.length; i++) {
    if (players[i].playerID == socket.id) {
      if (currentPlayer == i) {
        return true;
      }
      else {
        io.to(players[i].playerID).emit('updatechat', "Server: ", "It is not your turn");
        return false;
      }
    }
  }
}

function fixCards(pCards, tCards) {
  var retPCards = [];
  var retTCards = [];
    for (var i = 0; i < pCards.length; i++) {
      var card1 = findCard(pCards[i][0]);
      var card2 = findCard(pCards[i][1]);
      var tempHand = [card1, card2]
      retPCards.push(tempHand);
    }
    var card1 = findCard(tCards[0])
    var card2 = findCard(tCards[1])
    var card3 = findCard(tCards[2]);
    var card4 = findCard(tCards[3]);
    var card5 = findCard(tCards[4]);
    retTCards = [card1, card2, card3, card4, card5];
    console.log(retPCards + " " + retTCards);
    return [retPCards, retTCards];
  }

function findCard(card) {
  console.log(card);
  var suit = Math.floor(card / 13);
  card = card - (13 * suit);
  console.log(card)
  if (suit == 0) {
    if (card == 9) {
      return "JS"
    }
    else if (card == 10) {
      return "QS"
    }
    else if (card == 11) {
      return "KS"
    }
    else if (card == 12) {
      return "AS"
    }
    else {
      return ((card+2) + "S");
    }
  }
  else if (suit == 1) {
    if (card == 9) {
      return "JD"
    }
    else if (card == 10) {
      return "QD"
    }
    else if (card == 11) {
      return "KD"
    }
    else if (card == 12) {
      return "AD"
    }
    else {
      return ((card+2) + "D");
    }
  }
  else if (suit == 2) {
    if (card == 9) {
      return "JC"
    }
    else if (card == 10) {
      return "QC"
    }
    else if (card == 11) {
      return "KC"
    }
    else if (card == 12) {
      return "AC"
    }
    else {
      return ((card+2) + "C");
    }
  }
  else if (suit == 3) {
    if (card == 9) {
      return "JH"
    }
    else if (card == 10) {
      return "QH"
    }
    else if (card == 11) {
      return "KH"
    }
    else if (card == 12) {
      return "AH"
    }
    else {
      return ((card+2) + "H");
    }
  }
}

function getSockets(room) { // will return all sockets with room name
  return Object.entries(io.sockets.adapter.rooms[room] === undefined ?
  {} : io.sockets.adapter.rooms[room].sockets )
    .filter(([id, status]) => status) // get only status = true sockets
    .map(([id]) => io.sockets.connected[id])
}
