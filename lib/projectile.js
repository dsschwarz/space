

/**
 * Projectile is the base class for all weapons.
 * 
 */
var Projectile = function(rect) {
   Projectile.superConstructor.apply(this, arguments);
   this.rect = new gamejs.Rect(rect);
   this._x = rect.left || rect[0];
   this._y = rect.top || rect[1];
   this.xspeed = 0;
   this.yspeed = 0;

   this.rect = new gamejs.Rect([this._x, this._y]);
   
   return this;
}
gamejs.utils.objects.extend(Projectile, base.BaseSprite);
Projectile.prototype.update = function(msDuration) {
	var _s = msDuration/1000;
   this._x += this.xspeed * _s;
	this._y += this.yspeed * _s;
	this.rect.center = [this._x, this._y];

}

exports.Projectile = Projectile;