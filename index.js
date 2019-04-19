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
const defaultProfilePic = fs.readFileSync("test/boxes.png");
/*const test_pool = new pg.Pool({
  database: "poker-university-test",
  host:"localhost"
}); */
var rooms = [];
var loggedUsers = [];
//let dropAllTables = fs.readFileSync("sql/drop_all_tables.sql", 'utf8');
//let initDb = fs.readFileSync("sql/init_db.sql", 'utf8');
const server = express()
  //.use((req, res) => res.sendFile(path.join(__dirname, "src/pages/game.html")))
  //Testing login page
  .use(express.static(__dirname + '/src/pages/'))
  .use('/change_avatar', bp.raw({
    type: "image/*"
  }))
  //Converts post data to JSON
  .use(bp.urlencoded({
    extended: false,
    type: 'application/x-www-form-urlencoded'
  }))
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
    req.session.user.status = "INGAME"
    loggedUsers.push(req.session.user);
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
  .get('/checkPassword', function(req, res) {})
  .get('/getRooms', function(req, res) {
    console.log("in rooms");
    let innerHTMLForm = "";
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].name != undefined) {
        innerHTMLForm += '<input type="radio" id="' + rooms[i].name +
          '" name="radio" value="' + rooms[i].name + '"/>' +
          rooms[i].name;
        if (rooms[i].password == "") {
          innerHTMLForm += ' OPEN</br>'
        } else {
          innerHTMLForm += ' LOCKED</br>'
        }
      }
    }
    if (rooms.length != 1) {
      innerHTMLForm += '<button type="button" name="submit" onclick="validatePassword()" value="Join Room">Join Room</button>';
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
    console.log("MADE IT TO ROOM POST")
    //console.log("IN ROOM POST: " + req.session.user.username);
    req.session.user.room = req.body.roomName;
    return res.redirect('/game.html');
    //console.log(req.session.user.room + " " + req.session.user.username);
  })
  .get('/search_players', function(req, res) {
    //Get the input from the page
    //Query for LIKE username in the database
    //Display all results to the user with a view profile and send button
  })
  .get('/get_leaderboard_chips', function(req, res) {
    var boardArray = [];
    pool.connect()
      .then(client => {
        return lg.getLeaderboardChips(client)
          .then(leaderBoard => {
            client.release();
            console.log(leaderBoard.length);
            for (let i = 0; i < leaderBoard.length; i++) {
              let temp = leaderBoard[i].row;
              boardArray.push(temp);
              //console.log(boardArray);
            }
            console.log(boardArray);
            return res.send(boardArray);
          })
          .catch(err => {
            client.release();
            console.log(err.stack);
          })
      })
  })
  .get('/get_leaderboard_wins', function(req, res) {
    var boardArray = [];
    pool.connect()
      .then(client => {
        return lg.getLeaderboardWins(client)
          .then(leaderBoard => {
            client.release();
            console.log(leaderBoard.length);
            for (let i = 0; i < leaderBoard.length; i++) {
              let temp = leaderBoard[i].row;
              boardArray.push(temp);
              //console.log(boardArray);
            }
            console.log(boardArray);
            return res.send(boardArray);
          })
          .catch(err => {
            client.release();
            console.log(err.stack);
          })
      })
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
            if (!rooms) {
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
  .post('/register_post', function(req, res) {
    //create promise that returns a user from the database
    pool.connect()
      .then(client => {
        return lg.createUser(client, req.body)
          .then(user => {
            client.release()
            console.log(user);
            if (!user) {
              console.log(user);
              return res.redirect('/');
            } else {
              console.log(user);
              user.status = "Online";
              user.index = loggedUsers.length;
              loggedUsers.push(user);
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
    } else {
      pool.connect()
        .then(client => {
          return lg.updatePassword(client, req.session.username, passOne)
            .then(validate => {
              client.release();
              if (validate == true) {
                console.log("SUCCESS");
                return res.redirect('/');
              } else {
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
            } else {
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
            } else {
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
  .all('/profile_page', function(req, res) {
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
              content = content.replace('{ID}', req.session.user.userId);
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
  .post('/login_post', function(req, res) {
    //create promise that returns a user from the database
    //const result = lg.validateUser(client, req.body.username, req.body.password);
    pool.connect()
      .then(client => {
        return lg.validateUser(client, req.body.username, req.body.password)
          .then(user => {
            client.release()
            console.log(user);
            if (user.userId === undefined) {
              console.log(user.reason);
              return res.redirect('/');
            } else {
              console.log(user);
              user.status = "Online"
              loggedUsers.push(user);
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
  .get('/update_username', function(req, res) {
    console.log("FROM USERNAME: " + req.session.user.username);
    if (req.session && req.session.user) {
      return res.send(req.session.user.username);
    } else {
      return res.send("nobody");
    }
  })
  .get('/update_room', function(req, res) {
    console.log("FROM ROOM: " + req.session.user.room);
    if (req.session && req.session.user) {
      return res.send(req.session.user.room);
    } else {
      return res.send("nobody");
    }
  })
  .get('/join_room', function(req, res) {
    console.log(req.session.user);
    if (req.session && req.session.user) {
      currUser = req.session.user.username;
    }
  })
  .get('/avatar/:id', function(req, res) {
    (async () => {
      const client = await pool.connect();
      try {
        const pic = await lg.getProfilePicture(client, req.params.id);
        res.attachment('avatar.png');
        res.send((pic === null) ? defaultProfilePic : pic);
      } catch (e) {
        console.log(e);
        res.sendStatus(500);
      } finally {
        client.release();
      }
    })();
  })
  .post('/change_avatar', function(req, res) {
    // Change the user's avatar
    if (!req.session || !req.session.user) {
      res.sendStatus(401);
      return res.send("Log in you dum dum");
    }
    (async () => {
      const client = await pool.connect();
      try {
        let userId = req.session.user.userId;
        let pic = req.body;
        console.log(pic);
        let stat = await lg.setProfilePicture(client, userId, pic);
        if (!stat) {
          res.sendStatus(500);
          res.send("Profile picture not changed?");
        } else {
          res.send("done");
        }
      } catch (e) {
        res.sendStatus(500);
        res.send(e);
      } finally {
        client.release();
      }
    })();
  })
  .post('/')
  .listen(port, () => console.log(`Listening on ${ port }`));

const io = sio(server);

// Constants referring to game states

const Phase = {
  PREFLOP: 0,
  FLOP: 1,
  TURN: 2,
  RIVER: 3,
};

// For all-in logic
var sidePot = 0;
var mainPot = 0; // parallel currentPot
// rooms which are currently available in chat
var rooms = ['room1'];
/* Beginning of client-server communication for socket.io

Important things to note: whenever a request is sent from the client, it is sent in the
form of a socket. This socket holds the socket id and the room name they are currently in.
This allows us to send to only the sockets in one specific room. To send a request/response
to one speific client, user io.sockets.to(the socket id).emit(Whatever javascript function on the client side).
Look at the format in game.html to see how the socket commands are set up.

For every game, the number of players currently in the game
is currRoom.players.length. For every player object, player.playerID is the socket id.
socket.room gets the current room that the player is in. */
//On any request
io.sockets.on('connection', function(socket) {
  socket.on('checkRoomPass', function(roomName) {
    console.log("ROOM NAME: " + roomName);
    let roomIndex = findRoom(roomName);
    let currRoom = rooms[roomIndex];
    if (currRoom === undefined) {
      console.error("Current room named " + room + " is undefined!");
      return;
    }
    console.log("PASSWORD: " + currRoom.password);
    if (currRoom.password == "") {
      io.to(socket.id).emit('joinGame');
    } else {
      io.to(socket.id).emit('givePass', currRoom.password);
      //Do password verification
    }
  })
  socket.on('joinMain', function(username) {
    socket.username = username;
    socket.room = "main";
    socket.join("main");
    return;
  })
  socket.on('gameSelection', function(username) {
    console.log(socket.username);
    socket.room = "gameSearch";
    return;
  })
  //addUser is emitted
  socket.on('adduser', function(username, room) {
    // get room index and set up socket information
    socket.username = username;
    socket.room = room;
    let currRoomIndex = findRoom(room);
    let currRoom = rooms[currRoomIndex];
    if (currRoom === undefined) {
      console.error("Current room named " + room + " is undefined!");
      return;
    }
    if (currRoom.isGameStarted) {
      socket.join(room);
      currRoom = addPlayerQueue(currRoom, socket);
      rooms[currRoomIndex] = currRoom;
      return;
    } else {
      currRoom = addPlayer(currRoom, socket);
      //add a player to the room, set the returned room to currRoom
      //if room was full
      if (currRoom == null) {
        return;
      }
      socket.join(room);
      console.log(currRoom);
      // if max number of players have joined
      if (currRoom.players.length == currRoom.maxPlayers) {
        currRoom = startGame(socket, currRoom);
        for (let i = 0; i < currRoom.players.length; i++) {
          io.to(currRoom.players[i].playerID).emit('updateScreen', currRoom.currentPot, currRoom.currentBet, currRoom.players[i].chips);
        }
      }
      rooms[currRoomIndex] = currRoom;
      io.sockets.to(room).emit('updatechat', "Server", "New player has joined");
      console.log("JOINED ROOM");
      return;
    }
  })
  socket.on('sendchat', function(data) {
    let parsed = data.split(" ");
    //parsed[0] is command, parsed[1] is recipient, parsed[2] is reason, parsed[3] is expiry, parsed[4] is type
    if (parsed[0] == "/ban") {
      findUserId(socket.id, function(id) {
        executeBan(parsed[1], parsed[2], parsed[3], parsed[4]);
      })
      return;
    } else if (parsed[0] == "/backlog") {
      return;
    } else if (parsed[0] == "/chips") {
      grantChips(socket.username, parsed[1], parsed[2]);
      return;
    } else if (parsed[0] == "/admin") {
      if (parsed.length != 2) {
        io.to(socket.id).emit('updatechat', "SERVER", "Invalid command");
        return;
      }
      let temp = adminWrapper(socket.username);
      return;
    } else if (parsed[0] == "/mute" || parsed[0] == "/unmute") {
      setMute(socket.username, parsed[1], parsed[0] == "/mute");
    }
    //console.log(data);
    //make sure not empty
    if (data != "") {
      (async function() {
        try {
          let client = await pool.connect();
          let sid = await lg.getUserIdByUsername(client, senderName);
          let silenced = await lg.getBans(client, sid, false);
          if (silenced) {
            socket.emit('updatechat', "Server",
              `You are silenced: ${silenced[0].reason}`);
            return;
          }
          let newdata = validator.escape(data);
          let senderName = socket.username;
          let allSockets = io.sockets.in(socket.room).sockets;
          for (let key in allSockets) {
            let socket = allSockets[key];
            if (socket.room === null) continue;
            let recipientName = socket.username;
            (async function() {
              let rid = await lg.getUserIdByUsername(client, recipientName);
              let ignored = await lg.isMuted(client, rid, sid);
              if (!ignored) {
                socket.emit('updatechat', senderName, newdata);
              }
            })().catch(console.log);
          }
        } finally {
          client.release();
        }
      })().catch(console.log);
      // io.sockets.in(socket.room).emit('updatechat', socket.username, newdata);
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
    if (currRoom === undefined || !currRoom.isGameStarted) {
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
    for (var i = 0; i < currRoom.players.length; i++) {
      if (currRoom.players[i].state == "ALLIN") {
        currRoom.sidePot += (retArray[1] - mainPot);
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
    currRoom.players[currRoom.currentPlayer].idleTurns = 0;
    /*Update the socket emits and checking the ready state
    io.sockets.in(socket.room).emit('updatechat', "Server", socket.username + " raised " + raiseTo + ". The Pot is now " + currentPot + ".");
    checkReadyState(socket)
    */
    rooms[roomIndex] = currRoom;
    checkReadyState(socket);
    io.sockets.in(socket.room).emit('updatePlayer', null, currRoom.players[currRoom.currentPlayer].chips, currRoom.players[currRoom.currentPlayer].lastBet, false, true, currRoom.currentPlayer);
  })
  //Call button is clicked
  socket.on('playerCall', function() {
    //Get index and room object
    let roomIndex = findRoom(socket.room);
    let currRoom = rooms[roomIndex];
    //If there is not a game in progress
    if (!currRoom.isGameStarted) {
      io.sockets.in(socket.id).emit('updatechat', "Server", "A game has not started yet");
      return;
    }
    //If it is not the current player making the request (clicking a button)
    if (!validatePlayer(socket)) {
      return;
    }
    //If it is a check
    if (currRoom.currentBet == 0) {
      currRoom.players[currRoom.currentPlayer].state = "READY";
      //LOGS
      //io.sockets.in(socket.room).emit('updatechat', "Server", socket.username + " checked " + ". The Pot is now " + currentPot + ".");
      //FIX EMITS
    }
    //If money is being put in
    else {
      var amount = currRoom.currentBet;
      var retArray = game.playerCall(currRoom, currRoom.players[currRoom.currentPlayer].playerID, currRoom.currentBet);
      if (retArray == -1) {
        currRoom.currentPot += currRoom.players[currRoom.currentPlayer].chips;
        currRoom.players[currRoom.currentPlayer].chips = 0;
        currRoom.players[currRoom.currentPlayer].state = "ALLIN";
      } else {
        // Added: If some prior player was all-in, divert amount to main pot and side pot
        for (var i = 0; i < currRoom.players.length; i++) {
          if (currRoom.players[i].state == "ALLIN") {
            sidePot += (retArray[1] - mainPot);
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
    currRoom.players[currRoom.currentPlayer].idleTurns = 0;
    console.dir(currRoom.players[currRoom.currentPlayer]);
    checkReadyState(socket);
    io.sockets.in(socket.room).emit('updatePlayer', null, currRoom.players[currRoom.currentPlayer].chips, currRoom.players[currRoom.currentPlayer].lastBet, false, true, currRoom.currentPlayer);
  });

  // On player fold
  socket.on('playerFold', function() {
    console.log("Registered fold click");
    console.log(socket.username);
    let roomIndex = findRoom(socket.room);
    let currRoom = rooms[roomIndex];
    if (!currRoom.isGameStarted) {
      return;
    }
    if (!validatePlayer(socket)) {
      console.log("not this players turn");
      return;
    }
    currRoom.players[currRoom.currentPlayer].idleTurns = 0;
    fold(socket, currRoom);
  });
  // Hint button
  socket.on('playerHint', function() {
    let roomIndex = findRoom(socket.room);
    let currRoom = rooms[roomIndex];
    createHint(currRoom, socket);
  });
  // When a player leaves the game and disconnects from the socket
  socket.on('disconnect', function() {
    disconnect(socket);
  });
});
async function adminWrapper(sender, recipient) {
  pool.connect()
    .then(userId => {
      let id;
      pool.connect()
        .then(client => {
          return lg.getUserIdByUsername(client, username)
            .then(userId => {
              console.log(userId);
              client.release()
              id = userId;
            })
            .catch(err => {
              client.release()
              console.log(err.stack);
              return;
            })
        })
    })
}

function executeBan(sender, recipient, reason, expiry, type) {
  (async function() {
    let client = await pool.connect();
    try {
      let expiryNum = Date.parse(expiry);
      if (isNaN(expiryNum)) expiryNum = null;
      let sid = await lg.getUserIdByUsername(sender);
      let rid = await lg.getUserIdByUsername(recipient);
      lg.banUser(client, sid, rid, reason, expiryNum, type);
    } finally {
      client.release();
    }
  })().catch(console.log);
}

function checkAdminStatus(userId) {
  console.log("CHECK ADMIN: " + userId);
  pool.connect()
    .then(client => {
      return lg.isAdmin(client, userId)
        .then(adminCheck => {
          console.log(adminCheck);
          client.release()
          return adminCheck;
        })
        .catch(err => {
          client.release()
          console.log(err.stack);
          return false;
        })
    })
}

function grantChips(sender, recipient, amount) {
  findUserId(sender, function(sid) {
    findUserId(recipient, function(rid) {
      pool.connect()
        .then(client => {
          return lg.updateChips(client, id, amount)
            .then(newChips => {
              console.log(newChips);
              client.release();
              return 1;
            })
            .catch(err => {
              client.release();
              console.log(err.stack);
              return -1;
            })
        })
    })
  })
}

function setMute(sender, recipient, value) {
  (async function() {
    let client = await pool.connect();
    try {
      lg.setMuteName(client, sender, recipient, value);
    } finally {
      client.release();
    }
  })().catch(console.log);
}

function grantAdmin(id, val) {
  pool.connect()
    .then(client => {
      return lg.setAdmin(client, id, val)
        .then(userId => {
          client.release()
          return 1;
        })
        .catch(err => {
          client.release()
          console.log(err.stack);
          return -1;
        })
    })
}
//Called on leave, updates the chips and winning status of the leaver
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

function findUserId(username) {}
//Gets the array index of the room given the string of the room name
function findRoom(roomName) {
  for (let i = 0; i < rooms.length; i++) {
    //console.log(rooms[i].name);
    if (rooms[i].name == roomName) {
      return i;
    }
  }
  return "ERR";
}
//Adds a player to the current game
function addPlayer(currRoom, socket) {
  currRoom = room.addPlayer(currRoom, socket);
  return currRoom;
}

function addPlayerQueue(currRoom, socket) {
  currRoom = room.addPlayerQueue(currRoom, socket);
  return currRoom;
}

function setCurrentPlayer(socket, room, i) {
  console.log(`setting the current player to ${i}`);
  room.currentPlayer = i;
  if (room.idleTimeout !== null) clearTimeout(room.idleTimeout);
  room.idleTimeout = setTimeout(function () {
    let player = room.players[room.currentPlayer];
    ++player.idleTurns;
    console.log("waited too long: " + player.idleTurns);
    if (player.idleTurns >= 5) {
      io.sockets.in(socket.room).emit('updatechat', "Server",
        "A player has been kicked for being idle for too long");
      disconnect(socket);
    } else {
      fold(socket, room);
    }
  }, 30000);
  console.log("set callback");
}
//Starts the logic of the game
function startGame(socket, currRoom) {
  currRoom.isGameStarted = true;
  currRoom.gameState = Phase.PREFLOP;
  currRoom.smallBlindPlacement = 0;
  currRoom.bigBlindPlacement = 1;
  setCurrentPlayer(socket, currRoom, (currRoom.bigBlindPlacement + 1) % currRoom.players.length);
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
      setCurrentPlayer(socket, currRoom, i);
      break;
    }
    k++;
  }
  if (k == currRoom.players.length) {
    currRoom = progressGame(socket);
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
  io.sockets.in(socket.room).emit('renderBoardState', newGame.bigBlindPlacement, newGame.smallBlindPlacement, sanatizedPlayers);
  for (let i = 0; i < newGame.players.length; i++) {
    io.to(newGame.players[i].playerID).emit('dealCards', newGame.fixedPCards[i], i);
    io.to(newGame.players[i].playerID).emit('updateScreen', newGame.currentPot, newGame.currentBet, newGame.players[i].chips)
  }
  io.to(newGame.players[newGame.currentPlayer].playerID).emit("updatechat", "It is your turn");
  //console.log(newGame.players)
  //io.to(newGame.players[newGame.currentPlayer].playerID).emit("updatechat", "it is your turn");
  //io.to(newGame.players[newGame.currentPlayer].playerID).emit("updateTurn");
  return newGame;
}

function resetStates(currRoom) {
  for (var i = 0; i < currRoom.players.length; i++) {
    if (currRoom.players[i].state != "FOLDED" || currRoom.players[i].state != "ALLIN_OK") {
      currRoom.players[i].state = "NOTREADY";
      currRoom.players[i].lastBet = 0;
    }
  }
}

function progressGame(socket) {
  //get the room the request was sent from
  let currRoom = rooms[findRoom(socket.room)];
  //check if the game is preflop
  if (currRoom.gameState == Phase.PREFLOP) {
    var flop = [currRoom.fixedTCards[0], currRoom.fixedTCards[1], currRoom.fixedTCards[2]]
    updateSidePots(currRoom);
    resetStates(currRoom);
    /*
    for (var i = 0; i < players.length; i++) {
      if (players[i].state != "FOLDED") {
        players[i].state = "NOTREADY"
        players[i].lastBet = 0;
      }
    }
    */
    setCurrentPlayer(socket, currRoom, (currRoom.currentPlayer + 1) % currRoom.players.length);
    checkReadyState(socket);
    currRoom.gameState = Phase.FLOP;
    currRoom.currentBet = 0;
    io.sockets.in(socket.room).emit('flop', flop);
  } else if (currRoom.gameState == Phase.FLOP) {
    updateSidePots(currRoom);
    resetStates(currRoom);
    /*
    for (var i = 0; i < players.length; i++) {
      if (players[i].state != "FOLDED") {
        players[i].state = "NOTREADY"
        players[i].lastBet = 0;
      }
    }
    */
    setCurrentPlayer(socket, currRoom, (currRoom.currentPlayer + 1) % currRoom.players.length);
    checkReadyState(socket);
    currRoom.gameState = Phase.TURN;
    currRoom.currentBet = 0;
    io.sockets.in(socket.room).emit('turn', currRoom.fixedTCards[3])
  } else if (currRoom.gameState == Phase.TURN) {
    updateSidePots(currRoom);
    resetStates(currRoom);
    /*
    for (var i = 0; i < players.length; i++) {
      if (players[i].state != "FOLDED") {
        players[i].state = "NOTREADY"
        players[i].lastBet = 0;
      }
    }
    */
    setCurrentPlayer(socket, currRoom, (currRoom.currentPlayer + 1) % currRoom.players.length);
    checkReadyState(socket);
    currRoom.gameState = Phase.RIVER;
    currRoom.currentBet = 0;
    io.sockets.in(socket.room).emit('river', currRoom.fixedTCards[4])
  } else if (currRoom.gameState == Phase.RIVER) {
    updateSidePots(currRoom);
    // At the end of this loop, you are given player list of hand winners
    var playerHandRanks = [];
    for (var i = 0; i < currRoom.playerCards.length; i++) {
      if (currRoom.players[i].state != "FOLDED") {
        var hand = hf.finalhand(currRoom.playerCards[i], currRoom.tableCards)
        var matchArray = hf.match(hand);
        var handArray0 = hf.kinds(matchArray);
        var handArray1 = hf.flushAndStraight(hand, matchArray);
        if (handArray0[0] > handArray1[0]) {
          currRoom.players[i].handRank = handArray0;
          playerHandRanks.push(currRoom.players[i]);
        } else {
          currRoom.players[i].handRank = handArray1;
          playerHandRanks.push(currRoom.players[i]);
        }
      }
    }
    //console.log("WINNER HAS BEEN CALCULATED")
    let winnerArray = hf.findWinner(playerHandRanks);
    console.log("WINNERS ARRAY HERE");
    console.log(winnerArray);
    let updatedPlayers = distributeWinnings(winnerArray, currRoom.currentPot, [])
    console.log("UPDATED PLAYERS");
    console.log(updatedPlayers)
    for (var k = 0; k < currRoom.players.length; k++) {
      if (currRoom.players[k].state == "FOLDED") continue;
      for (var m = 0; m < updatedPlayers.length; m++) {
        if (updatedPlayers[m].playerID == currRoom.players[k].playerID) {
          currRoom.players[k] = updatedPlayers[m];
          delete currRoom.players[k].handRank;
          break;
        }
      }
    }
    /*

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
    */
    //Modulo the hand winnings add that to whatever players
    //At this point we have an array of the usernames of winners.
    //var winnings = Math.floor((currRoom.currentPot / winnersArr.length));
    //let winnersNames = [];
    //for (let k = 0; k < winnersArr.length; k++) {
    //  winnersNames.push(winnersArr[k].playerID)
    //}
    //io.sockets.in(socket.room).emit('winner', winnersNames.toString());
    /*for (var i = 0; i < winnersArr.length; i++) {
      io.sockets.in(socket.room).emit('winners', "Server", winnersArr[i] + " won. They win " + winnings + " chips.")
    }
    */
    io.sockets.in(socket.room).emit('winner', "Hello");
    for (var i = 0; i < currRoom.players.length; i++) {
      //for (var j = 0; j < winnersArr.length; j++) {
      //if (currRoom.players[i].playerID == winnersArr[j].playerID) {
      //  currRoom.players[i].chips += winnings;
      //console.log(currRoom.players[i].chips);
      //}
      //}
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
      currRoom.isGameStarted = false;
      return;
    }
    // Reset round
    currRoom.gameState = Phase.PREFLOP;
    currRoom.currentPot = 0;
    currRoom.currentBet = 0;
    currRoom.smallBlindPlacement = currRoom.bigBlindPlacement;
    currRoom.bigBlindPlacement = (currRoom.bigBlindPlacement + 1) % currRoom.players.length;
    setCurrentPlayer(socket, currRoom, (currRoom.bigBlindPlacement + 1) % currRoom.players.length);
    // Begin new round
    currRoom = beginRound(socket, currRoom);
  } // end of last else chunk
  return currRoom;
} // end of progressGame()

function fold(socket, currRoom) {
  console.log(`fold: player ${currRoom.currentPlayer}`);
  io.sockets.to(socket.room).emit('updatechat', "Server", socket.username + " folded");
  currRoom.players[currRoom.currentPlayer].state = "FOLDED";
  // Checking if there is only one other player that is not folded in the hand because they win if they are.
  var counter = 0;
  for (var i = 0; i < currRoom.players.length; i++) {
    if (currRoom.players[i].state == "FOLDED") {
      counter++;
    }
  }
  if (counter == currRoom.players.length - 1) {
    currRoom.gameState = Phase.RIVER;
    progressGame(socket);
  }
  io.sockets.in(socket.room).emit('updatePlayer', null, null, null, true, true, currRoom.currentPlayer);
  io.sockets.in(socket.room).emit('updatePlayerCards', false, true, [], currRoom.currentPlayer);
  checkReadyState(socket);
}


function disconnect(socket) {
  console.log(socket.username);
  let userSaveIndex;
  /*for (let i = 0; i < loggedUsers.length; i++) {
    if (loggedUsers[i].username == socket.username) {
      userSaveIndex = i;
      break;
    }
  }*/
  if (socket.room == "main") {
    socket.leave('main');
    //loggedUsers.splice(userSaveIndex, 1);
    return;
  } else if (socket.room == "gameSearch") {
    socket.leave('gameSearch');
    return;
  }
  //loggedUsers[userSaveIndex].status = "Online";
  //delete loggedUsers[userSaveIndex].room;
  //console.log(loggedUsers);
  let roomIndex = findRoom(socket.room);
  let currRoom = rooms[roomIndex];
  if (currRoom === undefined) {
    console.error("Current room named " + room + " is undefined!");
    return;
  }
  for (let i = 0; i < currRoom.playerQueue.length; i++) {
    if (socket.id == currRoom.playerQueue[i].playerID) {
      currRoom.playerQueue.splice(i, 1);
      socket.leave(currRoom.roomName);
      delete socket.room;
      return;
    }
  }
  let winFlag = 0;
  let chipAmount = 0;
  let leaver;
  let leaverIndex;
  for (leaverIndex = 0; leaverIndex < currRoom.players.length; leaverIndex++) {
    if (currRoom.players[leaverIndex].playerID == socket.id) {
      leaver = currRoom.players[leaverIndex];
      currRoom.players.splice(leaverIndex, 1);
      break;
    }
  }
  if (currRoom.players.length == 0) {
    if (currRoom.idleTimeout !== null) clearTimeout(currRoom.idleTimeout);
    if (currRoom.isGameStarted) {
      winFlag = 1;
      chipAmount = leaver.chips;
    }
    let userId = findUserId(socket.username);
    //updateHistory(userId, chipAmount, winFlag);
    rooms.splice(roomIndex, 1);
  } else {
    if (currRoom.isGameStarted) {
      currRoom.playerCards.splice(leaverIndex, 1);
      if (currRoom.currentPlayer == leaverIndex) {
        //Move the turn idleCounter
        //Move the turn indicator on client
        io.sockets.in(socket.room).emit('updatePlayer', null, null, null, true, true, leaverIndex);
        io.sockets.in(socket.room).emit('updatePlayerCards', false, true, [], leaverIndex);
        var counter = 0;
        for (var i = 0; i < currRoom.players.length; i++) {
          if (currRoom.players[i].state == "FOLDED") {
            counter++;
          }
        }
        if (counter == currRoom.players.length - 1) {
          currRoom.gameState = Phase.RIVER;
          progressGame(socket);
        }
        checkReadyState(socket);
      } else {
        //            currRoom.players.splice(leaverIndex, 1);
        if (currRoom.currentPlayer > leaverIndex) {
          currRoom.currentPlayer--;
        }
        io.sockets.in(socket.room).emit('updatePlayer', null, null, null, true, true, leaverIndex);
        io.sockets.in(socket.room).emit('updatePlayerCards', false, true, [], leaverIndex);
      }
    }
  }
  socket.leave(socket.room);
}

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
  if (gameState >= Phase.FLOP) {
    let flop = [fixedTCards[0], fixedTCards[1], fixedTCards[2]];
    io.sockets.in(socket.room).emit('updatechat', "Server", "Flop: " + flop);
  }
  if (gameState >= Phase.TURN) {
    let turn = fixedTCards[3];
    io.sockets.in(socket.room).emit('updatechat', "Server", "Turn: " + turn);
  }
  if (gameState >= Phase.RIVER) {
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
      } else {
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
  if (currRoom.gameState == Phase.PREFLOP) {
    tableArray = hf.finalhand(currPlayer.cards, []);
    console.log(tableArray);
    match = hf.match(tableArray);
    hintOutcome = hg.handgoodness(tableArray, match);
    //console.log(hintOutcome);
    io.sockets.to(socket.id).emit('handHint', hintOutcome);
  } else if (currRoom.gameState == Phase.FLOP) {
    tableArray = hf.finalhand(currPlayer.cards, flop);
    console.log(tableArray);
    match = hf.match(tableArray);
    console.log(match);
    hintOutcome = pos.possibility(tableArray, match, 5)
    io.sockets.to(socket.id).emit('boardHint', hintOutcome);
  } else if (currRoom.gameState == Phase.TURN) {
    flop.push(turn);
    tableArray = hf.finalhand(currPlayer.cards, flop);
    match = hf.match(tableArray);
    hintOutcome = pos.possibility(tableArray, match, 6)
    io.sockets.to(socket.id).emit('boardHint', hintOutcome);
  } else if (currRoom.gameState == Phase.RIVER) {
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

function updateSidePots(game) {
  var players = game.players;
  var totalPot = game.currentPot;
  for (var i = 0; i < players.length; i++) {
    if (players[i].state == "ALLIN_OK" || players[i].state == "FOLDED") {
      continue;
    }
    // Update sidepot variable for all players as if they were all-in
    for (var j = 0; j < players.length; j++) {
      if (i == j) continue;
      if (players[i].lastBet > players[j].lastBet) {
        players[i].sidePot += players[j].lastBet;
      } else {
        players[i].sidePot += players[i].lastBet;
      }
    }
    // Check player states and re-update sidepot to be correct based on state
    if (players[i].state == "ALLIN") {
      players[i].state = "ALLIN_OK";
      players[i].sidePot += players[i].lastBet;
    } else if (players[i].state == "READY") {
      players[i].state = "NOTREADY";
      players[i].sidePot = totalPot;
    }
  }
  game.players = players;
  return game;
}

function distributeWinnings(winnersArray, pot, finalArray) {
  if (pot < 0) {
    console.log("ERROR: Negative pot");
    return;
  } else if (pot === 0 || winnersArray.length === 0) {
    return finalArray;
  }
  var player = winnersArray[0];
  var sidePot = player.sidePot;
  if (player.state == "ALLIN_OK") {
    if (sidePot < pot) {
      // Case 1: Current winner went all-in, can only win part of the remaining pot
      player.chips += sidePot;
      pot -= sidePot;
    } else {
      // Case 2: Current winner went all-in, can win entire remaining pot
      player.chips += pot;
      pot -= pot;
    }
  } else {
    // Case 3: Current winner not all-in, so can win entire remaining pot
    player.chips += pot;
    pot -= pot;
  }
  // Remove current winner and recur with remaining pot
  finalArray.push(winnersArray.shift());
  distributeWinnings(winnersArray, pot, finalArray);
  return finalArray;
}