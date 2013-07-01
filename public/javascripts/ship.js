/**
 * The ship is the player. Inherits from base.BaseSprite
 * Able to fire and shield
 * Functions:
 * update(msDuration) - Executes every tick. Moves ship, adjusts cooldowns
 * fire(key) - fires the weapon mapped to that key
 * acclr() - accelerates the ship.
 */

var gamejs = require('gamejs');
var $v = require('gamejs/utils/vectors');
var $e = require('gamejs/event');
var globals = require('globals');
var base = require('base')
var $bomb = require('bomb');
var $rocket = require('rocket');
var $m = require('gamejs/utils/math');


var Ship = function(rect) {
   // call superconstructor
   Ship.superConstructor.apply(this, arguments);

   // Physics Properties 
   this.accleration = 220; // How fast ship accelerates (constant)
   this.deceleration = .52; // Percentage ship slows per second
   this.angular_v = 150; // Angular velocity (how fast it's rotating; deg/s)

   // Special Properties
   this.health_max = 100;
   this.health = this.health_max;
   this.bomb_speed = 300;
   this.rocket_speed = 30;

   this.heat = 0;
   this.heat_max = 300;
   this.cool_rate = 10; // How fast heat//overheat dissipates
   this.overheat = 30; // How long ship stays overheated
   this.o_timer = 0;

   // Weapons - First array index is main gun, second is turret
   this.weapon_type = [1, 1]
   this.ammo = [0,0];
   this.reload_time = [3,5];
   this.reload_timer = [0,0];
   // Delay between shots in milliseconds;
   this.delay = [[300, 0, 1000],[100, 0, 700]];
   this.delay_timer = [0,0];
   this.weapon_firing = [false, false];
   this.weapon_damage = [30, 4];
   this.turret = {
      image: gamejs.image.load("images/turret.png"),
      rotation: 0,
      center: [0.1, 0.5]
   };

   //For laser only
   var Laser = function(){
      return {
         charging: 0,
         charge_time: 1, 
         heat: 20,
         damage: 20,
         fade: 0,
         fade_time: .5,
         len: 1000, 
         width: 0,
         color: "#eeeeff",
         start_pos: [0,0],
         end_pos: [0,0],
         fire: false
      }
   };
   this.laser = [];
   var las1 = Laser();
   las1.heat = 80;
   las1.damage = 80;
   this.laser.push(las1);
   var las2 = Laser();
   las2.charge_time = .25;
   las2.fade_time = .1;
   this.laser.push(las2);

   //Shield
   this.shield_heat_rate = 90;
   this.shielded = false;
   this.shield_efficiency = 10; // How much of damage becomes heat, lower is better
   // Display Properties
   this.draw = function(surface) {
      gamejs.draw.rect(surface, '#22cc22', new gamejs.Rect([this.rect.left, this.rect.top], [this.health / this.health_max * this.originalImage.getSize()[0], 2]), 0);
      var las = this.laser[0];
      if ((las.charging) > 0 || (las.fade > 0)) {
         gamejs.draw.line(surface, las.color, las.start_pos, las.end_pos, las.width);
      }
      surface.blit(this.image, this.rect);
      var las = this.laser[1];
      if ((las.charging) > 0 || (las.fade > 0)) {
         gamejs.draw.line(surface, las.color, las.start_pos, las.end_pos, las.width);
      }
      surface.blit(gamejs.transform.rotate(this.turret.image, this.turret.rotation), 
         globals.get_position([this._x, this._y], this.turret.center, this.turret.image.getSize(), -this.turret.rotation))

      return;
   }
   this.rotate = function(_s) {
      if(this.o_timer == 0) {
         this.rotation += $m.normaliseDegrees(this.angular_v * this.rotating * _s);
        
      }
   };
   this.originalImage = gamejs.image.load("images/ship.png");
   this.chargeImage = gamejs.image.load("images/ship_charge.gif");
   this.image = gamejs.transform.rotate(this.originalImage, this.rotation);
   this.center = [.33, .5] // Percentage width/height from left/top
   this.rect = new gamejs.Rect(rect);
   return this;
};
// inherit (actually: set prototype)
gamejs.utils.objects.extend(Ship, base.BaseSprite);


Ship.prototype.update = function(msDuration) {
   var _s = msDuration / 1000;
   this.rotate(_s);
   this.move(_s);
   this.check_laser(_s);
   this.image = gamejs.transform.rotate(this.originalImage, this.rotation);
   var diff = $v.subtract(globals.mouse_pos, [this._x, this._y]);
   if (this.mainShip) {
      this.turret.rotation = Math.atan2(diff[1], diff[0]) * 180 / Math.PI;
      globals.offset = [(this._x - globals.width/2), (this._y - globals.height/2)];
   };
   var position = globals.get_position([this._x, this._y], this.center, this.getSize(), -this.rotation);
   this.rect = new gamejs.Rect(position, this.image.getSize());
};


// Utilities

Ship.prototype.move = function(_s) {
   // Call this from update. Otherwise, acclr depends on comp specs
   if (this.accelerating && (this.o_timer == 0)) {
      for (var i = 0; i < 3; i++) {
         this.attach_particles();
      }
      this.xspeed += Math.cos(this.rotation/180*Math.PI)*this.accleration*_s;
      this.yspeed += Math.sin(this.rotation/180*Math.PI)*this.accleration*_s;
   };
   this.yspeed *= 1-(this.deceleration * _s);
   this.xspeed *= 1-(this.deceleration * _s);
   this._x += this.xspeed * _s;
   this._y += this.yspeed * _s;
   // this.check_in_bounds();
};
Ship.prototype.attach_particles = function() {
   var particleImage = gamejs.image.load('images/particle.png');
   var speed = -40 - Math.random() * 20;
   var sidespeed = 60 - Math.random() * 120;
   var pos = globals.get_position([this._x, this._y], [.5, .5], particleImage.getSize(), 0);
   globals.particles.push({
       left: pos[0],
       top: pos[1],
       _x: this._x,
       _y: this._y,
       timer: Math.random()*.2 + .1,
       alpha: Math.random(),
       deltaX: Math.cos(this.rotation / 180 * Math.PI) * speed + Math.sin(this.rotation / 180 * Math.PI) * sidespeed,
       deltaY: Math.cos(this.rotation / 180 * Math.PI) * sidespeed + Math.sin(this.rotation / 180 * Math.PI) * speed,
    });
};
Ship.prototype.check_laser = function(_s) {
   for (var i = 1; i >= 0; i--) {
      var las = this.laser[i];
      if (las.charging > 0) {
         las.start_pos = globals.get_position([this._x, this._y]);
         if (i == 0) {
            las.end_pos = globals.get_position([this._x + las.len*Math.cos(this.rotation/180*Math.PI),
               this._y + las.len*Math.sin(this.rotation/180*Math.PI)]);
         } else if (i == 1) {
            las.end_pos = globals.get_position([this._x + las.len*Math.cos(this.turret.rotation/180*Math.PI),
               this._y + las.len*Math.sin(this.turret.rotation/180*Math.PI)]);
         }
         las.charging -= _s;
         if (las.charging <= 0) {
            las.charging = 0;
            las.width = 8;
            las.fire = true;
            las.color = '#8888cc';
            las.fade = las.fade_time;
            this.heat += las.heat;
         } else {
            las.width = las.charging*2/las.charge_time + .5;
            las.color = '#dd1111';
         }
      } else if (las.fade > 0) {
         las.fade -= _s;
         las.width = 8;
         if (las.fade <= 0) {
            las.fade = 0;
         };
      }
   }
}

exports.Ship = Ship;