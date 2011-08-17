var EventEmitter = require("events").EventEmitter;

module.exports = new EventEmitter();

module.exports.bind = function(app) {
  app.get('/', function(req, res) {
    if (!req.session.username) {
      res.redirect('/login');
      return;
    }

    res.render('index', {
      locals: {
        username: req.session.username
      }
    });
  });

  app.get('/login', function(req, res) {
      if (req.session.username) {
        res.redirect('/');
      } else {
        res.render('username_prompt');
      }
  });

  app.post('/login', function(req, res) {
    if (req.body.username && req.body.username.length > 0) {
      req.session.username = req.body.username;
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  });

  return app;
}

setTimeout(function() {
  module.exports.emit('ready');
}, 10);
