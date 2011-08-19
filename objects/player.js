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
  use_cards: function(cards) {
    var index;
    var delete_queue = [];
    
    for (var i = 0; i < cards.length; ++i) {
      index = this.get_card_index(card);
      if (index != -1) {
        delete_queue.push(index);
      }
    }

    for (var i = 0; i < delete_queue.length; ++i) {
      this.cards.splice(delete_queue[i], 1);
    }
  },
  has_card: function(card) {
    return get_card_index(card) != -1;
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
