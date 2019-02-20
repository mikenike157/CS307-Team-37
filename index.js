'use strict';

const express = require('express');
const game = require('./GameActions.js');
const validator = require('validator');
const port = process.env.PORT || 80;
const path = require('path')
const sio = require('socket.io')
const pg = require('pg');
const hf = require('./handFinder.js')
const pool = new pg.Pool({
  user: 'uvqmfjuwtlhurl',
  host: 'ec2-54-227-246-152.compute-1.amazonaws.com',
  database: 'dajkjt3t4o0mtt',
  password: 'aeae6293fd321e7d1eb3b1c95b3dcc93dd9878948aba3f1271b83a52472068b0',
  port: '5432',
  ssl: true
});

const server = express()
  .use((req, res) => res.sendFile(path.join(__dirname, 'chat.html')))
  .listen(port, () => console.log(`Listening on ${ port }`));

const io = sio(server);


var players = [];

var roomArray = new Array(101)

var usernames = {};

// rooms which are currently available in chat
var rooms = ['room1'];
var availSockets = [];
io.sockets.on('connection', function (socket) {

	// when the client emits 'adduser', this listesns and executes
	socket.on('adduser', function(username){
		// store the username in the socket session for this client
    var player = game.addPlayer(socket.id, availSockets.length);
    players[availSockets.length] = player;
    availSockets.push(socket.id);
    username = validator.escape(username);
		socket.username = username;
		// store the room name in the socket session for this client
		socket.room = 'room1';
		// add the client's username to the global list
		usernames[username] = username;
    console.log()
    console.log(player);
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
    if (data == "/start") {
      var cards = game.startGame();
      var playerCards = cards[0];
      var tableCards = cards[1];
      console.log(playerCards);
      console.log(tableCards);
      var handRanks = [];
      for (var i = 0; i < playerCards.length; i++) {
        var hand = hf.finalhand(playerCards[i], tableCards)
        var matchArray = hf.match(hand);
        var handArray0 = hf.kinds(matchArray);
        var handArray1 = hf.flushAndStraight(hand,matchArray);
        if(handArray0[0]>handArray1[0]){
          handRanks.push(handArray0);
        }else{
          handRanks.push(handArray1);
        }
      }
      var winner = hf.findWinner(handRanks)
      for (var i = 0; i < availSockets.length; i++) {
        players[i].cards = playerCards[i];
        io.to(availSockets[i]).emit('updatechat', "Your Cards: ", playerCards[i]);
      }
      console.log(players)

      var newdata = validator.escape(data)
      //io.sockets.in(socket.room).emit('updatechat', "Player Cards: ", playerCards);
      //io.sockets.in(socket.room).emit('updatechat', "Table Cards: ", tableCards)
      return;
    }

    if (parsed[0] == "/bet") {
      var newdata = validator.escape(data)
      io.sockets.in(socket.room).emit('updatechat', socket.username, "Congrats youve bet " + parsed[1] + " chips.")
    }
    else {
      if (data != "") {
        var newdata = validator.escape(data)

        io.sockets.in(socket.room).emit('updatechat', socket.username, newdata);
      }
    }
	});


	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});

function getSockets(room) { // will return all sockets with room name
  return Object.entries(io.sockets.adapter.rooms[room] === undefined ?
  {} : io.sockets.adapter.rooms[room].sockets )
    .filter(([id, status]) => status) // get only status = true sockets
    .map(([id]) => io.sockets.connected[id])
}
