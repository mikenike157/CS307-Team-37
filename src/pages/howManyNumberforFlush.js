function howManyNumforFlush(tableArray) {
	
	var flushcount = 0;
	var cardholder = 0;
	var rNumNeedForFlush;
	

	for (var i = 0; i < tableArray.length; i++) {
		for(var j = 0; j < tableArray[i].length; j++){

			if(tableArray[i][j] == 1){
				flushcount = flushcount + 1;		
			}
		}
		if(flushcount >= cardholder){
			  cardholder = flushcount
			  rNumNeedForFlush = 5 - cardholder;
		  }
		
		
		flushcount = 0;
	}
	
	return rNumNeedForFlush;
}