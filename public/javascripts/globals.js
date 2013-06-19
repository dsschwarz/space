var gamejs = require('gamejs');
exports.height = 600;
exports.width  = 800;
exports.mouse_pos = [0, 0];
exports.mouse_pixels = [0, 0];
exports.particles = [];
exports.projectiles = new gamejs.sprite.Group();
exports.planets = new gamejs.sprite.Group();
exports.ships = new gamejs.sprite.Group();
exports.offset = [0, 0];
function get_position(true_pos, center, dim, angle) {
	center = center || [0, 0];
	dim = dim || [0, 0];
	angle = angle || 0;
	if (angle > 360) {
		angle = angle%360;
	} while (angle < 0) {
		angle += 360;
	}
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
exports.get_position = get_position;
exports.groupCollideLine = groupCollideLine;