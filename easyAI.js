/**
 * 
 */
function easyAI(handCards,tableCards,pot,currentChips,numberOfPlayers,currentBet,playersPlaying){
	
	var reArray = [0,0]
	var shandgoodness = -1;
	var totalNumCards = handCards.length + tableCards.length;
	var numtableCards = tableCards.length;
	var randNum;
	
	if(numtableCards == 0){
		shandgoodness = handgoodness(tableArray,matchArray);
			
		if(shandgoodness == 1){
			//fold unless current bet is 0
			if(currentBet==0){
				reArray = [1,0]
			}else{
				reArray = [0,0]
			}
			return reArray;
		}
		if(shandgoodness == 2){
			//fold unless current bet is 0
			if(currentBet<= currentChips*.25){
				reArray = [1,currentBet]
			}else{
				reArray = [0,0]
			}
			return reArray;
		}	
		if(shandgoodness == 3){
			//Call bet unless current bet is too 10% ore more of currentChips --- Call if currentChips is < 2*bigBlind unless call is 75% of current chips
			if(currentBet<= currentChips*.50){
				reArray = [1,currentBet]
			}else{
				reArray = [0,0]
			}
			return reArray;
		
		}
		if(shandgoodness == 4){
			//Call bet unless current bet is too 55% ore more of currentChips--- Call if currentChips is < 5*bigBlind
			if(currentBet<= currentChips*.75){
				reArray = [1,currentBet]
			}else{
				reArray = [0,0]
			}
			return reArray;
		}
		if(shandgoodness == 5){
			//Call bet 
			reArray = [1,currentBet]
			return reArray;
		}
	}
	
	if(numtableCards == 3){
		randNum = getRandomInt(101)
		if(currentBet >= currentChips*.75){
			randNum = randNum+75
		}else if(currentBet >= currentChips*.50){
			randNum = randNum+50
		}else if(currentBet >= currentChips*.25){
			randNum = randNum+25
		}
		
		if(randNum>=95){
			reArray = [0,0]
			return reArray
		}
		if(randNum>=35){
			reArray = [1,currentBet]
			return reArray
		}
		if(randNum>=0){
			reArray = [1,currentBet*1.5]
			return reArray
		}
		return [0,0]
	}
	if(numtableCards == 4){
		randNum = getRandomInt(101)
		if(currentBet >= currentChips*.75){
			randNum = randNum+75
		}else if(currentBet >= currentChips*.50){
			randNum = randNum+50
		}else if(currentBet >= currentChips*.25){
			randNum = randNum+25
		}
		
		if(randNum>=95){
			reArray = [0,0]
			return reArray
		}
		if(randNum>=35){
			reArray = [1,currentBet]
			return reArray
		}
		if(randNum>=0){
			reArray = [1,currentBet*1.5]
			return reArray
		}
		return [0,0]		
		
	}
	if(numtableCards == 5){
		randNum = getRandomInt(101)
		if(currentBet >= currentChips*.75){
			randNum = randNum+75
		}else if(currentBet >= currentChips*.50){
			randNum = randNum+50
		}else if(currentBet >= currentChips*.25){
			randNum = randNum+25
		}
				
		if(randNum>=95){
			reArray = [0,0]
			return reArray
		}
		if(randNum>=35){
			reArray = [1,currentBet]
			return reArray
		}
		if(randNum>=0){
			reArray = [1,currentBet*1.5]
			return reArray
		}
		return [0,0]
	}
}


function getRandomInt(max) {
	  return Math.floor(Math.random() * Math.floor(max));
	}