var gamejs = require('gamejs');
var $p = require('projectile');
var globals = require('globals');

var Bomb = function(rect) {
   Bomb.superConstructor.apply(this, arguments);
   this.rect = new gamejs.Rect(rect);
   this.originalImage = gamejs.image.load('images/wiki.png');
   this.image = gamejs.transform.scale(this.originalImage, [5,5]);
   this.damage = 30;
   this.timer = 5;
}
gamejs.utils.objects.extend(Bomb, $p.Projectile);
Bomb.prototype.update = function(msDuration) {
	var _s = msDuration/1000;
	this._x += this.xspeed * _s;
	this._y += this.yspeed * _s;
	var collision_planets = gamejs.sprite.spriteCollide(this, globals.planets, true);
	var collision_ships = gamejs.sprite.spriteCollide(this, globals.ships, true, gamejs.sprite.CollideCircle);
	if (collision_planets.length > 0) {
		this.explode();
	}
	var pos = globals.get_position([this._x, this._y], [.5, .5], this.image.getSize(), 0);
	this.rect.left = pos[0];
	this.rect.top = pos[1];
	if (this.timer < 0) {
		this.explode();
	} else {
		this.timer -= _s;
	}
}
Bomb.prototype.explode = function() {
	this.kill();
}


exports.Bomb = Bomb;