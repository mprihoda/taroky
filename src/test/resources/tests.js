
// documentation on writing tests here: http://docs.jquery.com/QUnit
// example tests: https://github.com/jquery/qunit/blob/master/test/same.js

// below are some general tests but feel free to delete them.

module("example tests");
test("HTML5 Boilerplate is sweet",function(){
  expect(1);
  equals("boilerplate".replace("boilerplate","sweet"),"sweet","Yes. HTML5 Boilerplate is, in fact, sweet");
});

// these test things from plugins.js
test("Environment is good",function(){
  expect(3);
  ok( !!window.log, "log function present");

  var history = log.history && log.history.length || 0;
  log("logging from the test suite.");
  equals( log.history.length - history, 1, "log history keeps track" );

  ok( !!window.Modernizr, "Modernizr global is present");
});

module("player tests");
test("Player has zero score upon creation", function() {
    expect(1);
    var player = new PlayerSlot();
    equals(player.get("score"), 0, "Player should have 0 score.");
});

module("Player list tests");
test("Default player list has 4 players", function() {
  equals(new PlayerSlots().defaultSlots().length, 4, "There should be 4 default slots");
});

test("Player slots bootstraps to 4 players", function() {
  var p = new PlayerSlots();
  p.refresh();
  equals(p.length, 4, "Player slots should bootstrap to 4 players");
});

module("game tests");

test("Game should have expected results", function() {

  /**
   * desc: test description
   * game_type, score, flek: sets game type, result, flek
   * licitators: array of booleans size 4, represents player teams - 'checked' and 'unchecked'
   * results: array of size 2, 'checked' and 'unchecked' team expected score
   */
  var g = function(desc, game_type, score, flek, licitators, ann, results) {
    return {'desc': desc, 'game_type': game_type, 'result': score, 'flek': flek, 
      'licitators': licitators, 'results': results, 'announcements': ann};
  };

  // Generate random array of licitators
  var l = function(count) {
    var r = [];
    while (r.length < count) {
      var x = Math.floor(Math.random()*4);
      if (_.indexOf(r, x) == -1) {
        r.push(x);
      }
    }
    log(r);
    var b = [];
    for (i = 0; i < 4; i++) {
      b[i] = (_.indexOf(r, i) != -1);
    }
    return b;
  };

  var inputs = [
    g('Prvni', 1, 5, 1, l(2), [0, 0], [5, -5]),
    g('Prvni alone', 1, 5, 1, l(1), [0, 0], [15, -5]),
    g('Druha', 2, 5, 1, l(2), [0, 0], [10, -10]),
    g('Druha alone', 2, 5, 1, l(1), [0, 0], [30, -10]),
    g('Preferans prvni', 1, 5, 1, l(1), [0, 0], [15, -5]),
    g('Preferans druha', 2, -5, 1, l(1), [0, 0], [-30, 10]),
    g('Preferans treti', 3, 5, 1, l(1), [0, 0], [45, -15]),
    g('Solo', 4, 5, 1, l(1), [0, 0], [60, -20]),
    g('Prvni flek', 1, 5, 2, l(2), [0, 0], [10, -10]),
    g('Prvni hlasky', 1, 5, 1, l(2), [5, 15], [-5, 5]),
    g('Prvni tichy valat', 1, 35, 1, l(2), [0, 0], [70, -70])
  ];

  expect(inputs.length * 4);

  for (i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    var game = new Game({"game_type": input.game_type, "result": input.result, "flek": input.flek});
    var slots = new PlayerSlots();
    slots.refresh();
    for (j = 0; j < 4; j++) {
      slots.at(j).set({"licitator": input.licitators[j]});
    }
    game.slots = slots;
    var actual = game.aux_game_score(input.announcements);
    for (k = 0; k < 4; k++) {
      if (input.licitators[k]) {
        equals(actual[k], input.results[0], "Player " + k + " game result");
      } else {
        equals(actual[k], input.results[1], "Player " + k + " game result");
      }
    }
  }
});

test("Game should return expected revealing announcements", function() {

  var g = function(licit, ann, res) {
    return {"licitators": licit, "announcements": ann, "results": res};
  };

  var inputs = [
    g([true, false, true, false], [0, 5, 15, 5], [15, 10]),
    g([true, true, false, false], [5, 0, 10, 0], [5, 10]),
    g([true, false, false, false], [15, 0, 5, 0], [15, 5]),
    g([false, true, false, false], [5, 0, 5, 5], [0, 15])
  ];

  expect(4);

  for (i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    var game = new Game();
    var slots = new PlayerSlots();
    slots.refresh();
    for (j = 0; j < 4; j++) {
      slots.at(j).set({"licitator": input.licitators[j], "revealing": input.announcements[j]});
    }
    game.slots = slots;
    deepEqual(game.team_revealing_score(), input.results, "Revealing announcements test " + i);
  }
});

test("Game should return valat points properly", function() {
  expect(10);
  // Silent valat
  var game = new Game({"result": 35});
  equal(game.base_score(), 70, "Silent valat should be 70 points");
  game = new Game({"result": -35});
  equal(game.base_score(), -70, "Silent protivalat should be -70 points");
  // Announced valat
  game = new Game({"result": 35, "valat": 1});
  equal(game.base_score(), 140, "Announced successful valat should be 140 points");
  game = new Game({"result": -35, "valat": -1});
  equal(game.base_score(), -140, "Announced successful protivalat should be -140 points");
  game = new Game({"result": 35, "valat": 1, "valat_flek": 2});
  equal(game.base_score(), 280, "Announced successful valat with flek should be 280");
  game = new Game({"result": -35, "valat": -1, "valat_flek": 2});
  equal(game.base_score(), -280, "Announced successful protivalat with flek should be -280");
  // Announced failed valat
  game = new Game({"result": 20, "valat": 1});
  equal(game.base_score(), -70, "Announced failed valat should be -70 points");
  game = new Game({"result": 20, "valat": -1});
  equal(game.base_score(), 70, "Announced failed protivalat should be 70 points");
  // Announced failed with flek
  game = new Game({"result": 5, "valat": 1, "valat_flek": 2});
  equal(game.base_score(), -140, "Announced failed valat with flek should be -140 points");
  game = new Game({"result": 5, "valat": -1, "valat_flek": 2});
  equal(game.base_score(), 140, "Announced failed protivalat with flek should be 140 points");
});

test("Game should return pagat points properly", function() {
  var game_320 = function(attrs) {
    var g = new Game(attrs);
    var slots = new PlayerSlots();
    slots.refresh();
    for (i = 0; i < 4; i++) {
      slots.at(i).set({"score": -80});
    }
    g.slots = slots;
    return g;
  };
  var game = game_320();
  equal(game.jew_score(), 320, "When all players are -80, jew should be 320");
  // Silent pagat
  game = game_320({"pagat_played": 1});
  deepEqual(game.pagat_score(), [160, 0], "On silent pagat, team that played it should receive half of jew, the other nothing.");
  game = game_320({"pagat_played": -1});
  deepEqual(game.pagat_score(), [0, 160], "On silent pagat, team that played it should receive half of jew, the other nothing.");
  // Announced pagat, successful
  game = game_320({"pagat_played": 1, "pagat": 1});
  deepEqual(game.pagat_score(), [320, 0], "Announced pagat - jew goes to winner.");
  game = game_320({"pagat_played": -1, "pagat": -1});
  deepEqual(game.pagat_score(), [0, 320], "Announced pagat - jew goes to winner.");
  game = game_320({"pagat_played": 1, "pagat": 1, "pagat_flek": 2});
  deepEqual(game.pagat_score(), [640, -320], "Announced pagat with flek - jew goes to winner twice, loser pays");
  game = game_320({"pagat_played": -1, "pagat": -1, "pagat_flek": 2});
  deepEqual(game.pagat_score(), [-320, 640], "Announced pagat with flek - jew goes to winner twice, loser pays");
  // Announced pagat, failed
  game = game_320({"pagat_played": 0, "pagat": 1});
  deepEqual(game.pagat_score(), [-320, 0], "Announced failed pagat - loser pays");
  game = game_320({"pagat_played": -1, "pagat": 1});
  deepEqual(game.pagat_score(), [-320, 0], "Announced failed pagat - loser pays");
  game = game_320({"pagat_played": 0, "pagat": -1});
  deepEqual(game.pagat_score(), [0, -320], "Announced failed pagat - loser pays");
  game = game_320({"pagat_played": 1, "pagat": -1});
  deepEqual(game.pagat_score(), [0, -320], "Announced failed pagat - loser pays");
  // failed with flek
  game = game_320({"pagat_played": 0, "pagat": 1, "pagat_flek": 2});
  deepEqual(game.pagat_score(), [-640, 320], "Announced failed pagat with flek - jew goes to winner, loser pays");
  game = game_320({"pagat_played": -1, "pagat": 1, "pagat_flek": 2});
  deepEqual(game.pagat_score(), [-640, 320], "Announced failed pagat with flek - jew goes to winner, loser pays");
  game = game_320({"pagat_played": 0, "pagat": -1, "pagat_flek": 2});
  deepEqual(game.pagat_score(), [320, -640], "Announced failed pagat with flek - jew goes to winner, loser pays");
  game = game_320({"pagat_played": 1, "pagat": -1, "pagat_flek": 2});
  deepEqual(game.pagat_score(), [320, -640], "Announced failed pagat with flek - jew goes to winner, loser pays");
});

test("When game type is 'Druha', pagat must be set", function() {
  expect(3);
  var game = new Game();
  equal(game.pagat(), 0, "Default pagat announcement is set to none.");
  game.set({"game_name": 2, "game_type": 2});
  equal(game.pagat(), 1, "With 'druhá' pagat is set to the licitator side.");
  game.set({"game_name": 3, "game_type": 1});
  equal(game.pagat(), 0, "When 'treti' takes over, the pagat is re-set to none.");
});

test("Game should count Varsava correctly", function() {
  expect(6);

  var game_v = function(scores) {
    var g = new Game({"game_name": 0, "game_type": 1});
    var slots = new PlayerSlots();
    slots.refresh();
    for (i = 0; i < 4; i++) {
      slots.at(i).game_score(scores[i]);
    }
    g.slots = slots;
    return g;
  };

  var game = game_v([10, 10, 25, 25]);
  equal(game.valid(), true, "Game should be valid when sum of scores is 70");
  deepEqual(game.game_score(), [-10, -10, -25, -25], "Game score should match the input");

  game = game_v([10, 10, 20, 2]);
  equal(game.valid(), false, "Game should be invalid when sum of scores is not 70");

  game = game_v([10, 10, 50, 0]);
  deepEqual(game.game_score(), [-20, -20, -100, 0], "Game score should match the input 2 times");
  game = game_v([10, 60, 0, 0]);
  deepEqual(game.game_score(), [-40, -240, 0, 0], "Game score should match the input 4 times");
  game = game_v([70, 0, 0, 0]);
  deepEqual(game.game_score(), [-560, 0, 0, 0], "Game score should match the input 8 times");

});

module("GameView tests");
test("GameView should parse game type and value from options", function() {
  deepEqual(session.parseGameType("1-1"), [1, 1]);
  deepEqual(session.parseGameType("2-3"), [2, 3]);
  equal(session.renderGameType([1, 1]), "1-1");
  equal(session.renderGameType([2, 3]), "2-3");
});

module("History tests");
test("History should init with default line", function() {
  expect(1);
  var hist = new History();
  deepEqual(hist.toArray(hist.defaultLine()), [-10, -10, -10, -10, 40], "First history line should always be 4 times -10 and 40 in jew");
});
