p.socket = io.connect(window.location.origin);

p.socket.on('connect', function() {

});

p.socket.on('set_id', function(id) {
  p.id = id;
});

p.socket.on('data_dump', function(data) {
  console.log(data);
});

p.socket.on('error', function(e) {
  globals.error(e.message);
});

p.socket.on('user_list', function(users) {
  globals.process_user_list(users);
});

p.socket.on('add_user', function(user) {
  globals.add_user(user);
});

p.socket.on('remove_user', function(user) {
  globals.remove_user(user);
});

p.socket.on('player_joined', function(game_id, user) {
  if (game_id != p.active_game.id) {
    return;
  }

  p.active_game.players.push(user);
  globals.reset_user_list(p.active_game.players, $('#active_game .user_list'));
});

p.socket.on('player_left', function(game_id, user_id) {
  p.active_game.remove_user(user_id);
  globals.reset_user_list(p.active_game.players, $('#active_game .user_list'));
});

p.socket.on('game_joined', function(game_id, name, players, is_owner) {
  p.active_game = {
    id: game_id,
    name: name,
    players: players,
    is_owner: is_owner,
    remove_user: function(id) {
      var i = this.get_user_index(id);
      if (i === false) {
        return;
      }

      this.players.splice(i, 1);
    },
    get_user: function(id) {
      var i = this.get_user_index(id);
      if (i === false) {
        return false;
      }

      return this.players[i];
    },
    get_user_index: function(id) {
      for (var i in this.players) {
        if (this.players[i].id == id) {
          return i;
        }
      }

      return false;
    }
  };

  globals.transition('active_game');
});

p.socket.on('card_deal', function(game_id, cards) {
  if (p.active_game.id != game_id) {
    return;
  }
  
  $('#pre_game').hide();
  $('#game').show();
  p.active_game.cards = cards.cards;
  globals.deal_cards();
});

p.socket.on('turn_notification', function(player_id, last_play) {
  var buttons = $('.active_turn_button');

  if (player_id == p.id) {
    buttons.removeAttr('disabled');
  } else {
    buttons.attr('disabled', 'disabled');
  }

  if (last_play && p.active_game.active_player) {
    var last_user = p.active_game.get_user(p.active_game.active_player);
    if (last_play != 'pass') {
      globals.set_last_play(last_user, last_play);
    }
  }

  globals.set_active_player(player_id);
});

p.socket.on('game_over', function(winner_id) {
  var winner = p.active_game.get_user(winner_id);
  if (winner) {
    message = winner.id == p.id ? "THE WINNER IS YOU" : winner.name+" won teh gaimz. maybe you shouldn't suck next time :(";
    alert(message);
  }
});
