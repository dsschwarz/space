

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
	var collision_objs = gamejs.sprite.spriteCollide(this, globals.planets, false).concat(gamejs.sprite.spriteCollide(this, globals.asteroids, false));
	if (collision_objs.length > 0)  {
		this.explode();
		var that = this;
		collision_objs.forEach(function(obj) {
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
}


exports.Bomb = Bomb;