var gameActions = {

    var gameInfo: {
        // Length N array of Player objects
        // Each Player object contains chip information, current state
        allPlayers: [];
        
        // Legnth 2N+5 array of unique integers 
        // Syntax gameActions.gameInfo.array = [];
        numbers: []; // size is 2N+5
        playerCards: [[],[]];
        
        currentBet; 
        pot;
    }
    
    startGame: function(players) 
    {
        this.allPlayers = players; 
        this.currentBet = 0;
        this.pot = 0;
        
        // Deal 
        for (i = 0; i < (2*N+5); i++)
        {
            k = Math.random()*51; 
            numbers[i] = k;
            if (i > 0) // check for and eliminate repeats
            { while (k == a[i-1]) { k++; } }
            playerCards[0][i] = (k%13)+1; // value
            playerCards[1][i] = k/13; // suit
        }
        
        // Do other stuff here
        // Ante, blinds? Consider later 
        
        // RETURN TO SERVER: 
        // Array of player cards
        // Array of table cards 
    } 
    
    playerCall: function(player)
    {
        // Match current bet, if able 
        // update player state as applicable 
        // return 0 for error, 1 for success 
    }
    
    playerCheck: function(player)
    {
        // Pass player without folding 
    }
     
    playerFold: function(player)
    {
        // End user (enter fold state)  
    }
    
    playerRaise: function(player, amount)
    {
        // Increase current bet 
    }
    
    endGame: function()
    {
    }

}
