var Hand = require("./hand").Hand;

var Player = function(id, name) {
  this.id = id;
  this.name = name;
  this.cards = [];
}

Player.prototype = {
  give_cards: function(cards) {
    for (var i = 0; i < cards.length; ++i) {
      this.cards.push(cards[i]);
    }
  },
  get_cards: function() {
    return new Hand(this.cards);
  },
  use_cards: function(card_list) {
    var index;

    for (var i in card_list) {
      index = this.get_card_index(card_list[i]);
      if (index != -1) {
        this.cards[index].is_used = true;
      }
    }
  },
  card_count: function() {
    var count = 0;
    for (var i in this.cards) {
      if (!this.cards[i].is_used) {
        ++count;
      }
    }

    return count;
  },
  has_card: function(card) {
    var index = this.get_card_index(card);

    if (index == -1) {
      return false;
    }

    return this.cards[index].is_used == false;
  },
  get_card_index: function(card) {
    for (var i = 0; i < this.cards.length; ++i) {
      if (this.cards[i].equals(card)) {
        return i;
      }
    }

    return -1;
  },
  get_lowest_card: function() {
    var card = new Hand(this.cards).get_lowest_card();
    return card;
  },
  get_data: function(all_data) {
    all_data = all_data || false;
    var p = {
      id: this.id,
      name: this.name
    }
    
    if (all_data) {
      p.cards = this.cards;
    }

    return p;
  }
};

exports.Player = Player;
