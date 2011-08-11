var Card = require("./card").Card;

var Deck = function() {
  this.cards = [];

  var suits = ['c', 's', 'h', 'd'];
  var ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'j', 'q', 'k', 'a'];

  for (var i = 0; i < suits.length; ++i) {
    for (var j = 0; j < ranks.length; ++j) {
      this.cards.push(new Card(ranks[j], suits[i]));
    }
  }

  this.cards.sort(function() {
    return Math.round(Math.random()) - 0.5;
  });
}

exports.Deck = Deck;
