//requires fabricjs library to be sourced in pages that use this document


let c = new fabric.StaticCanvas();

let tableSpace = new fabric.Group([], );

const URL = 'res/PNG/';
const BACK = 'cardback';

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

const BLIND_RAD = 12;

const TABLE_SCALE = 0.8;

//types for transformTablePosRadial
const PLAYER_CARDS = 0.75;
const PLAYER_FOLDED = 0.5;
const PLAYER_BLIND = 0.5;
const PLAYER_CHIPS_OUT = 0;
const PLAYER_CHIPS_IN = 0;

const PLAYER_PADDING = 36;

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
    //c.renderAll();
}

function clearTable() {
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


    let canvasCards = getItemByName(c.getObjects(), 'name', 'player-cards-' + player);
    if (canvasCards != null && canvasCards.get('isFolded') == folded && canvasCards.get('isVisible') == folded) {

        c.renderAll();
        return;
    }

    //Creates cards in the default bottom center position of the table
    let playerCards = new fabric.Group([]);

    let loadPlayerCards = () => {
        return new Promise(
            (res, rej) => {

                if (folded || !visible) {
                    cards = [BACK, BACK];
                }

                if (folded) {
                    visible = false;
                    transformTablePosRadial(player, canvasCards, PLAYER_FOLDED);
                }

                fabric.Image.fromURL(URL + cards[0] + ".png", function(imgLeft) {
                    imgLeft.set('name', 'player-card-left' + player);
                    imgLeft.set('left', 0);
                    imgLeft.set('top', 0);
                    imgLeft.scale(CARD_WIDTH * CARD_SCALE / imgLeft.get('width'));

                    fabric.Image.fromURL(URL + cards[1] + ".png", function(imgRight) {
                        imgRight.set('name', 'player-card-right' + player);
                        imgRight.set('left', CARD_WIDTH * CARD_SCALE + CARD_GAP);
                        imgRight.set('top', 0);
                        imgRight.scale(CARD_WIDTH * CARD_SCALE / imgRight.get('width'));

                        playerCards = new fabric.Group([imgLeft, imgRight], {
                            name: 'player-cards-' + player,
                            left: CANVAS_WIDTH / 2,
                            top: CANVAS_HEIGHT / 2,
                            originX: "center",
                            originY: "center",
                            hasBorders: "true",
                            backgroundColor: 'black',
                            isVisible: visible,
                            isFolded: folded,
                            flipY: true
                        });

                        

                        if (playerCards._objects.length > 1) {
                            transformTablePosRadial(player, playerCards, PLAYER_CARDS);

                            c.add(playerCards);

                             c.renderAll();
                            res();

                        } else {
                            rej();
                        }
                    });


                })



            })

    };

    loadPlayerCards().then(() => {
        //Moves the newly created cards to a new position based on which player's turn it is.
        //transformTablePosRadial(player, playerCards, PLAYER_CARDS);

        //c.add(playerCards);

        // c.renderAll();
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
    fabric.Image.fromURL(URL + card + ".png", function(img) {
        img.set('name', 'table-card-' + pos);
        img.set('left', (CARD_WIDTH * CARD_SCALE + CARD_GAP) * (pos - 3));
        img.set('top', 0);
        img.set("originX", 'center');
        img.set("originY", 'center');
        img.scale(CARD_WIDTH * CARD_SCALE / img.get('width'));
        tableSpace.add(img);
        c.renderAll();
    });



}

//Folded must be boolean
function drawPlayer(name, totalChips, betChips, folded, active, player) {

    let canvasText = getItemByName(c.getObjects(), 'name', 'player-info-' + player);
    if (canvasText != null && canvasText._objects != undefined) {
        canvasText.item(0).set({ text: name });
        canvasText.item(1).set({ text: 'Total chips: ' + totalChips });
        canvasText.item(2).set({ text: 'Current Bet: ' + betChips });
        if (folded) {
            canvasText.item(2).set({ text: 'FOLDED', fontWeight: 'bold', color: 'red' });
        }
        if (active) {
            if (canvasText._objects.length < 4) {

                let lastActive = getItemByName(c.getObjects(), 'active', true);
                if (lastActive != null && lastActive._objects.length == 4) {
                    lastActive.remove(lastActive.item(0));
                    lastActive.set('active', false)
                }

                console.dir(lastActive);

                canvasText.set('active', true)
                canvasText.add(new fabric.Rect({
                    name: 'active-rect',
                    left: 0 - canvasText.get('width') / 2,
                    top: 0 - canvasText.get('height') / 2,
                    width: canvasText.get('width'),
                    height: canvasText.get('height'),
                    fill: 'red'
                }))
                getItemByName(c.getObjects(), 'name', 'active-rect').sendToBack();
            }
        } else {
            if (canvasText._objects.length > 3) {
                canvasText.remove(canvasText.item(3));
            }
        }
        //canvasText.sendToFront();
        c.renderAll();
        return;
    }


    let playerName = new fabric.Text(name, {
        name: 'player-name-' + player,
        top: 0,
        left: 0,
        fontSize: 20,
        textAlign: 'left',
        fontWeight: 'bold'
    });

    let playerTotalChips = new fabric.Text('Total chips: ' + totalChips, {
        name: 'player-total-chips-' + player,
        top: 6 + playerName.height,
        left: 0,
        fontSize: 14,
        textAlign: 'left',
    });

    let playerBetChips = new fabric.Text('Current Bet: ' + betChips, {
        name: 'player-bet-chips-' + player,
        left: 0,
        top: 6 + playerTotalChips.height + playerName.height,
        fontSize: 14,
        textAlign: 'left',
    });

    let textFromCenter = 0.9;
    if (player % 2) {
        textFromCenter = 1.1;
    }

    let textGroup = new fabric.Group([playerName, playerTotalChips, playerBetChips], {
        name: 'player-info-' + player,
        originX: 'center',
        originy: 'center',
        backgroundColor: 'red',
        active: false,
        left: CANVAS_WIDTH / 2 + Math.cos(player * (Math.PI / 4)) * (CANVAS_WIDTH / 2) * textFromCenter,
        top: CANVAS_HEIGHT / 2 + Math.sin(player * (Math.PI / 4)) * (CANVAS_HEIGHT / 2) * textFromCenter
    });

    if (active) {
        textGroup.add(new fabric.Rect({
            name: 'active-rect',
            left: 0 - textGroup.get('width') / 2,
            top: 0 - textGroup.get('height') / 2,
            width: textGroup.get('width'),
            height: textGroup.get('height'),
            fill: 'red'
        }))
        textGroup.set('active', true);
    }

    textGroup.set('top', textGroup.get('top') - textGroup.get('height') / 2)

    if (folded) {
        textGroup.item(2).set({ text: 'FOLDED', fontWeight: 'bold', color: 'red' });
    }




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

    object.set('left', object.left + Math.cos(player * (Math.PI / 4)) * (TABLE_WIDTH / 2) * type);
    object.set('top', object.top + Math.sin(player * (Math.PI / 4)) * TABLE_HEIGHT / 2 * type);
}

//Searches the canvas for an item with a specific name so that it can be updated
function getItemByName(currentObjArr, type, value) {
    for (let i = currentObjArr.length - 1; i >= 0; i--) {
        //console.log(currentObjArr[i].name);
        if (currentObjArr[i].get(type) == value) {
            return currentObjArr[i];
        } else if (currentObjArr[i]._objects != undefined && currentObjArr[i].getObjects().length != 0) {
            let res = getItemByName(currentObjArr[i].getObjects(), type, value)
            if (res != null) {
                return res;
            }
        }
    }
    return null;
}

//testing purposes
function logObjects() {
    console.log(c.getObjects());
}