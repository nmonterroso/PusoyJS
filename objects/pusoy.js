var Card = require("./card").Card;
var Hand = require("./hand").Hand;
var Deck = require("./deck").Deck;
var Player = require("./player").Player;

var Pusoy = function(players, observers) {
  this.deck = new Deck();
  this.players = [];
  this.observers = observers || [];
  this.accept_type = Pusoy.ACCEPT_TYPES.ANY;

  for (var i = 0; i < players.length; ++i) {
    this.players.push(new Player(players[i]));
  }

  this.deal_cards();
  this.active_player = this.get_player_with_lowest_card();
  this.last_active_player = this.active_player;
}

Pusoy.CARDS_PER_PLAYER_1V1 = 17;
Pusoy.MAX_PLAYERS = 10;

Pusoy.ACCEPT_TYPES = {
  ANY: 0,
  SINGLES: 1,
  PAIRS: 2,
  HANDS: 3
};

Pusoy.prototype = {
  deal_cards: function() {
    var cards_per_player;
    var pickup_cards;

    switch (this.players.length) {
      case 2:
        cards_per_player = Pusoy.CARDS_PER_PLAYER_1V1;
        pickup_cards = 1;
        break;
      default:
        cards_per_player = Math.floor(this.deck.cards.size / this.players.length);
        pickup_cards = this.deck.cards.size % this.players.length;
    }

    var offset = 0;
    for (var i = 0; i < this.players.length; ++i) {
      this.players[i].give_cards(this.deck.cards.slice(offset, cards_per_player + offset));
      offset += cards_per_player;
    }

    this.pickup_cards = this.deck.cards.slice(-pickup_cards);
  },
  get_player_with_lowest_card: function() {
    var index = -1;

    for (var i = 0; i < this.players.length; ++i) {
      if (index == -1 || this.players[index].get_lowest_card().is_higher_than(this.players[i].get_lowest_card())) {
        index = i;
      }
    }

    return index;
  }
}

exports.Pusoy = Pusoy;
