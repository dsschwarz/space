var gamejs = require('gamejs');
var $v = require('gamejs/utils/vectors');
var $e = require('gamejs/event');
var globals = require('globals');
var base = require('base')

var Planet = function(rect) {
   Planet.superConstructor.apply(this, arguments);
   this.rect = new gamejs.Rect(rect);
   this._x = Math.random() * globals.width;
   this._y = Math.random() * globals.height;
   this.xspeed = 0;
   this.yspeed = 0;

   this.originalImage = gamejs.image.load("images/wiki.png");
   this.image = this.originalImage; 
   var pos = globals.get_position([this._x, this._y], [.5, .5], this.image.getSize(), 0);
   this.rect = new gamejs.Rect(pos, this.image.getSize());
   return this;
}
gamejs.utils.objects.extend(Planet, base.BaseSprite);
Planet.prototype.update = function(msDuration) {
   var pos = globals.get_position([this._x, this._y], [.5, .5], this.image.getSize(), 0);
   this.rect = new gamejs.Rect(pos, this.image.getSize());
   this.radius = Math.min((this.image.rect.width * this.center[0]), (this.image.rect.height * this.center[1]));

}

exports.Planet = Planet;