$(document).ready(function() {
  var fade_time = 200;

  $('.username').text(p.name);

  $('#game_room').focus(function() {
    p.socket.emit('get_all_users');
  });

  $('#create_game').submit(function() {
    var name = $.trim($(this).find("input[name='name']").val());
    if (name == '') {
      globals.error('Please specify a game name!');
    }

    p.socket.emit('join_game', name);
    return false;
  });

  $('#game_room').fadeIn(fade_time).focus();
});
