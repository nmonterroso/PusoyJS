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
    var user_container;
    $.each(user_list, function(i, e) {
      if (e.name && e.id) {
        user_container = $("<div class='user'>"+e.name+"</div>").appendTo(container)[0];
        $.data(user_container, 'user_data', e);
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
        grid: [15, 20],
        opacity: 0.25
      })
      .disableSelection()
  },
  set_active_player: function(active_player_id) {
    var data;
    $('#active_game .user_list .user').each(function(i, e) {
      data = $.data(e, 'user_data');
      if (data.id == active_player_id) {
        p.active_game.active_player = active_player_id;
        $(e).addClass('active');
      } else {
        $(e).removeClass('active');
      }
    });
  },
  set_last_play: function(user, cards) {
    $('#last_active_player').text(user.name+' played');
    var html = "", card;

    for (var i in cards) {
      card = cards[i];
      html += "<li class='card'><img src='/images/cards/"+card.rank+card.suit+".png' /></li>";
    }

    $('#card_holder, #current_play').find('ul.card_sortable li.card').each(function(i, e) {
      var card_data = $.data(e, 'card_data');
      for (var j in cards) {
        if (card_data.rank == cards[j].rank && card_data.suit == cards[j].suit) {
          $(e).remove();
        }
      }
    });

    $('#card_last_play').html(html);
  },
  get_outgoing_cards: function() {
    var cards = [];
    $('ul#card_drop_target li.card').each(function(i, e) {
      cards.push($.data(e, 'card_data'));
    });
    return cards;
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
