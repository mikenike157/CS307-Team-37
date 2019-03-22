this.handgoodness = function(tableArray,matchArray){
	var goodness = 0;
	var handsuit = false;
	var lowflag = true;
	var highcard = -1;
	var lowcard = -1;
	var count = 0;

	for (var i = 0; i < tableArray.length; i++) {
		  for(var j = 0; j < tableArray[i].length; j++){

			  // 1 means we found a card
			  if(tableArray[i][j] == 1){
				  count = count + 1;
			  }
			  // if 5 is reached that means we found a flush thus we must set which suit it is incase of a straight flush
			  if(count == 2){
				  handsuit = true;
			  }
		  }
		  count = 0;
	  }

	for(var k = 0; k < matchArray.length; k++){
		if(matchArray[k]==2){
			if(k <= 1){
				return goodness = 2;
			}else if(k <= 3){
				return goodness = 3;
			}else if(k <= 8){
				return goodness = 4;
			}else if(k <= 12){
				return goodness = 5;
			}
		}

		if(matchArray[k]==1 && lowflag){
			lowcard = k;
			lowflag = false;
		}
		if(matchArray[k]==1 && !lowflag){
			highcard = k;
		}
	}

	if(lowcard <=2 && highcard <= 7 && !handsuit){
		return goodness = 1;
	}
	if(lowcard <=1 && highcard == 8 && !handsuit){
		return goodness = 1;
	}
	if(lowcard <=3 && highcard <= 11 && highcard >= 9 && !handsuit){
		return goodness = 2;
	}
	if(lowcard <=7 && highcard == 12 && !handsuit){
		return goodness = 3;
	}

	if((lowcard == 2 || lowcard == 3) && highcard == 8 && !handsuit){
		return goodness = 2;
	}
	if(lowcard == 3 && highcard <= 7 && !handsuit){
		return goodness = 1;
	}
	if(lowcard == 4 && highcard <= 10 && highcard >= 6 && !handsuit){
		return goodness = 2;
	}
	if(lowcard == 4 && highcard == 5 && !handsuit){
		return goodness = 1;
	}
	if(lowcard <= 10 && lowcard >= 4 && highcard == 11 && !handsuit){
		return goodness = 3;
	}
	if(lowcard <= 11 && lowcard >= 8 && highcard == 12 && !handsuit){
		return goodness = 4;
	}
	if(lowcard <= 6 && highcard <= 10 && !handsuit){
		return goodness = 2;
	}
	if(lowcard == 7 && highcard <= 9 && !handsuit){
		return goodness = 2;
	}
	if(lowcard == 8 && highcard == 9 && !handsuit){
		return goodness = 3;
	}
	if(lowcard <= 9 && highcard == 10 && !handsuit){
		return goodness = 3;
	}


	if(lowcard <= 2 && highcard <= 6 && handsuit){
		return goodness = 1;
	}
	if(lowcard == 0 && highcard == 7 && handsuit){
		return goodness = 1;
	}
	if(lowcard == 0 && highcard <= 11 && handsuit){
		return goodness = 2;
	}
	if(lowcard == 1 && highcard <= 10 && handsuit){
		return goodness = 2;
	}
	if(lowcard <= 6 && highcard == 12 && handsuit){
		return goodness = 3;
	}
	if(lowcard <= 11 && highcard == 12 && handsuit){
		return goodness = 4;
	}
	if(lowcard <= 8 && highcard == 11 && handsuit){
		return goodness = 3;
	}
	if(lowcard <= 10 && highcard == 11 && handsuit){
		return goodness = 4;
	}
	if(lowcard == 2 && highcard <= 10 && handsuit){
		return goodness = 2;
	}
	if(lowcard <= 4 && highcard <= 10 && handsuit){
		return goodness = 2;
	}
	if(lowcard <= 9 && highcard == 10 && handsuit){
		return goodness = 3;
	}
	if(lowcard == 5 && highcard <= 9 && handsuit){
		return goodness = 2;
	}
	if(lowcard <= 8 && highcard == 9 && handsuit){
		return goodness = 3;
	}
	if(lowcard == 6 && highcard <= 8 && handsuit){
		return goodness = 2;
	}
	if(lowcard == 7 && highcard == 8 && handsuit){
		return goodness = 3;
	}
	return 0;

}
