/**
 * The ship is the player. Inherits from base.BaseSprite
 * Able to fire and 'jump'
 * Functions:
 * update(msDuration) - Executes every tick. Moves ship, adjusts cooldowns
 * fire(key) - fires the weapon mapped to that key
 * jump() - moves the ship towards the mouse, equal to jump_charge value
 * acclr() - accelerates the ship.
 */

var gamejs = require('gamejs');
var $v = require('gamejs/utils/vectors');
var $e = require('gamejs/event');
var globals = require('globals');
var base = require('base')
var $bomb = require('bomb');

var max_jump_charge = 1000;
var min_jump_charge = 100;

var Ship = function(rect) {
   // call superconstructor
   Ship.superConstructor.apply(this, arguments);

   // Physics Properties 
   this.accleration = 120; // How fast ship accelerates (constant)
   this.deceleration = .52; // Percentage ship slows per second
   this.angular_v = 0; // Angular velocity (how fast it's rotating; deg/s)
   this.angular_a = 15; // How fast ship turns (constant)
   this.angular_d = 3; // Percentage angular velocity slows per second

   // Special Properties
   this.jump_charge = 0;
   this.charge_rate = 150;
   this.health_max = 100;
   this.health = this.health_max;
   this.heat = 0;
   this.heat_max = 300;
   this.cool_rate = 10; // How fast heat//overheat dissipates
   this.overheat = 30; // How long ship stays overheated
   this.bomb_speed = 200;

   // Flags
   this.charging = false;
   // If overheated, != 0, counts down per second
   this.o_timer = 0;

   // Weapons - Each array index holds data for one weapon
   this.ammo = [0,0];
   this.reload_time = [3,5];
   this.reload_timer = [0,0];
   // Delay between shots in milliseconds;
   this.delay = [300,1000];
   this.delay_timer = [0,0];
   this.weapon_firing = [false, false];

   // Display Properties
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
   this.check_heat(_s);
   this.check_weapons(msDuration);
   this.check_planet_collisions();
   if (this.health <= 0) {
      this.kill();
   }
   // Jump charge
   if (this.charging) {
      if (this.o_timer > 0) {
         this.image = gamejs.transform.rotate(this.originalImage, this.rotation);
         this.charging = false;
         this.jump_charge = 0;
      } else {
         this.image = gamejs.transform.rotate(this.chargeImage, this.rotation);
         if (this.jump_charge < max_jump_charge) {
            this.jump_charge += this.charge_rate * _s;
            this.heat += .3 * this.charge_rate * _s;
         }
      }
   } else {
      this.image = gamejs.transform.rotate(this.originalImage, this.rotation);
   }
   globals.offset = [(this._x - globals.width/2), (this._y - globals.height/2)];
   var position = globals.get_position([this._x, this._y], this.center, this.getSize(), -this.rotation);
   this.rect = new gamejs.Rect(position, this.image.getSize());
   this.radius = Math.min((this.originalImage.getSize()[0] * this.center[0]), (this.originalImage.getSize()[1] * this.center[1]));
};
Ship.prototype.jump = function() {
   if (this.jump_charge > min_jump_charge) {
      this.jump_charge -= min_jump_charge;
      this._x += this.jump_charge*Math.cos(this.rotation/180*Math.PI);
      this._y += this.jump_charge*Math.sin(this.rotation/180*Math.PI);
   }
   // this.check_in_bounds();
   this.jump_charge = 0;
   this.charging = 0;
};
Ship.prototype.check_weapons = function(msDuration) {
   if (this.weapon_firing[0]) {
      if ((this.delay_timer[0] <= 0) && (this.o_timer == 0)) {
         var bomb = new $bomb.Bomb([this._x, this._y])
         speed = this.bomb_speed;
         bomb.xspeed = (this.xspeed + Math.cos(this.rotation / 180 * Math.PI) * speed);
         bomb.yspeed = (this.yspeed + Math.sin(this.rotation / 180 * Math.PI) * speed);
         console.log(globals.projectiles);
         globals.projectiles.add(bomb);
         this.delay_timer[0] = this.delay[0];
      } else {
         this.delay_timer[0] -= msDuration;
      }
   } else if(this.delay_timer[0] > 0) {
      this.delay_timer[0] -= msDuration;
   }

   //Turret gun
   if (this.weapon_firing[1]) {
   } else if(this.delay_timer[1] > 0) {
      this.delay_timer[1] -= msDuration;
   }
}

// Utilities
Ship.prototype.check_heat = function(_s) {
   if ((this.heat > this.heat_max) && (this.o_timer == 0)) {
      this.o_timer = this.overheat;
      this.heat = this.heat_max * .95
   } else if (this.o_timer > 0) {
      console.log("Counting down")
      console.log(this.o_timer)
      this.o_timer -= this.cool_rate * _s;
      if (this.o_timer < 0) {
         this.o_timer = 0;
      }
   } else if(this.heat > 0) {
      this.heat -= this.cool_rate * _s;
      if (this.heat < 0) {
         this.heat = 0;
      }
   }
}
Ship.prototype.begin_charge = function() {
   if (this.o_timer == 0) {
      this.charging = true;
   }
}
Ship.prototype.point_to = function(coords) {
   var diff = $v.subtract(coords, [this._x, this._y]);
   console.log(diff)
   // this.rotation = Math.atan2(diff[1], diff[0]) * 180 / Math.PI
   // this.image = gamejs.transform.rotate(this.originalImage, this.rotation);
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
Ship.prototype.check_in_bounds = function() {
   if (this._y > globals.height) {
      this._y = 0;
   } else if (this._y < 0 ) {
      this._y = globals.height;
   }
   if (this._x > globals.width) {
      this._x = 0;
   } else if (this._x < 0 ) {
      this._x = globals.width;
   }
};

Ship.prototype.check_planet_collisions = function() {
   var that = this;
   var c_planets = gamejs.sprite.spriteCollide(this, globals.planets, true, gamejs.sprite.collideCircle);
   c_planets.forEach(function(planet) {
      that.health -= 10;
   });
}
Ship.prototype.fire = function() {
   this.weapon_firing[0] = true;
};
Ship.prototype.stop_firing = function() {
   this.weapon_firing[0] = false;
}

exports.Ship = Ship;