const express = require('express');
const app = express();
const port = process.env.PORT || 80;
const io = require('socket.io')();
const path = require('path')

var roomArray = new Array(100)

function Gameroom(roomName, numPlayers) {
  this.roomName = roomName;
  this.numPlayers = numPlayers;
}

for (var i = 0; i < 100; i++) {
  var room = new Gameroom("Room " + i, 0);
  roomArray[i] = room;
}

app.get('/', (req, res) => {
    var x = 0;
    while (roomArray[x].numPlayers > 7) {
      console.log(roomArray[x].numPlayers)
      x++;
    }
    res.send("Hello World")
    roomArray[x].numPlayers++;
    console.log(roomArray[x].roomName + ": " + roomArray[x].numPlayers);
});

io.on('connection', function(socket) {
  console.log("User connected");
  numPeople++;
  console.log(numPeople);
  socket.on('disconnect', function() {
    console.log("User disconnected");
    numPeople--;
    console.log(numPeople);
  });
});

app.listen(port)
