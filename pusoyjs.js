
/**
 * Module dependencies.
 */
require('ejs');
var express = require('express'),
    connect = require('connect'),
    app = module.exports = express.createServer(),
    io = require("socket.io").listen(app),
    RedisStore = require('connect-redis')(express),
    session_store = new RedisStore({
      host: '127.0.0.1',
      port: 6379
    });


// Configuration
app.configure(function() {
  app.set('listen_port', 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('view options', {
    layout: false,
    open: '{%',
    close: '%}'
  });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));

  app.use(express.cookieParser());
  app.use(express.session({
    secret: "Pu$0Yi$4w3s0m3", 
    store: session_store,
    key: 'express.sid'
  }));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
var routes = require("./routes");
routes.on('ready', function() {
  app = routes.bind(app);
  app.listen(app.settings.listen_port);
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

var sockets = require('./sockets');
sockets.on('ready', function() {
  sockets.init_session(io, session_store);
  sockets.bind(io);
});
