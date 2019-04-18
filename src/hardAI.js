const gtk = require('./goodTwoKind.js');
const hf = require('./handFinder.js');
const flushr = require("./howManyNumberforFlush.js")
const straightr = require("./howManyNumforStraight.js");
const lf = require("./lookingFor.js");
const pos = require("./possibility.js");
const hg = require("./handgoodness")


this.hardAI = function(gameObject){


	var player = gameObject.players[gameObject.currentPlayer];
	var handCards = player.cards
	var currentChips = player.chips;
	var tableCards = gameObject.tableCards;
	var pot = gameObject.pot;
	var currentBet = gameObject.currentBet


	var playersPlaying = 0;
	for(var i = 0; i < gameObject.players.length; i++){
		var state = gameObject.players[i].state
		if(state!= "FOLDED"){
			playersPlaying ++;
		}
	}


	var possibilityArray;
	var shandgoodness = -1;
	var totalNumCards;
	var numtableCards;

	var tableArray;
	var matchArray;

	var justTableArray;
	var justmatchArray

	var oppPossibilityArray;

	var flag2onTable = 0;

	var numForStraight;
	var numForFlush;
	var justnumForStraight;
	var justnumForFlush;

	var goodPoints = 0;
	var badPoints = 0;
	var totalPoints = 0;

	var larger2Kinds;

	var reArray = [0,0]

	var allTableCards = gameObject.tableCards;

	if (gameObject.gameState == 0) {
		numtableCards = 0;
		tableCards = [];

	}
	else if (gameObject.gameState == 1) {
		tableCards = [allTableCards[0], allTableCards[1], allTableCards[2]];
		numtableCards = 3;
	}
	else if (gameObject.gameState == 2) {
		tableCards = [allTableCards[0], allTableCards[1], allTableCards[2], allTableCards[3]];

		numtableCards = 4;
	}
	else if (gameObject.gameState == 3) {
		tableCards = [allTableCards[0], allTableCards[1], allTableCards[2], allTableCards[3], allTableCards[4]];
		numtableCards = 5;
	}
	totalNumCards = handCards.length + tableCards.length;
	tableArray = hf.finalhand(handCards,tableCards);
	matchArray = hf.match(tableArray);
	justTableArray = hf.finalhand([],tableCards);
	justmatchArray = hf.match(justTableArray);

	if(numtableCards == 0){
		shandgoodness = hg.handgoodness(tableArray,matchArray);

		if(shandgoodness == 1){
			if (currentBet == player.lastBet) {
				reArray = [1, 0];
			}
			else if(currentBet==0){
				reArray = [1,0]
			}else{
				reArray = [0,0]
			}
			return reArray;
		}
		if(shandgoodness == 2){
			if (currentBet == player.lastBet) {
				reArray = [1, 0];
			}
			else if(currentBet==0){
				reArray = [1,0]
			}else{
				reArray = [0,0]
			}
			return reArray;
		}
		if(shandgoodness == 3){
			if (currentBet == player.lastBet) {
				reArray = [1, 0];
			}
			else if(currentBet<= currentChips*.1){
				reArray = [1,currentBet]
			}else{
				reArray = [0,0]
			}
			return reArray;

		}
		if(shandgoodness == 4){
			if (currentBet == player.lastBet) {
				reArray = [1, 0];
			}
			else if(currentBet<= currentChips*.55){
				reArray = [1,currentBet]
			}else{
				reArray = [0,0]
			}
			return reArray;
		}
		if(shandgoodness == 5){
			if (currentBet == player.lastBet) {
				reArray = [1, 0];
			}
			else if(currentBet >= currentChips){
				reArray = [4,currentChips];
			}
			else{
				reArray = [1,currentBet];
			}
			return reArray;
		}
	}


	possibilityArray = pos.possibility(tableArray,matchArray,totalNumCards);
	oppPossibilityArray = pos.possibility(justTableArray,justmatchArray,totalNumCards - handCards.length);
	oppPossibilityOneCardArray = pos.possibility(justTableArray,justmatchArray,totalNumCards - handCards.length+1);

	if(possibilityArray[4] == 1){
		numForStraight = straightr.howManyNumforStraight(matchArray);
	}
	if(possibilityArray[5] == 1){
		numForFlush = flushr.howManyNumforFlush(tableArray);
	}
	if(oppPossibilityArray[4] == 1){
		justnumForStraight = straightr.howManyNumforStraight(justmatchArray);
	}
	if(oppPossibilityArray[5] == 1){
		justnumForFlush = flushr.howManyNumforFlush(justTableArray);
	}


	if(numtableCards == 3){

		if(possibilityArray[8] == 2){
			goodPoints = goodPoints + 10000;
		}else if(possibilityArray[7] == 2){
			goodPoints = goodPoints + 5000;
		}else if(possibilityArray[6] == 2){
			goodPoints = goodPoints + 4000;
		}else if(possibilityArray[5] == 2){
			goodPoints = goodPoints + 3000;
		}else if(possibilityArray[4] == 2){
			goodPoints = goodPoints + 2000;
		}else if(possibilityArray[3] == 2){
			goodPoints = goodPoints + 1000;
		}else if(possibilityArray[2] == 2){
			goodPoints = goodPoints + 500;
		}else if(possibilityArray[1] == 2){
			larger2Kinds = gtk.goodTwoKind(handCards,tableCards,matchArray);

			if(larger2Kinds == 0){
				goodPoints = goodPoints + 250
			}
			if(larger2Kinds == 1){
				goodPoints = goodPoints + 200
			}
			if(larger2Kinds == 2){
				goodPoints = goodPoints + 150
			}
			if(larger2Kinds == 3){
				goodPoints = goodPoints + 100
			}
		}
		if(startingChips*.9 >= currentChips){
			goodPoints = goodPoints + 100;
		}
		else if(startingChips*.75 >= currentChips){
			goodPoints = goodPoints + 50;
		}
		if(handCards[1]>=11 || handCards[2]>=11){
			goodPoints = goodPoints + 50;
		}

		if(currentBet >= currentChips){
			badPoints = 200 + badPoints
			if(playersPlaying >= 4){
				badPoints = 100 + badPoints
			}
		}
		else if(currentBet >= currentChips*.25){
			badPoints = 150 + badPoints
		}else if(currentBet >= currentChips*.1){
			badPoints = 100 + badPoints
		}

		totalPoints = goodPoints - badPoints;
		console.log(goodPoints);
		console.log(badPoints);

		if(currentBet == 0 && totalPoints<0){
			totalPoints = 200;
		}

		if(totalPoints<0){
			reArray = [0,0]
			return reArray;
		}else if(totalPoints>= 0 && totalPoints<= 500){
			if(currentBet >= currentChips){
				reArray = [4,currentChips];
			}
			else{
				reArray = [1,currentBet];
			}
		}else if(totalPoints>= 500 && totalPoints<= 1000){
			if(currentBet+currentChips*.1 >= currentChips){
				reArray = [4,currentChips];
			}
			else{
				reArray = [2,(currentBet+currentChips*.1)]
			}
			return reArray;
		}else if(totalPoints>= 1000 && totalPoints<= 2000){
			if(currentBet+currentChips*.2 >= currentChips){
				reArray = [4,currentChips];
			}
			else{
				reArray = [2,(currentBet+currentChips*.2)]
			}
			return reArray;
		}else{
			if(currentBet+currentChips*.3 >= currentChips){
				reArray = [4,currentChips];
			}
			else{
				reArray = [2,(currentBet+currentChips*.3)]
			}
			return reArray;
		}
		return [1,currentBet];
	}



		if(numtableCards == 4){
			if(possibilityArray[8] == 2){
				goodPoints = goodPoints + 10000;
			}else if(possibilityArray[7] == 2){
				goodPoints = goodPoints + 5000;
			}else if(possibilityArray[6] == 2){
				goodPoints = goodPoints + 4000;
			}else if(possibilityArray[5] == 2){
				goodPoints = goodPoints + 1200;
			}else if(possibilityArray[4] == 2){
				goodPoints = goodPoints + 800;
			}else if(possibilityArray[3] == 2){
				goodPoints = goodPoints + 600;
			}else if(possibilityArray[2] == 2){
				goodPoints = goodPoints + 400;
			}else if(possibilityArray[1] == 2){
				larger2Kinds = gtk.goodTwoKind(handCards,tableCards,matchArray);
				console.log(larger2Kinds);
				if(larger2Kinds == 0){
					goodPoints = goodPoints + 250;
				}
				if(larger2Kinds == 1){
					goodPoints = goodPoints + 200;
				}
				if(larger2Kinds == 2){
					goodPoints = goodPoints + 150;
				}
				if(larger2Kinds == 3){
					goodPoints = goodPoints + 100;
				}else{
					goodPoints = goodPoints + 50;
				}
			}



			if(pot >= currentChips){
				goodPoints = goodPoints + 100;
			}else if(pot >= currentChips*.5){
				goodPoints = goodPoints + 50;
			}
			if(numForFlush == 1 && justnumForFlush != 1){
				goodPoints = goodPoints + 500
			}
			if(numForStraight == 1 && justnumFornumForStraight != 1){
				goodPoints = goodPoints + 250
			}

			badPoints = 50 + badPoints;


			if(currentBet >= currentChips){
				badPoints = 200 + badPoints;
				if(playersPlaying >= 4){
					badPoints = 100 + badPoints
				}
				if(justnumForStraight == 1){
					badPoints = 150 + badPoints;
				}
				if(justnumForFlush == 1){
					badPoints = 550 + badPoints;
				}
				badPoints = 250 + badPoints;
			}else if(currentBet >= currentChips*.75){
				if(justnumForStraight == 1){
					badPoints = 100 + badPoints;
				}
				if(justnumForFlush == 1){
					badPoints = 400 + badPoints;
				}
				badPoints = 200 + badPoints;

			}


			else if(currentBet >= currentChips*.5){
				if(justnumForStraight == 1){
					badPoints = 100 + badPoints;
				}
				if(justnumForFlush == 1){
					badPoints = 350 + badPoints;
				}
				badPoints = 150 + badPoints;

			}else if(currentBet >= currentChips*.35){
				if(justnumForStraight == 1){
					badPoints = 100 + badPoints;
				}
				if(justnumForFlush == 1){
					badPoints = 300 + badPoints;
				}
				badPoints = 100 + badPoints;


			}else if(currentBet >= currentChips*.25){
				if(justnumForStraight == 1){
					badPoints = 50 + badPoints;
				}
				if(justnumForFlush == 1){
					badPoints = 150 + badPoints;
				}
				badPoints = 100 + badPoints;

			}else if(currentBet >= currentChips*.1){
				badPoints = 100 + badPoints;
			}

			if(oppPossibilityArray[7] == 1){
				badPoints = 50 + badPoints;
			}

			//return stuff based off goodpoints and badPoints
			totalPoints = goodPoints - badPoints;
			console.log(goodPoints);
			console.log(badPoints);

			if(currentBet == 0 && totalPoints<0){
				totalPoints = 200;
			}

			if(totalPoints<0){
				reArray = [0,0]
				return reArray;
			}else if(totalPoints>= 0 && totalPoints<= 500){
				if(currentBet >= currentChips){
					reArray = [4,currentChips];
				}
				else{
					reArray = [1,currentBet];
				}
			}else if(totalPoints>= 500 && totalPoints<= 1000){
				if(currentBet+currentChips*.1 >= currentChips){
					reArray = [4,currentChips];
				}
				else{
					reArray = [2,(currentBet+currentChips*.1)]
				}
				return reArray;
			}else if(totalPoints>= 1000 && totalPoints<= 2000){
				if(currentBet+currentChips*.2 >= currentChips){
					reArray = [4,currentChips];
				}
				else{
					reArray = [2,(currentBet+currentChips*.2)]
				}
				return reArray;
			}else{
				if(currentBet+currentChips*.3 >= currentChips){
					reArray = [4,currentChips];
				}
				else{
					reArray = [2,(currentBet+currentChips*.3)]
				}
				return reArray;
			}
			return [1,currentBet];
		}


		if(numtableCards == 5){
			if(possibilityArray[8] == 2){
				goodPoints = goodPoints + 10000;
			}else if(possibilityArray[7] == 2){
				goodPoints = goodPoints + 5000;
			}else if(possibilityArray[6] == 2){
				goodPoints = goodPoints + 2000;
			}else if(possibilityArray[5] == 2){
				goodPoints = goodPoints + 1200;
			}else if(possibilityArray[4] == 2){
				goodPoints = goodPoints + 800;
			}else if(possibilityArray[3] == 2){
				goodPoints = goodPoints + 600;
			}else if(possibilityArray[2] == 2){
				goodPoints = goodPoints + 400;
			}else if(possibilityArray[1] == 2){
				larger2Kinds = gtk.goodTwoKind(handCards,tableCards,matchArray);
				console.log(larger2Kinds);
				if(larger2Kinds == 0){
					goodPoints = goodPoints + 250;
				}
				if(larger2Kinds == 1){
					goodPoints = goodPoints + 200;
				}
				if(larger2Kinds == 2){
					goodPoints = goodPoints + 150;
				}
				if(larger2Kinds == 3){
					goodPoints = goodPoints + 100;
				}else{
					goodPoints = goodPoints + 50;
				}
			}

			goodPoints = goodPoints + 50; //you want to play

			if(oppPossibilityArray[5] == 1){
				badPoints = badPoints + 1200/4;
			}else if(oppPossibilityArray[4] == 1){
				badPoints = badPoints + 800/4;
			}else if(oppPossibilityArray[3] == 1){
				badPoints = badPoints + 600/4;
			}else if(oppPossibilityArray[2] == 1){
				badPoints = badPoints + 400/4;
			}else if(oppPossibilityArray[1] == 1){
				badPoints = badPoints + 150/4;
			}



			if(oppPossibilityOneCardArray[7] == 1){
				goodPoints = goodPoints + 5000/5;
			}else if(oppPossibilityOneCardArray[6] == 1){
				goodPoints = goodPoints + 2000/4;
			}if(oppPossibilityOneCardArray[5] == 1){
				badPoints = badPoints + 1200/2;
			}else if(oppPossibilityOneCardArray[4] == 1){
				badPoints = badPoints + 800/2;
			}else if(oppPossibilityOneCardArray[3] == 1){
				badPoints = badPoints + 600/2;
			}else if(oppPossibilityOneCardArray[2] == 1){
				badPoints = badPoints + 400/2;
			}




			if(currentBet >= currentChips){
				badPoints = 300 + badPoints;
			}else if(currentBet >= currentChips*.75){
				badPoints = 250 + badPoints;
			}else if(currentBet >= currentChips*.5){
				badPoints = 200 + badPoints;
			}else if(currentBet >= currentChips*.35){
				badPoints = 150 + badPoints;
			}else if(currentBet >= currentChips*.25){
				badPoints = 100 + badPoints;
			}else if(currentBet >= currentChips*.1){
				badPoints =  badPoints;
			}


			totalPoints = goodPoints - badPoints;
			console.log(goodPoints);
			console.log(badPoints);

			if(currentBet == 0 && totalPoints<0){
				totalPoints = 200;
			}

			if(totalPoints<0){
				reArray = [0,0]
				return reArray;
			}else if(totalPoints>= 0 && totalPoints<= 500){
				if(currentBet >= currentChips){
					reArray = [4,currentChips];
				}
				else{
					reArray = [1,currentBet];
				}
				return reArray;
			}else if(totalPoints>= 500 && totalPoints<= 1000){
				if(currentBet+currentChips*.1 >= currentChips){
					reArray = [4,currentChips];
				}
				else{
					reArray = [2,(currentBet+currentChips*.1)]
				}
			}else if(totalPoints>= 1000 && totalPoints<= 2000){
				if(currentBet+currentChips*.2 >= currentChips){
					reArray = [4,currentChips];
				}
				else{
					reArray = [2,(currentBet+currentChips*.2)]
				}
			}else{
				if(currentBet+currentChips*.3 >= currentChips){
					reArray = [4,currentChips];
				}
				else{
					reArray = [2,(currentBet+currentChips*.3)]
				}
			}
			return [1,currentBet];
		}

	return -1;
}
