

this.bot_decision = function(isAI, gameObject)
{
	var retArray = [-2, -2];
	if (isAI == 1) {
		retArray = bot_decision_simple(gameObject)
	} else if (isAI == 3) {
		retArray = bot_decision_medium(gameObject)
	//} else if (isAI == 3) {
		//retArray = bot_decision_hard(gameObject)
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
		commandID = 1;
		retVal = 0;
	} else {
		if (currentPlayer.chips > margin) {
			// Call
			commandID = 2;
			//retVal = gameObject.currentBet;
			retVal = margin;
		}
		else {
			// Fold
			commandID = 0;
			retVal = -1;
		}
	}

	return [commandID, retVal];
}

function bot_decision_medium(gameObject) // TT, needs testing
{
	var commandID = -2;
	var retVal = -2;

	var currentPlayerIndex = gameObject.currentPlayer
	var currentPlayer = gameObject.players[currentPlayerIndex]

	// 1. Get currentPlayer's hand strength
	var temp = getHandStrengths(gameObject)
	var currentRank = temp[0]
	var HAND_STRENGTH = temp[1]

	// 2. Get currentPlayer's pot odds
	var margin = gameObject.currentBet - currentPlayer.lastBet
	var POT_ODDS = margin / (margin+gameObject.currentPot)

	// 3. Compute rate of return = hand strength / pot odds
	var RATE_OF_RETURN = HAND_STRENGTH / POT_ODDS

	// 4. Make the Fold Call Raise decision
	// If unable to call currentBet, decide to fold or all-in
	if (currentPlayer.chips <= margin) {
		// fold
		commandID = 0
		retVal = -1
		printMove(commandID, retVal)
		return [commandID, retVal] // skips everything below
	}
	// Otherwise, choose between fold/call/raise
	var k = randomNum()
	if (RATE_OF_RETURN < 0.8) {
		if (k < 95) {
			// fold
			commandID = 0
			retVal = -1
		}
		else {
			// raise (bluff)
			commandID = 3
			retVal = gameObject.currentBet + (currentPlayer.chips-currentPlayer.lastBet)*0.10
		}
	}
	if (RATE_OF_RETURN >= 0.8 && RATE_OF_RETURN < 1.0) {
		if (k < 80) {
			// fold
			commandID = 0
			retVal = -1
		}
		if (k >= 80 && k < 85) {
			// call
			commandID = 2
			retVal = gameObject.currentBet
		}
		if (k >= 85) {
			// raise (bluff)
			commandID = 3
			retVal = gameObject.currentBet + (currentPlayer.chips-currentPlayer.lastBet)*0.10
		}
	}
	if (RATE_OF_RETURN >= 1.0 && RATE_OF_RETURN < 1.3) {
		if (k < 60) {
			// call
			commandID = 2
			retVal = gameObject.currentBet
		}
		else {
			// raise
			commandID = 3
			retVal = gameObject.currentBet + (currentPlayer.chips-currentPlayer.lastBet)*0.40
		}
	}
	if (RATE_OF_RETURN >= 1.3) {
		if (k < 30) {
			// call
			commandID = 2
			retVal = gameObject.currentBet
		}
		else {
			// raise
			commandID = 3
			retVal = gameObject.currentBet + (currentPlayer.chips-currentPlayer.lastBet)*0.60
		}
	}
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

/* Helper method for medium AI */
function getBestHand(cardArray)
{
	// cardArray: An array of 5-7 integers
	var valCounts = [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0],
					 [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0],
					 [13, 0]]

	var suitCounts = [["S", 0], ["H", 0], ["C", 0], ["D", 0]]

	for (var i = 0; i < cardArray.length; i++)
	{
		var card = findCard(cardArray[i])
		valCounts[card[0]-1][1] += 1
		suitCounts[card[1]][1] += 1
	}

	var hasFlush = findFlush(suitCounts)
	var hasNKind = findNkind(valCounts)
	var hasStraight = findStraight(valCounts, hasFlush)

	var best = Math.max(hasFlush[0], hasNKind[0], hasStraight[0])
	// console.log("Best hand:", HANDS[best])
	if (best <= 3 || best == 6 || best == 7)
	{
	  var r = hasNKind[1]
	  if (r == 1) r = "Ace"
	  else if (r == 11) r = "Jack"
	  else if (r == 12) r = "Queen"
	  else if (r == 13) r = "King"
	  // console.log("Ranking card:", r)
	}
	else if (best == 5)
	{
		// console.log("Flush suit:", SUITS[hasFlush[1]])
	}
	// console.log("")
	return best;
}

/* Helper methods called by getBestHand */
const HANDS = ["HIGH", "1PAIR", "2PAIR", "3KIND", // 0, 1, 2, 3
"STRAIGHT", "FLUSH", "FULLHOUSE", "4KIND", // 4, 5, 6, 7
"STRAIGHTFLUSH", "ROYALFLUSH"]; // 8, 9

const SUITS = ["SPADES", "HEARTS", "CLUBS", "DIAMONDS"];

//////////////////////////////////////////////////////
// test_find_Nkind()
// console.log("")
// test_find_flush()
// console.log("")
// test_find_straight()
//////////////////////////////////////////////////////

// Return: [<index into HANDS>, <index into SUITS>]
// Returns [0, -1] if no flush found
function findFlush(suitCounts)
{
  var hasFlush = 0; // index into HANDS
  var flush = -1; // index into SUITS

  for (var i = 0; i < suitCounts.length; i++) {
  	if (suitCounts[i][1] >= 5) {
  		hasFlush = 5;
  		flush = i;
  		break;
  	}
  }

  // if (hasFlush != 0) { console.log(SUITS[flush] + " flush found"); }
  // else { console.log("No flush found"); }

  return [hasFlush, flush]
}

// Return: [<index into HANDS>, <rank of best nkind>]
// Returns [0, r] if best nkind is high card of rank r
function findNkind(valCounts)
{
	var nKind = 0; // index into HANDS Array
	var r = -1; // rank (not index) of highest nkind

	for (var i = 1; i <= valCounts.length; i++) {
		var temp = i;
		i = i % valCounts.length;

		// Case 1: Four of a kind found
		if (valCounts[i][1] == 4) {
			nKind = HANDS.indexOf("4KIND");
			r = valCounts[i][0];
			break;
		}

		// Case 2: Three of a kind or full house
		if (valCounts[i][1] == 3) {
			// 2a. Check for a full house
			for (var j = 0; j < valCounts.length; j++) {
				if (i != j && valCounts[j][1] == 2) {
					if (HANDS.indexOf("FULLHOUSE") >= nKind) {
						nKind = HANDS.indexOf("FULLHOUSE");
						r = valCounts[i][0];
					}
				}
			}

			// 2b. No separate pair found
			if (HANDS.indexOf("3KIND") >= nKind) {
					nKind = HANDS.indexOf("3KIND");
					r = valCounts[i][0];
				}
		}

		// Case 3: Two of a kind or two pair
		if (valCounts[i][1] == 2) {
			// 3a. Check for a two pair
			for (var j = 0; j < valCounts.length; j++) {
				if (i != j && valCounts[j][1] == 2) {
					if (HANDS.indexOf("2PAIR") >= nKind) {
						nKind = HANDS.indexOf("2PAIR");
						r = valCounts[i][0];
					}
				}
			}
			// 3b. No two pair found
			if (HANDS.indexOf("1PAIR") >= nKind) {
				nKind = HANDS.indexOf("1PAIR");
				r = valCounts[i][0];
			}
		}

		// Case 4: High card
		if (valCounts[i][1] == 1) {
			if (0 >= nKind) {
				r = valCounts[i][0]
			}
		}

		i = temp
	} // end for loop

	// console.log(HANDS[nKind] + " @ " + r)
	return [nKind, r]
}

// Returns: [<index into HANDS>, <rank of low card of straight>]
// Returns [0, -1] if no straight found
function findStraight(valCounts, hasFlush)
{
	var hasStraight = 0; // index into HANDS
	var startRank = -1; // rank of low card of straight

	for (var i = 0; i <= 9; i++) {
		// see if there is a straight starting at i
		var straight = 1;
		for (var j = i; j < i+5; j++) {
			var temp = j;
			j = j % 13;
			if (valCounts[j][1] === 0)
			{ straight = 0; break; }
			j = temp;
		}
		if (straight == 1) {
			hasStraight = 4 // regular straight
			startRank = i+1
		}
	}

	// if (hasStraight != 0)
	// 	console.log("Straight beginning at rank " + startRank)
	// else
	// 	console.log("No straight found");

	return [hasStraight, startRank]
}

function getHandStrengths(gameObject)
{
	var ranks = []
	var currentRank = 0
	// Compute hand rank of all players
	for (var i = 0; i < gameObject.players.length; i++)
	{
		var player = gameObject.players[i]
		var cards = gameObject.tableCards.concat(player.cards)
		var bestHand = getBestHand(cards)
		ranks.push([player, bestHand])
		// store your best rank
		if (i == gameObject.currentPlayer)
			currentRank = bestHand
	}
	// Count how many people have a better or same hand
	var numerator = gameObject.players.length
	for (var i = 0; i < ranks.length; i++)
	{
		// compare your best rank with others
		if (i != gameObject.currentPlayer)
		{
			if (ranks[i][1] > currentRank)
				numerator -= 1
			if (ranks[i][1] == currentRank)
				numerator -= 0.5
		}
	}
	// Compute your hand strength, assert on range [0, 1]
	var HAND_STRENGTH = numerator / gameObject.players.length

	return [currentRank, HAND_STRENGTH]
}

function findCard(card)
{
	const RANKS = [11, 12, 13, 1]; // ["J", "Q", "K", "A"]
	const SUIT_INDICES = [0, 1, 2, 3]; // ["S", "H", "C", "D"]

	var suit = Math.floor(card/13);
	var num = card-(13*suit);
	var val = 0;

	// get rank
	if (num < 9) num = num + 2;
	else num = RANKS[num-9];
	// get suit
	suit = (suit + (2*(suit%2))) % 4;
	// return info
	val = SUIT_INDICES[suit]*13+num;
	return [num, SUIT_INDICES[suit]]
}

function randomNum()
{
  var tempSeed = new Date().getTime() / 1000;
  tempSeed = tempSeed * tempSeed;
  var x = Math.sin(tempSeed) * 100;
  return Math.floor((x - Math.floor(x)) * 100);
}
