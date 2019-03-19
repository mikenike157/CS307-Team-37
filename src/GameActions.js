
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
        this.fixedCards = [-1, -1];
        this.initialChips = chips; // Add
    }
}

this.addPlayer = function(socketid, startingChips) {
  var player = new Player(socketid, startingChips);
  console.log("NEW PLAYER: " + player);
  return player;
}

///////////////////////////////////////
 /* Called by server at game start */
///////////////////////////////////////

this.startGame = function(game) {
  numbers = [];
  playerCards = [];
  tableCards = [];
  N = game.players.length;

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
  game.playerCards = playerCards;
  game.tableCards = tableCards;
  let fixedCards = fixCards(playerCards, tableCards);
  game.fixedPCards = fixedCards[0];
  game.fixedTCards = fixedCards[1];

  return game;
}

///////////////////////////////////////
/* Called by server at player action */
///////////////////////////////////////

function getPlayer(playerArray, playerID) {
  for (var i = 0; i < playerArray.length; i++) {
    if (playerArray[i].playerID == playerID) {
      return i;
      //  player = players[i];
      //  break;
    }
  }
  return -1;
} // internal helper method

this.playerRaise = function(game, playerID, currentBet, raiseTo) {
  raiseTo = parseInt(raiseTo);
  console.log(raiseTo + " " + currentBet);
  let playerIndex = getPlayer(game.players, playerID);
  player = game.players[playerIndex];
  console.log(player.chips);
  if (player.chips >= raiseTo && raiseTo > currentBet) {
    var margin = raiseTo-player.lastBet;
    player.chips -= margin;
    player.state = "READY";
    player.lastBet = raiseTo;
    game.players[playerIndex] = player;
    game.currentPot += margin;
    game.currentBet = raiseTo;
    return [game, player, margin];
  }
  return -1;
}

this.playerCall = function(game, playerID, currentBet) {
  let playerIndex = getPlayer(game.players, playerID);
  player = game.players[playerIndex];

  if (player.chips >= currentBet) {
    var margin = currentBet-player.lastBet;
    player.chips -= margin;
    player.state = "READY";
    player.lastBet = currentBet;
    return [game, player, margin];
  }
  return -1;
}

this. Fold = function(game, playerID) {
  player = getPlayer(game.players, playerID);
  player.state = "FOLDED";
  return [game, player];
}

this.blind = function(game, playerID, amount) {
  console.log("FULL GAME: " + game);
  let playerIndex = getPlayer(game.players, playerID);
  console.log("Player Index: " + playerIndex);
  player = game.players[playerIndex];
  game.players[playerIndex].chips -= amount;
  game.players[playerIndex].lastBet = amount;
  return game;
}

this.allIn = function(game, playerID) {
  player = getPlayer(game.players, playerID);
  var amount = player.chips;
  //player.chips = 0; // keep player.chips as reference amount
  player.state = "ALLIN";
  return [game, player, amount];
}

function fixCards(pCards, tCards) {
  var retPCards = [];
  var retTCards = [];
    for (var i = 0; i < pCards.length; i++) {
      var card1 = findCard(pCards[i][0]);
      var card2 = findCard(pCards[i][1]);
      var tempHand = [card1, card2]
      retPCards.push(tempHand);
    }
    var card1 = findCard(tCards[0])
    var card2 = findCard(tCards[1])
    var card3 = findCard(tCards[2]);
    var card4 = findCard(tCards[3]);
    var card5 = findCard(tCards[4]);
    retTCards = [card1, card2, card3, card4, card5];
    console.log(retPCards + " " + retTCards);
    return [retPCards, retTCards];
  }

function findCard(card) {
  console.log(card);
  var suit = Math.floor(card / 13);
  card = card - (13 * suit);
  console.log(card)
  if (suit == 0) {
    if (card == 9) {
      return "JS"
    }
    else if (card == 10) {
      return "QS"
    }
    else if (card == 11) {
      return "KS"
    }
    else if (card == 12) {
      return "AS"
    }
    else {
      return ((card+2) + "S");
    }
  }
  else if (suit == 1) {
    if (card == 9) {
      return "JD"
    }
    else if (card == 10) {
      return "QD"
    }
    else if (card == 11) {
      return "KD"
    }
    else if (card == 12) {
      return "AD"
    }
    else {
      return ((card+2) + "D");
    }
  }
  else if (suit == 2) {
    if (card == 9) {
      return "JC"
    }
    else if (card == 10) {
      return "QC"
    }
    else if (card == 11) {
      return "KC"
    }
    else if (card == 12) {
      return "AC";
    }
    else {
      return ((card+2) + "C");
    }
  }
  else if (suit == 3) {
    if (card == 9) {
      return "JH"
    }
    else if (card == 10) {
      return "QH"
    }
    else if (card == 11) {
      return "KH"
    }
    else if (card == 12) {
      return "AH"
    }
    else {
      return ((card+2) + "H");
    }
  }
}
