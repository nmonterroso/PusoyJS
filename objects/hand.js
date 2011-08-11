var Hand = function(cards) {
  this.cards = cards;
  this.size = cards.length;
  this.sort_cards();
  this.set_type();
}

Hand.TYPE_INVALID = 0;
Hand.TYPE_SINGLE = 1;
Hand.TYPE_PAIR = 2;
Hand.TYPE_STRAIGHT = 3;
Hand.TYPE_FLUSH = 4;
Hand.TYPE_FULL_HOUSE = 5;
Hand.TYPE_QUADS = 6;
Hand.TYPE_STRAIGHT_FLUSH = 7;

Hand.prototype = {
  is_playable: function() {
    return this.type != TYPE_INVALID;
  },
  is_higher_than: function(hand) {
    if (this.type == hand.type) {
      return this.get_highest_card().is_higher_than(hand.get_highest_card());
    }

    return this.type > hand.type;
  },
  get_lowest_card: function() {
    return this.cards[0];
  },
  get_highest_card: function() {
    return this.cards[this.size - 1];
  },
  sort_cards: function() {
    this.cards.sort(function(c1, c2) {
      var rank_diff = c1.get_rank_value() - c2.get_rank_value();
      var suit_diff = c1.get_suit_value() - c2.get_suit_value();

      return rank_diff != 0 ? rank_diff : suit_diff;
    });
  },
  set_type: function() {
    if (this.size == 1) {
      this.type = Hand.TYPE_SINGLE;
    } else if (this.size == 2 && this.cards[0].get_rank_value() == this.cards[1].get_rank_value()) {
      this.type = Hand.TYPE_PAIR;
    } else if (this.size == 5) {
      if (this.is_straight()) {
        if (this.is_flush()) {
          this.type = Hand.TYPE_STRAIGHT_FLUSH;
        } else {
          this.type = Hand.TYPE_STRAIGHT;
        }
      } else if (this.is_flush()) {
        this.type = Hand.TYPE_FLUSH;
      } else if (this.is_full_house()) {
        this.type = Hand.TYPE_FULL_HOUSE;
      } else if (this.is_quads()) {
        this.type = Hand.TYPE_QUADS;
      } else {
        this.type = Hand.TYPE_INVALID;
      }
    } else {
      this.type = Hand.TYPE_INVALID;
    }
  },
  is_straight: function() {
    var starting_value = this.cards[0].get_rank_value();

    for (var i = 1; i < this.size; ++i) {
      if (this.cards[i].get_rank_value() != starting_value + i) {
        return false;
      }
    }

    return true;
  },
  is_flush: function() {
    var starting_suit = this.cards[0].get_suit_value();

    for (var i = 1; i < this.size; ++i) {
      if (this.cards[i].get_suit_value() != starting_suit) {
        return false;
      }
    }

    return true;
  },
  is_full_house: function() {
    var starting_pair = this.cards[0].get_rank_value() == this.cards[1].get_rank_value();
    var ending_pair = this.cards[3].get_rank_value() == this.cards[4].get_rank_value();

    return starting_pair && ending_pair && (this.cards[2].get_rank_value() == this.cards[1].get_rank_value() ||
        this.cards[2].get_rank_value() == this.cards[3].get_rank_value());
  },
  is_quads: function() {
    if (this.cards[0].get_rank_value() == this.cards[1].get_rank_value() &&
        this.cards[0].get_rank_value() == this.cards[2].get_rank_value() &&
        this.cards[0].get_rank_value() == this.cards[3].get_rank_value()) {
          return true;
    } else if (this.cards[1].get_rank_value() == this.cards[2].get_rank_value() &&
        this.cards[1].get_rank_value() == this.cards[3].get_rank_value() &&
        this.cards[1].get_rank_value() == this.cards[4].get_rank_value()) {
      return true;
    }

    return false;
  },
};

exports.Hand = Hand;
