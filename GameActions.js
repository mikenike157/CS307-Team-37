var SUITS = new Array("Spades", "Hearts", "Clubs", "Diamonds")
var VALUES = new Array("Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King")
var STATES = new Array("NOTREADY", "READY", "FOLDED")

    // Length N array of Player objects
    // Each Player object contains chip information, current state
var allPlayers = [];

    // Legnth 2N+5 array of unique integers
    // Syntax gameActions.gameInfo.array = [];
var numbers = [];
var playerCards = [[],[], [], [], [], [], [], []]; // maximum of eight players
var playerOrder = []; // allPlayers[playerOrder[0]] to get 0th player
var tableCards = [];
var playerChips = [];

    // Track current bet and pot
var currentBet;
var pot;
var N;

//function gameActions() {
    this.value = function(element) {
      return element
    }

    this.startGame = function() // change to pass game object instead, gameInfo
    {

        N = 8;
        currentBet = 0;
        pot = 0;

        // Deal
        var m = 0;
        /*while (m < 2*N+5) {
          k = Math.floor(Math.random()*51);
          if (numbers.findIndex(value(k)) == -1) {
            numbers[m] = k;
            m++;
          }
        }*/
        for (var i = 0; i < (2*N+5); i++)
        {
          var k = Math.floor(Math.random()*51);
          numbers[i] = k;
          var j = i-1;
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
        var k = 0;
        for (var i = 0; i < (N*2); i+=2)
        {

            playerCards[k][0] = numbers[i];
            playerCards[k][1] = numbers[i+1];

            k++;
        }
        k=0
        for (var i = (2*N); i < (2*N+5); i++)
        {
            tableCards[k] = numbers[i];
            k++
        }
        return [playerCards, tableCards];
        // Do other stuff here
        // Ante, blinds? Consider later
        // 1. Assign random order for players/
        /*
        for (var i = 0; i < 8; i++)
        {
            k = Math.random()*7;
            playerOrders[i] = k;
            if (i > 0) // check for and eliminate repeats
            { while (k == playerOrders[i-1]) { k++; } }
        }
*/
        // 2. 0th player = dealer, 1st = small blind, 2nd = big blind

        // RETURN TO SERVER:
        // gameInfo
            // Array of player cards (first 2N cards)
            // Array of table cards (last 5 cards)
    }
/*
    // TODO: Inner game loop

    playerCall: function(player)
    {
        // Match current bet, if able
        if (player.chips >= currentBet)
        {
            player.chips -= currentBet;
            player.state = "READY";
            pot += currentBet;
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

    playerRaise: function(player, amount)
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
