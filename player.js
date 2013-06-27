counter = 0;
var Player = function(name){
	this.name = name || "Imanoob";
	this.number = counter++;
};
exports.Player = Player;