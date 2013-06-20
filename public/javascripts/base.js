
var gamejs = require('gamejs');
var globals = require('globals');

var BaseSprite = function (rect) {
	BaseSprite.superConstructor.apply(this, arguments);
	this.center = [0,0]
	this._x = 100;
	this._y = 100;

	// Physics Properties 
	this.accleration = 0; // How fast object accelerates (constant)
	this.deceleration = 0; // Percentage object slows per second
	this.xspeed = 0;
	this.yspeed = 0;
	this.accelerating = false;

	this.angular_v = 100; // Angular velocity (how fast it's rotating; deg/s)
	// rotation is clockwise from positive x-axis (gamejs thing)
	this.rotation = 0;
	// 1 if rotating right, -1 if left, else 0.
	this.rotating = 0;

	this.damage = 10;
   this.health_max = 100;
   this.health = this.health_max;

	this.center = [.5, .5];
	this.originalImage = new gamejs.Surface([0, 0]);
	this.radius = Math.min((this.originalImage.width * this.center[0]), (this.originalImage.height * this.center[1]));
	this.getSize = function() {
		return this.originalImage.getSize();
	}
	this.draw = function(surface) {
		gamejs.draw.rect(surface, '#22cc22', new gamejs.Rect([this.rect.left, this.rect.top], [this.health / this.health_max * this.originalImage.getSize()[0], 2]), 0);

		surface.blit(this.image, this.rect);
		return
	}
	this.rotate = function(_s) {
		this.rotation += this.angular_v * this.rotating * _s;
		if (this.rotation > 360) {
		  this.rotation = this.rotation%360;
		}
		while (this.rotation < 0) {
		  this.rotation += 360;
		}
	}
	return this;
}


// inherit (actually: set prototype)
gamejs.utils.objects.extend(BaseSprite, gamejs.sprite.Sprite);


exports.BaseSprite = BaseSprite;