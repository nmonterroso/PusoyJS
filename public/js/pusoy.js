$(document).ready(function() {
  $('.username').text(p.name);

  $('#game_room').focus(function() {
    p.socket.emit('get_all_users');
  });

  $('#active_game').focus(function() {
      $(this).find('h2.page_title').text(p.active_game.name);
      globals.reset_user_list(p.active_game.players, $(this).find('div.user_list'));

      var start_game = $('#start_game')
      if (p.active_game.is_owner) {
        start_game.show();
      } else {
        start_game.hide();
      }
  });

  $('#active_game #start_game').click(function() {
      p.socket.emit('start_game', p.active_game.id);
  });

  $('#create_game').submit(function() {
    var name = $.trim($(this).find("input[name='name']").val());

    if (name == '') {
      globals.error('Please specify a game name!');
    } else {
      p.socket.emit('join_game', name);
    }

    return false;
  });

  $('#card_holder li.card').live('dblclick', function() {
    $(this).appendTo('#card_drop_target');
  });

  $('#card_drop_target li.card').live('dblclick', function() {
    $(this).appendTo('#card_holder');
  });

  $('#send_cards').click(function() {
    p.socket.emit('send_cards', p.active_game.name, globals.get_outgoing_cards());
  });

  $('#pass').click(function() {
    p.socket.emit('pass', p.active_game.name);
  });

  $('#game_room').fadeIn(globals.fade_time).focus();
});
