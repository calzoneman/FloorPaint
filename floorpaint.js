// [GLOBALS]
var canvas, ctx;
var game;
var time = {
    genNoise     : 0,
    impossible   : 0,
    stackpush    : 0,
    stackpop     : 0
};

// [CONSTANTS]
const SIZE = 16;
const TILE_EMPTY = 0;
const TILE_PAINTED = 1;
const TILE_WALL = 2;

// [CONTROL]
function init() {
    canvas = document.getElementById('game');
    ctx = canvas.getContext('2d');
    var keyHandler = function(ev) { game.keypress(ev) };
    if(window.document.addEventListener) {
        window.document.addEventListener("keydown", keyHandler, false);
    }
    else {
        window.document.attachEvent("onkeydown", keyHandler);
    }
    game = new Game();
    newlevel();
    setInterval(function() { game.render() }, 1000 / 60);
}

function newlevel() {
    game.level.generate();
    game.posx = game.level.startx;
    game.posy = game.level.starty;
    game.level.visit(game.posx, game.posy);
    document.getElementById('win').innerHTML = "";
}

function resetlevel() {
    game.level.reset();
    game.posx = game.level.startx;
    game.posy = game.level.starty;
    game.level.visit(0, 0);
    document.getElementById('win').innerHTML = "";
}

// [UTIL]
var StringStack = function() {
    this.str = "";
};

StringStack.prototype.push = function(primitive) {
    var s = new Date().getTime();
    this.str += "," + primitive;
    time["stackpush"] += new Date().getTime() - s;
};

StringStack.prototype.pop = function() {
    var s = new Date().getTime();
    var idx = this.str.lastIndexOf(",");
    if(idx == -1) {
        return null;
    }
    var result = this.str.slice(idx+1, this.str.length);
    this.str = this.str.slice(0, idx);
    time["stackpop"] += new Date().getTime() - s;
    return result;
};

// [LEVEL]

/* Level constructor */
var Level = function(width, height) {
    this.width = width;
    this.height = height;
    this.map = [];
    this.startx = 0;
    this.starty = 0;
};

/* Level generation routine */
Level.prototype.generate = function() {
    var s = new Date().getTime();
    var noiseAmt = 5;
    this.genNoise(noiseAmt);
    //this.genRectangles(3, 2, 2, 5, 5);
    var tries = 0;
    while(this.impossible()) {
        if(tries % 1000 == 0) {
            //alert(JSON.stringify(time));
        }
        tries++;
        //this.genRectangles(3, 2, 2, 5, 5);
        this.genNoise(noiseAmt);
    }
    alert("Level generation took " + tries + " tries, " + (new Date().getTime() - s) + "ms");
    alert(JSON.stringify(time));
};

// [LEVEL GENERATION]

Level.prototype.genNoise = function(amt) {
    var s = new Date().getTime();
    for(var i = 0; i < this.width * this.height; i++) {
        this.map[i] = TILE_EMPTY;
    }

    for(var i = 0; i < amt; i++) {
        var x = Math.floor(Math.random() * this.width);
        var y = Math.floor(Math.random() * this.height);
        if(this.map[y * this.width + x] == TILE_WALL) {
            i--;
        }
        else {
            this.map[y * this.width + x] = TILE_WALL;
        }
    }

    // Find the spawnpoint
    this.startx = 0;
    this.starty = 0;
    while(this.map[this.starty * this.width + this.startx] != TILE_EMPTY) {
        this.startx++;
        if(this.startx >= this.width) {
            this.startx = 0;
            this.starty++;
        }
    }
    time["genNoise"] += new Date().getTime() - s;
};

Level.prototype.genRectangles = function(n, minw, minh, maxw, maxh) {
    var s = new Date().getTime();
    this.startx = 0;
    this.starty = 0;
    for(var i = 0; i < this.width * this.height; i++) {
        this.map[i] = TILE_EMPTY;
    }


    for(var i = 0; i < n; i++) {
        var x = Math.floor(Math.random() * (this.width / 10 - 10) + 10);
        var y = Math.floor(Math.random() * (this.height / 10 - 10) + 10);
        var width = Math.random() * (maxw-minw) + minw;
        var height = Math.random() * (maxh-minh) + minh;
        for(var xx = 0; xx < width; xx++) {
            if(x + xx >= this.width) {
                break;
            }
            for(var yy = 0; yy < height; yy++) {
                if(y + yy >= this.height) {
                    continue;
                }
                this.map[(y+yy) * this.width + (x+xx)] = TILE_WALL;
            }
        }
    }

    while(this.map[this.starty * this.width + this.startx] == TILE_WALL) {
        this.startx++;
        if(this.startx >= this.width) {
            this.startx = 0;
            this.starty++;
        }
    }

    time["genRectangles"] += new Date().getTime() - s;
};

function stringifywrap(obj) {
    var s = new Date().getTime();
    var str = JSON.stringify(obj);
    time["stringify"] += new Date().getTime() - s;
    return str;
}

/* Check if the level is solvable */
Level.prototype.impossible = function() {
    var s = new Date().getTime();
    var stack = new StringStack();
    var bad = {};
    var lvl = this.clone();
    var x = lvl.startx;
    var y = lvl.starty;
    stack.push(x)
    stack.push(y);
    lvl.visit(x, y);
    while(!lvl.checkWin() && stack.str.length > 0) {
        var rand = Math.floor(Math.random() * 4);
        if(bad[stack.str] !== undefined) {
            lvl.map[y * lvl.width + x] = TILE_EMPTY;
            y = stack.pop();
            x = stack.pop();
        }
        if(lvl.validMove(x+1, y)) {
            x++;
            lvl.visit(x, y);
            stack.push(x);
            stack.push(y);
        }
        else if(lvl.validMove(x-1, y)) {
            x--;
            lvl.visit(x, y);
            stack.push(x);
            stack.push(y);
        }
        else if(lvl.validMove(x, y+1)) {
            y++;
            lvl.visit(x, y);
            stack.push(x);
            stack.push(y);
        }
        else if(lvl.validMove(x, y-1)) {
            y--;
            lvl.visit(x, y);
            stack.push(x);
            stack.push(y);
        }
        else if(!lvl.checkWin()) {
            bad[stack.str] = true;
            lvl.map[y * lvl.width + x] = TILE_EMPTY;
            y = stack.pop();
            x = stack.pop();
        }

    }

    time["impossible"] += new Date().getTime() - s;
    return !lvl.checkWin();
};

/* Determine if a square is valid */
Level.prototype.validMove = function(x, y) {
    if(x < 0 || x >= this.width || y < 0 || y >= this.height) {
        return false;
    }
    if(this.map[y * this.width + x] != TILE_EMPTY) {
        return false;
    }
    return true;
};

/* Visit a square */
Level.prototype.visit = function(x, y) {
    if(x < 0 || x >= this.width || y < 0 || y >= this.height) {
        return;
    }
    this.map[y * this.width + x] = TILE_PAINTED;
};

/* Check if the game has been won */
Level.prototype.checkWin = function() {
    for(var i = 0; i < this.width * this.height; i++) {
        if(this.map[i] == TILE_EMPTY) {
            return false;
        }
    }
    return true;
};

/* Reset the map */
Level.prototype.reset = function() {
    for(var i = 0; i < this.width * this.height; i++) {
        if(this.map[i] == TILE_PAINTED) {
            this.map[i] = TILE_EMPTY;
        }
    }
};

/* Clone the map */
Level.prototype.clone = function() {
    var lvl = new Level(this.width, this.height);

    for(var i = 0; i < this.width * this.height; i++) {
        lvl.map[i] = this.map[i];
    }
    return lvl;
};

// [GAME]

/* Game constructor */
var Game = function() {
    this.level = new Level(8, 8);
};

/* Game rendering routine */
Game.prototype.render = function() {
    for(var i = 0; i < this.level.width; i++) {
        for(var j = 0; j < this.level.height; j++) {
            var t = this.level.map[j * this.level.width + i];
            var color;
            switch(t) {
                case TILE_EMPTY:
                    color = "#0000FF";
                    break;
                case TILE_PAINTED:
                    color = "#007700";
                    break;
                default:
                    color = "#000000";
            }
            if(i == this.posx && j == this.posy) {
                color = "#FF0000";
            }
            ctx.fillStyle = color;
            ctx.fillRect(i * (SIZE + 1) + 1, j * (SIZE + 1) + 1, SIZE, SIZE);
        }
    }
};

/* Some key constants */
const K_LEFT = 37;
const K_UP = 38;
const K_RIGHT = 39;
const K_DOWN = 40;

/* Game input handling */
Game.prototype.keypress = function(ev) {
    var key = ev.keyCode;
    switch(key) {
        case K_LEFT:
            if(this.level.validMove(this.posx-1, this.posy)) {
                this.posx--;
            }
            break;
        case K_RIGHT:
            if(this.level.validMove(this.posx+1, this.posy)) {
                this.posx++;
            }
            break;
        case K_UP:
            if(this.level.validMove(this.posx, this.posy-1)) {
                this.posy--;
            }
            break;
        case K_DOWN:
            if(this.level.validMove(this.posx, this.posy+1)) {
                this.posy++;
            }
            break;
        default:
            break;
    }
    this.level.visit(this.posx, this.posy);
    if(this.level.checkWin()) {
        document.getElementById('win').innerHTML = "You Win!";
    }
};
