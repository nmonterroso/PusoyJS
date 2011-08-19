p.socket = io.connect(window.location.origin);

p.socket.on('connect', function() {

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
      for (var i in this.players) {
        if (players[i].id == id) {
          this.players.splice(i, 1);
          break;
        }
      }
    }
  };

  globals.transition('active_game');
});

p.socket.on('card_deal', function(game_id, cards) {
  if (p.active_game.id != game_id) {
    return;
  }

  console.log(cards);
});
