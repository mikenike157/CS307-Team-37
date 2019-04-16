this.bot_decision = function(isAI, gameObject)  
{
	// Call specific AI to build return array
  retArray = [-2, -2]
  if (isAI == 1) 
    retArray = bot_decision_simple(gameObject) 
  else if (isAI == 2) 
    retArray = bot_decision_medium(gameObject)
  else if (isAI == 3) 
    retArray = bot_decision_hard(gameObject) 
  else 
    console.log("Error, isAI flag is invalid"); 

  // Check that return array is in valid form
  if (retArray.length != 2)
    console.log("Error: Return array is too long or too short");
  if retArray[0] == -2 || returnArray[1] == -2:
			console.log("Error: Return array not updated or not updated correctly");
      
  return retArray
}

function bot_decision_simple(gameObject)
{
	var commandID = -2;
	var retVal = -2; 

	var currentPlayer = gameObject.players[gameObject.currentPlayer];
	var margin = gameObject.currentBet - currentPlayer.lastBet; 

	if (gameObject.currentBet == 0) {
		// Check
		commandID = 2; 
		retVal = 0;
	} else {
		if (currentPlayer.chips > margin) {
			// Call
			commandID = 1; 
			retVal = gameObject.currentBet; 
		}
		else {
			// Fold
			commandID = 0; 
			retVal = -1; 
		}
	}

	return [commandID, retVal];
}

function bot_decision_medium(gameObject)
{
}

function bot_decision_hard(gameObject)
{
}
