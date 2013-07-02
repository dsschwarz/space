var $ship = require("ship");
var $g = require("globals");
var $rocket = require('rocket');
var $bomb = require('bomb');
var $planet = require('planet');
var $asteroid = require('asteroid');
var gamejs = require("gamejs");
var socket = io.connect('http://localhost:3000');

socket.on('datadump', function(data){
  temp = new gamejs.sprite.Group();
  data.ships.forEach(function(ship){
    var s = new $ship.Ship([0,0]);
    update_attributes(s, ship);
    if (s.number === data.number) {
      s.mainShip = true;
      $g.mainShip = s;
    }
    temp.add(s);
  });
  $g.ships= temp;

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

  temp = new gamejs.sprite.Group();
  data.planets.forEach(function(planet){
    var p = new $planet.Planet([0,0]);
    update_attributes(p, planet);
    temp.add(p);
  });
  $g.planets = temp;

  temp = new gamejs.sprite.Group();
  data.asteroids.forEach(function(asteroid){
    var p = new $asteroid.Asteroid([0,0]);
    update_attributes(p, asteroid);
    temp.add(p);
  });
  $g.asteroids = temp;
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
socket.on('accelerate', function(acclr, num){
  if (num === -1) {
    $g.mainShip.accelerating = acclr;
  } else {
    $g.findShip(num).accelerating = acclr;
  }
});
socket.on('rotate', function(rotating){
  $g.mainShip.rotating = rotating;
});
socket.on('shield', function(shielded){
  $g.mainShip.shielded = shielded;
});
socket.on('death', function(data){
  $g.connected = false;
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
exports.socket = socket;
var update_attributes = function(obj, obj2){
    if(obj2 == null || typeof(obj2) != 'object')
        return obj2;

    for(var key in obj2) {
      obj[key] = update_attributes(obj[key], obj2[key]);
    }
    return obj;
}