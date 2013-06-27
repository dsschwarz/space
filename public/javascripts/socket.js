var socket = io.connect('http://localhost:3000');
socket.on('datadump', function(data){

});
socket.on('connect', function(data){
  console.log('connected to:')
  console.log(socket)
  socket.emit('join', prompt("Name"))
});
socket.on('new_player', function(player) {
  console.log(player);
});
exports.socket = socket;