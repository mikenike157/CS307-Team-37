function lookingFor(possibilityArray,tableArray,matchArray,numTableCards){
	
	var lookingForArray = new Array(7);
    for (var i = 0; i < lookingForArray.length; i++) {
        lookingForArray[i] = new Array(14);
      }
	

	
	var cardsleft = 7-numTableCards;
	
	var highestkindHave = 0;
	var highestkindLooking = 0;
	
	var highestkindHaveNumber = -1;
	var highestkindLookingNumber = -1;
	
	var flushSuitHave = -1;
	var flushSuitLooking = -1;
	
	var possibleFlushArray = [0,0,0,0];
	var possibleFlushcount = 0;
	
	var straightArrayHave = [-1,-1,-1,-1,-1];
	
	var straightFlushArrayHave = [-1,-1,-1,-1,-1];
	
	var fullHouse3kindHave = -1;
	var fullHouse2kindHave = -1;
	
	var doubleCounter = 0;
	var doubleCountArray = [-1,-1];
	
	var nCardsStraight = 0;
	var straightFlag = 0;
	var straightFlushFlag = 0;
	var straightCardLookingArray = [0,0,0,0,0,0,0,0,0,0,0,0,0];
	var straightFlushCardLookingArray = [0,0,0,0,0,0,0,0,0,0,0,0,0];
	
	straightFlush = false;
	straight = false;
	
	//Highest Kind that the player has
	if(possibilityArray[7] == 2){
		highestkindHave = 4
	}else 	if(possibilityArray[3] == 2){
		highestkindHave = 3
	}else 	if(possibilityArray[1] == 2){
		highestkindHave = 2
	}
	
	//Highest Kind that the player is looking for
	if(possibilityArray[7] == 1){
		highestkindLooking = 4
	}else 	if(possibilityArray[3] == 1){
		highestkindLooking = 3
	}else 	if(possibilityArray[2] == 1){
		highestkindLooking = 2
	}
	
	//what is the actual number of the highest kind that the player has and is looking for
	for(var k = 0; k < matchArray.length; k++){
		if(highestkindHave == matchArray[k]){
			highestkindHaveNumber = k;
		}
		if((highestkindLooking - 1) == matchArray[k]){
			highestkindLookingNumber = k;
		}
	}
	
	var count = 0;
	
	var straightHigh = -1;
	var straight = false;
	  
	var straightFlush = false;
	var straightFlushHigh = -1;
	
	
	//Has and looking for a Flush
	if(possibilityArray[5] == 2){
		for (var i = 0; i < tableArray.length; i++) {
			  for(var j = 0; j < tableArray[i].length; j++){	
				    
				  // 1 means we found a card
				  if(tableArray[i][j] == 1){
					  count = count + 1;		
				  }
				  // if 5 is reached that means we found a flush thus we must set which suit it is incase of a straight flush
				  if(count >= 5){
					  flushSuitHave = i;
				  }
			  }
			  count = 0;  
		  }
		lookingForArray[4][0] = 2;
		lookingForArray[4][1] = flushSuitHave;
	}
	if(possibilityArray[5] == 1){
		for (var i = 0; i < tableArray.length; i++) {
			  for(var j = 0; j < tableArray[i].length; j++){	
				    
				  // 1 means we found a card
				  if(tableArray[i][j] == 1){
					  count = count + 1;		
				  }
				  // if 5 is reached that means we found a flush thus we must set which suit it is incase of a straight flush
				  if((count + cardsleft) >= 5){
					  possibleFlushArray[i] = 1;
				  }
			  }
			  count = 0;  
		  }
		lookingForArray[4][0] = 1;
		lookingForArray[4][1] = possibleFlushArray[0];
		lookingForArray[4][2] = possibleFlushArray[1];
		lookingForArray[4][3] = possibleFlushArray[2];
		lookingForArray[4][4] = possibleFlushArray[3];		
		
	}
	if(possibilityArray[5] == 0){
		lookingForArray[4][0] = 0;
	}
	
	
	//Has and looking for a straight
	if(possibilityArray[4] == 2){
		for(var k = 2; k < (matchArray.length - 2); k++){
			  //checking 5 slots at a time
			  if(matchArray[k-2] > 0 && matchArray[k-1] > 0 && matchArray[k] > 0 && matchArray[k+1] > 0 && matchArray[k+2] > 0){
				  straightArrayHave =[k-2,k-1,k,k+1,k+2];
				  straight = true;
			  }
			 //checking in the case of A,2,3,4,5
			  if(matchArray[0] > 0 && matchArray[1] > 0 && matchArray[2] > 0 && matchArray[3] > 0 && matchArray[12] > 0 && matchArray[4] == 0 && !straight && !straight){
				  straightArrayHave =[12,0,1,2,3];
				  straight = true;
			  }
		  }
		lookingForArray[3][0] = 2;
		lookingForArray[3][1] = straightArrayHave[0];
		lookingForArray[3][2] = straightArrayHave[1];
		lookingForArray[3][3] = straightArrayHave[2];
		lookingForArray[3][4] = straightArrayHave[3];
		lookingForArray[3][5] = straightArrayHave[4];
	}
	
	if(possibilityArray[4] == 1  && cardsleft == 1){
		
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
				 straightFlag = 1;
			 } 
			  
			 if(straightFlag == 1){
				 if(matchArray[k-2] == 0){
					 straightCardLookingArray[k-2] = 1;
				 }
				 if(matchArray[k-1] == 0){
					 straightCardLookingArray[k-1] = 1;
				 }
				 if(matchArray[k] == 0){
					 straightCardLookingArray[k] = 1;
				 }
				 if(matchArray[k+1] == 0){
					 straightCardLookingArray[k+1] = 1;
				 }
				 if(matchArray[k+2] == 0){
					 straightCardLookingArray[k+2] = 1;
				 }
				 
			 }
			 
			 straightFlag = 0;
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
				 straightFlag = 1;
			 } 
			  
		  if(straightFlag == 1){
				 if(matchArray[0] == 0){
					 straightCardLookingArray[0] = 1;
				 }
				 if(matchArray[1] == 0){
					 straightCardLookingArray[1] = 1;
				 }
				 if(matchArray[2] == 0){
					 straightCardLookingArray[2] = 1;
				 }
				 if(matchArray[3] == 0){
					 straightCardLookingArray[3] = 1;
				 }
				 if(matchArray[12] == 0){
					 straightCardLookingArray[12] = 1;
				 }
				 
			 }
		  
		  
			 straightFlag = 0;
			 nCardsStraight = 0;
			 
			 
			 
			 lookingForArray[3][0] = 1;
			 for(var z = 0; z < straightCardLookingArray.length; z++){
				 lookingForArray[3][z+1] = straightCardLookingArray[z];
			 }
			 
	}
	if(possibilityArray[4] == 0){
		lookingForArray[3][0]=0;
	}
	
	//Has and looking for a StraightFlush
	if(possibilityArray[8] == 2){
		  
		//checking within the flush suit
		for(var k = 2; k < (tableArray[flushSuitHave].length - 2); k++){
			  
			//checking 5 slots at a time
			if(tableArray[flushSuitHave][k-2] > 0 && tableArray[flushSuitHave][k-1] > 0 && tableArray[flushSuitHave][k] > 0 && tableArray[flushSuitHave][k+1] > 0 && tableArray[flushSuitHave][k+2] > 0){
				straightFlush = true;
				straightFlushArrayHave =[k-2,k-1,k,k+1,k+2];
			  }
			  
			  //checking in the case of A,2,3,4,5
			if(tableArray[flushSuitHave][0] > 0 && tableArray[flushSuitHave][1] > 0 && tableArray[flushSuitHave][2] > 0 && tableArray[flushSuitHave][3] > 0 && tableArray[flushSuitHave][12] > 0 && tableArray[flushSuitHave][4] == 0 && !straightFlush){
				  straightFlush = true;
				  straightFlushArrayHave =[12,0,1,2,3];
			}
		}
		lookingForArray[6][0] == 2;
		for(var z = 0; z < straightFlushArrayHave.length; z++){
			 lookingForArray[6][z+1] = straightFlushArrayHave[z];
		 }
		
		  
	}
	if(possibilityArray[8] == 1 && cardsleft == 1){
		
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
					 straightFlushFlag = 1;
				 }
				 if(straightFlushFlag == 1){
					 if(tableArray[i][k-2] == 0){
						 straightFlushCardLookingArray[k-2] == 1;
					 }
					 if(tableArray[i][k-1] == 0){
						 straightFlushCardLookingArray[k-1] == 1;
					 }
					  if(tableArray[i][k] == 0){
						 straightFlushCardLookingArray[k] == 1;
					 }
					 if(tableArray[i][k+1] == 0){
						 straightFlushCardLookingArray[k+1] == 1;
					 }
					 if(tableArray[i][k+2] == 0){
						 straightFlushCardLookingArray[k+2] == 1;
					 }
					 
				 }
				 straightFlushFlag = 0;
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
					 straightFlushFlag = 1;
				 }
				 
				 if(straightFlushFlag == 1){
					 if(tableArray[i][0] == 0){
						 straightFlushCardLookingArray[0] = 1;
					 }
					 if(tableArray[i][1] == 0){
						 straightFlushCardLookingArray[1] = 1;
					 }
					 if(tableArray[i][2] == 0){
						 straightFlushCardLookingArray[2] = 1;
					 }
					 if(tableArray[i][3] == 0){
						 straightFlushCardLookingArray[3] = 1;
					 }
					 if(tableArray[i][12] == 0){
						 straightFlushCardLookingArray[12] = 1;
					 }
					 
				 }
				 
				 nCardsStraight = 0;
				 straightFlushFlag = 0;
			 }
		 }
		lookingForArray[6][0] = 1;
		for(var z = 0; z < straightFlushCardLookingArray.length; z++){
			 lookingForArray[6][z+1] = straightFlushCardLookingArray[z];
		 }

	
	}
	if(possibilityArray[8] == 0){
		lookingForArray[6][0] = 0;
	}
	
	
	//Has and looking for a Full House
	if(possibilityArray[6] == 2){
		for(var k = 0; k < matchArray.length; k++){
			if(matchArray[k] == 3){
				fullHouse3kindHave = k;
			}
			if(matchArray[k] == 2){
				fullHouse2kindHave = k;
			}
		}
		lookingForArray[5][0] = 2;
		lookingForArray[5][1] = fullHouse3kindHave;
		lookingForArray[5][2] = fullHouse2kindHave;
	}
	
	if(possibilityArray[6] == 1){
		lookingForArray[5][0] = 1;
	}
	if(possibilityArray[6] == 0){
		lookingForArray[5][0] = 0;
	}
	
	if(possibilityArray[2] == 2){
		for(var k = 0; k < matchArray.length; k++){
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
		lookingForArray[2][0] = 2
		lookingForArray[2][1] = doubleCountArray[0];
		lookingForArray[2][2] = doubleCountArray[1];
	}else if(possibilityArray[2] == 1){
		lookingForArray[2][0] = 1;
	}else{
		lookingForArray[2][0] = 0;
	}
	
	
	
	
	lookingForArray[0][0] = highestkindHave; lookingForArray[0][1] = highestkindHaveNumber;
	lookingForArray[1][0] = highestkindLooking; lookingForArray[1][1] = highestkindLookingNumber;
  //lookingForArray[2][:] already done pair
  //lookingForArray[3][:] already done straight
  //lookingForArray[4][:] already done flush
  //lookingForArray[5][:] already done fullhouse
  //lookingForArray[6][:] already done straightFlush	
	

	
	
	
	
	return lookingForArray;
	
}