var gameActions = {

    SUITS: new Array("Spades", "Hearts", "Clubs", "Diamonds"),
    VALUES: new Array("Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"),
    STATES: new Array("NOTREADY", "READY", "FOLDED"),

    var gameInfo: {
        // Length N array of Player objects
        // Each Player object contains chip information, current state
        allPlayers: [];
        
        // Legnth 2N+5 array of unique integers 
        // Syntax gameActions.gameInfo.array = [];
        numbers: []; 
        playerCards: [[],[], [], [], [], [], [], []]; // maximum of eight players
        playerOrder: []; // allPlayers[playerOrder[0]] to get 0th player
        tableCards: [];
        playerChips: []; 
        
        // Track current bet and pot
        currentBet; 
        pot; 
        N; 
    },

    startGame: function(players) // change to pass game object instead, gameInfo
    {
        this.allPlayers = players; 
        this.N = players.length; 
        this.currentBet = 0;
        this.pot = 0;
        
        // Deal 
        for (i = 0; i < (2*N+5); i++)
        {
            k = Math.random()*51; 
            numbers[i] = k;
            if (i > 0) // check for and eliminate repeats
            { while (k == numbers[i-1]) { k++; } }
            // value = (k%13)+1; 
            // suit = Math.floor(k/13); 
        }
        for (i = 0; i < (2*N); i+=2)
        {
            playerCards[i][0] = new Card(numbers[i]);
            playerCards[i][1] = new Card(numbers[i+1]);
        }
        for (i = (2*N); i < (2*N+5); i++)
        {
            tableCards[i] = new Card(numbers[i]);
        }
        
        // Do other stuff here
        // Ante, blinds? Consider later 
        // 1. Assign random order for players
        for (i = 0; i < 8; i++)
        {
            k = Math.random()*7; 
            playerOrders[i] = k;
            if (i > 0) // check for and eliminate repeats
            { while (k == playerOrders[i-1]) { k++; } }
        }
        
        // 2. 0th player = dealer, 1st = small blind, 2nd = big blind 
        
        // RETURN TO SERVER: 
        // gameInfo
            // Array of player cards (first 2N cards)
            // Array of table cards (last 5 cards)
    },
        
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

}
