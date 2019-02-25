function factorialize(num) {
	var fac=num;
	if(num > 1){ 

		while(num > 1){
			fac = fac*(num-1);
			num=num-1;	
		}
	}else{
		fac = 1;
	}
	  return fac;
	}

 function nCk(n,k){
	 ret = factorialize(n)/((factorialize(k)*factorialize(n-k)))
	 return ret;
 }

 function percent(x,matchArray,cardNum){
	 
	 var percent2kind = 0;
	 var percent3kind = 0;
	 var percent4kind = 0;
	
	 
	 
	 for(var k = 0; k < matchArray.length; k++){
		 if(matchArray[k]==2){
			 percent2kind = 1;
		 }
		 if(matchArray[k]==3){
			 percent3kind = 1;
		 }
		 if(matchArray[k]==4){
			 percent4kind = 1;
		 }
	 }
	 if(percent2kind != 1){		 
		 //percent2kind = nCk(13,1)*nCk(6,2)*nCk(12,5)*Math.pow(nCk(6,1),3);
		 //percent2kind = (nCk(13,6)-9-(2*nCk(7,1)+8*nCk(6,1)))*(Math.pow(nCk(4,1),5)-34)*(nCk(6,1)*nCk(4,2))/nCk(52,7);
	 }
	 if(percent3kind != 1){
		 percent3kind = (2/(52 - (2+ matchArray.length)))*percent2kind;
	 }	 
	 
	 if(percent4kind != 1){
		 percent4kind = (1/(52 - (2+ matchArray.length)))*percent3kind;
	 }
	 
	 return [percent2kind,percent3kind,percent4kind];
 }