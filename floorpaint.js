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

/* Game constructor */
var Game = function() {
    this.level = new Level(16, 16);
    this.posx = 0;
    this.posy = 0;
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
