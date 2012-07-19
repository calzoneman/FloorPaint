var canvas, ctx;
var game;

/* Called when the page loads */
function init() {
    canvas = document.getElementById('game');
    ctx = canvas.getContext('2d');
    game = new Game();
    setInterval(function() { game.render() }, 1000 / 60);
}

/* Level constructor */
var Level = function(width, height) {
    this.width = width;
    this.height = height;
    this.map = [];
    this.generate();
};

/* Level generation routine */
Level.prototype.generate = function() {
    for(var i = 0; i < this.width; i++) {
        for(var j = 0; j < this.height; j++) {
            // Placeholder
            this.map[j * this.width + i] = 0;
        }
    }
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

/* Game constructor */
var Game = function() {
    this.level = new Level(16, 16);
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
Game.prototype.keypress = function() {
    var key = event.keyCode;
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
};
document.onkeydown = function() { game.keypress() };
