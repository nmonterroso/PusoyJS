var EventEmitter = require('events').EventEmitter,
    Pusoy = require('./objects/pusoy').Pusoy,
    user_list = {},
    game_list = {},
    next_uid = 0,
    next_gid = 0;

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
        session = socket.handshake.session,
        interval_id = setInterval(function() {
          session.reload(function() {
            session.touch().save();
          });
        }, 60*1000);

    socket.join(sid);
    if (!user_list[sid]) {
      user_list[sid] = {
        id: get_uid(sid),
        name: session.username || 'unknown_user',
      };
      socket.broadcast.emit('add_user', get_user(sid, false));
    }

    socket.on('disconnect', function() {
      var sockets = get_sockets(io, sid);
      
      leave_game(io, sid);
      if (user_list[sid] && sockets.length == 1) {
        socket.broadcast.emit('remove_user', get_user(sid, false));
        delete user_list[sid];
        clearInterval(interval_id);
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

    socket.on('join_game', function(game_name) {
      var game = get_game(game_name, sid),
          user = get_user(sid),
          sockets = get_sockets(io, game.channel_id);

      if (game.pusoy.has_started) {
        socket.emit('error', { message: "Can't join game \""+game_name+"\", it's already in progress" });
        return;
      }

      socket.join(game.channel_id);
      game_list[game.name].pusoy.add_player(user);
      user_list[sid].game = game.name;

      if (sockets) {
        var s, 
            u = get_user(sid, false), 
            player_list = [];

        for (var i in sockets) {
          s = sockets[i];
          s.emit('player_joined', game.id, u);
        }
      }

      socket.emit('game_joined', game.id, game.name, game.pusoy.get_player_list(), game.owner == sid);
    });

    socket.on('start_game', function(game_id) {
      var user = get_user(sid, true);
      if (!user.game) {
        socket.emit('error', { message: 'ERROR: No game for you found' });
        return;
      }

      var game = get_game(user.game),
          sockets = get_sockets(io, game.channel_id);
      if (game.owner != sid || !sockets) {
        socket.emit('error', { message: 'ERROR: You are not the game owner or no one is connected?' });
        return;
      }

      try {
        game_list[game.name].pusoy.start_game();
      } catch (e) {
        socket.emit('error', { message: e });
        return;
      }

      for (var i in sockets) {
        var user = get_user(sockets[i].handshake.sessionID, false);
        sockets[i].emit('card_deal', game.id, game.pusoy.get_player_cards(user.id));
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

var get_game = function(game_name, as_session) {
  if (!game_list[game_name]) {
    var gid = ++next_gid;

    game_list[game_name] = {
      id: gid,
      name: game_name,
      channel_id: 'game_'+gid,
      owner: as_session,
      pusoy: new Pusoy()
    };
  }

  return game_list[game_name];
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

var get_sockets = function(io, room_name) {
  var sockets = io.sockets.clients(room_name);
  return !sockets || sockets.length == 0 ? false : sockets;
}

var leave_game = function(io, sid) {
  var user = get_user(sid, true);

  if (!user.game) {
    return;
  }

  var game = get_game(user.game),
      sockets = get_sockets(io, game.channel_id);

  game_list[game.name].pusoy.remove_player(user);

  if (sockets) {
    for (var i in sockets) {
      sockets[i].emit('player_left', game.id, user.id);
    }

    if (game.pusoy.players.length <= 0) {
      delete game_list[game.name];
    }
  }

  delete user_list[sid].game;
}

setTimeout(function() {
  module.exports.emit('ready');
}, 0);
