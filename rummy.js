// Rummy

//
// Card : [1-13, a-d]
//        wild card : [-2 | -1, *]
var Card = function(number, suite) {
  this.n = number;
  this.s = suite;
}

Card.prototype.isWildcard = function() {
  return this.s === '*';
}

Card.prototype.rank = function() {
  return this.s === '*' ? 0
    : this.n > 10 ? 10 : this.n;
}

Card.prototype.toString = function() {
  return '{n: ' + this.n + ', s:' + this.s + '}';
}

function sameNumbers(cards, n, count) {
  // console.log("sameNumbers: [" + n + ':' + count + ']', cardsToString(cards));

  if (cards.length === 0)
    return count >= 3;

  var matched = cards.filter(function(c) {
    return c.n === n || c.isWildcard();
  });

  if (matched.some(function(c) {
    var index = cards.indexOf(c);
    cards.splice(index, 1);
    if (sameNumbers(cards, n, count+1))
      return true;
    cards.push(c);
    return false;
  })) return true;

  return (count >= 3) ? isFinished(cards) : false;
}

function successive(cards, n, s, count) {
  // console.log("successive: [{" + n + ', ' + s + '}:' + count + ']', cardsToString(cards));

  if (cards.length === 0)
    return count >= 3;

  var matched = cards.filter(function(c) {
    return (c.n === n+1 && c.s === s) || s === '*' || c.isWildcard();
  });

  if (matched.some(function(c) {
    var index = cards.indexOf(c);
    cards.splice(index, 1);
    if (successive(cards, n+1, s, count+1))
      return true;
    cards.push(c);
    return false;
  })) return true;

  return (count >= 3) ? isFinished(cards) : false;
}

function isFinished(cds) {
  // console.log('isFinished: ' + cardsToString(cds));

  var cards = cds.slice(1);
  var first = cds[0];

  // Put wildcards to the tail since the isFinished logic can be confused if the wirld card is at head.
  while (first.isWildcard()) {
    cards.push(first);
    first = cards.shift();
  }
 
  return sameNumbers(cards, first.n, 1) || successive(cards, first.n, first.s, 1);
}

function score(cards) {
  return cards.reduce(function(sum, c) { return sum + c.rank(); }, 0);
}

function cardsToString(cards) {
  return cards.length === 0 ? '[]' : cards.reduce(function(prev, c) { return prev + '{' + c.n + ', ' + c.s + '} '; }, '');
}

var Player = function(name) {
  this.name = name;
  this.cards = [];
  this.score = 0;
}

Player.prototype.addCard = function(card) {
  this.cards.push(card);
}

var Deck = function() {
  this.cards = [];
  var self = this;
  ['a', 'b', 'c', 'd'].forEach(function(s) {
    for (var i=1; i<=13; i++)
      self.cards.push(new Card(i, s));
  });
  // 2 wild cards
  this.cards.push(new Card(-1, '*'));
  this.cards.push(new Card(-2, '*'));
}

Deck.prototype.size = function() {
  return this.cards.length;
}

Deck.prototype.shuffle = function() {
  for (var i=0; i<this.cards.length-1; i++) {
    var len = this.cards.length-i-1;
    var pos = parseInt(Math.random() * len + i);
    var t = this.cards[i];
    this.cards[i] = this.cards[pos];
    this.cards[pos] = t;
  }
}

var Game = function(howmany) {
  this.players = [];
  var decks = [];
  for (var i=0; i<howmany; i++) {
    this.players.push(new Player(i));
  }

  for (var i=0; i<parseInt((howmany+1)/2); i++)
    decks.push(new Deck());

  this.deck = decks.reduce(function(arr, deck) { return arr.concat(deck.cards); }, []);
}

Game.prototype.shuffle = function() {
  for (var i=0; i<this.deck.length-1; i++) {
    var len = this.deck.length-i-1;
    var pos = parseInt(Math.random() * len + i);
    var t = this.deck[i];
    this.deck[i] = this.deck[pos];
    this.deck[pos] = t;
  }
}

Game.prototype.deal = function() {
  var self = this;
  for (var i=0; i<13; i++) {
    this.players.forEach(function(player) {
      var card = self.deck.shift();
      player.addCard(card);
    });
  }
}

Game.prototype.setup = function() {
  this.shuffle();
  this.deal();

  this.wildcard = this.deck.shift();
  this.pile = [this.deck.shift()];
}

Game.prototype.play = function() {
  var async = require('async');
  var self = this;
  var firstPlayer = self.players[0];

  console.log(this.players[0].cards);

  if (isFinished(this.players[0].cards)) {
    console.log('Finished!');
    return;
  } else {
    var readline = require('readline');
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('Top of Pile: ' + this.pile[0]);

    // Pick a card or sort the cards
    rl.question("Pick (Deck or Pile) / Sort ? ", function(choice) {
      var card = null;
      if (choice === 'd') {
        console.log('Deck');
        card = self.deck.shift();
      } else if (choice === 'p') {
        console.log('Pile');
        card = self.pile.shift();
      } else if (choice === 's') {
        // sort it, then play again
        firstPlayer.cards.sort();
        rl.close();
        self.play();
        return;
      }
      console.log('Picked card:' + card.toString());
      firstPlayer.cards.unshift(card);
      console.log(firstPlayer.cards);

      // Choose a card to dispose
      rl.question("Which to dispose ? ", function(index) {
        index = parseInt(index);
        card = firstPlayer.cards.splice(index, 1)[0];
        self.pile.unshift(card);

        rl.close();
        self.play();
      });
    });
  }
}

exports.Card = Card;
exports.Player = Player;
exports.Game = Game;
exports.Deck = Deck;
exports.isFinished = isFinished;
exports.cardsToString = cardsToString;