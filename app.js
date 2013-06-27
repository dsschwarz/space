
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , game = require('./routes/game')
  , http = require('http')
  , path = require('path')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.set("view options", { layout: false});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


socket = require('./socket')
  , gamejs = require('./lib/gamejs')
  , globals = require('./lib/globals')
  , $v = require('./lib/gamejs/utils/vectors')
  , $g = require('./lib/globals')
  , base = require('./lib/base')
  , $ship = require('./lib/ship')
  , $planet = require('./lib/planet')
  , $asteroid = require('./lib/asteroid')
  , $p = require('./lib/projectile')
  , bomb = require('./lib/bomb')
  , rocket = require('./lib/rocket')
  , $player = require('./player');

app.get('/', routes.index);
app.get('/map', game.map);

var ship = new $ship.Ship([100, 100]);
$g.ships.add(ship);

var ontick = function () {
	$g.mouse_pos = $v.add($g.mouse_pixels, $g.offset)
	var msDuration = (Date.now() - TIMER_LASTCALL);
	TIMER_LASTCALL = Date.now();

	$g.projectiles.update(msDuration);
	$g.planets.update(msDuration);
	$g.ships.update(msDuration);
};
setInterval(ontick, 10);
var TIMER_LASTCALL = Date.now();



io.on('connection', socket.io);

server.listen(3000);