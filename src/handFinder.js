
this.finalhand = function(a, b){
  // Logic that makes these arrays look like what I want them to look like

  // Make master Array
  let x = new Array(4);
  for (let i = 0; i < x.length; i++) {
    x[i] = new Array(13);
  }

  for (let j = 0; j < x.length; j++){
    for (let k = 0; k < x[j].length; k++){
      x[j][k] = 0;
    }
  }

  // find what cards are in users hand and setting them
  for (let i = 0; i < a.length; i++){
    const holder_a_number = a[i] % 13;
    const holder_a_suit = Math.floor(a[i] / 13);
    x[holder_a_suit][holder_a_number] = 1;
  }

  // find what cards are on the table and setting them
  for (let i = 0; i < b.length; i++){
    const holder_b_number = b[i] % 13;
    const holder_b_suit   = Math.floor(b[i] / 13);
    x[holder_b_suit][holder_b_number] = 1;
  }

  return x;
};



this.match = function(x){

  let matchArray = new Array(13);
  let count = 0;


  for (let i = 0; i < x[0].length; i++) {
    for (let j = 0; j < x.length; j++){
      if (x[j][i] == 1){
        count = count + 1;
      }
    }
    matchArray[i] = count;
    count = 0;
  }

  return matchArray;

};

this.findWinner = function(handArray) {
  let sortArray = handArray.sort(function(x, y) {
    let minArray = Math.min(x.length, y.length);
    for (let i = 0; i < minArray; i++) {
      if (x[i] > y[i]) {
        return -1;
      } else if (x[i] < y[i]) {
        return 1;
      }
    }
    return 0;
  });
  console.log("ALL HANDS: " + sortArray);
  let finalArr = [];
  for (let i = 0; i < sortArray.length-1; i++) {
    for (let j = 0; j < sortArray[i].length; j++) {
      if (sortArray[i][j] != sortArray[i+1][j]) {
        finalArr.push(sortArray[i]);
        return finalArr;
      }
    }
    finalArr.push(sortArray[i]);
  }
  return finalArr;
};

this.kinds = function(matchArray){
  let highCard = -1;

  let fourCounter = 0;
  let fourHigh = -1;

  let tripleCounter = 0;
  let tripleHigh = -1;

  let doubleCounter = 0;
  let doubleCountArray = [-1, -1];

  let fullHouse = false;
  let twoPair = false;

  for (let k = 0; k < matchArray.length; k++){
    //What is the High Card
    if (matchArray[k] != 0){
      highCard = k;
    }

    //How many 4 of a kinds
    if (matchArray[k] == 4){
      fourCounter = fourCounter + 1;
      fourHigh = k;
    }

    //How many 3 of a kinds
    if (matchArray[k] == 3){
      tripleCounter = tripleCounter + 1;
      tripleHigh = k;
    }

    //How many pairs
    if (matchArray[k] == 2){

      if (doubleCounter == 0){
        doubleCountArray[0] = k;
      }

      if (doubleCounter > 0){
        doubleCountArray[1] = doubleCountArray[0];
        doubleCountArray[0] = k;
      }

      doubleCounter = doubleCounter + 1;
    }
  }
	
  let fullHouseArray = undefined;

  //Is there a Full House
  if (tripleCounter >= 1 && doubleCounter >= 1){
    fullHouse = true;
    fullHouseArray = [tripleHigh, doubleCountArray[0]];
  }

  //Is there a two Pair
  if (doubleCounter >= 2 && !fullHouse){
    twoPair = true;
  }

  //Ranking on highest Hand

  if (fourCounter == 1){
    return [7, fourHigh];
  } else if (fullHouse){
    return [6, fullHouseArray[0], fullHouseArray[1]];
  } else if (tripleCounter >= 1){
    return [3, tripleHigh];
  } else if (twoPair){
    return [2, doubleCountArray[0], doubleCountArray[1]];
  } else if (doubleCounter == 1){
    return [1, doubleCountArray[0]];
  } else {
    return [0, highCard];
  }

};

this.flushAndStraight = function(x, matchArray){

  let flush = false;
  let flushArrayHolder = new Array(5);
  let flushArray = new Array(5);
  let flushSuit = -1;
  let count = 0;

  let straightHigh = -1;
  let straight = false;

  let straightFlush = false;
  let straightFlushHigh = -1;


  //Flush Section

  //Go through matrix
  for (let i = 0; i < x.length; i++) {
    for (let j = 0; j < x[i].length; j++){

      // when there are more than 5 cards of the same suit
      if (x[i][j] == 1 && count >=5){
        for (let l = 0; l < 4; l++){
          flushArrayHolder[l] = flushArrayHolder[l+1];
        }
        flushArrayHolder[4] = j;
        count = count + 1;
      }

      // 1 means we found a card
      if (x[i][j] == 1 && count<5){
        flushArrayHolder[count] = j;
        count = count + 1;
      }




      // if 5 is reached that means we found a flush thus we must set which suit it is incase of a straight flush
      if (count >= 5){
        flushSuit = i;
      }

    }
    // if 5 is reached that means we found a flush
    if (count >= 5){
      flush = true;
      //we must return the array to compare which flush is bigger if two user have a flush
      for (let z = 0; z < flushArray.length; z++){
        flushArray[z] = flushArrayHolder[z];
      }
    }
    count = 0;
  }



  //Straight Section
  for (let k = 2; k < (matchArray.length - 2); k++){
    //checking 5 slots at a time
    if (matchArray[k-2] > 0 && matchArray[k-1] > 0 && matchArray[k] > 0 && matchArray[k+1] > 0 && matchArray[k+2] > 0){
      straight = true;
      straightHigh = k+2;
    }
    //checking in the case of A,2,3,4,5
    if (matchArray[0] > 0 && matchArray[1] > 0 && matchArray[2] > 0 && matchArray[3] > 0 && matchArray[12] > 0 && matchArray[4] == 0){
      straight = true;
      straightHigh = 3;
    }
  }



  //Straight flush Section
  if (straight && flush){

    //checking within the flush suit
    for (let k = 2; k < (x[flushSuit].length - 2); k++){

      //checking 5 slots at a time
      if (x[flushSuit][k-2] > 0 && x[flushSuit][k-1] > 0 && x[flushSuit][k] > 0 && x[flushSuit][k+1] > 0 && x[flushSuit][k+2] > 0){
        straightFlush = true;
        straightFlushHigh = k+2;
      }

      //checking in the case of A,2,3,4,5
      if (x[flushSuit][0] > 0 && x[flushSuit][1] > 0 && x[flushSuit][2] > 0 && x[flushSuit][3] > 0 && x[flushSuit][12] > 0 && x[flushSuit][4] == 0){
        straightFlush = true;
        straightFlushHigh = 3;
      }
    }

  }


  //ranking system
  if (straightFlush){
    let val = [8];
    val = val.concat(straightFlushHigh);
    return val;
  } else if (flush){
    let val = [5];
    val = val.concat(flushArray);
    return val;
  } else if (straight){
    let val = [4];
    val = val.concat(straightHigh);
    return val;
  } else {
    return [-1, 0];
  }



};