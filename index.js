const express = require("express");
const app = express();
const pg = require("pg");
const pool = new pg.Pool({
  user: "uvqmfjuwtlhurl",
  host: "ec2-54-227-246-152.compute-1.amazonaws.com",
  database: "dajkjt3t4o0mtt",
  password: "aeae6293fd321e7d1eb3b1c95b3dcc93dd9878948aba3f1271b83a52472068b0",
  port: "5432",
  ssl: true
});
const port = process.env.PORT || 80;
const io = require("socket.io")();
const path = require("path");

var roomArray = new Array(100);

function Gameroom(roomName, numPlayers) {
  this.roomName = roomName;
  this.numPlayers = numPlayers;
}

for (var i = 0; i < 100; i++) {
  var room = new Gameroom("Room " + i, 0);
  roomArray[i] = room;
}

app.get("/", (req, res) => {
  var x = 0;
  while (roomArray[x].numPlayers > 7) {
    console.log(roomArray[x].numPlayers);
    x++;
    if (x == 100) {
      res.send("Sorry all rooms are full");
      return;
    }
  }
  res.send("You are player " + (roomArray[x].numPlayers + 1) + " in room " + roomArray[x].roomName);
  roomArray[x].numPlayers++;
  console.log(roomArray[x].roomName + ": " + roomArray[x].numPlayers);
});

app.get("/login", (req, res) => {
  var username = request.query.username;
  var password = request.query.password;
  pool.query("Select * from users where username = ${username}", (error, results)=> {

  });

});
/*
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
*/
app.listen(port);
