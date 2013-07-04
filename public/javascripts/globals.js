var gamejs = require('gamejs');
exports.height = 600;
exports.width  = 800;
exports.mouse_pos = [0, 0];    // Absolute
exports.mouse_pixels = [0, 0]; // Relative to screen
exports.particles = [];
exports.players = [];		   // Current players; name & number
exports.projectiles = new gamejs.sprite.Group();
exports.planets = new gamejs.sprite.Group();
exports.asteroids = new gamejs.sprite.Group();
exports.ships = new gamejs.sprite.Group();
exports.mainShip = {};
exports.offset = [0, 0];

// Flags for socket
exports.ping_timer = 0;
exports.ping_count = 0;
exports.total_ping = 0;
exports.accelerating = false;
exports.shielded = false;
exports.fire = [false];
exports.rotating = 0;
exports.connected = false;
function get_position(true_pos, center, dim, angle) {
	center = center || [0, 0];
	dim = dim || [0, 0];
	angle = angle || 0;
	if (angle > 360) {
		angle = angle%360;
	} while (angle < 0) {
		angle += 360;
	}
	if (angle === 0) {
		return [true_pos[0] - center[0] * dim[0] -exports.offset[0],
			true_pos[1] - center[1] * dim[1] -exports.offset[1]]
	};
	var la = dim[1]*center[1]
	var lb = dim[0]*center[0]
	var lc = dim[1]*(1-center[1])
	var ld = dim[0]*(1-center[0])

	if (angle < 90) {
		return get_xy(angle, la, lb, ld, true_pos)
	} else if (angle < 180) {
		return get_xy(angle-90, ld, la, lc, true_pos)
	} else if (angle < 270) {
		return get_xy(angle-180, lc, ld, lb, true_pos)
	} else {
		return get_xy(angle-270, lb, lc, la, true_pos)
	}
};
function get_xy(angle, l1, l2, l3, true_pos) {
	var sin = Math.sin(angle / 180 * Math.PI);
	var cos = Math.cos(angle / 180 * Math.PI);
	var x = true_pos[0] - l1*sin - l2*cos - exports.offset[0];
	var y = true_pos[1] - l1*cos - l3*sin - exports.offset[1];
	return [x, y];
}
function groupCollideLine(group, pointA, pointB) {
	var colObjs = [];
	group.forEach(function(obj) {
		if (obj.rect.collideLine(pointA, pointB)) {
			colObjs.push(obj);
		}
	})
	return colObjs;
}
var findShip = function(num) {
	var return_ship = {};
	exports.ships.forEach(function(ship){
		if(ship.number === num){
			return_ship = ship;
			return;
		}
	})
	return return_ship;
}
exports.findShip = findShip
exports.get_position = get_position;
exports.groupCollideLine = groupCollideLine;