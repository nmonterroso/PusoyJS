var EventEmitter = require("events").EventEmitter;

module.exports = new EventEmitter();

module.exports.bind = function(app) {
  app.get('/', function(req, res) {
    res.render('index', {
      layout: false,
      locals: {
        sess_id: req.sessionID
      }
    });
  });

  return app;
}

setTimeout(function() {
  module.exports.emit('ready');
}, 10);
