var PLANET_SIZE = [30, 30]

var Planet = function(rect) {
   Planet.superConstructor.apply(this, arguments);
   this.rect = new gamejs.Rect(rect);
   this._x = Math.random() * globals.width;
   this._y = Math.random() * globals.height;
   this.xspeed = 0;
   this.yspeed = 0;

   this.damage = 40;
   this.radius = Math.random()*10 + 10;
   var pos = globals.get_position([this._x, this._y], [.5, .5], PLANET_SIZE);
   this.rect = new gamejs.Rect(pos, PLANET_SIZE);
   return this;
}
gamejs.utils.objects.extend(Planet, base.BaseSprite);
Planet.prototype.update = function(msDuration) {
}

exports.Planet = Planet;