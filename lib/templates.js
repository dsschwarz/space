/**
 * This file contains the template of the objects to be sent to the client on datadump.
 * Each object template should contain only the minimum amount of information the client needs.
 *
 * 
 * TODO - make advanced and simple templates. Complex will only be sent occasionally, and contain all the initialization values too.
 */

exports.Ship = function(orig) {
	base_attr(this, orig);
	this.rotation = orig.rotation;
	this.health = orig.health;
	this.shielded = orig.shielded;
	this.heat = orig.heat;
	this.number = orig.number;
	this.laser = orig.laser;
	return this;
}
exports.Projectile = function(orig) {
	base_attr(this, orig);
	this.rotation = orig.rotation;
	this.ptype = orig.ptype;
	if(orig.ptype === "rocket") {
		this.destination = orig.destination;
		this.speed = orig.speed;
		this.tracking = orig.tracking;
		this.angular_v = orig.angular_v;
	} else if(orig.ptype === "bomb") {
		
	}
	this.number = orig.number;
	return this;
}
exports.Asteroid = function(orig) {
	base_attr(this, orig);
	this.rotation = orig.rotation;
	this.health = orig.health;
	return this;
}
exports.Planet = function(orig) {
	base_attr(this, orig);
	this.radius = orig.radius;
	this.health = orig.health;
	return this;
}
var base_attr = function(that, orig) {
	that._x = orig._x;
	that._y = orig._y;
	that.accelerating = orig.accelerating;
	that.rotating = orig.rotating;
	that.xspeed = orig.xspeed;
	that.yspeed = orig.yspeed;
	return this;
}