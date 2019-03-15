function possibility(tableArray,matchArray,numTableCards) {
	
	var rArray = new Array(8);
	var currentHighMatch = 0;
	var secondhighmatch = 0;
	var nCardsStraight = 0;
	var flushcount = 0;
	var cardsleft = 7-numTableCards;
	
	if(numTableCards == 5){
		return -1;
	}
	
	//highCards and 2kind
	rArray[0] = 1;
	rArray[1] = 1;
	
	 for(var k = 0; k < matchArray.length; k++){
		  if(matchArray[k] > currentHighMatch){
			  secondhighmatch = currentHighMatch
			  currentHighMatch = matchArray[k];
		  }
	 }
	 //2pair
	 if((cardsleft >= 2) || (secondhighmatch == 2) || (currentHighMatch == 2 && cardsleft >= 1)){
		 rArray[2] = 1;		 
	 }
	 
	 //3kind
	 if((cardsleft + currentHighMatch) >= 3){
		 rArray[3] = 1;
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
	  
	  //flush
	  for (var i = 0; i < tableArray.length; i++) {
		  for(var j = 0; j < tableArray.length; j++){
			  
			  if(x[i][j] == 1){
				  flushcount = flushcount + 1;		
			  }
			  if((flushcount + cardsleft) >= 5){
				  rArray[5] = 1;
			  }
	  
		  }
		  flushcount = 0;
	  }

	  //fullhouse
	  if((cardsleft >= 3) || (secondhighmatch == 2 && currentHighMatch == 3) || (currentHighMatch >= 3 && cardsleft >= 1) || (currentHighMatch >= 2 && cardsleft >= 2) || (secondhighmatch>=2 ||cardsleft >= 1)){
			 rArray[6] = 1;		 
	  }
	 
	 //4kind
	 if((cardsleft + currentHighMatch) >= 4){
		 rArray[7] = 1;
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
	 
	 return rArray;
	
}