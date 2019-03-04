
///////////////////////////////////////
            /* Variables */
///////////////////////////////////////

var numbers = []; // 2N+5 unique random integers on [0, 51]
var playerCards = []; // maximum of eight players
var tableCards = [];
var N;

///////////////////////////////////////
          /* Deck generation */
///////////////////////////////////////

var seed = 1;
function tutorialDeck() {
  var x = Math.sin(seed++) * 52
  return Math.floor((x-Math.floor(x))* 52);
}

function randomDeck() {
  var tempSeed = new Date().getTime() / 1000;
  tempSeed = tempSeed * tempSeed;
  var x = Math.sin(tempSeed) * 52;
  return Math.floor((x - Math.floor(x)) * 52);
}

///////////////////////////////////////
    /* Player object and methods */
///////////////////////////////////////

class Player {
    constructor(playerID, chips)
    {
        this.playerID = playerID;
        this.lastBet = 0;
        this.state = "NOTREADY";
        this.chips = chips;
        this.cards = [-1, -1];
    }
}

this.addPlayer = function(socketid) {
  var player = new Player(socketid, 100);
  return player;
}

///////////////////////////////////////
 /* Called by server at game start */ 
///////////////////////////////////////

this.startGame = function(numPlayers) {
  numbers = [];
  playerCards = [];
  tableCards = [];
  N = numPlayers;

  // 0. Generate random deck
  var m = 0; 
  var i = 0;
  while (i < 52) {
    var k = randomDeck();
    if (numbers.includes(k)) {
      continue;
    } 
    else {
      numbers[i] = k;
      i++;
    }
  }
  
  // 1. Assign cards to players
  for (var i = 0; i < (N*2); i+=2) {
    playerCards.push([numbers[i], numbers[i+1]]);
    //var cardsToPush = [numbers[i], numbers[i+1]];
    //playerCards.push(cardsToPush);
  }
  
  // 2. Assign cards to table
  //k = 0; 
  for (var i = (2*N); i < (2*N+5); i++) {
    tableCards.push(numbers[i]);
    //tableCards[k] = numbers[i];
    //k++;
  }
  
  // 3. Return cards to server
  return [playerCards, tableCards];
}

///////////////////////////////////////
/* Called by server at player action */
///////////////////////////////////////

this.playerRaise = function(player, currentBet, raiseTo) {
  raiseTo = parseInt(raiseTo);
  if (player.chips >= raiseTo && raiseTo > currentBet) {
    var margin = raiseTo-player.lastBet;
    player.chips -= margin;
    player.state = "READY";
    player.lastBet = raiseTo;
    return [player, margin];
  }
  return -1;
}

this.playerCall = function(player, currentBet) {
  if (player.chips >= currentBet) {
    var margin = currentBet-player.lastBet;
    player.chips -= margin;
    player.state = "READY";
    player.lastBet = currentBet;
    return [player, margin];
  }
  return -1;
}

this.playerFold = function(player) {
  player.state = "FOLDED";
  return player;
}

this.blind = function(player, amount) {
  player.chips -= amount;
  player.lastBet = amount;
  return player;
}

this.allIn = function(player) {
  player.state = "ALLIN";
  return player.chips; 
}

