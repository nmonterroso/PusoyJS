var globals = {
  active_page: 'username_prompt',
  user_list: []
};

$(document).ready(function() {
  var fade_time = 200;

  $('#username_prompt').fadeIn(fade_time);
  $('#username_prompt form').submit(function() {
    var username = $.trim($('#username').val());

    if (username == '') {
      globals.error('Please enter a username');
      return false;
    }

    p.socket.emit('set_username', username);
    return false;
  });

  $('#game_room').focus(function() {
    p.socket.emit('get_all_users');
  });

  globals.error = function(message) {
    alert(message);
  };

  globals.transition = function(from, to) {
    from = $('#'+from);
    to = $('#'+to);
    
    from.fadeOut(fade_time, function() {
      to
        .fadeIn(fade_time)
        .delay(fade_time)
        .focus();
    });
  };

  globals.process_user_list = function(users) {
    globals.user_list = users;
    globals.reset_user_list();
  }

  globals.add_user = function(user) {
    globals.user_list.push(user);
    globals.reset_user_list();
  }

  globals.remove_user = function(user) {
    var index = $.inArray(user, globals.user_list);
    if (index != -1) {
      globals.user_list.splice(index, 1);
      globals.reset_user_list();
    }
  }

  globals.reset_user_list = function() {
    globals.user_list.sort();
    $('#user_list').html('');
    for (var i in globals.user_list) {
      $('#user_list').append(globals.user_list[i]+'<br />');
    }
  }
});
