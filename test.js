var assert = require('assert'),
  rummy = require('./rummy');

describe("Card", function(){
  it("should score like this", function(){
    var c = new rummy.Card(5, 'a');
    assert.equal(5, c.n);
    assert.equal('a', c.s);
  });
  it("should have good score", function(){
    var c = new rummy.Card(5, 'a');
    assert.equal(5, c.rank());

    var w = new rummy.Card(0, '*');
    assert.equal(0, w.rank());
  });

});

describe("Deck", function(){
  it("should have 54 cards", function(){
    var deck = new rummy.Deck();
    assert.equal(54, deck.size());
    assert.equal(1, deck.cards[0].n);
  });
  it("should shuffle", function(){
    var deck = new rummy.Deck();
    assert.equal(deck.cards[0].n + 1, deck.cards[1].n);
    deck.shuffle();
    var first  = deck.cards[0];
    var second = deck.cards[1];
    assert(first.n + 1 !== second.n || first.s !== second.s, rummy.cardsToString(deck.cards));
  });
});

describe("Game", function(){
  var checkIsFinished = function(cards, expected) {
    cards = cards.map(function(c) {
      return new rummy.Card(c[0], c[1]);
    });
    assert.equal(expected, rummy.isFinished(cards));
  }

  describe("isFinished", function(){
    it("should be true for simple case 1", function(){
      checkIsFinished([
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [3, 'a'],
        [4, 'a'],
        [5, 'a'],
        [0, '*']
      ], true);
    });
    it("should be true for simple case 2", function(){
      checkIsFinished([
        [1, 'a'],
        [1, 'b'],
        [1, 'c'],
        [3, 'a'],
        [4, 'a'],
        [5, 'a'],
        [0, '*'],
        [7, 'a']
      ], true);
    });
    it("should be true for simple case 3", function(){
      checkIsFinished([
        [1, 'a'],
        [1, 'b'],
        [1, 'c'],
        [3, 'a'],
        [4, 'a'],
        [5, 'a'],
        [0, '*'],
        [7, 'a'],
        [7, 'b']
      ], true);
    });
    it("should be true for simple case 4", function(){
      checkIsFinished([
        [1, 'a'],
        [1, 'b'],
        [1, 'c'],
        [3, 'a'],
        [4, 'a'],
        [5, 'a'],
        [0, '*'],
        [7, 'a'],
        [10, 'a']
      ], false);
    });
  });
});