
exports.io = function(socket) {
	console.log("rofl");
	socket.on('accelerate', function(){
		console.log('key w pressed')
	});
    socket.on('rotate', function(dir){
    });
    socket.on('join', function(name){
    	var player = new $player.Player(name)
    	socket.set('player', player);
    	globals.players.push(player);
    	console.log(player);
    	socket.emit('new_player', player)
    });
};