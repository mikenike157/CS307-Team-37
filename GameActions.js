var SUITS = new Array("Spades", "Hearts", "Clubs", "Diamonds")
var VALUES = new Array("Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King")
var STATES = new Array("NOTREADY", "READY", "FOLDED")

// Length N array of Player objects
// Each Player object contains chip information, current state
var allPlayers = [];
var numbers = []; // 2N+5 unique random integers on [0, 51]
var playerCards = [[],[], [], [], [], [], [], []]; // maximum of eight players
var tableCards = [];

var playerOrder = []; // not currently used; assign N values on [0, N-1]
var playerChips = [];
var playerStates = [];
var lastBet = [];

// Track current bet and pot
var currentBet;
var pot;
var N;

class Player {
    constructor(playerID, order, chips)
    {
        this.playerID = playerID;
        this.order = order;
        this.lastBet = 0;
        this.playerState = "NOTREADY";
        this.playerChips = chips;
        this.cards = [-1, -1];
    }
}


    this.addPlayer = function(socketid, n) {
      var player = new Player(socketid, n, 100);
      //allPlayers[n] = player;
      return player;
    }


    this.testPlayer = function()
    {
        var player0 = new Player(0, 0, 100);
        return player0;
    }

    this.startGame = function() // change to pass game object instead, gameInfo
    {
        N = 2;
        currentBet = 0;
        pot = 0;
        defaultChips = 100;
        // Deal
        var m = 0; // 1. Random numbers
        for (var i = 0; i < (2*N+5); i++)
        {
          var k = Math.floor(Math.random()*51);
          numbers[i] = k;
          var j = i-1; // check for and eliminate repeats
          while (j >= 0)
          {
            if (numbers[i] == numbers[j])
            {
              numbers[i] = (numbers[i]+1) % 52;
              j = i-1;
            }
            else { j--; }
          }
        }
        var k = 0; // 2. Assign to players
        for (var i = 0; i < (N*2); i+=2)
        {
            playerCards[k][0] = numbers[i];
            playerCards[k][1] = numbers[i+1];
            k++;
        }
        k = 0; // 3. Assign table cards
        for (var i = (2*N); i < (2*N+5); i++)
        {
            tableCards[k] = numbers[i];
            k++;
        }
        // Later: Assign random order for players

        // 0th player = dealer, 1st = small blind, 2nd = big blind
        // Could use playerRaise for blinds, take amount as parameter and numerical player index [0, 1]

        return [playerCards, tableCards];
    }

    // TODO #1: Test this. Raise /to/ amount
    this.playerRaise = function(pIndex, amount)
    {
        // Increase current bet
        if (playerChips[pIndex] >= amount)
        {
            playerChips[pIndex] -= amount;
            playerStates[pIndex] = "READY";
            pot += amount;
            currentBet = amount;
            return 1;
        }
        // Fail to raise
        return 0;
    }

/*
    // TODO: Inner game loop

    playerCall: function(pIndex)
    {
        // Match current bet, if able
        if (player.chips >= currentBet)
        {
            player.chips -= (currentBet-lastBet[pIndex]);
            player.state = "READY";
            pot += (currentBet-lastBet[pIndex]);
            return 1;
        }
        return 0;
    },

    playerCheck: function(player)
    {
        // Pass player without folding
        player.state = "NOTREADY";
        return 1;
    },

    playerFold: function(player)
    {
        // End user (enter fold state)
        player.state = "FOLDED";
        return 1;
    },

    //playerRaise: function(player, amount)
    {
        // Increase current bet
        if (player.chips >= amount)
        {
            player.chips -= amount;
            player.state = "READY";
            pot += amount;
            currentBet = amount;
            return 1;
        }
        return 0;
    },

    endGame: function()
    {
    },
*/
//}
