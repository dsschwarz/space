
exports.io = function(socket) {
	console.log("A user connected");
	socket.set('playing', false);
    socket.on('join', function(name){
    	var player = new $player.Player(name)
    	socket.set('player', player);
    	socket.set('playing', true);
    	globals.players.push(player);
    	var ship = new $ship.Ship([0,0]);
    	ship.number = player.number;
    	globals.ships.add(ship);
    	console.log("New player " + player.name + " :: #" + player.number);
    	socket.broadcast.emit('new_player', player);
    	socket.emit('join_success', globals.players);
    });
	socket.on('accelerate', function(acclr){
		var ship = getShip(current_player(socket).number);
		ship.accelerating = acclr;
		socket.emit("accelerate", acclr, -1);
        socket.broadcast.emit("accelerate", acclr, ship.number);
	});
    socket.on('rotate', function(dir){
		var ship = getShip(current_player(socket).number);
		ship.rotating = dir;
		socket.emit("rotate", dir);
    });
    socket.on('shield', function(shielded){
        var ship = getShip(current_player(socket).number);
        ship.shielded = shielded;
        console.log(ship.shielded)
        socket.emit("shield", shielded);
    });
    socket.on('fire', function(wpn_number) {
    	var ship = getShip(current_player(socket).number);
    	ship.weapon_firing[wpn_number] = 1;
    });
    socket.on('weapon_switch', function(wpn_number) {
    	var ship = getShip(current_player(socket).number);
    	ship.weapon_switch(wpn_number);
    });
    socket.on('end_fire', function(wpn_number) {
    	var ship = getShip(current_player(socket).number);
    	ship.weapon_firing[wpn_number] = 0;
    });
    socket.on('end_rotate', function(dir){
		var ship = getShip(current_player(socket).number);
		if (ship.rotating === dir) {
			ship.rotating = 0;
            socket.emit("rotate", 0);
		}
		// socket.emit("rotate", player.ship.rotating);
    });
    socket.on('disconnect', function(){
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
    	temp = new gamejs.sprite.Group();
    	globals.ships.forEach(function(ship){
			if (number != ship.number) {
				temp.add(ship);
			};
    	});
    	globals.ships = temp;
    	socket.broadcast.emit('player_dc', globals.players);
    });
};
var current_player = function(socket){
	var player = {};
	socket.get('player', function(e, p){
		player = p;
	});
	return player;
};
exports.current_player = current_player;
var getShip = function(number) {
	var s = {};
	globals.ships.forEach(function(ship){
		if (ship.number === number) {
			s = ship;
		};
	});
	return s;
}
exports.isPlaying = function(socket) {
	var flag = false;
	socket.get('playing', function(e, p){
		flag = p;
	});
	return flag;
}