//requires fabricjs library to be sourced in pages that use this document

let c = new fabric.Canvas();
let CANVAS_WIDTH = 0;
let CANVAS_HEIGHT = 0;

//Positions of objects that will not move
const CARD_WIDTH = 2;
const CARD_HEIGHT = 3;
const CARD_SCALE = 10;
 
const TABLE_CARDS = 0;
const TABLE_BET = 0;

//Position of the cards and blinds when they are in front of the player
const PLAYER_CARDS = 0;
const PLAYER_BLIND = 0;
const PLAYER_FOLDED = 0;
const PLAYER_CHIPS_OUT = 0;
const PLAYER_CHIPS_IN = 0;

let players = [];

//Draws everything that can be drawn before the game is set up
function drawRoom(canvas, cHeight, cWidth){
	c = new fabric.StaticCanvas(canvas)
	c.setHeight(cHeight);
	c.setWidth(cWidth);

	//Draws the Table
	c.add(new fabric.Ellipse({
			left: (cWidth * 0.2),
			top: (cHeight * 0.2),
			fill:'green',
			//width: (cWidth * 0.6),
			//height: (cHeight * 0.6),
			rx : (cWidth / 2) * 0.6,
			ry : (cHeight / 2) * 0.6
		})
	)

	CANVAS_WIDTH = cWidth;
	CANVAS_HEIGHT = cHeight;

}

function add

//slot must be an integer from 0 t0 7
//Determines where each players cards and the blinds are rendered relative to the player's position
function transformPosition(slot, object){

}