var ASTEROID_SIZE = [30, 30];

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
   var pos = globals.get_position([this._x, this._y], [.5, .5], ASTEROID_SIZE, 0);
   this.rect = new gamejs.Rect(pos, ASTEROID_SIZE);
   return this;
};

gamejs.utils.objects.extend(Asteroid, base.BaseSprite);
Asteroid.prototype.update = function(msDuration) {
   this._x += this.xspeed * (msDuration/1000);
   this._y += this.yspeed * (msDuration/1000);
   this.rotate((msDuration/1000));
   var pos = globals.get_position([this._x, this._y], [.5, .5], ASTEROID_SIZE, 0);
   this.radius = ASTEROID_SIZE[0];
}

exports.Asteroid = Asteroid;