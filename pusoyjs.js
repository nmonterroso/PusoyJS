
/**
 * Module dependencies.
 */
require('ejs');
var express = require('express'),
  app = module.exports = express.createServer(),
  io = require("socket.io").listen(app),
  session_store = new express.session.MemoryStore();

// Configuration

app.configure(function(){
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
  app.use(express.cookieParser());
  app.use(express.session({
    secret: "Pu$0Yi$4w3s0m3", 
    key: 'express.sid',
    store: session_store,
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
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