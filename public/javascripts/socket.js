var $ship = require("ship");
var $g = require("globals");
var gamejs = require("gamejs");
var socket = io.connect('http://localhost:3000');

socket.on('datadump', function(data){
  temp = new gamejs.sprite.Group();
  data.ships.forEach(function(ship){
    var t_ship = new $ship.Ship([0,0]);
    update_attributes(t_ship, ship);
    temp.add(t_ship);
  })
  $g.ships= temp;
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
  players.forEach(function(player){
    $('#users-list').append("<li>"+player.name+"</li>");
  })
});
socket.on('player_dc', function(players) {
  $('#users-list').empty();
  players.forEach(function(player){
    $('#users-list').append("<li>"+player.name+"</li>");
  })
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