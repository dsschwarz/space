var gamejs = require('gamejs');
var $v = require('gamejs/utils/vectors');
var $e = require('gamejs/event');
var globals = require('globals');
var base = require('base')

var Asteroid = function(rect) {
   Asteroid.superConstructor.apply(this, arguments);
   this.rect = new gamejs.Rect(rect);
   this._x = Math.random() * globals.width;
   this._y = Math.random() * globals.height;
   this.xspeed = Math.random() * 20 - 10;
   this.yspeed = Math.random() * 20 - 10;

   this.health_max = 60;
   this.health = this.health_max;
   this.angular_v = Math.random() * 4 - 2;
   this.originalImage = gamejs.image.load("images/asteroid.png");
   this.image = this.originalImage;
   var pos = globals.get_position([this._x, this._y], [.5, .5], this.image.getSize(), 0);
   this.rect = new gamejs.Rect(pos, this.image.getSize());
   return this;
}
gamejs.utils.objects.extend(Asteroid, base.BaseSprite);
Asteroid.prototype.update = function(msDuration) {
   this.move((msDuration/1000));
   this.rotate((msDuration/1000));
   this.image = gamejs.transform.rotate(this.originalImage, this.rotation);
   var pos = globals.get_position([this._x, this._y], [.5, .5], this.image.getSize(), 0);
   this.rect = new gamejs.Rect(pos, this.image.getSize());
   this.radius = Math.min((this.image.rect.width * this.center[0]), (this.image.rect.height * this.center[1]));
}

exports.Asteroid = Asteroid;