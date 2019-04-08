function hardAI(handCards,tableCards,pot,currentChips,numberOfPlayers,currentBet,bigBlind,playersPlaying){
	
	var possibilityArray;
	var shandgoodness = -1;
	var totalNumCards = handCards.length + tableCards.length;
	
	var tableArray;
	var matchArray;
	
	var justTable;
	var justmatchArray

	var oppPossibilityArray;
	
	tableArray = finalhand(handCards,tableCards);
	matchArray = match(tableArray);
	justTable = finalhand([],tableCards);
	justmatchArray = match(justTable);
	
	
	if(numTableCards == 0){
		shandgoodness = handgoodness(tableArray,matchArray);
	}
	
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
	
	
	
	possibilityArray = possibility(tableArray,matchArray,totalNumCards);
	oppPossibilityArray = possibility(justTable,justmatchArray,totalNumCards - tableCards.length);
	
	
	
	
}