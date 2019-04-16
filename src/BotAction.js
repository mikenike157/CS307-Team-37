
this.bot_decision(isAI, gameObject)
{
	var retArray = [-2, -2];
	if (isAI == 1) {
		retArray = bot_decision_simple(gameObject)
	} else if (isAI == 2) {
		retArray = bot_decision_medium(gameObject)
	} else if (isAI == 3) {
		retArray = bot_decision_hard(gameObject)
	} else {
		console.log("ERROR: No AI associated with this flag");
	}
	console.log("bot_decision retArray:", retArray);
	printMove(retArray[0], retArray[1]);
	return retArray;
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
	var commandID = -2;
	var retVal = -2;

	return [commandID, retVal];
}

function bot_decision_hard(gameObject)
{
	var commandID = -2;
	var retVal = -2;

	return [commandID, retVal];
}

/* Prints move corresponding to retArray, for checking/debugging */
var COMMANDS = ["Fold", "Check", "Call", "Raise", "All-in"]
function printMove(commandID, retVal)
{
	var str = COMMANDS[commandID]
	if (commandID == 2)
	{
		str += " current bet of "
		str += retVal
	}
	else if (commandID == 3)
	{
		str += " to "
		str += retVal
	}
	else if (commandID == 4)
	{
		str += " with "
		str += retVal
	}
	else if (commandID < 0 || commandID > 4)
	{
		console.log("Invalid commandID")
	}
	console.log("Move: " + str)
}
