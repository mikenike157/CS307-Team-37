function possibility(tableArray,matchArray,numTableCards) {
	
	var rArray = new Array(8);
	var currentHighMatch = 0;
	var secondhighmatch = 0;
	var nCardsStraight = 0;
	var flushcount = 0;
	var cardsleft = 7-numTableCards;	
	
	var fourCounter = 0;
	var fourHigh = -1;
	  
	var tripleCounter = 0;
	var tripleHigh = -1;
	  
	var doubleCounter = 0;
	var doubleCountArray = [-1,-1];
	  
	var fullHouse = false;
	var twoPair = false; 
	
	
	//highCards and 2kind
	rArray[0] = 1;
	rArray[1] = 1;
	
	 for(var k = 0; k < matchArray.length; k++){
		  if(matchArray[k] >= currentHighMatch){
			  secondhighmatch = currentHighMatch
			  currentHighMatch = matchArray[k];
		  }
	 }
	 //2pair
	 if((cardsleft >= 2) || (secondhighmatch == 2) || (currentHighMatch >= 2 && cardsleft >= 1)){
		 rArray[2] = 1;		 
	 }else{
		 rArray[2] = 0;
	 }
	 
	 //3kind
	 if((cardsleft + currentHighMatch) >= 3){
		 rArray[3] = 1;
	 }else{
		 rArray[3] = 0;
	 }
	 
	 //straight
	 for(var k = 2; k < (matchArray.length - 2); k++){
		  
		 if(matchArray[k-2] > 0){
			 nCardsStraight++;
		 }
		 if(matchArray[k-1] > 0){
			 nCardsStraight++;
		 }
		 if(matchArray[k] > 0){
			 nCardsStraight++;
		 }
		 if(matchArray[k+1] > 0){
			 nCardsStraight++;
		 }
		 if(matchArray[k+2] > 0){
			 nCardsStraight++;
		 }
		  
		 if((nCardsStraight + cardsleft) >= 5){
			 rArray[4] = 1;
		 } 
		  
		 nCardsStraight = 0;
	  }
	  
	  if(matchArray[0] > 0){
		  nCardsStraight++;
	  }
	  if(matchArray[1] > 0){
		  nCardsStraight++;
	  }
	  if(matchArray[2] > 0){
		  nCardsStraight++;
	  }
	  if(matchArray[3] > 0){
		  nCardsStraight++;
	  }
	  if(matchArray[12] > 0){
		  nCardsStraight++;
	  }
	  
	  if((nCardsStraight + cardsleft) >= 5){
		  rArray[4] = 1;
	  }
	  

	  if(rArray[4] != 1){
		  rArray[4] = 0;
	  }
	  
	  //flush
	  for (var i = 0; i < tableArray.length; i++) {
		  for(var j = 0; j < tableArray[i].length; j++){
			  
			  if(tableArray[i][j] == 1){
				  flushcount = flushcount + 1;		
			  }
			  if((flushcount + cardsleft) >= 5){
				  rArray[5] = 1;
			  }
	  
		  }
		  flushcount = 0;
	  }

	  if(rArray[5] != 1){
		  rArray[5] = 0;
	  }

	  //fullhouse
	  if((cardsleft >= 3) || (secondhighmatch == 2 && currentHighMatch == 3) || (currentHighMatch >= 3 && cardsleft >= 1) || (currentHighMatch >= 2 && cardsleft >= 2) || (secondhighmatch>=2 && cardsleft >= 1)){
			 rArray[6] = 1;		 
	  }else{
		  rArray[6] = 0;
	  }
	 
	 //4kind
	 if((cardsleft + currentHighMatch) >= 4){
		 rArray[7] = 1;
	 }else{
		  rArray[7] = 0;
	  }
	
	 
	  //Straight flush 
	 nCardsStraight = 0;
	 if(rArray[5] == 1  && rArray[4] == 1){
		  
		  //checking within the flush suit
		 for(var i = 0; i < 4; i++){
			 for(var k = 2; k < (tableArray[i].length - 2); k++){			  
				 if(tableArray[i][k-2] > 0){
					  nCardsStraight++;
				 }
				 if(tableArray[i][k-1] > 0){
					 nCardsStraight++;
				 }
				  if(tableArray[i][k] > 0){
					 nCardsStraight++;
				 }
				 if(tableArray[i][k+1] > 0){
					 nCardsStraight++;
				 }
				 if(tableArray[i][k+2] > 0){
					 nCardsStraight++;
				 }
				  
				 if((nCardsStraight + cardsleft) >= 5){
					 rArray[8] = 1;
				 } 
				  
				 nCardsStraight = 0;
			  
				 if(tableArray[i][0] > 0){
					 nCardsStraight++;
				 }
				 if(tableArray[i][1] > 0){
					 nCardsStraight++;
				 }
				 if(tableArray[i][2] > 0){
					 nCardsStraight++;
				 }
				 if(tableArray[i][3] > 0){
					 nCardsStraight++;
				 }
				 if(tableArray[i][12] > 0){
					 nCardsStraight++;
				 }
				  
				 if((nCardsStraight + cardsleft) >= 5){
					 rArray[8] = 1;
				 } 
				 nCardsStraight = 0;
			 }
		 }
		  
	 }
	  if(rArray[8] != 1){
		  rArray[8] = 0;
	  }
	  
	  
	  	  
	  for(var k = 0; k < matchArray.length; k++){
		  		  
		  //How many 4 of a kinds
		  if(matchArray[k] == 4){ 
			  fourCounter = fourCounter + 1;
			  fourHigh = k;
		  }
		  
		//How many 3 of a kinds
		  if(matchArray[k] == 3){
			  tripleCounter = tripleCounter + 1;
			  tripleHigh = k;
		  }
		  
		//How many pairs
		  if(matchArray[k] == 2){
			  
			  if(doubleCounter == 0){
				  doubleCountArray[0] = k;
			  }
			  
			  if(doubleCounter > 0){
				  doubleCountArray[1] = doubleCountArray[0];
				  doubleCountArray[0] = k;
			  }		  
				  
			  doubleCounter = doubleCounter + 1;			  
		  }			  
	  }
	  
	  //Is there a Full House
	  if(tripleCounter >= 1 && doubleCounter >= 1){
		  fullHouse = true;
		  fullHouseArray = [tripleHigh,doubleCountArray[0]]
	  }
	  
	  //Is there a two Pair
	  if(doubleCounter >= 2 && !fullHouse){
		  twoPair = true;
	  }
	  
	  	  
	  var flush = false;
	  var flushArrayHolder = new Array(5);
	  var flushArray = new Array(5);
	  var flushSuit = -1;
	  var count = 0;
	  
	  var straightHigh = -1;
	  var straight = false;
	  
	  var straightFlush = false;
	  var straightFlushHigh = -1;
	  
	  
	  //Flush Section
	  
	  //Go through matrix 
	  for (var i = 0; i < tableArray.length; i++) {
		  for(var j = 0; j < tableArray[i].length; j++){	
			    	  
			  
			  // 1 means we found a card
			  if(tableArray[i][j] == 1){
				  count = count + 1;		
			  }
			  
			  // if 5 is reached that means we found a flush thus we must set which suit it is incase of a straight flush
			  if(count >= 5){
				  flushSuit = i;
				  flush = true;
			  }
			  
		  }
		  count = 0;  
	  }
	  

	  
	  //Straight Section
	  for(var k = 2; k < (matchArray.length - 2); k++){
		  //checking 5 slots at a time
		  if(matchArray[k-2] > 0 && matchArray[k-1] > 0 && matchArray[k] > 0 && matchArray[k+1] > 0 && matchArray[k+2] > 0){
			  straight = true;
			  straightHigh = k+2;
		  }
		 //checking in the case of A,2,3,4,5
		  if(matchArray[0] > 0 && matchArray[1] > 0 && matchArray[2] > 0 && matchArray[3] > 0 && matchArray[12] > 0 && matchArray[4] == 0){
			  straight = true;
			  straightHigh = 3;
		  }
	  }
	  

	  
	  //Straight flush Section
	  if(straight && flush){
		  
		  //checking within the flush suit
		  for(var k = 2; k < (tableArray[flushSuit].length - 2); k++){
			  
			  //checking 5 slots at a time
			  if(tableArray[flushSuit][k-2] > 0 && tableArray[flushSuit][k-1] > 0 && tableArray[flushSuit][k] > 0 && tableArray[flushSuit][k+1] > 0 && tableArray[flushSuit][k+2] > 0){
				  straightFlush = true;
				  straightFlushHigh = k+2;
			  }
			  
			  //checking in the case of A,2,3,4,5
			  if(tableArray[flushSuit][0] > 0 && tableArray[flushSuit][1] > 0 && tableArray[flushSuit][2] > 0 && tableArray[flushSuit][3] > 0 && tableArray[flushSuit][12] > 0 && tableArray[flushSuit][4] == 0){
				  straightFlush = true;
				  straightFlushHigh = 3;
			  }
		  }
		  
	  }
	  
	  
	  if(straightFlush){
		  rArray[8] = 2;
	  }if(fourCounter == 1){
		  rArray[7] = 2;
	  }if (fullHouse){
		  rArray[6] = 2;
	  }if(flush){
		  rArray[5] = 2;
	  }if(straight){
		  rArray[4] = 2;
	  }if (tripleCounter >= 1){
		  rArray[3] = 2;
	  }if (twoPair){
		  rArray[2] = 2;
	  }if(doubleCounter >= 1){
		  rArray[1] = 2;
	  } 	  
	 
	 return rArray;
	
}