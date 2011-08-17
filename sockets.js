var EventEmitter = require('events').EventEmitter,
  Pusoy = require('./objects/pusoy').Pusoy,
  user_list = {},
  next_uid = 0;

module.exports = new EventEmitter();

module.exports.init_session = function(io, session_store) {
  var parseCookie = require('connect').utils.parseCookie;
  var Session = require('connect').middleware.session.Session;

  io.set('authorization', function (data, accept) {
    if (data.headers.cookie) {
      data.cookie = parseCookie(data.headers.cookie);
      data.sessionID = data.cookie['express.sid'];
      data.sessionStore = session_store;
      session_store.get(data.sessionID, function(err, session) {
        if (err) {
          accept(err.message, false);
        } else {
          data.session = new Session(data, session);
          accept(null, true);
        }
      });
    } else {
      return accept('no cookie', false);
    }
  });
};


module.exports.bind = function(io) {
  io.sockets.on('connection', function(socket) {
    var sid = socket.handshake.sessionID,
        session = socket.handshake.session;

    socket.join(sid);
    if (user_list[sid]) {
      ++user_list[sid].active_connections;
    } else {
      user_list[sid] = {
        id: get_uid(sid),
        name: session.username || 'unknown_user',
        active_connections: 1
      };
      socket.broadcast.emit('add_user', get_user(sid, false));
    }

    socket.on('disconnect', function() {
      if (user_list[sid]) {
        --user_list[sid].active_connections;
        if (user_list[sid].active_connections <= 0) {
          socket.broadcast.emit('remove_user', get_user(sid, false));
          delete user_list[sid];
        }
      }
    });

    socket.on('get_all_users', function() {
      var users = [];
      for (var session_id in user_list) {
        if (session_id != sid) {
          users.push(get_user(session_id, false));
        }
      }

      socket.emit('user_list', users);
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

var get_uid = function(session_id) {
  if (user_list[session_id]) {
    return user_list[session_id].id;
  }

  return ++next_uid;
}

var get_user = function(session_id, get_all) {
  get_all = get_all || false;

  if (user_list[session_id]) {
    if (get_all) {
      return user_list[session_id];
    } 

    return {
      id: user_list[session_id].id,
      name: user_list[session_id].name
    };
  }

  return false;
}

var get_sockets = function(io, session_id) {
  if (user_list[session_id]) {
    return io.sockets.in(session_id);
  }

  return false;
}

setTimeout(function() {
  module.exports.emit('ready');
}, 0);
