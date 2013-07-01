




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

io.set('log level', 1);

$socket = require('./socket')
  , gamejs = require('./lib/gamejs')
  , globals = require('./lib/globals')
  , $v = require('./lib/gamejs/utils/vectors')
  , $m = require('./lib/gamejs/utils/math')
  , $g = require('./lib/globals')
  , base = require('./lib/base')
  , $ship = require('./lib/ship')
  , $planet = require('./lib/planet')
  , $asteroid = require('./lib/asteroid')
  , $p = require('./lib/projectile')
  , $bomb = require('./lib/bomb')
  , $rocket = require('./lib/rocket')
  , $player = require('./player')
  , templates = require('./lib/templates')

app.get('/', routes.index);
app.get('/map', game.map);


for (var i = 10; i >= 0; i--) {
  $g.asteroids.add(new $asteroid.Asteroid([$g.width*Math.random(), $g.height*Math.random()]));
};

for (var j=0;j<3;j++) {
  $g.planets.add(new $planet.Planet([0,0]));
}
var timer = 0;
var ontick = function () {
	var msDuration = (Date.now() - TIMER_LASTCALL);
	TIMER_LASTCALL = Date.now();
  $g.projectiles.update(msDuration);
	$g.asteroids.update(msDuration);
	$g.ships.update(msDuration);

  timer += msDuration;
  if (timer > 200) {
    timer = 0;
    datadump();
  }
  
};
setInterval(ontick, 10);
var TIMER_LASTCALL = Date.now();

var datadump = function(){
  var ships = []
    , asteroids = []
    , projectiles = []
    , planets = [];
  $g.ships.forEach(function(ship) {
    ships.push(new templates.Ship(ship));
  });
  $g.asteroids.forEach(function(asteroid) {
    asteroids.push(new templates.Asteroid(asteroid));
  });
  $g.planets.forEach(function(planet) {
    planets.push(new templates.Planet(planet));
  });
  $g.projectiles.forEach(function(projectile) {
    projectiles.push(new templates.Projectile(projectile));
  });
  io.sockets.clients().forEach(function (socket) {
    if ($socket.isPlaying(socket)) {
      socket.emit('datadump', {
        number: $socket.current_player(socket).number,
        ships: ships,
        asteroids: asteroids,
        projectiles: projectiles,
        planets: planets});
    }
  });
}

io.on('connection', $socket.io);

server.listen(3000);