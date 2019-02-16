'use strict';

const express = require('express');
const app = express();
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

app.get('/', function(req, res) => {
  res.sendFile(__dirname + 'chat.html');
});

app.get('room1' function(req, res) => {

})

app.get('room2' function(req, res) => {
  
})

io.on('connection', function(socket) {
  console.log('connect');
  socket.on('disconnect', () => console.log('disconnect'));
});

app.get()



setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
