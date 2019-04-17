function goodTwoKind(handCards,tableCards,matchArray){
	
	var highest2kindNumber
	var firstCardinHand = handCards[0]%13
	var secondCardinHand = handCards[1]%13
	var myKind
	var largerCards = 0;
	
	
	
	
	if(matchArray[firstCardinHand] == 2){
		myKind = firstCardinHand
	}
	if(matchArray[secondCardinHand] == 2){
		myKind = secondCardinHand
	}
	
	for(var k = 0; k < tableCards.length; k++){
		if((tableCards[k]%13) > myKind){
			largerCards++;
		}
	}
	return largerCards;
}