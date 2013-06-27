var socket = io.connect('http://localhost:3000');
socket.on('datadump', function(data){
  console.log(data.msDuration);
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