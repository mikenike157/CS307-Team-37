"use strict";

const express = require("express");
const game = require("./src/GameActions.js");
const validator = require("validator");
const path = require("path");
const sio = require("socket.io");
const pg = require("pg");
const hf = require("./src/handFinder.js");
const bp = require("body-parser");
const fs = require("fs")
const session = require('client-sessions')

//The code for the database interaction
const lg = require("./src/transactions/index.js")


const port = process.env.PORT || 80;

const pool = new pg.Pool({
  user: "uvqmfjuwtlhurl",
  host: "ec2-54-227-246-152.compute-1.amazonaws.com",
  database: "dajkjt3t4o0mtt",
  password: "aeae6293fd321e7d1eb3b1c95b3dcc93dd9878948aba3f1271b83a52472068b0",
  port: "5432",
  ssl: true
});

/*const test_pool = new pg.Pool({
  database: "poker-university-test",
  host:"localhost"
}); */




//let dropAllTables = fs.readFileSync("sql/drop_all_tables.sql", 'utf8');
//let initDb = fs.readFileSync("sql/init_db.sql", 'utf8');


const server = express()
  //.use((req, res) => res.sendFile(path.join(__dirname, "pages/chat.html")))
  //Testing login page
  .use(express.static(__dirname + '/src/pages'))
  //Converts post data to JSON
  .use(bp.urlencoded({ extended: false }))

  .use(
    session({
      cookieName: 'session',
      secret: 'LkX1KlxW5q92WR5CRgXqvYTUZi84umI7',
      duration: 1000,
      activeDuration: 1000,
      httpOnly: true,
      secure: true,
      ephemeral: true
    })
  )

  //attempts to register new user in database
  .post('/register_post',  function(req, res){

      //create promise that returns a user from the database

      pool.connect()
        .then(client => {
          return lg.createUser(client, req.body)
          .then(user => {

          client.release()

          console.log(user);
          if(!user){
            console.log(user);
            return res.redirect('/');
          } else {
            console.log(user);
            req.session.user = user;
            return res.redirect('/chat.html');
          }
        }) 
        .catch(err => {
          client.release()
          console.log(err.stack);
          return res.redirect('/')
        }) 
          
      })
    
  })

  //validates login credentials of user
  .post('/login_post',  function(req, res){
    console.log("begin login");

      //create promise that returns a user from the database
      //const result = lg.validateUser(client, req.body.username, req.body.password);

      pool.connect()
        .then(client => {
          return lg.validateUser(client, req.body.username, req.body.password)
          .then(user => {

          client.release()

            console.log(user);
            if( user.userId === undefined ){
              console.log(user.reason);
              return res.redirect('/');
            } else {
              console.log(user.userId);
              req.session.user = user;
              return res.redirect('/chat.html');
            }
          }) 
          .catch(err => {
            client.release()
            console.log(err.stack);
            return res.redirect('/')
          }) 
          
        })
    
  })
  
  .listen(port, ()  => console.log(`Listening on ${ port }`));

const io = sio(server);


let players = [];

let roomArray = new Array(101);

let usernames = {};

// rooms which are currently available in chat
let rooms = ["room1"];
let availSockets = [];
io.sockets.on("connection", function (socket) {

  // when the client emits 'adduser', this listesns and executes
  socket.on("adduser", function(username){
    // store the username in the socket session for this client
    let player = game.addPlayer(socket.id, availSockets.length);
    players[availSockets.length] = player;
    availSockets.push(socket.id);
    username = validator.escape(username);
    socket.username = username;
    // store the room name in the socket session for this client
    socket.room = "room1";
    // add the client's username to the global list
    usernames[username] = username;
    console.log();
    console.log(player);
    // send client to room 1
    socket.join("room1");
    // echo to client they've connected
    socket.emit("updatechat", "SERVER", "you have connected to room1");
    // echo to room 1 that a person has connected to their room
    socket.broadcast.to("room1").emit("updatechat", "SERVER", username + " has connected to this room");
    socket.emit("updaterooms", rooms, "room1");
  });

  // when the client emits 'sendchat', this listens and executes
  socket.on("sendchat", function (data) {
    // we tell the client to execute 'updatechat' with 2 parameters
    let parsed = data.split(" ");
    if (data == "/start") {
      let cards = game.startGame();
      let playerCards = cards[0];
      let tableCards = cards[1];
      console.log(playerCards);
      console.log(tableCards);
      let handRanks = [];
      for (let i = 0; i < playerCards.length; i++) {
        let hand = hf.finalhand(playerCards[i], tableCards);
        let matchArray = hf.match(hand);
        let handArray0 = hf.kinds(matchArray);
        let handArray1 = hf.flushAndStraight(hand, matchArray);
        if (handArray0[0]>handArray1[0]){
          handRanks.push(handArray0);
        } else {
          handRanks.push(handArray1);
        }
      }
      let winner = hf.findWinner(handRanks);
      for (let i = 0; i < availSockets.length; i++) {
        players[i].cards = playerCards[i];
        io.to(availSockets[i]).emit("updatechat", "Your Cards: ", playerCards[i]);
      }
      console.log(players);

      let newdata = validator.escape(data);
      //io.sockets.in(socket.room).emit('updatechat', "Player Cards: ", playerCards);
      //io.sockets.in(socket.room).emit('updatechat', "Table Cards: ", tableCards)
      return;
    }

    if (parsed[0] == "/bet") {
      let newdata = validator.escape(data);
      io.sockets.in(socket.room).emit("updatechat", socket.username, "Congrats youve bet " + parsed[1] + " chips.");
    } else {
      if (data != "") {
        let newdata = validator.escape(data);

        io.sockets.in(socket.room).emit("updatechat", socket.username, newdata);
      }
    }
  });


  // when the user disconnects.. perform this
  socket.on("disconnect", function(){
    // remove the username from global usernames list
    delete usernames[socket.username];
    // update list of users in chat, client-side
    io.sockets.emit("updateusers", usernames);
    // echo globally that this client has left
    socket.broadcast.emit("updatechat", "SERVER", socket.username + " has disconnected");
    socket.leave(socket.room);
  });
});

function getSockets(room) { // will return all sockets with room name
  return Object.entries(io.sockets.adapter.rooms[room] === undefined ?
    {} : io.sockets.adapter.rooms[room].sockets )
    .filter(([id, status]) => status) // get only status = true sockets
    .map(([id]) => io.sockets.connected[id]);
}
