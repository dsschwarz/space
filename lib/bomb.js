

var Bomb = function(rect) {
   Bomb.superConstructor.apply(this, arguments);
   this.ptype = 'bomb';
   this.rect = new gamejs.Rect(rect);
   this.damage = 30;
   this.timer = 15;
   this.number = -1; //Number of ship/player
}
gamejs.utils.objects.extend(Bomb, $p.Projectile);
Bomb.prototype.update = function(msDuration) {
	var _s = msDuration/1000;
	this._x += this.xspeed * _s;
	this._y += this.yspeed * _s;
	this.rect.center = [this._x, this._y];
	var collision_planets = gamejs.sprite.spriteCollide(this, globals.planets, false)
	var collision_asteroids = (gamejs.sprite.spriteCollide(this, globals.asteroids, false));
	if (collision_planets.length > 0)  {
		this.explode();
		var that = this;
		collision_planets.forEach(function(obj) {
			globals.flags.planets = true;
			obj.health -= that.damage;
			if (obj.health <= 0) {
				obj.kill();
			}
		});
	}
	if (collision_asteroids.length > 0)  {
		this.explode();
		var that = this;
		collision_asteroids.forEach(function(obj) {
			globals.flags.asteroids = true;
			obj.health -= that.damage;
			if (obj.health <= 0) {
				obj.kill();
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
	globals.flags.projectiles = true;
}


exports.Bomb = Bomb;