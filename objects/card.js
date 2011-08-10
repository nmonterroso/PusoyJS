var Card = function(rank, suit) {
  this.rank = rank;
  this.suit = suit;
}

Card.prototype = {
  get_image_filename: function() {
    return this.rank+this.suit+'.png';
  },
  get_rank_value: function() {
    switch (this.rank) {
      case 'j':
        return 11;
      case 'q':
        return 12;
      case 'k':
        return 13;
      case 'a':
        return 14;
      default:
        return this.rank == 2 ? 15 : this.rank;
    }
  },
  get_suit_value: function() {
    switch (this.suit) {
      case 'c':
        return 1;
      case 's':
        return 2;
      case 'h':
        return 3;
      case 'd':
        return 4;
      default:
        return 0;
  },
  is_higher_than: function(card) {
    return this.get_rank_value() > card.get_rank_value() || 
      this.get_suit_value() > card.get_suit_value();
  }
};

exports.Card = Card;
