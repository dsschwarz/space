var gamejs = require('gamejs');
var $p = require('projectile');
var globals = require('globals');
var $v = require('gamejs/utils/vectors');
var $m = require('gamejs/utils/math');

var Rocket = function(rect) {
	Rocket.superConstructor.apply(this, arguments);
	this.rect = new gamejs.Rect(rect);
	this.originalImage = gamejs.transform.scale(this.originalImage, [30,8]);
	this.image = gamejs.transform.rotate(this.originalImage, this.rotation);
	this.damage = 50;
	this.angular_v = 100;
	this.acceleration = 100;
	this.speed = 100;
	this.timer = 15;
	this.destination = [0, 0];
	this.tracking = false;
	this.rotate = function(_s) {
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
};
gamejs.utils.objects.extend(Rocket, $p.Projectile);
Rocket.prototype.update = function(msDuration) {
	var _s = msDuration/1000;
	this.rotate(_s);
	this._x += this.speed * Math.cos($m.radians(this.rotation))* _s;
	this._y += this.speed * Math.sin($m.radians(this.rotation))* _s;
	
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