var EventEmitter = require('events').EventEmitter;
var Pusoy = require('./objects/pusoy').Pusoy;
var games_list = {};
var users = {};

module.exports = new EventEmitter();

module.exports.bind = function(io) {
  io.sockets.on('connection', function(socket) {
    socket.on('set_session', function(session_id) {
      var user = get_socket_user_from_session(session_id);
      if (user == null) {
        users[session_id] = { sid: session_id, socket: socket };
        socket.set('session_id', session_id, function() {});
      } else {
        users[session_id].socket = socket;
        socket.set('session_id', user.sid, function() {});
      }
    });

    socket.on('set_username', function(name) {
      get_socket_user(socket, function(user) {
        if (user == null) {
          socket.emit('error', {'message': 'Unable to set username'});
          return;
        }

        users[user.sid].name = name;
      });
    });

    socket.on('disconnect', function() {
      get_socket_user(socket, function(user) {
        if (user != null) {
          delete users[user.sid];
        }
      });
    });

    socket.on('get_data', function() {
      get_socket_user(socket, function(user) {
        if (user == null) {
          socket.emit('error', {'message': 'Unable to get user data'});
          return;
        }

        socket.emit('data_dump', { sid: user.sid, name: user.name });
      });
    });

    socket.on('start_game', function() {
      if (Object.keys(users).length == 1) {
        socket.emit('error', {'message': 'no one to play with :('});
        return;
      }

      var players = [];
      for (var sid in users) {
        players.push(sid);
      }

      var p = new Pusoy(players);
      var user;

      for (var i in players) {
        user = get_socket_user_from_session(players[i]);
        if (user != null) {
          user.socket.emit('data_dump', p);
        }
      }
    });
  });
}

var get_socket_user_from_session = function(session_id) {
  if (typeof users[session_id] != 'undefined') {
    return users[session_id];
  }

  return null;
}

var get_socket_user = function(socket, callback) {
  socket.get('session_id', function(err, sid) {
    if (sid != null && typeof users[sid] != 'undefined')  {
      callback(users[sid]);
    } else {
      callback(null);
    }
  });
}

setTimeout(function() {
  module.exports.emit('ready');
}, 10);
