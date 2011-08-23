var Card = require("./card").Card;
var Hand = require("./hand").Hand;
var Deck = require("./deck").Deck;
var Player = require("./player").Player;

var Pusoy = function() {
  this.deck = new Deck();
  this.players = [];
  this.accept_type = Pusoy.ACCEPT_TYPES.ANY;
  this.has_started = false;
}

Pusoy.CARDS_PER_PLAYER_1V1 = 17;
Pusoy.MIN_PLAYERS = 2;
Pusoy.MAX_PLAYERS = 10;

Pusoy.ACCEPT_TYPES = {
  ANY: 0,
  SINGLES: 1,
  PAIRS: 2,
  HANDS: 3
};

Pusoy.prototype = {
  add_player: function(user) {
    this.players.push(new Player(user.id, user.name));
  },
  remove_player: function(user) {
    for (var i in this.players) {
      if (this.players[i].id == user.id) {
        this.players.splice(i, 1);
        break;
      }
    }

    return;
  },
  start_game: function() {
    if (this.players.length < Pusoy.MIN_PLAYERS) {
      throw "Not enough players!";
    } else if (this.players.length > Pusoy.MAX_PLAYERS) {
      throw "Too many players!";
    } else if (this.has_started) {
      throw "Game is already in progress!";
    }

    this.deal_cards();
    this.active_player = this.get_player_with_lowest_card();
    this.last_active_player = this.active_player;
    this.has_started = true;
    this.first_turn = true;
    this.hand_to_beat = false;
  },
  deal_cards: function() {
    var cards_per_player;
    var pickup_cards;

    switch (this.players.length) {
      case 2:
        cards_per_player = Pusoy.CARDS_PER_PLAYER_1V1;
        pickup_cards = 1;
        break;
      default:
        cards_per_player = Math.floor(this.deck.cards.length / this.players.length);
        pickup_cards = this.deck.cards.size % this.players.length;
        break;
    }

    var offset = 0;
    for (var i = 0; i < this.players.length; ++i) {
      this.players[i].give_cards(this.deck.cards.slice(offset, cards_per_player + offset));
      offset += cards_per_player;
    }

    this.pickup_cards = this.deck.cards.slice(-pickup_cards);
  },
  pass: function(player_id) {
    if (this.active_player != player_id) {
      return { error: "It's not your turn!" };
    } else if (this.first_turn) {
      return { error: "You can't pass on the first turn!" };
    } else if (this.accept_type == Pusoy.ACCEPT_TYPES.ANY) {
      return { error: "You can't pass after everyone else has passed!" };
    }

    this.set_next_player(player_id, false);
    if (this.active_player == this.last_active_player) {
      this.accept_type = Pusoy.ACCEPT_TYPES.ANY;
      this.hand_to_beat = false;
    }

    return { error: false };
  },
  play_cards: function(player_id, incoming_cards) {
    var player = this.get_player(player_id),
        cards = [],
        card, hand, hand_type;

    if (this.active_player != player_id) {
      return { error: "It's not your turn!" };
    }

    var is_valid, player_has_card;
    for (var i in incoming_cards) {
      card = new Card(incoming_cards[i].rank, incoming_cards[i].suit);
      is_valid = card.is_valid();
      player_has_card = player.has_card(card);

      if (!is_valid || !player_has_card) {
        return { error: 'Invalid card' };
      }

      cards.push(card);
    }

    hand = new Hand(cards);
    hand_type = this.get_hand_type(hand);

    if (hand.type == Hand.TYPE_INVALID || (this.accept_type != Pusoy.ACCEPT_TYPES.ANY && 
        hand_type != this.accept_type)) {
      return { error: 'Invalid hand' };
    } else if (this.first_turn && !hand.contains(this.lowest_card)) {
      return { error: 'You must start the game with the lowest card!' };
    } else if (this.hand_to_beat && !hand.is_higher_than(this.hand_to_beat)) {
      return { error: 'You must beat the hand!' };
    }

    this.first_turn = false;
    this.hand_to_beat = hand;
    this.use_player_cards(player_id, cards);
    this.accept_type = hand_type;
    this.set_next_player(player_id, true);

    return { error: false, is_win: this.get_player(player_id).card_count() == 0 };
  },
  set_next_player: function(last_player, set_last_active) {
    set_last_active = set_last_active || false;

    if (set_last_active) {
      this.last_active_player = last_player;
    }

    var found_player = false;
    for (var i = 0; i < this.players.length; ++i) {
      if (found_player) {
        this.active_player = this.players[i].id;
        break;
      } else if (this.players[i].id == last_player) {
        found_player = true;
      } 
      
      if (i == this.players.length - 1 && found_player) {
        i = -1;
      }
    }
  },
  get_hand_type: function(hand) {
    switch (hand.cards.length) {
      case 1:
        return Pusoy.ACCEPT_TYPES.SINGLES;
      case 2:
        return Pusoy.ACCEPT_TYPES.PAIRS;
      default:
        return Pusoy.ACCEPT_TYPES.HANDS;
    }
  },
  get_player_cards: function(id) {
    var player = this.get_player(id);
    return player.get_cards();
  },
  use_player_cards: function(player_id, cards) {
    for (var i in this.players) {
      if (this.players[i].id == player_id) {
        this.players[i].use_cards(cards);
        return;
      }
    }
  },
  get_player_with_lowest_card: function() {
    var index = -1;
    
    for (var i = 0; i < this.players.length; ++i) {
      if (index == -1 || this.players[index].get_lowest_card().is_higher_than(this.players[i].get_lowest_card())) {
        this.lowest_card = this.players[i].get_lowest_card();
        index = i;
      }
    }

    return this.players[index].id;
  },
  get_player: function(id) {
    for (var i in this.players) {
      if (this.players[i].id == id) {
        return this.players[i];
      }
    }

    return false;
  },
  get_player_list: function(all_data) {
    all_data = all_data || false;
    var player_list = [], player;

    for (var i in this.players) {
      player = this.players[i];
      player_list.push(player.get_data(all_data));
    }

    return player_list;
  }
}

exports.Pusoy = Pusoy;
