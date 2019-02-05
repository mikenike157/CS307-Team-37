const express = require('express');
const app = express();
const port = process.env.PORT || 80;
const io = require('socket.io')();
const path = require('path')

var numPeople = 0;

app.get('/', (req, res) => {
  res.send('Hello World'))
  count++;
  console.log(count);
}

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
