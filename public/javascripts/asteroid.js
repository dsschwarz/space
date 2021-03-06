var gamejs = require('gamejs');
var $v = require('gamejs/utils/vectors');
var $e = require('gamejs/event');
var globals = require('globals');
var base = require('base')

var Asteroid = function(rect) {
   Asteroid.superConstructor.apply(this, arguments);
   this.rect = new gamejs.Rect(rect);
   this._x = rect[0];
   this._y = rect[1];
   var speed = Math.random() * 50 + 50;
   var dir = Math.random() * 2 * Math.PI;
   this.xspeed = speed * Math.cos(dir);
   this.yspeed = speed * Math.sin(dir);

   this.health_max = 60;
   this.health = this.health_max;
   this.angular_v = Math.random() * 4 - 2;
   this.rotating = 1;
   this.originalImage = gamejs.image.load("images/asteroid.png");
   this.image = this.originalImage;
   var pos = globals.get_position([this._x, this._y], [.5, .5], this.image.getSize(), 0);
   this.rect = new gamejs.Rect(pos);
   return this;
};

gamejs.utils.objects.extend(Asteroid, base.BaseSprite);
Asteroid.prototype.update = function(msDuration) {
   this._x += this.xspeed * (msDuration/1000);
   this._y += this.yspeed * (msDuration/1000);
   this.rotate((msDuration/1000));
   this.image = gamejs.transform.rotate(this.originalImage, this.rotation);
   var pos = globals.get_position([this._x, this._y], [.5, .5], this.image.getSize(), 0);
   this.rect = new gamejs.Rect(pos, this.image.getSize());
}

exports.Asteroid = Asteroid;