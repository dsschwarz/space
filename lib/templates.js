/**
 * This file contains the template of the objects to be sent to the client on datadump.
 * Each object template should contain only the minimum amount of information the client needs.
 *
 * 
 * TODO - make advanced and simple templates. Complex will only be sent occasionally, and contain all the initialization values too.
 */

exports.Ship = function(orig) {
	this._x = orig._x;
	this._y = orig._y;
	this.accelerating = orig.accelerating;
	this.rotating = orig.rotating;
	this.xspeed = orig.xspeed;
	this.yspeed = orig.yspeed;
	this.rotation = orig.rotation;
	this.health = orig.health;
	this.shielded = orig.shielded;
	this.heat = orig.heat;
}