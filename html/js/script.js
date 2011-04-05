(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  $(function() {
    window.Player = (function() {
      function Player() {
        Player.__super__.constructor.apply(this, arguments);
      }
      __extends(Player, Backbone.Model);
      Player.prototype.defaults = {
        score: 0,
        game_score: 0,
        licitator: false
      };
      Player.prototype.licitator = function() {
        return this.get("licitator");
      };
      Player.prototype.addScore = function(score) {
        this.save({
          score: this.get("score") + score
        });
        return score;
      };
      Player.prototype.setGameScore = function(score) {
        this.set({
          game_score: score
        });
        return score;
      };
      Player.prototype.reset = function() {
        return this.save({
          game_score: 0
        });
      };
      Player.prototype.sessionReset = function() {
        return this.save({
          game_score: 0,
          score: 0
        });
      };
      return Player;
    })();
    window.PlayerList = (function() {
      function PlayerList() {
        PlayerList.__super__.constructor.apply(this, arguments);
      }
      __extends(PlayerList, Backbone.Collection);
      PlayerList.prototype.model = Player;
      PlayerList.prototype.localStorage = new Store("players");
      PlayerList.prototype.fetch = function() {
        var i, p, player, _i, _len, _results;
        PlayerList.__super__.fetch.apply(this, arguments);
        if (this.length !== 4) {
          for (_i = 0, _len = this.length; _i < _len; _i++) {
            p = this[_i];
            p.destroy();
          }
          _results = [];
          for (i = 0; i <= 3; i++) {
            player = new Player({
              name: "Player " + (i + 1),
              order: i
            });
            this.add(player);
            _results.push(player.save());
          }
          return _results;
        }
      };
      PlayerList.prototype.comparator = function(player) {
        return player.get('order');
      };
      return PlayerList;
    })();
    window.Players = new PlayerList;
    window.PlayerView = (function() {
      function PlayerView() {
        this.close = __bind(this.close, this);;
        this.render = __bind(this.render, this);;        PlayerView.__super__.constructor.apply(this, arguments);
      }
      __extends(PlayerView, Backbone.View);
      PlayerView.prototype.tagName = "li";
      PlayerView.prototype.template = _.template($("#player-template").html());
      PlayerView.prototype.events = {
        "click div.player-name": "edit",
        "keypress .player-name-input": "updateOnEnter",
        "click .renonc": "renonc"
      };
      PlayerView.prototype.initialize = function() {
        this.model.bind("change", this.render);
        return this.model.view = this;
      };
      PlayerView.prototype.render = function() {
        $(this.el).html(this.template(this.model.toJSON()));
        this.setName();
        return this;
      };
      PlayerView.prototype.setName = function() {
        var name;
        name = this.model.get("name");
        this.$('.player-name .display').text(name);
        this.input = this.$('.player-name-input');
        this.input.bind('blur', this.close);
        return this.input.val(name);
      };
      PlayerView.prototype.edit = function() {
        $(this.el).addClass("editing");
        return this.input.focus();
      };
      PlayerView.prototype.close = function() {
        this.model.save({
          name: this.input.val()
        });
        return $(this.el).removeClass("editing");
      };
      PlayerView.prototype.updateOnEnter = function(e) {
        if (e.keyCode === 13) {
          return this.close();
        }
      };
      PlayerView.prototype.renonc = function(e) {
        return this.model.addScore(-20);
      };
      return PlayerView;
    })();
    window.Game = (function() {
      function Game() {
        Game.__super__.constructor.apply(this, arguments);
      }
      __extends(Game, Backbone.Model);
      Game.prototype.defaults = {
        game_type: 1,
        valat: 0,
        pagat: 0,
        result: 0
      };
      return Game;
    })();
    window.SessionView = (function() {
      function SessionView() {
        this.addAllPlayers = __bind(this.addAllPlayers, this);;
        this.addPlayer = __bind(this.addPlayer, this);;
        this.render = __bind(this.render, this);;        SessionView.__super__.constructor.apply(this, arguments);
      }
      __extends(SessionView, Backbone.View);
      SessionView.prototype.el = $("#main");
      SessionView.prototype.jew_template = _.template($("#jew-template").html());
      SessionView.prototype.events = {
        "click #reset": "reset",
        "click #session_reset": "sessionReset",
        "click #process": "process"
      };
      SessionView.prototype.initialize = function() {
        Players.bind("add", this.addPlayer);
        Players.bind("refresh", this.addAllPlayers);
        Players.bind("all", this.render);
        return Players.fetch();
      };
      SessionView.prototype.render = function() {
        return this.$("#jew").html(this.jew_template({
          'score': -this.playerScore(),
          'game_score': -this.playerGameScore()
        }));
      };
      SessionView.prototype.addPlayer = function(p) {
        var view;
        view = new PlayerView({
          model: p
        });
        return this.$("#player-list").append(view.render().el);
      };
      SessionView.prototype.addAllPlayers = function(ps) {
        return ps.each(this.addPlayer);
      };
      SessionView.prototype.playerScore = function() {
        var sum, sumScore;
        sumScore = function(memo, p) {
          return memo + p.get("score");
        };
        sum = Players.reduce(sumScore, 0);
        if (sum === 0) {
          Players.each(function(p) {
            return p.addScore(-10);
          });
          sum = Players.reduce(sumScore, 0);
        }
        return sum;
      };
      SessionView.prototype.playerGameScore = function() {
        var sumScore;
        sumScore = function(memo, p) {
          return memo + p.get("game_score");
        };
        return Players.reduce(sumScore, 0);
      };
      SessionView.prototype.process = function() {
        return Players.each(function(p) {
          return p.setGameScore(10);
        });
      };
      SessionView.prototype.reset = function() {
        return Players.each(function(p) {
          return p.reset();
        });
      };
      SessionView.prototype.sessionReset = function() {
        return Players.each(function(p) {
          return p.sessionReset();
        });
      };
      return SessionView;
    })();
    return window.session = new SessionView;
  });
}).call(this);
