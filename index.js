'use strict';

const express = require('express');
const validator = require('validator');
const port = process.env.PORT || 80;
const path = require('path')
const sio = require('socket.io')
const pg = require('pg');
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

var roomArray = new Array(101)

var usernames = {};

// rooms which are currently available in chat
var rooms = ['room1'];

io.sockets.on('connection', function (socket) {

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// store the username in the socket session for this client
    username = validator.escape(username);
		socket.username = username;
		// store the room name in the socket session for this client
		socket.room = 'room1';
		// add the client's username to the global list
		usernames[username] = username;
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
    var newdata = validator.escape(data)
		// we tell the client to execute 'updatechat' with 2 parameters
    var parsed = [1, 2]// = newdata.split(" ");
    if (parsed[0] == "bet") {
      io.sockets.in(socket.room).emit('updatechat', socket.username, "Congrats youve bet " + parsed[1] + " chips.")
    }
    else {
      if (data != "") {
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
