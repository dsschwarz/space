/**
 * Space shooter. Awesomeness.
 */

var gamejs = require('gamejs');
var $v = require('gamejs/utils/vectors');
var $e = require('gamejs/event');
var globals = require('globals');
var $ship = require('ship');
var $proj = require('projectile');
var $planet = require('planet');
var $asteroid = require('asteroid');


/**
 * M A I N
 */

function main() {
   // screen setup
   var display = gamejs.display.setMode([globals.width, globals.height]);
   gamejs.display.setCaption("Example Sprites");
   // create ship
   var ship = new $ship.Ship([100, 100]);
   globals.ships.add(ship);
   for (var j=0;j<3;j++) {
      globals.planets.add(new $planet.Planet([0,0]));
   }

   var particleImage = gamejs.image.load('images/particle.png');
   var starImage = gamejs.image.load('images/star.png');

   // game loop
   var mainSurface = gamejs.display.getSurface();
   var attach_asteroid = function () {
      if (globals.planets.sprites().length > 30) {
         globals.planets.forEach(function(planet) {
            if (Math.abs(ship._x - planet._x) > globals.width * 2) {
               planet.kill();
            } else if (Math.abs(ship._y - planet._y) > globals.height * 2) {
               planet.kill();
            }
         })
      }
      if (globals.planets.sprites().length < 100) {
         var rand1 = Math.random();
         var rand2 = Math.random();
         var xflip = 0, yflip = 0;
         if (rand1 > .85) {
            xflip = 1;
         } else if (rand1 < .15) {
            xflip = -1;
         }
         if (rand2 > .85) {
            yflip = 1;
         } else if (rand2 < .15) {
            yflip = -1;
         }
         if ((xflip != 0) && (yflip != 0)) {
            globals.planets.add(new $asteroid.Asteroid([ship._x + globals.width * xflip + Math.random() * globals.width / 2 * xflip,
              ship._y + globals.height * yflip + Math.random() * globals.height / 2 * yflip]));
         }
      }
   }
   var draw_bars = function() {
      if (ship.o_timer == 0) {
         gamejs.draw.rect(display, '#ffffff', new gamejs.Rect([globals.width * .05, 10], [globals.width * .9, 20]), 0);
         gamejs.draw.rect(display, '#3333ee', new gamejs.Rect([globals.width * .05, 10], [ship.heat / ship.heat_max * globals.width * .9, 20]), 0);
      } else {
         gamejs.draw.rect(display, '#ee3333', new gamejs.Rect([globals.width * .05, 10], [globals.width * .9, 20]), 0);
      }
      gamejs.draw.rect(display, '#33ee33', new gamejs.Rect([globals.width * .05, 40], [ship.health / ship.health_max * globals.width * .9, 20]), 0);
   };
   var draw_particles = function(msDuration) {

      globals.particles = globals.particles.filter(function(particle) {
          return particle.timer > 0;
      });
      globals.particles.forEach(function(particle) {
         var r = (msDuration/1000);
         particle.timer -= 1 * r;
         particle._x += particle.deltaX * r;
         particle._y += particle.deltaY * r;
         var pos = globals.get_position([particle._x, particle._y], [.5, .5], particleImage.getSize(), 0);
         particle.left = pos[0];
         particle.top = pos[1];
         particle.alpha = particle.timer;
         particleImage.setAlpha(particle.alpha);
         display.blit( particleImage, [particle.left, particle.top]);
      });
   };
   var starGroup = {stars: [], bounds: {left: 0, right: 0, top: 0, bottom: 0}};
   var generate_stars = function(left_edge, top_edge, width, height) {
      var star_num = height * width / 20000;
      for (var i = 0; i < star_num; i++) {
         console.log(width, height, left_edge, top_edge)
         var new_size = Math.random()*3;
         starGroup.stars.push({
            _x: Math.random()*width + left_edge,
            _y: Math.random()*height + top_edge,
            left: 0,
            top: 0,
            alpha: Math.random()*.5 + .5,
            dim: [new_size, new_size]
         })
      };
   }
   var draw_stars = function() {
      var bounds = starGroup.bounds;
      var height = 0;
      var width = 0;
      var left_edge = 0;
      var top_edge = 0;
      if (ship._x + globals.width > bounds.right) {
         console.log("Generating right")
         generate_stars(bounds.right, bounds.top, globals.width, bounds.bottom - bounds.top);
         starGroup.bounds.right += globals.width;
      }
      if (ship._x - globals.width < bounds.left) {
         console.log("Generating left")
         generate_stars(bounds.left - globals.width, bounds.top, globals.width, bounds.bottom - bounds.top);
         starGroup.bounds.left -= globals.width;
      }
      if (ship._y + globals.height > bounds.bottom) {
         console.log("Generating below")
         generate_stars(bounds.left, bounds.bottom,bounds.right - bounds.left, globals.height);
         starGroup.bounds.bottom += globals.height;
      }
      if (ship._y - globals.height < bounds.top) {
         console.log("Generating above")
         generate_stars(bounds.left, bounds.top - globals.height, bounds.right - bounds.left, globals.height);
         starGroup.bounds.top -= globals.height;
      };
      var delete_stars = false;
      if (starGroup.stars.length > 100) {
         delete_stars = true;
         starGroup.bounds.left = Math.max(ship._x - 2*globals.width, starGroup.bounds.left);
         starGroup.bounds.right = Math.min(ship._x + 2*globals.width, starGroup.bounds.right);
         starGroup.bounds.top = Math.max(ship._y - 2*globals.height, starGroup.bounds.top);
         starGroup.bounds.bottom = Math.min(ship._y + 2*globals.height, starGroup.bounds.bottom);
      };
      for (var i = 0; i < starGroup.stars.length; ++i) {
         star = starGroup.stars[i];
         if ((delete_stars) && ((star._x < starGroup.bounds.left) || (star._x > starGroup.bounds.right) || 
              (star._y < starGroup.bounds.top) || (star._y > starGroup.bounds.bottom))) {
               starGroup.stars.splice(i--, 1);
         } else {
            star.left = star._x - globals.offset[0];
            star.top = star._y - globals.offset[1];
            starImage.setAlpha(star.alpha);
            display.blit( starImage, [star.left, star.top]);
         };
      };
   };
   // msDuration = time since last tick() call
   gamejs.onTick(function(msDuration) {
         globals.mouse_pos = $v.add(globals.mouse_pixels, globals.offset)
         mainSurface.fill("#000000");
         attach_asteroid();

         draw_particles(msDuration);
         draw_stars();

         // Draw heat and health
         globals.projectiles.update(msDuration);
         globals.projectiles.draw(mainSurface);
         globals.planets.update(msDuration);
         globals.planets.draw(mainSurface);
         globals.ships.update(msDuration);
         globals.ships.draw(mainSurface);
         draw_bars();

   });
   
   gamejs.onEvent(function(event) {
      if (event.type === $e.KEY_UP) {
         if (event.key == $e.K_w) {
            ship.accelerating = false;
         } else if (event.key == $e.K_d) {
            if (ship.rotating == 1) {
               ship.rotating = 0;
            }
         } else if (event.key == $e.K_a) {
            if (ship.rotating == -1) {
               ship.rotating = 0;
            }        
         } else if (event.key == $e.K_SHIFT) {
            ship.jump();
         } else if (event.key == $e.K_SPACE) {
            ship.stop_firing();
         } else if (event.key == $e.K_ALT) {
            ship.shielded = false;
         }
      } else if (event.type === $e.KEY_DOWN) {
         if (event.key == $e.K_w) {
            ship.accelerating = true;
         } else if (event.key == $e.K_d) {
            ship.rotating = 1;
         } else if (event.key == $e.K_a) {
            ship.rotating = -1;
         } else if (event.key == $e.K_SHIFT) {
            ship.begin_charge();
         } else if (event.key == $e.K_SPACE) {
            ship.fire();
         } else if (event.key == $e.K_ALT) {
            ship.shielded = true;
         } else if (event.key == $e.K_q) {
            ship.weapon_switch(0);
         } else if (event.key == $e.K_e) {
            ship.weapon_switch(1);
         }
      } else if (event.type === $e.MOUSE_MOTION) {
         if (display.rect.collidePoint(event.pos)) {
            // ship.point_to([event.pos[0] + globals.offset[0], event.pos[1] + globals.offset[1]]);
            globals.mouse_pixels = event.pos;
            globals.mouse_pos = $v.add(event.pos, globals.offset)
         }
      } else if (event.type === $e.MOUSE_DOWN) {
         if (display.rect.collidePoint(event.pos)) {
            ship.weapon_firing[1] = true;
         }
      } else if (event.type === $e.MOUSE_UP) {
         ship.weapon_firing[1] = false;
      };
   });
}


gamejs.preload(['images/ship.png']);
gamejs.preload(['images/turret.png']);
gamejs.preload(['images/ship_charge.gif']);
gamejs.preload(['images/particle.png']);
gamejs.preload(['images/star.png']);
gamejs.preload(['images/wiki.png']);
gamejs.preload(['images/asteroid.png']);

gamejs.ready(main);
