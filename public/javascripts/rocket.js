var gamejs = require('gamejs');
var $p = require('projectile');
var globals = require('globals');

var Rocket = function(rect) {
   Rocket.superConstructor.apply(this, arguments);
   this.rect = new gamejs.Rect(rect);
   this.originalImage = gamejs.transform.scale(this.originalImage, [30,8]);
   this.image = gamejs.transform.rotate(this.originalImage, this.rotation);
   this.damage = 50;
   this.acceleration = 400;
   this.timer = 15;
}
gamejs.utils.objects.extend(Rocket, $p.Projectile);
Rocket.prototype.update = function(msDuration) {
	var _s = msDuration/1000;
	this.xspeed += Math.cos(this.rotation/180*Math.PI)*this.acceleration*_s;
	this.yspeed += Math.sin(this.rotation/180*Math.PI)*this.acceleration*_s;
	this._x += this.xspeed * _s;
	this._y += this.yspeed * _s;
	var collision_planets = gamejs.sprite.spriteCollide(this, globals.planets, false);
	var collision_ships = gamejs.sprite.spriteCollide(this, globals.ships, false, gamejs.sprite.CollideCircle);
	if (collision_planets.length > 0)  {
		this.explode();
		var that = this;
		collision_planets.forEach(function(planet) {
			planet.health -= that.damage;
			if (planet.health <= 0) {
				planet.kill();
			}
		});
	}
	this.image = gamejs.transform.rotate(this.originalImage, this.rotation);
	var pos = globals.get_position([this._x, this._y], [.25, .5], this.originalImage.getSize(), this.rotation);
	this.rect.left = pos[0];
	this.rect.top = pos[1];
	if (this.timer < 0) {
		this.explode();
	} else {
		this.timer -= _s;
	}
}
Rocket.prototype.explode = function() {
	this.kill();
}


exports.Rocket = Rocket;