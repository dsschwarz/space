var $ship = require("ship");
var $g = require("globals");
var $rocket = require('rocket');
var $bomb = require('bomb');
var $planet = require('planet');
var $asteroid = require('asteroid');
var gamejs = require("gamejs");
// var socket = io.connect('http://192.34.63.118:3000');
var socket = io.connect('http://localhost:3000');

var update_ships = function(number, data){
  temp = new gamejs.sprite.Group();
  data.ships.forEach(function(ship){
    var s = new $ship.Ship([0,0]);
    update_attributes(s, ship);
    if (s.number === number) {
      s.mainShip = true;
      $g.mainShip = s;
    }
    temp.add(s);
  });
  $g.ships= temp;
};
var update_projectiles = function(data){
  temp = new gamejs.sprite.Group();
  data.projectiles.forEach(function(projectile){
    var p = {};
    if (projectile.ptype === "bomb") {
      p = new $bomb.Bomb([0,0]);
    } else if (projectile.ptype === "rocket") {
      p = new $rocket.Rocket([0,0])
    };
    update_attributes(p, projectile);
    temp.add(p);
  });
  $g.projectiles = temp;
}
var update_planets = function(data){
  temp = new gamejs.sprite.Group();
  data.planets.forEach(function(planet){
    var p = new $planet.Planet([0,0]);
    update_attributes(p, planet);
    temp.add(p);
  });
  $g.planets = temp;
}
var update_asteroids = function(data){
  temp = new gamejs.sprite.Group();
  data.asteroids.forEach(function(asteroid){
    var p = new $asteroid.Asteroid([0,0]);
    update_attributes(p, asteroid);
    temp.add(p);
  });
  $g.asteroids = temp;
}
socket.on('datadump', function(number, data){
  update_ships(number, data);
  update_projectiles(data);
  update_planets(data);
  update_asteroids(data);
});
socket.on('update_ships', function(number, data){
  update_ships(number, data);
  console.log(data);
});
socket.on('update_projectiles', function(number, data){
  update_projectiles(data);
  console.log(data);
});
socket.on('update_planets', function(number, data){
  update_planets(data);
  console.log(data);
});
socket.on('update_asteroids', function(number, data){
  update_asteroids(data);
  console.log(data);
});
socket.on('connect', function(data){
  console.log('connected to:')
  console.log(socket)
  socket.emit('join', prompt("Name"))
});
socket.on('new_player', function(player) {
  $('#users-list').append("<li>"+player.name+"</li>");
});
socket.on('join_success', function(players) {
  $('#users-list').empty();
  players.forEach(function(player){
    $('#users-list').append("<li>"+player.name+"</li>");
  });
  $g.connected = true;
});
socket.on('accelerate', function(acclr, num, ship){
  console.log(num + 'accelerate: ' + acclr);
  if (num === -1) {
    $g.mainShip.accelerating = acclr;
    update_attributes($g.mainShip, ship);
  } else {
    update_attributes($g.findShip(num), ship);
  }
});
socket.on('rotate', function(rotating, num, ship){
  console.log(num)
  if (num === -1) {
    update_attributes($g.mainShip, ship);
  } else {
    update_attributes($g.findShip(num), ship);
  }
});
socket.on('shield', function(shielded, num){
  if (num === -1) {
    $g.mainShip.shielded = shielded;
  } else {
    $g.findShip(num).shielded = shielded;
  }
});
socket.on('overheat', function(o_timer, heat, num){
  if (num === -1) {
    $g.mainShip.o_timer = o_timer;
    $g.mainShip.heat = heat;
  } else {
    $g.findShip(num).o_timer = o_timer;
    $g.findShip(num).heat = heat;    
  }
});
socket.on('end_overheat', function(num){
  if (num === -1) {
    $g.mainShip.o_timer = 0;
  } else {
    $g.findShip(num).o_timer = 0;
  }
});
socket.on('death', function(data){
  $g.connected = false;
  $g.mainShip.health = 0;
});

socket.on('player_died', function(data){
  console.log("Player is dead")
});
socket.on('player_dc', function(players) {
  $('#users-list').empty();
  players.forEach(function(player){
    $('#users-list').append("<li>"+player.name+"</li>");
  });
});
socket.on('ping', function(){
  $('#ping').text($g.ping_timer);
  $g.total_ping += $g.ping_timer;
  $g.ping_count += 1;
  $('#ave_ping').text($g.total_ping/$g.ping_count);
  $g.ping_timer = 0;
}) 
exports.socket = socket;

var update_attributes = function(obj, obj2){
    if(obj2 == null || typeof(obj2) != 'object')
        return obj2;

    for(var key in obj2) {
      obj[key] = update_attributes(obj[key], obj2[key]);
    }
    return obj;
}