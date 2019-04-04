"use strict";

const express = require("express");
const game = require("./src/GameActions.js");
const hg = require("./src/handgoodness.js")
const display = require("./src/display.js");
const room = require("./src/Gamerooms.js");
const validator = require("validator");
const path = require("path");
const sio = require("socket.io");
const pg = require("pg");
const hf = require("./src/handFinder.js");
const bp = require("body-parser");
const fs = require("fs")
const session = require('client-sessions')
const jq = require('jquery')
const pos = require('./src/possibility.js');

//The code for the database interaction
const lg = require("./src/transactions/index.js")

var flag = 1;

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


var rooms = [];

//let dropAllTables = fs.readFileSync("sql/drop_all_tables.sql", 'utf8');
//let initDb = fs.readFileSync("sql/init_db.sql", 'utf8');

const server = express()
  //.use((req, res) => res.sendFile(path.join(__dirname, "src/pages/game.html")))
  //Testing login page
  .use(express.static(__dirname + '/src/pages/'))
  //Converts post data to JSON
  .use(bp.urlencoded({ extended: false }))

  .use(
    session({
      cookieName: 'session',
      secret: 'LkX1KlxW5q92WR5CRgXqvYTUZi84umI7',
      duration: 30 * 60 * 1000,
      activeDuration: 5 * 60 * 1000,
      //httpOnly: true,
      //secure: true,
      ephemeral: true
    })
  )

  .post('/host_game', function(req, res) {
    /* this section needs to update the requesting usernme's room field in
    the databse to the name of the room they are creating. After this, they
    need to be redirected to the game lobby. This also needs to call
    the function that creates a room and inserts it into the rooms array
    */
    console.log(req.body);
    let roomName = req.body.roomName;
    let maxPlayers = req.body.numPlayers;
    let roomPass = req.body.roomPass;
    let numAI = req.body.numAI;
    let anteOption = req.body.anteOption
    let startChips = req.body.startChips;
    createRoom(roomName, maxPlayers, roomPass, numAI, anteOption, startChips);
    req.session.user.room = roomName;

    return res.redirect('/game.html');

  })

  .get('/getRooms', function(req, res) {
    console.log("in rooms");
    let innerHTMLForm = "";
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].name != undefined) {
        innerHTMLForm += '<input type="radio" id="' + rooms[i].name + '" name="radio" value="' + rooms[i].name + '"/>' + rooms[i].name + '</br>';
      }
    }
    if (rooms.length != 1) {
      innerHTMLForm += '<input type="submit" name="submit" value="Join Room"/>';
    }
    console.log(innerHTMLForm);
    return res.send(innerHTMLForm);
  })

  .post('/join_game', function(req, res) {
    /*
    for (let i = 0; i < 5; i++) {
      let name = "room" + i;
      createRoom(name, 3, "", 0, 0, 100);
      console.log(rooms[i].name);
    }
    /* Update the current players current room, redirect them to the game
    page.
    */
    //console.log("IN JOIN GAME: " + req.session.user.username);
    return res.redirect('/buttonDemo.html');
  })
  .post('/room_post', function(req, res) {
    //console.log("IN ROOM POST: " + req.session.user.username);
    req.session.user.room = req.body.radio;
    console.log(req.body.radio)
    let roomIndex = findRoom(req.body.radio);
    let currRoom = rooms[roomIndex];
    if (currRoom.password == "") {
      return res.redirect('/game.html');
    }
    else {
      //Do password verification
    }
    //console.log(req.session.user.room + " " + req.session.user.username);
  })

  .get('/search_players', function(req, res) {
    //Get the input from the page
    //Query for LIKE username in the database
    //Display all results to the user with a view profile and send button
  })

  .post('/redirect_main', function(req, res) {
    console.log(req.data.playerChips + " " + req.data.winStatus);

    res.redirect('/main.html');
  })

  .post('/search_rooms', function(req, res) {
    pool.connect()
      .then(client => {
        return lg.getRooms(client)
        .then(rooms => {
        client.release()
        console.log(rooms);
        if(!rooms){
          console.log("No open rooms");
          return res.redirect('/');
        } else {
          var header = "";
          var body = "";

          return res.redirect('/main.html');
        }
      })
      .catch(err => {
        client.release()
        console.log(err.stack);
        return res.redirect('/')
      })
    });
  })
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
            return res.redirect('/main.html');
          }
        })
        .catch(err => {
          console.log("HERE");
          client.release()
          console.log(err.stack);
          return res.send("Username is taken");
        })

      })

  })

  .post('/reset_pass', function(req, res) {
    let passOne = req.body.password_one;
    let passTwo = req.body.password_two;
    if (passOne != passTwo) {
      return res.redirect('/');
    }
    else {
      pool.connect()
        .then(client => {
          return lg.updatePassword(client, req.session.username, passOne)
          .then(validate => {
            client.release();
            if (validate == true) {
              console.log("SUCCESS");
              return res.redirect('/');
            }
            else {
              return res.redirect('/');
            }
          })
        });
    }
  })

  .post('/logout_get', function(req, res) {
    //Make sure current room is equal to null
    delete req.session.user;
    console.log(req.session.user);
    res.redirect('/index.html');
  })
  .post('/question_post', function(req, res) {
    console.log(req.body.answer);
    pool.connect()
      .then(client => {
        return lg.validateSecurityQuestion(client, req.session.username, req.body.answer)
        .then(val => {
          client.release();
          if (val.validate == false) {
            return res.redirect('/');
          }
          else {
            return res.redirect("/resetPass.html");
          }
        })
        .catch(err => {
          console.log(err.stack);
          client.release();
          return res.redirect('/')
        })
    })
  })

  .post('/password_post', function(req, res, next) {
    req.session.username = req.body.username;
    let content;
    pool.connect()
      .then(client => {
        return lg.getSecurityQuestion(client, req.body.username)
        .then(question => {
        client.release()
          if (question.question === undefined) {
            console.log(question.reason);
            return res.redirect('/');
          }
          else {
            let thisPath = path.join(__dirname, "/src/pages/question.html");
            fs.readFile(thisPath, "utf-8", function(err, data) {
              if (err) {
                console.log(err, 'error');
                return null;
              };
              content = data;
              content = content.replace('{QUESTION}', question.question);
              res.send(content);
            })
          }
      })
      .catch(err => {
        console.log("HERE");
        client.release()
        console.log(err.stack);
        return res.redirect('/');
      })
    })
  })

  .post('/username_post', function(req, res) {
    let content;
    pool.connect()
      .then(client => {
        return lg.updateUsername(client, req.session.user.userId, req.body.newUsername)
        .then(validate => {
          client.release();
            req.session.user.username = req.body.newUsername;
            return res.redirect("/main.html");
          })
        .catch(err => {
          console.log(err.stack);
          client.release();
          return res.redirect('/')
        })
    })
  })

  .post('/profile_page', function(req, res) {
    console.log(req.session.user);
    let content;
    pool.connect()
      .then(client => {
        return lg.profileQuery(client, req.session.user.userId)
        .then(profileResult => {
          client.release()

          let thisPath = path.join(__dirname, "/src/pages/profile.html");
          fs.readFile(thisPath, "utf-8", function(err, data) {
            if (err) {
              console.log(err, 'error');
              return null;
            };
            content = data;
            content = content.replace('{USER}', req.session.user.username);
            content = content.replace('{CHIPS}', profileResult.numChips);
            content = content.replace('{WINS}', profileResult.numWins);
            res.send(content);
          })
        })
        .catch(err => {
          console.log("HERE");
          client.release()
          console.log(err.stack);
          return res.redirect('/');
        })
      })
    })

  .post('/join_tutorial', function(req, res) {
    console.log("FROM TUTORIAL JOIN: " + req.session.user.username);
    return res.redirect('/tutorial.html');
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
              console.log(user);
              req.session.user = user;
              return res.redirect('/main.html');
            }
          })
          .catch(err => {
            client.release()
            console.log(err.stack);
            return res.redirect('/')
          })

        })

  })


  .get('/update_username', function(req,res){
    console.log("FROM USERNAME: " + req.session.user.username);
    if(req.session && req.session.user){
      return res.send(req.session.user.username);
    } else {
      return res.send("nobody");
    }
  })

  .get('/update_room', function(req, res) {
    console.log("FROM ROOM: " + req.session.user.room);
    if (req.session && req.session.user) {
      return res.send(req.session.user.room);
    }
    else {
      return res.send("nobody");
    }
  })

  .get('/join_room', function(req, res) {
    console.log(req.session.user);
    if (req.session && req.session.user) {
      currUser = req.session.user.username;

    }
  })

  .post('/')

  .listen(port, () => console.log(`Listening on ${ port }`));

const io = sio(server);

/*
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

var tableCards = [];

var usernames = {};
*/


// For all-in logic
var sidePot = 0;
var mainPot = 0; // parallel currentPot

// rooms which are currently available in chat
var rooms = ['room1'];

io.sockets.on('connection', function (socket) {
  // when the client emits 'adduser', this listesns and executes
  /*
  socket.on('adduser', function(username){
    if (username != null) {
      username = validator.escape(usernameupda);
    }
    else {
      return;
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
    */
    socket.on('adduser', function(username, room) {

      // get room index and set up socket information
      console.log(room);
      socket.username = username;
      socket.room = room;
      let currRoomIndex = findRoom(room);
      console.log(currRoomIndex);
      let currRoom = rooms[currRoomIndex];
      if (currRoom.gameStatus != 0) {
        game.addPlayerQueue(currRoom, socket);
        rooms[currRoomIndex] = currRoom;
        return;
      }
      else {
        currRoom = addPlayer(currRoom, socket);

      //add a player to the room, set the returned room to currRoom
      //if room was full
        if (currRoom == null) {
          return;
        }
        socket.join(room);
        console.log(currRoom);
        // if max numebr of players have joined
        if (currRoom.players.length == currRoom.maxPlayers) {
          currRoom = startGame(socket, currRoom);
          for (let i = 0; i < currRoom.players.length; i++) {
            io.to(currRoom.players[i].playerID).emit('updateScreen', currRoom.currentPot, currRoom.currentBet, currRoom.players[i].chips);
          }
        }
        rooms[currRoomIndex] = currRoom;
        //updateLog
        io.sockets.to(room).emit('updatechat', "Server", "New player has joined");
        console.log("JOINED ROOM");
        return;
      }
    })

    socket.on('sendchat', function (data) {
      //console.log(data);
      //make sure not empty
      if (data != "") {
        var newdata = validator.escape(data);
        //
        io.sockets.in(socket.room).emit('updatechat', socket.username, newdata);
        return;
      }
    });

    socket.on('playerRaise', function(amount) {
      console.log(amount);
      let roomIndex = findRoom(socket.room);
      let currRoom = rooms[roomIndex];
      //if (amount == 0) {

      //}
      //checks if there is a game running, if not dont do anything
      if (currRoom.gameStatus == 0) {
        return;
      }
      //checks if it is the current players turn
      if (!validatePlayer(socket)) {
        return;
      }
      //start raise logic
      var currPlayer = currRoom.players[currRoom.currentPlayer];
      var retArray = game.playerRaise(currRoom, currPlayer.playerID, currRoom.currentBet, amount);
      //if the raise failed / they do not have enough chips
      if (retArray == -1) {
        io.sockets.in(socket.id).emit('updatechat', "Server", "You cannot raise more than your current chips.")
        return;
      }
      //make the current room equal to the output of the raise logic
      currRoom = retArray[0];
      // Added: If some prior player was all-in, divert amount to main pot and side pot
      for (var i = 0; i < currRoom.players.length; i++)
      {
        if (currRoom.players[i].state == "ALLIN") {
          currRoom.sidePot += (retArray[1]-mainPot);
          mainPot += mainPot;
          break;
        }
      }

      for (var i = 0; i < currRoom.players.length; i++) {
        if (currRoom.players[i].state == "READY") {
          currRoom.players[i].state = "NOTREADY";
        }
      }
      currRoom.players[currRoom.currentPlayer].state = "READY";
      /*Update the socket emits and checking the ready state
      io.sockets.in(socket.room).emit('updatechat', "Server", socket.username + " raised " + raiseTo + ". The Pot is now " + currentPot + ".");
      checkReadyState(socket)
      */


      rooms[roomIndex] = currRoom;
      checkReadyState(socket)
      io.sockets.in(socket.room).emit('updatePlayer', null, currRoom.players[currRoom.currentPlayer].chips, currRoom.players[currRoom.currentPlayer].lastBet, false, true, currRoom.currentPlayer);

    })

    socket.on('playerCall', function() {
      let roomIndex = findRoom(socket.room);
      let currRoom = rooms[roomIndex];

      if (currRoom.gameStatus == 0) {
        io.sockets.in(socket.id).emit('updatechat', "Server", "A game has not started yet");
        return;
      }
      if (!validatePlayer(socket)) {
        return;
      }
      if (currRoom.currentBet == 0) {
        currRoom.players[currRoom.currentPlayer].state = "READY";
        //LOGS
        //io.sockets.in(socket.room).emit('updatechat', "Server", socket.username + " checked " + ". The Pot is now " + currentPot + ".");
        //FIX EMITS
      }
      else {
        var amount = currRoom.currentBet;
        var retArray = game.playerCall(currRoom, currRoom.players[currRoom.currentPlayer].playerID, currRoom.currentBet);
        if (retArray == -1) {
          currRoom.currentPot += currRoom.players[currRoom.currentPlayer].chips;
          currRoom.players[currRoom.currentPlayer].chips = 0;
          currRoom.players[currRoom.currentPlayer].state = "ALLIN";
        }
        else {

          // Added: If some prior player was all-in, divert amount to main pot and side pot
          for (var i = 0; i < currRoom.players.length; i++)
          {
            if (currRoom.players[i].state == "ALLIN") {
              sidePot += (retArray[1]-mainPot);
             mainPot += mainPot;
             break;
           }
          }

          currRoom.currentPot += retArray[2];
          currRoom.players[currRoom.currentPlayer] = retArray[1];
          rooms[currRoom] = currRoom;
          //LOGS
          //io.sockets.in(socket.room).emit('updatechat', "Server", socket.username + " called " + ". The Pot is now " + currentPot + ".");
        }
      }
      console.dir(currRoom.players[currRoom.currentPlayer]);

      checkReadyState(socket)
      io.sockets.in(socket.room).emit('updatePlayer', null, currRoom.players[currRoom.currentPlayer].chips, currRoom.players[currRoom.currentPlayer].lastBet, false, true, currRoom.currentPlayer);

    })
    //On player fold
    socket.on('playerFold', function() {
      io.sockets.to(socket.room).emit('updatechat', "Server", socket.username + " folded");
      console.log("Registered fold click");
      console.log(socket.username);
      let roomIndex = findRoom(socket.room);
      let currRoom = rooms[roomIndex];
      if (currRoom.gameStatus == 0) {
        //io.to(socket.id).emit('updatechat', "Server", "A game has not started yet");
        return;
      }
      if (!validatePlayer(socket)) {
        console.log("not this players turn");
        return;
      }
      currRoom.players[currRoom.currentPlayer].state = "FOLDED";




      var counter = 0;
      for (var i = 0; i < currRoom.players.length; i++) {
        if (currRoom.players[i].state == "FOLDED") {
          counter++;
        }
      }
      if (counter == currRoom.players.length-1) {
        currRoom.gameState = 3;
        progressGame(socket);
      }
      io.sockets.in(socket.room).emit('updatePlayer', null, null, null, true, true, currRoom.currentPlayer);
      io.sockets.in(socket.room).emit('updatePlayerCards', false, true, [], currRoom.currentPlayer);
      checkReadyState(socket);
    })

    socket.on('playerHint', function() {
      let roomIndex = findRoom(socket.room);
      let currRoom = rooms[roomIndex];
      createHint(currRoom, socket);
    })

    socket.on('disconnect', function() {
      let roomIndex = findRoom(socket.room);
      let currRoom = rooms[roomIndex];
      let winFlag = 0;
      let chipAmount = 0;
      let leaver;
      let leaverIndex;
      for (leaverIndex = 0; i < currRoom.players.length; i++) {
        if (currRoom.players[i].playerID == socket.id) {
          leaver = currRoom.players[i];
          currRoom.players.splice(i, 1);
          break;
        }
      }
      if (currRoom.players.length == 0) {
        if (gameStatus == 1) {
          winFlag = 1;
          chipAmount = leaver.chips;
        }
        rooms.splice(roomIndex, 1);
      }
      else {
        if (gameStatus == 1) {
          currRoom.playerCards.splice(leaverIndex, 1);
          if (currRoom.currPlayer == leaverIndex) {
            //Move the turn idleCounter
            //Move the turn indicator on client
          }
        }
      }



      /*
      console.log("DISCONNECT");
      let roomIndex = findRoom(socket.room);
      let currRoom = rooms[roomIndex];
      let winFlag = 0;
      if (currRoom.players.length == 1) {
        winFlag == 1;
      }
      for (let i = 0; i < currRoom.players.length; i++) {
        if (currRoom.players[i].playerID == socket.id) {
          let currChips = currRoom.players[i].chips;
          updateHistory(currChips, winFlag);
          if (currRoom.currentPlayer == i) {
            io.sockets.in(socket.room).emit('updatePlayer', null, null, null, true, true, currRoom.currentPlayer);
            io.sockets.in(socket.room).emit('updatePlayerCards', false, true, [], currRoom.currentPlayer);
          }
          currRoom.players.splice(i, 1);
          currRoom.playerCards.splice(i, 1);
          rooms[roomIndex] = currRoom;
          break;
        }
      }
      for (let k = 0; k < currRoom.players.length; k++) {
        console.log("PLAYER DISCONNECT PRINT");
        console.log(currRoom.players[k]);
      }
      if (currRoom.players.length == 0) {
        rooms.splice(roomIndex, 1);
      }
      else {
        checkReadyState(socket);
      }
      delete socket.room;
      */
  })

});

function updateHistory(userID, chips, winFlag) {
  pool.connect()
  .then(client => {
    return lg.updateChips(client, userID, chips)
    .then(updatedChips => {
      console.log(updatedChips.newChips);
      client.release()
    })
    .catch(err => {
      client.release()
      console.log(err.stack);
    })
  })
  if (winFlag) {
    pool.connect()
    .then(client => {
      return lg.updateWin(client, userID)
      .then(amountWins => {
        console.log(amountWins.numWins);
        client.release()
      })
      .catch(err => {
        client.release()
        console.log(err.stack);
      })
    })
  }
}

function findRoom(roomName) {
  for (let i = 0; i < rooms.length; i++) {
    //console.log(rooms[i].name);
    if (rooms[i].name == roomName) {
      return i;
    }
  }
  return "ERR";
}

/*
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
      gameState = 0;
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

      // Added: If some prior player was all-in, divert amount to main pot and side pot
      for (var i = 0; i < players.length; i++)
      {
        if (players[i].state == "ALLIN") {
          sidePot += (retArray[1]-mainPot);
          mainPot += mainPot;
          break;
        }
      }

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
    else if (parsed[0] == "/ignore") {
      ignoreList.push(socket.id);
      return;
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

          // Added: If some prior player was all-in, divert amount to main pot and side pot
          for (var i = 0; i < players.length; i++)
          {
            if (players[i].state == "ALLIN") {
              sidePot += (retArray[1]-mainPot);
             mainPot += mainPot;
             break;
           }
          }

          players[currentPlayer] = retArray[0];
          io.sockets.in(socket.room).emit('updatechat', "Server", socket.username + " called " + ". The Pot is now " + currentPot + ".");
        }
      }
      checkReadyState(socket)
    }
    else if (parsed[0] == "/blinds") {
      if (gameStatus == 0) {
        io.to(socket.id).emit('updatechat', "Server", "A game has not started yet");
        return;
      }
      io.to(socket.id).emit('updatechat', "Server", "The small blind is " + smallBlind + " and big blind is " + bigBlind + ".");
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
        console.log("validate player")
        return;
      }
      console.log("Validate player succeeds.");
      if (currentBet != 0 && currentPlayer != bigBlindPlacement && gameState != 0 && players[bigBlindPlacement].lastBet == bigBlind) {
        io.to(socket.id).emit("You cannot check when the current bet is higher than 0");
      }
      else{ console.log("Can check"); }
      players[currentPlayer].state = "READY";
      console.log(players[currentPlayer].state);
      checkReadyState(socket);
    }
    else if (parsed[0] == "/allin")
    {
      // Check game started
      if (gameStatus == 0)
      {
        io.to(socket.id).emit('updatechat', "Server", "A game has not started yet");
        return;
      }
      // Check valid player
      if (!validatePlayer(socket)) {
        console.log("vadlidate player")
        return;
      }

      var currPlayer = players[currentPlayer];
      var retArray = game.allIn(currPlayer);
      mainPot += retArray[1]; // subsequent bets match this to make this the winnable amount for the all-in player
      players[currentPlayer] = retArray[0];

      io.sockets.in(socket.room).emit('updatechat', "Server", socket.username + " went all-in at" + retArray[1] + ". The Pot is now " + currentPot + ". mainPot is now " + mainPot + ".");
      checkReadyState(socket)
    }
    else {
      if (data != "") {
        var newdata = validator.escape(data);
          for (var i = 0; i < players.length; i++) {
            if (!(ignoreList.includes(players[i].playerID))) {
              io.to(players[i].playerID).emit('updatechat', socket.username, newdata);
            }
          }
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
      if (players.length == 1) {
        players[0] = game.addPlayerplayer(players[0].playerID);
      }
    }
    console.log(players);
    // update list of users in chat, client-side
    io.sockets.emit('updateusers', usernames);
    // echo globally that this client has left
    socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
    socket.leave(socket.room);
  });
});
*/

function addPlayer(currRoom, socket) {
  currRoom = room.addPlayer(currRoom, socket);
  return currRoom;
}

function startGame(socket, currRoom) {
  currRoom.gameStatus = 1;
  currRoom.gameState = 0;
  currRoom.smallBlindPlacement = 0;
  currRoom.bigBlindPlacement = 1;
  currRoom.currentPlayer = (currRoom.bigBlindPlacement + 1) % currRoom.players.length;
  currRoom = beginRound(socket, currRoom);

  io.sockets.in(socket.room).emit('updatePlayer', null, null, null, false, true, currRoom.currentPlayer);

  return currRoom;
}


function checkReadyState(socket) {
  let currRoomIndex = findRoom(socket.room);
  let currRoom = rooms[currRoomIndex];
  let k = 0;
  for (let i = currRoom.currentPlayer; k < currRoom.players.length; i++) {
    if (i >= currRoom.players.length) {
      i = 0;
    }
    if (currRoom.players[i].state == "NOTREADY") {
      currRoom.currentPlayer = i;
      break;
    }
    k++;
  }
  if (k == currRoom.players.length) {
    currRoom = progressGame(socket)
  }
  for (let i = 0; i < currRoom.players.length; i++) {
    io.to(currRoom.players[i].playerID).emit('updateScreen', currRoom.currentPot, currRoom.currentBet, currRoom.players[i].chips);

  }
  //LOGS
  io.to(currRoom.players[currRoom.currentPlayer].playerID).emit("updatechat", "SERVER", "It is your turn");
  //io.to(currRoom.players[currRoom.currentPlayer].playerID).emit("updateTurn");

  rooms[currRoomIndex] = currRoom;
}

function beginRound(socket, currGame) {
  currGame.currentPot = 0;

  //console.log("Hello world")

  // Call GameAction.js to get cards
  var newGame = game.startGame(currGame);

  //playerCards = cards[0];
  //tableCards = cards[1];

  // Initialize player cards
  //fixedPCards = fixedCards[0];
  //fixedTCards = fixedCards[1];

  //Michael: Note i'm changing all of these from currGame. to newGame.
  //at the end of this, it will return newGame and the index of the current game
  //in rooms will be replaced by this.
  for (var i = 0; i < newGame.players.length; i++) {
    newGame.players[i].lastBet = 0;
    //This is what deals the cards
    newGame.players[i].cards = newGame.playerCards[i];
    newGame.players[i].fixedCards = newGame.fixedPCards[i];
  }

  // Small blind
  newGame = game.blind(newGame, newGame.players[newGame.smallBlindPlacement].playerID, newGame.smallBlind);
  newGame.currentPot += newGame.smallBlind;
  //game.players[smallBlindPlacement] = temp;

  // Big blind
  newGame = game.blind(newGame, newGame.players[newGame.bigBlindPlacement].playerID, newGame.bigBlind);
  newGame.currentPot += newGame.bigBlind;
  newGame.currentBet = newGame.bigBlind;
  //players[bigBlindPlacement] = temp;

  //printInfo(socket);
  let sanatizedPlayers = [];
  for (var i = 0; i < newGame.players.length; i++) {
    sanatizedPlayers.push({
        username: io.sockets.connected[newGame.players[i].playerID].username,
        chips: newGame.players[i].chips
    });
  }

  console.dir(sanatizedPlayers);

  io.sockets.in(socket.room).emit('renderBoardState',newGame.bigBlindPlacement, newGame.smallBlindPlacement, sanatizedPlayers);

  for (let i = 0; i < newGame.players.length; i++) {
    io.to(newGame.players[i].playerID).emit('dealCards', newGame.fixedPCards[i],i);

    io.to(newGame.players[i].playerID).emit('updateScreen', newGame.currentPot, newGame.currentBet, newGame.players[i].chips)
  }
  io.to(newGame.players[newGame.currentPlayer].playerID).emit("updatechat", "It is your turn");
  //console.log(newGame.players)
  //io.to(newGame.players[newGame.currentPlayer].playerID).emit("updatechat", "it is your turn");
  //io.to(newGame.players[newGame.currentPlayer].playerID).emit("updateTurn");

  return newGame;
}

function resetStates(currRoom)
{
  for (var i = 0; i < currRoom.players.length; i++)
  {
      if (currRoom.players[i].state != "FOLDED")
      {
        currRoom.players[i].state = "NOTREADY";
        currRoom.players[i].lastBet = 0;
      }
  }
}

function progressGame(socket) {
  //get the room the request was sent from
  let currRoom = rooms[findRoom(socket.room)];

  //check if the game is preflop
  if (currRoom.gameState == 0) { // Pre-flop
    var flop = [currRoom.fixedTCards[0], currRoom.fixedTCards[1], currRoom.fixedTCards[2]]
    resetStates(currRoom);
    /*
    for (var i = 0; i < players.length; i++) {
      if (players[i].state != "FOLDED") {
        players[i].state = "NOTREADY"
        players[i].lastBet = 0;
      }
    }
    */
    currRoom.currentPlayer = (currRoom.currentPlayer + 1) % currRoom.players.length;
    checkReadyState(socket);

    currRoom.gameState++;
    currRoom.currentBet = 0;
    io.sockets.in(socket.room).emit('flop', flop);
  }
  else if (currRoom.gameState == 1) { // Flop
    resetStates(currRoom);
    /*
    for (var i = 0; i < players.length; i++) {
      if (players[i].state != "FOLDED") {
        players[i].state = "NOTREADY"
        players[i].lastBet = 0;
      }
    }
    */
    currRoom.currentPlayer = (currRoom.currentPlayer + 1) % currRoom.players.length;
    checkReadyState(socket);
    currRoom.gameState++;
    currRoom.currentBet = 0;
    io.sockets.in(socket.room).emit('turn', currRoom.fixedTCards[3])
  }
  else if (currRoom.gameState == 2) { // Turn
    resetStates(currRoom);
    /*
    for (var i = 0; i < players.length; i++) {
      if (players[i].state != "FOLDED") {
        players[i].state = "NOTREADY"
        players[i].lastBet = 0;
      }
    }
    */
    currRoom.currentPlayer = (currRoom.currentPlayer + 1) % currRoom.players.length;
    checkReadyState(socket);
    currRoom.gameState++;
    currRoom.currentBet = 0;
    io.sockets.in(socket.room).emit('river', currRoom.fixedTCards[4])

  }
  else if (currRoom.gameState == 3) { // River

    var handRanks = [];
    for (var i = 0; i < currRoom.playerCards.length; i++) {
      if (currRoom.players[i].state != "FOLDED") {
        var hand = hf.finalhand(currRoom.playerCards[i], currRoom.tableCards)
        var matchArray = hf.match(hand);
        var handArray0 = hf.kinds(matchArray);
        var handArray1 = hf.flushAndStraight(hand,matchArray);
        if(handArray0[0]>handArray1[0]){
          handRanks.push(handArray0);
          currRoom.players[i].handRank = handArray0;
        }
        else {
          handRanks.push(handArray1);
          currRoom.players[i].handRank = handArray1;
        }
      }
    }

    //console.log("WINNER HAS BEEN CALCULATED")

    let winnerArray = hf.findWinner(handRanks);


    let winPlayers = [];
    for (let j = 0; j < winnerArray.length; j++) {
      for (let i = 0; i < currRoom.players.length; i++) {
        if (currRoom.players[i].state != "FOLDED") {
          if (winnerArray[j].toString() == currRoom.players[i].handRank.toString()) {
            winPlayers.push(currRoom.players[i]);
          }
        }
      }
    }

    let winner = winnerArray[0];

    var winnersArr = []
    var winString = winner.toString();
    //console.log(winString);


    for (var i = 0; i < currRoom.players.length; i++) {
      if (currRoom.players[i].state != "FOLDED") {
       var handRankString = currRoom.players[i].handRank.toString();
       //console.log(handRankString);
       if (handRankString == winString) {
         //console.log("WINNER FOUND");
          //winnersArr.push(currRoom.players[i].username);
          winnersArr.push(currRoom.players[i]);
          delete currRoom.players[i].handRank
       }
      }
    }

    //Modulo the hand winnings add that to whatever players
    //At this point we have an array of the usernames of winners.
    var winnings = Math.floor((currRoom.currentPot / winnersArr.length));
    let winnersNames = [];
    for (let k = 0; k < winnersArr.length; k++) {
      winnersNames.push(winnersArr[k].playerID)
    }
    io.sockets.in(socket.room).emit('winner', winnersNames.toString());

    /*for (var i = 0; i < winnersArr.length; i++) {
      io.sockets.in(socket.room).emit('winners', "Server", winnersArr[i] + " won. They win " + winnings + " chips.")
    }
    */
    for (var i = 0; i < currRoom.players.length; i++) {
      for (var j = 0; j < winnersArr.length; j++) {
        if (currRoom.players[i].playerID == winnersArr[j].playerID) {
          currRoom.players[i].chips += winnings;
          //console.log(currRoom.players[i].chips);
        }
      }
      currRoom.players[i].state = "NOTREADY";
      currRoom.players[i].lastBet = 0;
    }

    for (var i = 0; i < currRoom.players.length; i++) {
      if (currRoom.players[i].chips == 0) {
        io.sockets.in(socket.room).emit('lost', currRoom.players[i].playerID);
        currRoom.players.splice(i, 1);
      }
    }

    if (currRoom.players.length == 1) {
      io.sockets.in(socket.room).emit('finalWinner', currRoom.players[0].playerID);
      currRoom.gameStatus = 0;
      return;
    }

    // Reset round
    currRoom.gameState = 0;
    currRoom.currentPot = 0;
    currRoom.currentBet = 0;
    currRoom.smallBlindPlacement = currRoom.bigBlindPlacement;
    currRoom.bigBlindPlacement = (currRoom.bigBlindPlacement + 1) % currRoom.players.length;
    currRoom.currentPlayer = (currRoom.bigBlindPlacement + 1) % currRoom.players.length;

    // Begin new round
    currRoom = beginRound(socket, currRoom);
  } // end of last else chunk
  return currRoom;
} // end of progressGame()

function printInfo(socket) {
  let fixedCards = display.namePlayerAndTableCards(playerCards, tableCards);
  let fixedPCards = fixedCards[0];
  let fixedTCards = fixedCards[1];
  io.sockets.in(socket.room).emit('updatechat', "Server", "Pot: " + currentPot);
  io.sockets.in(socket.room).emit('updatechat', "Server", "Current Bet: " + currentBet);
  for (let i = 0; i < players.length; i++) {
    var variable = players[i];
    io.sockets.in(socket.room).emit('updatechat', "Chips: ", variable.username + ": " + variable.chips);
  }
  for (let i = 0; i < players.length; i++) {
    io.to(players[i].playerID).emit('updatechat', 'Your Cards: ', fixedPCards[i]);
  }
  if (gameState >= 1) {
    let flop = [fixedTCards[0], fixedTCards[1], fixedTCards[2]];
    io.sockets.in(socket.room).emit('updatechat', "Server", "Flop: " + flop);
  }
  if (gameState >= 2) {
    let turn = fixedTCards[3];
    io.sockets.in(socket.room).emit('updatechat', "Server", "Turn: " + turn);
  }
  if (gameState >= 3) {
    let river = fixedTCards[4];
    io.sockets.in(socket.room).emit('updatechat', "Server", "River: " + river);
  }
  io.sockets.in(socket.room).emit('updatechat', "Server", "It is now " + players[currentPlayer].username + "\'s turn.");
}

function validatePlayer(socket) {
  let currRoomIndex = findRoom(socket.room);
  let currRoom = rooms[currRoomIndex];
  let playerList = currRoom.players;
  for (var i = 0; i < playerList.length; i++) {
    if (playerList[i].playerID == socket.id) {
      if (currRoom.currentPlayer == i) {
        return true;
      }
      else {
        //FIX EMITS
        //io.to(players[i].playerID).emit('updatechat', "Server: ", "It is not your turn");
        return false;
      }
    }
  }
}



function joinRoom(socket, newRoom) {
  var joinRoom = findCurrentRoom()
  var player = game.addPlayer(socket.id);
  var i = 0;
  for (i = 0; i < rooms.length; i++) {
    if (newRoom == rooms[i].name) {
      break;
    }
  }
  var roomToJoin = rooms[i];
  socket.room = rooms[i].name;
  roomToJoin.players.push(player);
  socket.join(newRoom);

}

//Will take the game options as arguments
function createRoom(name, maxPlayers, password, numAI, anteOption, startChips) {
  //Do stuff with the database here. Insert into the games table
  var newRoom = room.createRoom(name, maxPlayers, password, numAI, anteOption, startChips);
  console.log(newRoom);
  rooms.push(newRoom);
}


//FOR HINT
function createHint(currRoom, socket) {
  let currPlayer;
  for (let i = 0; i < currRoom.players.length; i++) {
    if (currRoom.players[i].playerID == socket.id) {
      currPlayer = currRoom.players[i];
    }
  }
  let flop = [currRoom.tableCards[0], currRoom.tableCards[1], currRoom.tableCards[2]]
  let turn = currRoom.tableCards[3];
  let river = currRoom.tableCards[4];
  let tableArray;
  let match;
  let hintOutcome;
  if (currRoom.gameState == 0) {
    tableArray = hf.finalhand(currPlayer.cards, []);
    console.log(tableArray);
    match = hf.match(tableArray);
    hintOutcome = hg.handgoodness(tableArray, match);
    //console.log(hintOutcome);
    io.sockets.to(socket.id).emit('handHint', hintOutcome);
  }
  else if (currRoom.gameState == 1) {
    tableArray = hf.finalhand(currPlayer.cards, flop);
    console.log(tableArray);
    match = hf.match(tableArray);
    console.log(match);
    hintOutcome = pos.possibility(tableArray, match, 5)
    io.sockets.to(socket.id).emit('boardHint', hintOutcome);
  }
  else if (currRoom.gameState == 2) {
    flop.push(turn);
    tableArray = hf.finalhand(currPlayer.cards, flop);
    match = hf.match(tableArray);
    hintOutcome = pos.possibility(tableArray, match, 6)
    io.sockets.to(socket.id).emit('boardHint', hintOutcome);

  }
  else if (currRoom.gameState == 3) {
    flop.push(turn);
    flop.push(river);
    tableArray = hf.finalhand(currPlayer.cards, flop);
    match = hf.match(tableArray);
    hintOutcome = pos.possibility(tableArray, match, 7)
    io.sockets.to(socket.id).emit('boardHint', hintOutcome);

  }
  //get whoever clicked the hint button, do all of this with the currRoom.player[whatever]
  console.log(hintOutcome);
}
