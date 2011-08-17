var globals = {
  fade_time: 200,
  active_page: 'game_room',
  user_list: [],
  process_user_list: function(users) {
    globals.user_list = users;
    globals.reset_user_list();
  },
  add_user: function(user) {
    globals.user_list.push(user);
    globals.reset_user_list();
  },
  remove_user: function(user) {
    for (var i in globals.user_list) {
      if (globals.user_list[i].id == user.id) {
        globals.user_list.splice(i, 1);
        globals.reset_user_list();
        break;
      }
    }
  },
  reset_user_list: function() {
    globals.user_list.sort(function(u1, u2) {
      if (!u1.name || !u2.name) {
        return 0;
      }

      return u1.name.localeCompare(u2.name);
    });
    
    $('#user_list').html('');
    $.each(globals.user_list, function(i, e) {
      if (e.name) {
        $('#user_list').append("<div class='user'>"+e.name+"</div>");
      }
    });  
  },
  error: function(message) {
    alert(message);
  },
  transition: function(to, from) {
    from = from || globals.active_page;
    globals.active_page = to;
    from = $('#'+from);
    to = $('#'+to);

    from.fadeOut(globals.fade_time, function() {
      to
        .fadeIn(globals.fade_time)
        .delay(fade_time)
        .focus();
    });
  }
};
