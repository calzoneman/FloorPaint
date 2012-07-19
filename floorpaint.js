var canvas, ctx;
var game;

/* Called when the page loads */
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
    game.posx = 0;
    game.posy = 0;
    game.level.visit(0, 0);
    document.getElementById('win').innerHTML = "";
}

function resetlevel() {
    game.level.reset();
    game.posx = 0;
    game.posy = 0;
    game.level.visit(0, 0);
    document.getElementById('win').innerHTML = "";
}

/* Level constructor */
var Level = function(width, height) {
    this.width = width;
    this.height = height;
    this.map = [];
};

/* Level generation routine */
Level.prototype.generate = function() {
    this.genNoise();
    while(this.impossible()) {
        this.genNoise();
    }
};

/* Random Level Generation */
Level.prototype.genNoise = function() {
    var blockfreq = Math.random() * 0.33;
    for(var i = 0; i < this.width; i++) {
        for(var j = 0; j < this.height; j++) {
            var t = 0;
            if(Math.random() < blockfreq) {
                t = 2;
            }
            this.map[j * this.width + i] = t;
        }
    }
};


Level.prototype.impossible = function() {
    var trapped = function(level, x, y) {
        var x1 = x-1;
        var x2 = x+1;
        var y1 = y-1;
        var y2 = y+1;

        var count = 0;
        if(x1 < 0 || !level.validMove(x1, y)) count++;
        if(x2 >= level.width || !level.validMove(x2, y)) count++;
        if(y1 < 0 || !level.validMove(x, y1)) count++;
        if(y2 >= level.height || !level.validMove(x, y2)) count++;

        return count > 2;
    };

    for(var i = 0; i < this.width; i++) {
        for(var j = 0; j < this.width; j++) {
            if(trapped(this, i, j)) {
                return true;
            }
        }
    }
    return false;
};

/* Determine if a square is valid */
Level.prototype.validMove = function(x, y) {
    if(x < 0 || x >= this.width || y < 0 || y >= this.height) {
        return false;
    }
    if(this.map[y * this.width + x] != 0) {
        return false;
    }
    return true;
};

/* Visit a square */
Level.prototype.visit = function(x, y) {
    if(x < 0 || x >= this.width || y < 0 || y >= this.height) {
        return;
    }
    this.map[y * this.width + x] = 1;
};

/* Check if the game has been won */
Level.prototype.checkWin = function() {
    for(var i = 0; i < this.width * this.height; i++) {
        if(this.map[i] == 0) {
            return false;
        }
    }
    return true;
};

/* Reset the map */
Level.prototype.reset = function() {
    for(var i = 0; i < this.width * this.height; i++) {
        if(this.map[i] == 1) {
            this.map[i] = 0;
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

/* Game constructor */
var Game = function() {
    this.level = new Level(8, 8);
    this.posx = 0;
    this.posy = 0;
    this.level.visit(0, 0);
};

/* Game rendering routine */
Game.prototype.render = function() {
    for(var i = 0; i < this.level.width; i++) {
        for(var j = 0; j < this.level.height; j++) {
            var t = this.level.map[j * this.level.width + i];
            var color;
            switch(t) {
                case 0:
                    color = "#0000FF";
                    break;
                case 1:
                    color = "#007700";
                    break;
                default:
                    color = "#000000";
            }
            if(i == this.posx && j == this.posy) {
                color = "#FF0000";
            }
            ctx.fillStyle = color;
            ctx.fillRect(i * 16, j * 16, 16, 16);
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
