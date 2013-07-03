/**
 * The ship is the player. Inherits from base.BaseSprite
 * Able to fire and shield
 * Functions:
 * update(msDuration) - Executes every tick. Moves ship, adjusts cooldowns
 * fire(key) - fires the weapon mapped to that key
 * acclr() - accelerates the ship.
 */
var SHIP_RADIUS = 10;
var SHIP_SIZE = [10, 10];
var Ship = function(rect) {
   // call superconstructor
   Ship.superConstructor.apply(this, arguments);
   this.mouse_pos = [0, 0];

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
   
   this.rotate = function(_s) {
      if(this.o_timer == 0) {
         this.rotation += this.angular_v * this.rotating * _s;
         if (this.rotation >= 360) {
           this.rotation = this.rotation%360;
         }
         while (this.rotation < 0) {
           this.rotation += 360;
         }
      }
   };
   this.center = [.33, .5] // Percentage width/height from left/top
   this.rect = new gamejs.Rect(rect);
   this.radius = SHIP_RADIUS;
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
   this.check_laser(_s);
   if (this.health <= 0) {
      this.kill();
      this.health = 0;
      this.socket.emit('death')
      globals.flags.ships= true;
   }
   //Shield heat
   if (this.shielded) {
      if (this.o_timer > 0) {
         this.shielded = false;
      } else {
         this.heat += this.shield_heat_rate * _s;
      }
   }
   var diff = $v.subtract(this.mouse_pos, [this._x, this._y]);
   this.turret.rotation = Math.atan2(diff[1], diff[0]) * 180 / Math.PI
   var position = globals.get_position([this._x, this._y], this.center, SHIP_SIZE, -this.rotation);
   this.rect = new gamejs.Rect(position, SHIP_SIZE);
   this.radius = SHIP_RADIUS;
};
Ship.prototype.check_weapons = function(msDuration) {
   if (this.weapon_firing[0]) {
      if ((this.delay_timer[0] <= 0) && (this.o_timer == 0)) {
         if (this.weapon_type[0] == 0) {
            var bomb = new $bomb.Bomb([this._x, this._y])
            var speed = this.bomb_speed;
            bomb.xspeed = (this.xspeed + Math.cos(this.rotation / 180 * Math.PI) * speed);
            bomb.yspeed = (this.yspeed + Math.sin(this.rotation / 180 * Math.PI) * speed);
            bomb.number = this.number;
            globals.projectiles.add(bomb);
            this.delay_timer[0] = this.delay[0][0];
            globals.flags.projectiles = true;
         } else if((this.weapon_type[0] == 1) && (this.laser[0].charging == 0) && (this.laser[0].fade == 0)) {
            this.laser[0].charging = this.laser[0].charge_time;
            globals.flags.ships= true;
         } else if (this.weapon_type[0] == 2) {
            var rocket = new $rocket.Rocket([this._x, this._y]);
            var speed = this.rocket_speed;
            rocket.xspeed = (this.xspeed + Math.cos(this.rotation / 180 * Math.PI) * speed);
            rocket.yspeed = (this.yspeed + Math.sin(this.rotation / 180 * Math.PI) * speed);
            rocket.rotation = this.rotation;
            rocket.tracking = true;
            rocket.follow_mouse = false;
            rocket.destination = this.mouse_pos;
            rocket.ship = this;
            rocket.number = this.number;
            globals.projectiles.add(rocket);
            this.delay_timer[0] = this.delay[0][2];
            globals.flags.projectiles = true;
         }
      } else {
         this.delay_timer[0] -= msDuration;
      }
   } else if(this.delay_timer[0] > 0) {
      this.delay_timer[0] -= msDuration;
   }

   //Turret gun
   if (this.weapon_firing[1]) {
      if ((this.delay_timer[1] <= 0) && (this.o_timer == 0)) {
         if (this.weapon_type[1] == 0) {
            var bomb = new $bomb.Bomb([this._x, this._y])
            var speed = this.bomb_speed;
            bomb.xspeed = (this.xspeed + Math.cos(this.turret.rotation / 180 * Math.PI) * speed);
            bomb.yspeed = (this.yspeed + Math.sin(this.turret.rotation / 180 * Math.PI) * speed);
            bomb.damage = 4;
            bomb.number = this.number;
            globals.projectiles.add(bomb);
            this.delay_timer[1] = this.delay[1][0];
            globals.flags.projectiles = true;
         } else if ((this.weapon_type[1] == 1) && (this.laser[1].charging == 0) && (this.laser[1].fade == 0)) {
            this.laser[1].charging = this.laser[1].charge_time;
            globals.flags.ships= true;
         } else if (this.weapon_type[1] == 2) {
            var rocket = new $rocket.Rocket([this._x, this._y]);
            var speed = this.rocket_speed;
            rocket.xspeed = (this.xspeed + Math.cos(this.rotation / 180 * Math.PI) * speed);
            rocket.yspeed = (this.yspeed + Math.sin(this.rotation / 180 * Math.PI) * speed);
            rocket.rotation = this.turret.rotation;
            rocket.tracking = true;
            rocket.follow_mouse = true;
            rocket.damage = 10;
            rocket.destination = this.mouse_pos;
            rocket.ship = this;
            rocket.number = this.number;
            globals.projectiles.add(rocket);
            this.delay_timer[1] = this.delay[1][2];
            globals.flags.projectiles = true;
         }
      } else {
         this.delay_timer[1] -= msDuration;
      }
   } else if(this.delay_timer[1] > 0) {
      this.delay_timer[1] -= msDuration;
   }
}
Ship.prototype.check_laser = function(_s) {
   for (var i = 1; i >= 0; i--) {
      var las = this.laser[i];
      if (las.charging > 0) {
         var start_pos = [this._x, this._y];
         if (i == 0) {
            var end_pos = [this._x + las.len*Math.cos(this.rotation/180*Math.PI),
               this._y + las.len*Math.sin(this.rotation/180*Math.PI)];
         } else if (i == 1) {
            var end_pos = [this._x + las.len*Math.cos(this.turret.rotation/180*Math.PI),
               this._y + las.len*Math.sin(this.turret.rotation/180*Math.PI)];
         }
         las.charging -= _s;
         if (las.charging <= 0) {
            las.charging = 0;
            las.fire = true;
            las.fade = las.fade_time;
            this.heat += las.heat;
            var col_planets = globals.groupCollideLine(globals.planets, start_pos, end_pos);
            var col_asteroids = globals.groupCollideLine(globals.asteroids, start_pos, end_pos);
            col_planets.forEach(function(colObject) {
               colObject.health -= las.damage;
               globals.flags.planets = true;
               if (colObject.health <= 0) {
                  colObject.kill();
               }
            });
            col_asteroids.forEach(function(colObject) {
               colObject.health -= las.damage;
               globals.flags.asteroids = true;
               if (colObject.health <= 0) {
                  colObject.kill();
               }
            });
         }
      } else if (las.fade > 0) {
         las.fade -= _s;
         if (las.fade <= 0) {
            las.fade = 0;
         };
      }
   }
}

// Utilities
Ship.prototype.check_heat = function(_s) {
   if ((this.heat > this.heat_max) && (this.o_timer == 0)) {
      this.o_timer = this.overheat;
      this.heat = this.heat_max * .95
      this.socket.emit('overheat', this.o_timer, this.heat, -1);
      this.socket.broadcast.emit('overheat', this.o_timer, this.heat, this.number);
   } else if (this.o_timer > 0) {
      console.log("Counting down");
      console.log(this.o_timer);
      this.o_timer -= this.cool_rate * _s;
      if (this.o_timer < 0) {
         this.o_timer = 0;
         this.socket.emit('end_overheat', -1);
         this.socket.broadcast.emit('end_overheat', this.number);
      }
   } else if(this.heat > 0) {
      this.heat -= this.cool_rate * _s;
      if (this.heat < 0) {
         this.heat = 0;
      }
   }
}
Ship.prototype.move = function(_s) {
   // Call this from update. Otherwise, acclr depends on comp specs
   if (this.accelerating && (this.o_timer == 0)) {
      this.xspeed += Math.cos(this.rotation/180*Math.PI)*this.accleration*_s;
      this.yspeed += Math.sin(this.rotation/180*Math.PI)*this.accleration*_s;
   };
   this.yspeed *= 1-(this.deceleration * _s);
   this.xspeed *= 1-(this.deceleration * _s);
   this._x += this.xspeed * _s;
   this._y += this.yspeed * _s;
   // this.check_in_bounds();
};

Ship.prototype.check_planet_collisions = function() {
   var that = this;
   var c_planets = gamejs.sprite.spriteCollide(this, globals.planets, true, gamejs.sprite.collideCircle);
   var c_ast = gamejs.sprite.spriteCollide(this, globals.asteroids, true, gamejs.sprite.collideCircle);
   var c_projectiles = gamejs.sprite.spriteCollide(this, globals.projectiles, false, gamejs.sprite.collideCircle);
   c_planets.forEach(function(planet) {
      that.collide(planet);
   });
   c_ast.forEach(function(ast) {
      that.collide(ast);
   });
   c_projectiles.forEach(function(p) {
      if(p.number != that.number) {
         that.collide(p);
         p.explode();
      }
   });
};
Ship.prototype.collide = function(colObject) {
   globals.flags.ships= true;
   if (this.shielded) {
      this.heat += this.shield_efficiency * colObject.damage;
   } else {
      this.health -= colObject.damage;
   }
};
Ship.prototype.fire = function() {
   this.weapon_firing[0] = true;
};
Ship.prototype.stop_firing = function() {
   this.weapon_firing[0] = false;
};
Ship.prototype.weapon_switch = function(num) {
   this.weapon_type[num] += 1;
   if (this.weapon_type[num] > 2) {
      this.weapon_type[num] = 0;
   }
};

exports.Ship = Ship;