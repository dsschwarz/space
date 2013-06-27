
var Rocket = function(rect) {
   Rocket.superConstructor.apply(this, arguments);
   this.rect = new gamejs.Rect(rect);
   this.damage = 50;
   this.acceleration = 100;
   this.max_v = 100;
   this.angular_v = 100;
   this.timer = 15;
   this.destination = [0, 0]
   this.tracking = false;
   this.follow_mouse = false;
   this.rotate = function(_s) {
	if(this.follow_mouse) {
		this.destination = globals.mouse_pos;
	};
	if(this.tracking) {
		var dif = $v.subtract(this.destination, [this._x, this._y]);
		var angle = $m.normaliseDegrees($m.degrees(Math.atan2(dif[1], dif[0])));
		var angle_diff = $m.normaliseDegrees(angle - this.rotation);
		this.rotating = 0;
		if(angle_diff > 180) {
			console.log("Going right")
			if ($m.normaliseDegrees(this.rotation - this.angular_v *_s - angle) > 180 ) {
				this.rotation = angle;
				console.log("Locking on")
			} else {
				this.rotating = -1;
			}
		} else if(angle_diff < 180) {
			console.log("Going left")
			if ($m.normaliseDegrees(this.rotation + this.angular_v *_s - angle) < 180) {
				console.log("Locking on")
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
	var pos = globals.get_position([this._x, this._y], [.25, .5], ROCKET_SIZE, this.rotation);
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