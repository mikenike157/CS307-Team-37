//requires fabricjs library to be sourced in pages that use this document


let c = new fabric.StaticCanvas();

let tableSpace = new fabric.Group([], );

//These values depend on the size of the canvas, so they will be assigned on the first drawRoom call.
let CANVAS_WIDTH = 0;
let CANVAS_HEIGHT = 0;
let TABLE_HEIGHT = 0;
let TABLE_WIDTH = 0;

//Positions of objects that will not move
const CARD_WIDTH = 2;
const CARD_HEIGHT = 3;
const CARD_SCALE = 25;
const CARD_GAP = 3;

const BLIND_RAD = 3;

const TABLE_SCALE = 0.8;

//types for transformTablePosRadial
const PLAYER_CARDS = 0.75;
const PLAYER_FOLDED = 0.5;
const PLAYER_BLIND = 0.6;
const PLAYER_CHIPS_OUT = 0;
const PLAYER_CHIPS_IN = 0;

let players = [];
let playerCards;

//Draws everything that can be drawn before the game is set up
function drawRoom(canvas, cHeight, cWidth) {
    c = new fabric.StaticCanvas(canvas, { backgroundColor: 'rgb(200,200,200)' });
    c.setHeight(cHeight);
    c.setWidth(cWidth);

    //Creates a group as the reference point for all objects on the table
    tableSpace = new fabric.Group([], {
        name: 'table-space',
        left: (cWidth * (1 - TABLE_SCALE) / 2),
        top: (cHeight * (1 - TABLE_SCALE) / 2),
        width: cWidth * TABLE_SCALE,
        height: cHeight * TABLE_SCALE
    })

    tableSpace.add(
        new fabric.Ellipse({
            name: 'table',
            originX: 'center',
            originY: 'center',
            left: 0,
            top: 0,
            fill: 'green',
            rx: tableSpace.width / 2,
            ry: tableSpace.height / 2,
        })
    );

    c.add(tableSpace);

    CANVAS_WIDTH = cWidth;
    CANVAS_HEIGHT = cHeight;
    TABLE_WIDTH = CANVAS_WIDTH * TABLE_SCALE;
    TABLE_HEIGHT = CANVAS_HEIGHT * TABLE_SCALE;
    c.renderAll();
}

function clearTable(){
	c.clear();

	c.set({ backgroundColor: 'rgb(200,200,200)' })
	
	tableSpace = new fabric.Group([], {
        name: 'table-space',
        left: (CANVAS_WIDTH * (1 - TABLE_SCALE) / 2),
        top: (CANVAS_HEIGHT * (1 - TABLE_SCALE) / 2),
        width: CANVAS_WIDTH * TABLE_SCALE,
        height: CANVAS_HEIGHT * TABLE_SCALE
    })

    tableSpace.add(
        new fabric.Ellipse({
            name: 'table',
            originX: 'center',
            originY: 'center',
            left: 0,
            top: 0,
            fill: 'green',
            rx: tableSpace.width / 2,
            ry: tableSpace.height / 2,
        })
    );

    c.add(tableSpace);

    c.renderAll();
}

function drawPlayerCards(visible, folded, cards, player) {
    //Draws the player's cards
    return new Promise(function(res, rej){

    let loaded1 = false;
    let loaded2 = false;

    let canvasCards = getItemByName(c, 'player-cards-' + player);
    if (canvasCards != null) {

        if (folded) {
            visible = false;
            transformTablePosRadial(player, canvasCards, PLAYER_FOLDED);
        }
        if (visible) {
            canvasCards.item(0).set({ text: cards[0] });
            canvasCards.item(1).set({ text: cards[1] });
        }
        c.renderAll();
        return;
    }

    //Creates cards in the default bottom center position of the table
    let playerCards = new fabric.Group([], {
        name: 'player-cards-' + player,
        left: 0,
        top: 0,
        originX: "center",
        originY: "center"
    });

    fabric.Image.fromURL( "res/PNG/" + cards[0] + ".png", function(img) {
        img.set('name', 'player-card-left' + player);
        img.set('left', 0);
        img.set('top', 0);
        img.scale(CARD_WIDTH * CARD_SCALE / img.get('width'));
        playerCards.add(img);
        console.log("left");
      	//c.renderAll();
      	}
      );
    fabric.Image.fromURL( "res/PNG/" + cards[1] + ".png", function(img) {
        img.set('name', 'player-card-right' + player);
        img.set('left', CARD_WIDTH * CARD_SCALE + CARD_GAP);
        img.set('top', 0);
        img.scale(CARD_WIDTH * CARD_SCALE / img.get('width'));
        console.log("right");
        playerCards.add(img);
        
        //c.renderAll();
      	}
      );    

}).then(()=>{
	//Moves the newly created cards to a new position based on which player's turn it is.
    transformTablePosRadial(player, playerCards, PLAYER_CARDS);

    tableSpace.add(playerCards);
    c.renderAll();
})
    
}

//blindType must be one of these three strings: 'dealer', 'big', 'small'
function drawBlind(blindType, player) {

    if (blindType != 'dealer' && blindType != 'big' && blindType != 'small') {
        console.log('Cannot resolve blind type: \n blindType must be one of these three strings: \'dealer\', \'big\', \'small\'');
        return false;
    }

    let blind = new fabric.Circle({
        name: blindType + '-blind',
        left: 0,
        top: 0,
        originX: 'center',
        originY: 'center',
        //placeholder for image
        fill: 'blue',
        radius: BLIND_RAD
    })

    transformTablePosRadial(player, blind, PLAYER_BLIND);
    tableSpace.add(blind);
    c.renderAll();

}

//pos must be an integer from 1 to 5, represents which stage of revealed cards to draw
function drawTableCard(card, pos) {
    fabric.Image.fromURL( "res/PNG/" + card + ".png", function(img) {
        img.set('name', 'table-card-' + pos);
        img.set('left', (CARD_WIDTH * CARD_SCALE + CARD_GAP) * (pos - 3));
        img.set('top', 0);
        img.set("originX", 'center');
        img.set("originY", 'center');
        img.scale(CARD_WIDTH * CARD_SCALE / img.get('width'));
        tableSpace.add(img);
      	 c.renderAll();
      	}
      );

    
   
}

//Folded must be boolean
function drawPlayer(name, totalChips, betChips, folded, player) {

    let canvasText = getItemByName(c,'player-info-' + player);
    if (canvasText != null) {
        canvasText.item(0).set({ text: name});
        canvasText.item(1).set({ text: 'Total chips: ' + totalChips });
        canvasText.item(2).set({ text:'Current Bet: ' + betChips });
        if (folded) {
            canvasText.item(2).set({ text: 'folded' });
        }
        c.renderAll();
        return;
    }


    let playerName = new fabric.Text(name, {
        name: 'player-name-' + player,
        top: 0,
        fontSize: 20,
        textAlign: 'left',
        fontWeight: 'bold'
    });

    let playerTotalChips = new fabric.Text('Total chips: ' + totalChips, {
        name: 'player-total-chips-' + player,
        top: playerName.height + 6,
        fontSize: 14,
        textAlign: 'left',
    });

    let playerBetChips = new fabric.Text('Current Bet: ' + betChips, {
        name: 'player-bet-chips-' + player,
        top: playerTotalChips.height + 6,
        fontSize: 14,
        textAlign: 'left',
    });

    let playerFolded = new fabric.Text('FOLDED', {
        name: 'player-folded-' + player,
        top: playerTotalChips.height + 6,
        left: 0,
        fontSize: 14,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'red'
    });

    let textGroup = new fabric.Group([playerName, playerTotalChips], {
        name: 'player-info-' + player,
        originX: 'center',
        originy: 'center'
    });

    if (!folded) {
        textGroup.add(playerBetChips)
    } else {
        textGroup.add(playerFolded)
    }


    textGroup.left = Math.cos(player * (Math.PI / 4)) * (CANVAS_WIDTH / 2) * 0.8;
    textGroup.top = Math.sin(player * (Math.PI / 4)) * CANVAS_WIDTH / 2 * 0.8;

    if (textGroup.intersectsWithObject(c.item(0))) {
        console.log("collides");
    }


    c.add(textGroup);
    c.renderAll();

}

//player must be an integer from 0 t0 7
//Object is the canvas object to be transformed
//type is a constant that determines how far from the center of the table the object will be, defined at the top of this file
//Determines where each players cards and the blinds are rendered relative to the player's playerition
function transformTablePosRadial(player, object, type) {
    object.angle = (360 / 8) * player + 90;

    object.set('left',Math.cos(player * (Math.PI / 4)) * (TABLE_WIDTH / 2) * type) ;
    object.set('top', Math.sin(player * (Math.PI / 4)) * TABLE_HEIGHT / 2 * type);
}

//Searches the canvas for an item with a specific name so that it can be updated
function getItemByName (thisCanvas, name) {
    let currentObjects = thisCanvas.getObjects();
    for (let i = currentObjects.length - 1; i >= 0; i--) {
        if (currentObjects[i].name == name) {
            return currentObjects[i];
        }
    }
    console.log("Could not find object");
    return null;
}

//testing purposes
function logObjects() {
    console.log(c.getObjects());
}