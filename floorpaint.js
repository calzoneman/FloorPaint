var canvas, ctx;
var game;
const SIZE = 16;

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
    var noiseAmt = 5;
    this.genNoise(noiseAmt);
    var tries = 0;
    while(this.impossible()) {
        if(tries % 1000 == 0) {
            alert("Tries: " + tries);
        }
        tries++;
        this.genNoise(noiseAmt);
    }
    //alert("Possible: " + !this.impossible());
};

/* Random Level Generation */
Level.prototype.genNoise = function(amt) {
    for(var i = 0; i < this.width * this.height; i++) {
        this.map[i] = 0;
    }

    for(var i = 0; i < amt; i++) {
        var x = Math.floor(Math.random() * this.width);
        var y = Math.floor(Math.random() * this.height);
        if(this.map[y * this.width + x] == 2) {
            i--;
        }
        else {
            this.map[y * this.width + x] = 2;
            console.log("Placed at " + x + ", " + y);
        }
    }
};

/* Check if the level is solvable */
Level.prototype.impossible = function() {
    var pathEqual = function(p, q) {
        if(p.length != q.length) {
            return false;
        }
        for(var i = 0; i < p.length; i++) {
            if(p[i][0] != q[i][0] || p[i][1] != q[i][1]) {
                return false;
            }
        }
        return true;
    };

    var clonePath = function(p) {
        var tmp = [];
        for(var i = 0; i < p.length; i++) {
            tmp.push([p[i][0], p[i][1]]);
        }
        return tmp;
    };

    var pathExists = function(q, path, func) {
        for(var i = 0; i < q.length; i++) {
            if(func(q[i], path)) {
                return true;
            }
        }
        return false;
    };

    var stack = [];
    var bad = [];
    var lvl = this;//.clone();
    var x = 0;
    var y = 0;
    stack.push([x, y]);
    lvl.visit(x, y);
    while(!lvl.checkWin() && stack.length > 0) {
        var rand = Math.floor(Math.random() * 4);
        if(pathExists(bad, stack, pathEqual)) {
            var tmp = stack.pop();
            lvl.map[y * lvl.width + x] = 0;
            x = tmp[0];
            y = tmp[1];
        }
        if(lvl.validMove(x+1, y)) {
            x++;
            lvl.visit(x, y);
            stack.push([x, y]);
        }
        else iflvl.validMove(x-1, y)) {
            x--;
            lvl.visit(x, y);
            stack.push([x, y]);
        }
        else if(lvl.validMove(x, y+1)) {
            y++;
            lvl.visit(x, y);
            stack.push([x, y]);
        }
        else if(lvl.validMove(x, y-1)) {
            y--;
            lvl.visit(x, y);
            stack.push([x, y]);
        }
        else if(!lvl.checkWin()) {
            bad.push(clonePath(stack));
            //for(var i = 0; i < Math.random() * stack.length; i++) {
                lvl.map[y * lvl.width + x] = 0;
                var tmp = stack.pop();
                x = tmp[0];
                y = tmp[1];
            //}
        }

    }

    return !lvl.checkWin();
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
