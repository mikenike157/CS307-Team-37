function howManyNumforStraight(matchArray) {
	
	var cardholder = 0;
	var rNumNeedForStraight
	var nCardsStraight = 0;
	
	for(var k = 2; k < matchArray.length - 2; k++){
		  
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
		  
		 if(nCardsStraight >= cardholder){
			 cardholder = nCardsStraight
			 rNumNeedForStraight = 5 - cardholder;
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
	  
	  if(nCardsStraight >= cardholder){
		  cardholder = nCardsStraight
		  rNumNeedForStraight = 5 - cardholder;
	  }
	  return rNumNeedForStraight;
}