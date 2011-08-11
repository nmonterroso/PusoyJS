p.socket = io.connect(window.location.origin);

p.socket.on('connect', function() {
  p.socket.emit('set_session', p.sid);
});

p.socket.on('data_dump', function(data) {
  console.log(data);
});

p.socket.on('error', function(e) {
  globals.error(e.message);
});

p.socket.on('saved_username', function(name) {
  p.name = name;
  $('#username').val(p.name);
  $('.username').text(p.name);

  if (name != null) {
    globals.transition('username_prompt', 'game_room');
  }
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
