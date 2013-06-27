
exports.io = function(socket) {
	console.log("A user connected");
	socket.on('accelerate', function(acclr){
		var player = current_player();
		player.ship.accelerating = acclr;
		socket.emit("accelerate", acclr);
	});
    socket.on('rotate', function(dir){
		var player = current_player();
		player.ship.rotating = dir;
		socket.emit("rotate", player.ship.rotating);
    });
    socket.on('end_rotate', function(dir){
		var player = current_player();
		if (player.ship.rotating === dir) {
			player.ship.rotating = 0;
		}
		socket.emit("rotate", player.ship.rotating);
    });
    socket.on('join', function(name){
    	var player = new $player.Player(name)
    	socket.set('player', player);
    	globals.players.push(player);
    	console.log("New player " + player.name + " :: #" + player.number);
    	socket.broadcast.emit('new_player', player);
    	socket.emit('join_success', globals.players);
    });
    socket.on('disconnect', function(data){
    	var temp = [];
    	var number = NaN;
    	socket.get('player', function(e , player){
    		number = player.number;
    	});
    	console.log("Disconnect: " + number);
    	globals.players.forEach(function(player){
			if (number != player.number) {
				temp.push(player);
			};
    	});
    	globals.players = temp;
    	socket.broadcast.emit('player_dc', temp);
    });
};
var current_player = function(){
	var player = {};
	socket.get('player', function(e, p){
		player = p
	});
	return player;
}
var findUser = function(number) {
	globals.players.forEach(function(player){
		if (number === player.number) {
			return player;
		};
	});
};