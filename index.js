"use strict";

const express = require("express");
const game = require("./src/GameActions.js");
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
const gr = require("./src/Gamerooms.js");

//The code for the database interaction
const lg = require("./src/transactions/index.js")

let flag = 1;


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
  })

  .get('/join_game', function(req, res) {
    /* Update the current players current room, redirect them to the game
    page.
    */
    //console.log("IN JOIN GAME: " + req.session.user.username);
    return res.redirect('/buttonDemo.html');
  })
  .post('/room_post', function(req, res) {
    //console.log("IN ROOM POST: " + req.session.user.username);
    req.session.user.room = req.body.room;
    //console.log(req.session.user.room + " " + req.session.user.username);
    return res.redirect('/game.html');
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
            return res.redirect('/game.html');
          }
        })
        .catch(err => {
          client.release()
          console.log(err.stack);
          return res.redirect('/')
        })

      })

  })

  .get('/logout_get', function(req, res) {
    //Make sure current room is equal to null
    res.redirect('/index.html');
  })

  .post('/password_post', function(req, res) {
    pool.connect()
      .then(client => {
        console.log(client);
        return lg.getSecurityQuestion(client, req.body.username)
        .then(question => {
        client.release()
          if (question.question === undefined) {
            console.log(question.reason);
            return res.redirect('/');
          }
          else {
            let thispath = path.join(__dirname, "/pages/question.html")
            fs.readFile(thispath, function(err, data) {
              if (err) {
                console.log(err, 'error');
                return null;
              };
              data = data.replace('{QUESTION}', question.question);
              next(data);
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
              console.log("197");
              req.session.user = user;
              return res.redirect('/game.html');
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
    console.log("FROM ROOM: " + req.session.user);
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


// For all-in logic
var sidePot = 0;
var mainPot = 0; // parallel currentPot

// rooms which are currently available in chat
var rooms = ['room1'];
io.sockets.on('connection', function (socket) {
  // when the client emits 'adduser', this listesns and executes

    socket.on('adduser', function(username, room) {
      // get room index and set up socket information
      if(flag){
        for (let i = 0; i < 3; i++){
          let newRoom = createRoom("room" + (i+1));
          rooms.push(newRoom); 
        }
        flag = 0;
      }

      room = "room1";

      let currRoomIndex = findRoom(room);
      socket.username = username;
      socket.room = room;
      //add a player to the room, set the returned room to currRoom
      let currRoom = addPlayer(rooms[currRoomIndex], socket);
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
          io.to(currRoom.players[i].playerID).emit('updateScreen', currRoom.currentPot, currRoom.current, currRoom.players[i].chips);
        }
      }
      rooms[currRoomIndex] = currRoom;
      console.log("JOINED ROOM");
      return;
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
          //io.sockets.in(socket.room).emit('updatechat', "Server", socket.username + " called " + ". The Pot is now " + currentPot + ".");
        }
      }
      checkReadyState(socket)
    })
    socket.on('playerFold', function() {
      console.log("Registered fold click");
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
      checkReadyState(socket);
    })
});

function findRoom(roomName) {
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].name == roomName) {
      return i;
    }
  }
  return "ERR";
}

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
  io.to(currRoom.players[currRoom.currentPlayer].playerID).emit("updatechat", "It is your turn");
  io.to(currRoom.players[currRoom.currentPlayer].playerID).emit("updateTurn");

  rooms[currRoomIndex] = currRoom;
}

function beginRound(socket, currGame) {
  currGame.currentPot = 0;

  console.log("Hello world")

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
  for (let i = 0; i < newGame.players.length; i++) {
    io.to(newGame.players[i].playerID).emit('dealCards', newGame.fixedPCards[i]);
    io.to(newGame.players[i].playerID).emit('updateScreen', newGame.currentPot, newGame.currentBet, newGame.players[i].chips)
  }
  console.log(newGame.players)
  io.to(newGame.players[newGame.currentPlayer].playerID).emit("updatechat", "it is your turn");
  io.to(newGame.players[newGame.currentPlayer].playerID).emit("updateTurn");

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

    console.log("WINNER HAS BEEN CALCULATED")
    let winner = hf.findWinner(handRanks)

    var winnersArr = []
    var winString = winner.toString();
    console.log(winString);

    for (var i = 0; i < currRoom.players.length; i++) {
      if (currRoom.players[i].state != "FOLDED") {
       var handRankString = currRoom.players[i].handRank.toString();
       console.log(handRankString);
       if (handRankString == winString) {
         console.log("WINNER FOUND");
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
          console.log(currRoom.players[i].chips);
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

function sendLog(socket) {
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

//Send all client-visible data so that it can be rendered on the screen
function sendVisibleData(socket){

  io.sockets.in(socket.room).emit('updatedisplay', fixedTCards, 'fixedTCards');
  io.sockets.in(socket.room).emit('updatedisplay', currentPot, 'currentPot');
  io.sockets.in(socket.room).emit('updatedisplay', currentBet, 'currentBet');

  for(let i  = 0; i < players.length; i++){

    io.to(players[i].playerID).emit('updatedisplay', players[i].chips, 'chips['+i+']');
    io.to(players[i].playerID).emit('updatedisplay', fixedpCards[i], 'fixedPCards');
  }
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
function createRoom(name) {
  //Do stuff with the database here. Insert into the games table
  var newRoom = room.createRoom(name);
  console.log(newRoom);
  rooms.push(newRoom);
}
