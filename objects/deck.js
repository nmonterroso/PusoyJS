var Card = require("./card").Card;

var Deck = function() {
  this.cards = [];

  var suits = ['c', 's', 'h', 'd'],
      ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'j', 'q', 'k', 'a'],
      ordered = [];

  for (var i = 0; i < suits.length; ++i) {
    for (var j = 0; j < ranks.length; ++j) {
      ordered.push(new Card(ranks[j], suits[i]));
    }
  }

  var num_cards = ordered.length;
  while (this.cards.length < num_cards) {
    var index = Math.floor(Math.random()*ordered.length);
    this.cards.push(ordered[index]);
    ordered.splice(index, 1);
  }
}

exports.Deck = Deck;
