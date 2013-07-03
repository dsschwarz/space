var ROCKET_SIZE = [10, 5];
var ROCKET_RADIUS = 10;
var Rocket = function(rect) {
   Rocket.superConstructor.apply(this, arguments);
   this.ptype = 'rocket';
   this.rect = new gamejs.Rect(rect);
   this.damage = 50;
   this.angular_v = 100;
   this.acceleration = 100;
   this.speed = 100;
   this.timer = 15;
   this.destination = [0, 0]
   this.tracking = false;
   this.follow_mouse = false;
   this.number = -1;
   this.ship= {};
   this.rotate = function(_s) {
	if(this.follow_mouse) {
		this.destination = this.ship.mouse_pos;
	};
	if(this.tracking) {
		var dif = $v.subtract(this.destination, [this._x, this._y]);
		var angle = $m.normaliseDegrees($m.degrees(Math.atan2(dif[1], dif[0])));
		var angle_diff = $m.normaliseDegrees(angle - this.rotation);
		this.rotating = 0;
		if(angle_diff > 180) {
			if ($m.normaliseDegrees(this.rotation - this.angular_v *_s - angle) > 180 ) {
				this.rotation = angle;
			} else {
				this.rotating = -1;
			}
		} else if(angle_diff < 180) {
			if ($m.normaliseDegrees(this.rotation + this.angular_v *_s - angle) < 180) {
				this.rotation = angle;
			} else {
				this.rotating = 1;
			}
		};
		this.rotation += $m.normaliseDegrees(this.angular_v * this.rotating * _s);
		if (this.rotating == 0) {
			this.speed += this.acceleration * _s;
		};
	  };
	};
}
gamejs.utils.objects.extend(Rocket, $p.Projectile);
Rocket.prototype.update = function(msDuration) {
	var _s = msDuration/1000;
	this.rotate(_s);
	this._x += this.speed * Math.cos($m.radians(this.rotation))* _s;
	this._y += this.speed * Math.sin($m.radians(this.rotation))* _s;
	if ($v.distance([this._x, this._y], this.destination) < ROCKET_RADIUS) {
		this.explode();
	}
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
	this.rect.center = [this._x, this._y];
	if (this.timer < 0) {
		this.explode();
	} else {
		this.timer -= _s;
	}
}
Rocket.prototype.explode = function() {
	this.kill();
	globals.flags.projectiles = true;
}


exports.Rocket = Rocket;