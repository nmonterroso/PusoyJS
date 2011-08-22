var globals = {
  fade_time: 200,
  active_page: 'game_room',
  user_list: [],
  process_user_list: function(users) {
    globals.user_list = users;
    globals.reset_user_list();
  },
  add_user: function(user, user_list, container) {
    user_list = user_list || globals.user_list;
    user_list.push(user);
    globals.reset_user_list(user_list, container);
  },
  remove_user: function(user, user_list, container) {
    user_list = user_list || globals.user_list;

    for (var i in user_list) {
      if (user_list[i].id == user.id) {
        user_list.splice(i, 1);
        globals.reset_user_list(user_list, container);
        break;
      }
    }
  },
  reset_user_list: function(user_list, container) {
    user_list = user_list || globals.user_list;
    container = container || $('#user_list');
    user_list.sort(function(u1, u2) {
      if (!u1.name || !u2.name) {
        return 0;
      }

      return u1.name.localeCompare(u2.name);
    });
    
    container.html('');
    $.each(user_list, function(i, e) {
      if (e.name) {
        container.append("<div class='user'>"+e.name+"</div>");
      }
    });  
  },
  deal_cards: function() {
    if (!p.active_game.cards) {
      return;
    }

    var card, holder = $('#card_holder'), card_li;
    for (var i in p.active_game.cards) {
      card = p.active_game.cards[i];
      card_li = $("<li class='card'><img src='/images/cards/"+card.rank+card.suit+".png' /></li>")
        .appendTo('#card_holder')[0]
      $.data(card_li, 'card_data', card);
    }

    holder
      .sortable({
        revert: 50,
        placeholder: 'card_placeholder',
        forcePlaceholderSize: true,
        tolerance: 'pointer',
        opacity: 0.5
      })
      .disableSelection()
      .find('li.card')
        .live('dblclick', function() {
          $(this).appendTo('#card_drop_target');
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
        .delay(globals.fade_time)
        .focus();
    });
  }
};
