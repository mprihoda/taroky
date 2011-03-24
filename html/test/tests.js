
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
  log("logging from the test suite.")
  equals( log.history.length - history, 1, "log history keeps track" )
  
  ok( !!window.Modernizr, "Modernizr global is present")
});

module("session tests");
test("Session has 4 players upon creation", function() {
    expect(1);
    var session = new Session;
    equals(session.players.length, 4, "Session has 4 players.");
});

module("player tests");
test("Player has zero score upon creation", function() {
    expect(1);
    var player = new Player;
    equals(player.get("score"), 0, "Player has 0 score, indeed.");
})



