
exports.io = function(socket) {
	console.log("A user connected");
	socket.on('accelerate', function(acclr){
		var ship = getShip(current_player(socket).number);
		console.log(ship);
		ship.accelerating = acclr;
		// socket.emit("accelerate", acclr);
	});
    socket.on('rotate', function(dir){
		var ship = getShip(current_player(socket).number);
		console.log(ship);
		console.log(current_player(socket));
		ship.rotating = dir;
		// socket.emit("rotate", player.ship.rotating);
    });
    socket.on('end_rotate', function(dir){
		var ship = getShip(current_player(socket).number);
		if (ship.rotating === dir) {
			ship.rotating = 0;
		}
		// socket.emit("rotate", player.ship.rotating);
    });
    socket.on('join', function(name){
    	var player = new $player.Player(name)
    	socket.set('player', player);
    	globals.players.push(player);
    	var ship = new $ship.Ship([0,0]);
    	ship.number = player.number;
    	globals.ships.add(ship);
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
    	temp = [];
    	globals.ships.forEach(function(ship){
			if (number != ship.number) {
				temp.push(ship);
			};
    	});
    	globals.ships = temp;
    	socket.broadcast.emit('player_dc', temp);
    });
};
var current_player = function(socket){
	var player = {};
	socket.get('player', function(e, p){
		player = p;
	});
	return player;
};
var getShip = function(number) {
	var s = {};
	globals.ships.forEach(function(ship){
		if (ship.number === number) {
		console.log(ship.number)
		console.log(number)
			s = ship;
		};
	});
	return s;
}