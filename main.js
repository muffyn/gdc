/* GDC gameeeeeee
TODO: organize this mess
TODO: finish the game
*/

var canvas, ctx; //TODO: clean up these random globals?
var keysDown = [];
var rectList = [];
var menuList = [];
var state;
var gridSize = 64;


class Rectangle { //TODO: move to separate file
	constructor(x, y, width, height, vel) {
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 10;
		this.height = height || 10;
		this.xVel = vel || 1;
		this.yVel = 0;
		this.jumpHeight = 8;
		this.gravity = 0.5;
		this.color = getRandomColor();
		this.inAir = false;
		this.onGrid = true;
	}
	setX(x) {
		if (x < 0) this.x = 0;
		else if (x + this.width > canvas.width) this.x = canvas.width - this.width;
		else this.x = x;
		}
	getX() { return this.x; }
	setY(y) {
		if (y < 0) this.y = 0;
		else if (y + this.height > canvas.height) this.y = canvas.height - this.height;
	 	else this.y = y;
	}
	getY() { return this.y; }
	setWidth(w) { if (w > 0) this.width = w; }
	getWidth() { return this.width; }
	setHeight(h) { if (h > 0) this.height = h; }
	getHeight() { return this.height; }

	checkCollision(other) {
		if (arguments[0] === undefined) {
			for (var i = 0; i < rectList.length; i++) {

		  	if (this.x + this.width > rectList[i].x &&
		  		this.y + this.height > rectList[i].y &&
					this.x < rectList[i].x + rectList[i].width &&
					this.y < rectList[i].y + rectList[i].height)
					return rectList[i];
				}
				return false;
		} else {
			if (this.x + this.width > other.x &&
				this.y + this.height > other.y &&
				this.x < other.x + other.width &&
				this.y < other.y + other.height)
				return other;
			return false;
		}
	}

	move() { //TODO: convert to actual physics LOL

		//update yVel
		if (this.inAir === true) {
			this.yVel += this.gravity;
		}

		//up
		if (keysDown[1] === 1 && this.inAir === false) {
			this.inAir = true;
			this.yVel = -this.jumpHeight;
			this.gravity = 0.5;
		}

		var other;

		if (this.inAir) {
			other = (new Rectangle (this.x, this.y + this.yVel, this.width, this.height)).checkCollision();

		if (other === false) {
			this.inAir = true;
			this.gravity = 0.5;
	  } else {
				if (this.y > other.y) { //touching ceiling
					console.log('Touched ceiling!' + this.y + other.y);
					this.setY(other.y + other.height);
					this.yVel = 0;
				} else { //on ground
					this.touchGround(other);
				}
			}
		} else {
			other = (new Rectangle (this.x, this.y + 0.1, this.width, this.height)).checkCollision();
			if (other === false) {
				console.log('Starting to fall');
				this.inAir = true;
				this.gravity = 0.5;
		  }

		}

		if (keysDown[0] === 1) { //left
			this.xVel = -Math.abs(this.xVel)
		} else if (keysDown[2] === 1) { //right
			this.xVel = Math.abs(this.xVel)
		}

		if (keysDown[0] || keysDown[2]) {
			other = (new Rectangle (this.x + this.xVel, this.y, this.width, this.height)).checkCollision();
			if (other !== false) if (this.xVel > 0) this.setX(other.x - this.width); else this.setX(other.x + other.width);
			else {
				other = (new Rectangle (this.x + this.xVel, this.y + this.yVel, this.width, this.height)).checkCollision();
				if (other !== false) if (this.xVel > 0) this.setX(other.x - this.width); else this.setX(other.x + other.width);
				else this.setX(this.x + this.xVel);
			}
		}


		if (this.inAir === true) {
			this.setY(this.y + this.yVel);
		}

		if (this.checkCollision()) { //TODO: figure out what to do when this happens :s Currently happens when a block gets inside of you
			console.log('p1 is stuck in a rect at ' + this.checkCollision().x + ", " + this.checkCollision().y);
		}

	}

  touchGround(other) {
    this.setY(other.y - this.height);
    this.yVel = 0;
    this.inAir = false;
    this.gravity = 0;
  }

	render() {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	}
}

class MovingRectangle extends Rectangle {
	constructor(x, y, width, height, vel, distance) {
		super(x, y, width, height, vel);
		this.distance = distance;
		this.rect = new Rectangle(x, y, width, height);
		rectList.push(this.rect);
		this.direction = 1;
		movingRectangleList.push(this);
	}

	act() {
		if (this.x + this.distance < this.rect.x) {
			this.direction = 0;
		} else if (this.x > this.rect.x) {
			this.direction = 1;
		}
		if (this.direction) {
			this.rect.x += 1;
		} else {
			this.rect.x -= 1;
		}
	}

	render() {
		ctx.fillStyle = this.color;
		ctx.drawRect(this.x, this.y, this.width, this.height);

	}
}

class Editor {
	constructor() {
		this.active = false;
	}

	setActive(other, e) {
		this.active = other;
		this.sendElementToTop();
		this.offsetLeft = e.clientX - canvas.offsetLeft - other.x;
		this.offsetTop = e.clientY - canvas.offsetTop - other.y;
		this.side = "";
		if (Math.abs(other.y - (e.clientY - canvas.offsetTop)) < other.height / 4) this.side = this.side.concat("top");
		else if (Math.abs(other.y - (e.clientY - canvas.offsetTop)) > other.height * 3/ 4) this.side = this.side.concat("bottom");
		if (Math.abs(other.x - (e.clientX - canvas.offsetLeft)) < other.width / 4) this.side = this.side.concat("left");
		else if (Math.abs(other.x - (e.clientX - canvas.offsetLeft)) > other.width * 3 / 4) this.side = this.side.concat("right");
		else if (this.side === "") this.side = "middle";
		this.sendElementToTop();
	}

	move(e) { //TODO: come up with more elegant way to resize
		if (keysDown[4]) { //shift clicked
			this.resize(e)
		} else {
			this.active.setX(e.clientX - canvas.offsetLeft - this.offsetLeft);
			this.active.setY(e.clientY - canvas.offsetTop - this.offsetTop);

			//set values for later
			this.prevX = e.clientX;
			this.prevY = e.clientY;
		}

	}

	resize(e) {

		if (this.side.indexOf("left") !== -1) { //anchors right edge, changes width
			var dx = this.prevX - e.clientX;
			this.active.setWidth(this.active.width + dx);
			this.active.setX(e.clientX - canvas.offsetLeft - this.offsetLeft); //TODO: make it not drag when width is at its lowest
		}

		if (editor.side.indexOf("right") !== -1) { //anchors left edge, changes width
			var dx = this.prevX - e.clientX;
			this.active.setWidth(this.active.width - dx);
		}

		if (editor.side.indexOf("top") !== -1) { //anchors bottom edge, changes height
			var dy = this.prevY - e.clientY;
			this.active.setHeight(this.active.height + dy);
			this.active.setY(e.clientY - canvas.offsetTop - this.offsetTop);
		}

		if (editor.side.indexOf("bottom") !== -1) { //anchors top edge, changes height
			var dy = this.prevY - e.clientY;
			this.active.setHeight(this.active.height - dy);
		}

		if (editor.side.indexOf("middle") !== -1) { //do normal click
			this.active.setX(e.clientX - canvas.offsetLeft - this.offsetLeft);
			this.active.setY(e.clientY - canvas.offsetTop - this.offsetTop);
		}

		//set values for later
		this.prevX = e.clientX;
		this.prevY = e.clientY;
	}

	recolor(other) {
		other.color = getRandomColor();
	}

	sendElementToTop() {
		for (var i = 0; i < rectList.length; i++) {
			if (rectList[i] === this.active)
    		rectList.splice(0, 0, rectList.splice(i, 1)[0]);
		}
	}
	snapToGrid() {
		if (this.active.x % gridSize < gridSize / 2) {
			this.active.setX(Math.floor(this.active.x / 16) * 16);
		} else {
			this.active.setX(Math.ceil(this.active.x / 16) * 16);
		}

		if (this.active.y % gridSize < gridSize / 2) {
			this.active.setY(Math.floor(this.active.y / 16) * 16);
		} else {
			this.active.setY(Math.ceil(this.active.y / 16) * 16);
		}

		if (this.active.width % gridSize < gridSize / 2) {
			this.active.setWidth(Math.floor(this.active.width / 16) * 16);
		} else {
			this.active.setWidth(Math.ceil(this.active.width / 16) * 16);
		}

		if (this.active.height % gridSize < gridSize / 2) {
			this.active.setHeight(Math.floor(this.active.height / 16) * 16);
		} else {
			this.active.setHeight(Math.ceil(this.active.height / 16) * 16);
		}
	}
}

var p1 = new Rectangle(20, 20, 40, 40, 3);
var editor = new Editor();

window.onload = function() {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");

	// get save data
	load('default');

	document.addEventListener("keydown", keydown);
	document.addEventListener("keyup", keyup);
	document.addEventListener("click", click);
	document.addEventListener("mousedown", mousedown);
	document.addEventListener("mousemove", mousemove);
	document.addEventListener("mouseup", mouseup);
	document.addEventListener("dblclick", dblclick);

	setInterval(main, 1/60 * 1000);
}

function main() {
	//update
	p1.move();

	//render
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//drawBG();
	//drawGrid();
	for (var i = rectList.length - 1; i >= 0; i--) {
		rectList[i].render();
	}

	drawPlayer();
	drawMenu();

}

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++)
		color += letters[Math.floor(Math.random() * 16)];
	return color;
}

function drawGrid() {
    for (x = 0; x <= canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
			}
    for (y = 0; y <= canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }

    ctx.stroke();

};

function drawPlayer() {
	if (p1.dir === 0) {
		ctx.drawImage(document.getElementById("cowL"), p1.x, p1.y, p1.width, p1.height);
  }
	else if (p1.dir === 1 || p1.dir === undefined) {
		ctx.drawImage(document.getElementById("cowR"), p1.x, p1.y, p1.width, p1.height);
  }
}

function drawMenu() {
	if (menuList.length === 0) {
		menuList.push(new Rectangle(canvas.width - 220, 20, 200, 50));
		menuList.push(new Rectangle(canvas.width - 220, 90, 200, 50));
	}


	for (var i = 0; i < menuList.length; i++) {
		ctx.fillStyle = menuList[i].color;
		ctx.fillRect(menuList[i].x, menuList[i].y, menuList[i].width, menuList[i].height);

	}
	ctx.fillStyle = "#FFF"
	ctx.font = "30px Arial";
	ctx.fillText("Save", menuList[0].x + 60, menuList[0].y + 35);
	ctx.fillText("Load", menuList[1].x + 60, menuList[1].y + 35);
	ctx.fillStyle = "#000"
	ctx.strokeText("Save", menuList[0].x + 60, menuList[0].y + 35);
	ctx.strokeText("Load", menuList[1].x + 60, menuList[1].y + 35);

}

function keydown(e) {
	//move character
	if (e.keyCode === 37 || e.keyCode === 65) { keysDown[0] = 1; p1.dir = 0; } //left or a
	if (e.keyCode === 38 || e.keyCode === 87) keysDown[1] = 1; //up or w
	if (e.keyCode === 39 || e.keyCode === 68) { keysDown[2] = 1; p1.dir = 1; } //right or d
	if (e.keyCode === 40 || e.keyCode === 83) keysDown[3] = 1; //down or s
	if (e.keyCode === 16) keysDown[4] = 1; //shift
	//temp for changing speed
	if (e.keyCode === 187) p1.xVel += 1;
	if (e.keyCode === 189 && p1.xVel > 1) p1.xVel -= 1;
}

function keyup(e) {
	//move character
	if (e.keyCode === 37 || e.keyCode === 65) keysDown[0] = 0;
	if (e.keyCode === 38 || e.keyCode === 87) keysDown[1] = 0;
	if (e.keyCode === 39 || e.keyCode === 68) keysDown[2] = 0;
	if (e.keyCode === 40 || e.keyCode === 83) keysDown[3] = 0;
	if (e.keyCode === 16) keysDown[4] = 0; //shift
	//temp for changing speed
	if (e.keyCode === 187) p1.speed += 1;
	if (e.keyCode === 189 && p1.speed > 1) p1.speed -= 1;

}

function click(e) {
}

function mousedown(e) {
	var other = new Rectangle(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, 0, 0).checkCollision();
	if (other !== false) {
		editor.setActive(other, e);
	} else {
		other = new Rectangle(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, 0, 0).checkCollision(menuList[0]);
		if (other !== false) save(prompt("Enter name for save: "));
		other = new Rectangle(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, 0, 0).checkCollision(menuList[1]);
		if (other !== false) load(prompt("Enter name for load: "));
	}

}

function mousemove(e) {
	if (editor.active !== false) { //currently dragging something
		editor.move(e);
	}
}

function mouseup(e) {
	editor.snapToGrid();
	if (editor.active !== false) {
		editor.active = false;
	}
}

function dblclick(e) {
	var other = new Rectangle(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop, 0, 0).checkCollision();
	if (other !== false) {
		editor.recolor(other);
	} else {
		rectList.push(new Rectangle(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop));
	}
}

function save(saveKey) {
	state.rectList = rectList;
	localStorage.setItem(saveKey, JSON.stringify(state));
}

function load(saveKey) {
	state = JSON.parse(localStorage.getItem(saveKey));

	if (state === null) {
		rectList = [];
		drawGridofRects();
		state = {};
		state.rectList = rectList;
	} else {
		rectList = [];
		for (var i = 0; i < state.rectList.length; i++) {
			rectList.push(new Rectangle(state.rectList[i].x, state.rectList[i].y, state.rectList[i].width, state.rectList[i].height));
		}
	}
}

window.onunload = function() {
	save('default');
}
