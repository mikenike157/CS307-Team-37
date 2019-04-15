function hardAI(handCards,tableCards,pot,currentChips,numberOfPlayers,currentBet,playersPlaying,startingChips){
	
	var possibilityArray;
	var shandgoodness = -1;
	var totalNumCards = handCards.length + tableCards.length;
	var numtableCards = tableCards.length;
	
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
	
	var larger2Kinds;
	
	tableArray = finalhand(handCards,tableCards);
	matchArray = match(tableArray);
	justTableArray = finalhand([],tableCards);
	justmatchArray = match(justTableArray);
	
	
	if(numtableCards == 0){
		shandgoodness = handgoodness(tableArray,matchArray);
			
		if(shandgoodness == 1){
			//fold unless current bet is 0
		}
		if(shandgoodness == 2){
			//fold unless current bet is 0
		}	
		if(shandgoodness == 3){
			//Call bet unless current bet is too 10% ore more of currentChips --- Call if currentChips is < 2*bigBlind unless call is 75% of current chips
		}
		if(shandgoodness == 4){
			//Call bet unless current bet is too 55% ore more of currentChips--- Call if currentChips is < 5*bigBlind
		}
		if(shandgoodness == 5){
			//Call bet 
		}
	}


	possibilityArray = possibility(tableArray,matchArray,totalNumCards);
	oppPossibilityArray = possibility(justTableArray,justmatchArray,totalNumCards - tableCards.length);
	
	if(possibilityArray[4] == 1){
		numForStraight = howManyNumforStraight(matchArray);
	}
	if(possibilityArray[5] == 1){
		numForFlush = howManyNumforFlush(tableArray);
	}
	if(oppPossibilityArray[4] == 1){
		justnumForStraight = howManyNumforStraight(justmatchArray);
	}
	if(oppPossibilityArray[5] == 1){
		justnumForFlush = howManyNumforFlush(justTableArray);
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
			larger2Kinds = goodTwoKind(handCards,tableCards,matchArray);
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
		//return stuff based off goodpoints and badPoints
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
				larger2Kinds = goodTwoKind(handCards,tableCards,matchArray);
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
				}else{
					goodPoints = goodPoints + 50
				}
			}
			
			if(startingChips*.9 >= currentChips){
				goodPoints = goodPoints + 100;
			}
			else if(startingChips*.75 >= currentChips){
				goodPoints = goodPoints + 50;
			}

			
			if(currentBet >= currentChips){
				badPoints = 200 + badPoints
				if(playersPlaying >= 4){
					badPoints = 100 + badPoints
				}
				if(justnumForStraight == 1){
					badPoints = 500;
				}
				if(justnumForFlush == 1){
					badPoints = 900;
				}				
			}
			else if(currentBet >= currentChips*.5){
				if(justnumForStraight == 1){
					badPoints = 250;
				}
				if(justnumForFlush == 1){
					badPoints = 500;
				}
				
				
			}else if(currentBet >= currentChips*.1){
				badPoints = 100 + badPoints
			}
			//return stuff based off goodpoints and badPoints
		}
		
		
		if(numtableCards == 5){
		
		}
		
	return -1;
}