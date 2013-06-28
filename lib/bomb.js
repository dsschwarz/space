

var Bomb = function(rect) {
   Bomb.superConstructor.apply(this, arguments);
   this.ptype = 'bomb';
   this.rect = new gamejs.Rect(rect);
   this.damage = 30;
   this.timer = 15;
}
gamejs.utils.objects.extend(Bomb, $p.Projectile);
Bomb.prototype.update = function(msDuration) {
	var _s = msDuration/1000;
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