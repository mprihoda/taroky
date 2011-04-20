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
    window.PlayerSlot = (function() {
      function PlayerSlot() {
        PlayerSlot.__super__.constructor.apply(this, arguments);
      }
      __extends(PlayerSlot, Backbone.Model);
      PlayerSlot.prototype.defaults = {
        name: "Player",
        licitator: false,
        revealing: 0,
        score: 0
      };
      PlayerSlot.prototype._game_score = 0;
      PlayerSlot.prototype.licitator = function(v) {
        if (v != null) {
          return this.set({
            "licitator": v
          });
        } else {
          return this.get("licitator");
        }
      };
      PlayerSlot.prototype.score = function() {
        return this.get("score");
      };
      PlayerSlot.prototype.game_score = function(s) {
        if (s != null) {
          this._game_score = s;
          return this.change();
        } else {
          return this._game_score;
        }
      };
      PlayerSlot.prototype.toRender = function() {
        var x;
        x = this.toJSON();
        x['game_score'] = this.game_score();
        return x;
      };
      PlayerSlot.prototype.revealing = function() {
        return this.get("revealing");
      };
      PlayerSlot.prototype.addScore = function(score) {
        return this.save({
          "score": this.get("score") + score
        });
      };
      PlayerSlot.prototype.reset = function() {
        this.game_score(0);
        this.licitator(false);
        return this.set({
          revealing: 0
        });
      };
      PlayerSlot.prototype.sessionReset = function() {
        this.reset();
        return this.set({
          score: 0
        });
      };
      return PlayerSlot;
    })();
    window.PlayerSlots = (function() {
      function PlayerSlots() {
        PlayerSlots.__super__.constructor.apply(this, arguments);
      }
      __extends(PlayerSlots, Backbone.Collection);
      PlayerSlots.prototype.model = PlayerSlot;
      PlayerSlots.prototype.localStorage = new Store("slots");
      PlayerSlots.prototype.defaultSlots = function() {
        var i, _results;
        _results = [];
        for (i = 1; i <= 4; i++) {
          _results.push(new PlayerSlot({
            name: "Player " + i
          }));
        }
        return _results;
      };
      PlayerSlots.prototype.add = function(models, options) {
        if ((_.isArray(models) && (this.models.length + models.length <= 4)) || this.models.length < 4) {
          return PlayerSlots.__super__.add.call(this, models, options);
        } else {
          return log("WARNING: attempting to add player slots above 4, impossible!");
        }
      };
      PlayerSlots.prototype.remove = function(models, options) {
        if (options.really != null) {
          return PlayerSlots.__super__.remove.call(this, models, options);
        } else {
          return log("WARNING: attempting to remove player slots, impossible!");
        }
      };
      PlayerSlots.prototype.create = function() {
        return log("WARNING: attempting to create player slots, impossible!");
      };
      PlayerSlots.prototype.refresh = function(models, options) {
        if ((models != null) && (models.length === 4)) {
          return PlayerSlots.__super__.refresh.call(this, models, options);
        } else {
          this.remove(models, {
            really: true
          });
          return PlayerSlots.__super__.refresh.call(this, this.defaultSlots(), options);
        }
      };
      return PlayerSlots;
    })();
    window.PlayerSlotView = (function() {
      function PlayerSlotView() {
        this.close = __bind(this.close, this);;
        this.render = __bind(this.render, this);;        PlayerSlotView.__super__.constructor.apply(this, arguments);
      }
      __extends(PlayerSlotView, Backbone.View);
      PlayerSlotView.prototype.tagName = "li";
      PlayerSlotView.prototype.template = _.template($("#player-template").html());
      PlayerSlotView.prototype.events = {
        "click div.player-name": "edit",
        "keypress .player-name-input": "updateOnEnter",
        "click .renonc": "renonc",
        "change .licitator": "toggleLicitator",
        "change .hlasky": "updateHlasky"
      };
      PlayerSlotView.prototype.initialize = function() {
        this.model.bind("change", this.render);
        return this.model.view = this;
      };
      PlayerSlotView.prototype.render = function() {
        $(this.el).html(this.template(this.model.toRender()));
        this.setName();
        this.setHlasky();
        return this;
      };
      PlayerSlotView.prototype.setName = function() {
        var name;
        name = this.model.get("name");
        this.$('.player-name .display').text(name);
        this.input = this.$('.player-name-input');
        this.input.bind('blur', this.close);
        return this.input.val(name);
      };
      PlayerSlotView.prototype.setHlasky = function() {
        return this.$('.hlasky').val(this.model.get("revealing"));
      };
      PlayerSlotView.prototype.toggleLicitator = function() {
        return this.model.licitator(!this.model.licitator());
      };
      PlayerSlotView.prototype.updateHlasky = function() {
        return this.model.save({
          revealing: parseInt(this.$('.hlasky').val())
        });
      };
      PlayerSlotView.prototype.edit = function() {
        $(this.el).addClass("editing");
        return this.input.focus();
      };
      PlayerSlotView.prototype.close = function() {
        this.model.save({
          name: this.input.val()
        });
        return $(this.el).removeClass("editing");
      };
      PlayerSlotView.prototype.updateOnEnter = function(e) {
        if (e.keyCode === 13) {
          return this.close();
        }
      };
      PlayerSlotView.prototype.renonc = function(e) {
        return this.model.addScore(-20);
      };
      return PlayerSlotView;
    })();
    window.Game = (function() {
      function Game() {
        Game.__super__.constructor.apply(this, arguments);
      }
      __extends(Game, Backbone.Model);
      Game.prototype.localStorage = new Store("game");
      Game.prototype.defaults = {
        game_name: 1,
        game_type: 1,
        flek: 1,
        valat: 0,
        valat_flek: 1,
        pagat: 0,
        pagat_flek: 1,
        pagat_played: 0,
        result: 0
      };
      Game.prototype.jew_score = function() {
        return -this.total_score();
      };
      Game.prototype.total_score = function() {
        var sum_score;
        sum_score = function(memo, s) {
          return memo + s.score();
        };
        return this.slots.reduce(sum_score, 0);
      };
      Game.prototype.licitator_count = function() {
        return this.slots.reduce((function(memo, p) {
          if (p.licitator()) {
            return memo + 1;
          } else {
            return memo;
          }
        }), 0);
      };
      Game.prototype.base_score = function() {
        var b, r, v;
        r = this.get("result");
        v = this.get("valat");
        if (Math.abs(r) === 35) {
          b = v * r > 0 ? r * 4 : r * 2;
          return b * this.get("valat_flek");
        } else if (v !== 0) {
          return -v * 70 * this.get("valat_flek");
        } else {
          return r;
        }
      };
      Game.prototype.game_score = function() {
        return this.aux_game_score(this.team_revealing_score());
      };
      Game.prototype.aux_game_score = function(rev_score) {
        var bonus, kt, pagat, result_kt, result_t, sc, t, total;
        sc = this.base_score();
        t = this.licitator_count();
        kt = 4 - t;
        bonus = rev_score[0] - rev_score[1];
        pagat = this.pagat_score();
        total = kt * ((sc * this.get("game_type") * this.get("flek")) + bonus);
        result_t = (pagat[0] + total) / t;
        result_kt = (pagat[1] - total) / kt;
        return this.slots.map(function(p) {
          if (p.licitator()) {
            return result_t;
          } else {
            return result_kt;
          }
        });
      };
      Game.prototype.team_revealing_score = function() {
        return this.slots.reduce((function(memo, s) {
          if (s.licitator()) {
            memo[0] = memo[0] + s.revealing();
            return memo;
          } else {
            memo[1] = memo[1] + s.revealing();
            return memo;
          }
        }), [0, 0]);
      };
      Game.prototype.pagat_score = function() {
        var inverse, jew, k, p, pb, pf, pp, to_announcer, to_winner;
        jew = this.jew_score();
        pp = this.get("pagat_played");
        p = this.get("pagat");
        pf = this.get("pagat_flek");
        inverse = function(inv, score) {
          if (inv === 1) {
            return score;
          } else {
            return [score[1], score[0]];
          }
        };
        to_winner = function(score) {
          var antiscore;
          antiscore = pf > 1 ? jew - score : 0;
          return inverse(pp, [score, antiscore]);
        };
        to_announcer = function(score) {
          var antiscore;
          antiscore = pf > 1 ? jew : 0;
          return inverse(p, [score, antiscore]);
        };
        if (p !== 0 && pp !== p) {
          return to_announcer(-jew * pf);
        } else if (pp !== 0) {
          k = p === pp ? 1 : 2;
          pb = jew / (k / pf);
          return to_winner(pb);
        } else {
          return [0, 0];
        }
      };
      Game.prototype.reset = function() {
        this.save({
          "result": 0
        });
        return this.slots.each(function(p) {
          return p.reset();
        });
      };
      Game.prototype.sessionReset = function() {
        this.reset();
        return this.slots.each(function(p) {
          return p.sessionReset();
        });
      };
      return Game;
    })();
    window.GameView = (function() {
      function GameView() {
        this.addAllPlayers = __bind(this.addAllPlayers, this);;
        this.addPlayer = __bind(this.addPlayer, this);;
        this.render = __bind(this.render, this);;        GameView.__super__.constructor.apply(this, arguments);
      }
      __extends(GameView, Backbone.View);
      GameView.prototype.el = $("#main");
      GameView.prototype.jew_template = _.template($("#jew-template").html());
      GameView.prototype.events = {
        "click #reset": "reset",
        "click #session_reset": "sessionReset",
        "click #process": "process",
        "change #game_result": "setResult",
        "change #game_type": "setGameType",
        "change #game_flek": "setGameFlek",
        "change #valat": "setValat",
        "change #valat_flek": "setValatFlek",
        "change #pagat": "setPagat",
        "change #pagat_flek": "setPagatFlek",
        "change #pagat_uhrany": "setPagatUhrany"
      };
      GameView.prototype.initialize = function() {
        var game, slots;
        slots = new PlayerSlots();
        game = new Game();
        game.id = "Main";
        game.slots = slots;
        this.game = game;
        slots.bind("add", this.addPlayer);
        slots.bind("refresh", this.addAllPlayers);
        slots.bind("all", this.render);
        game.bind("all", this.render);
        game.fetch();
        return slots.fetch();
      };
      GameView.prototype.render = function() {
        var gt;
        this.$("#jew").html(this.jew_template({
          score: -this.playerScore()
        }));
        gt = this.renderGameType([this.game.get("game_name"), this.game.get("game_type")]);
        this.$("#game_type").val(gt);
        this.$("#game_result").val(this.game.get("result"));
        this.$("#valat").val(this.game.get("valat"));
        this.$("#valat_flek").val(this.game.get("valat_flek"));
        this.$("#pagat").val(this.game.get("pagat"));
        this.$("#pagat_flek").val(this.game.get("pagat_flek"));
        return this.$("#pagat_uhrany").val(this.game.get("pagat_played"));
      };
      GameView.prototype.addPlayer = function(p) {
        var view;
        view = new PlayerSlotView({
          model: p
        });
        return this.$("#player-list").append(view.render().el);
      };
      GameView.prototype.addAllPlayers = function(s) {
        return s.each(this.addPlayer);
      };
      GameView.prototype.playerScore = function() {
        var s, sum, sumScore;
        s = this.game.slots;
        sumScore = function(memo, p) {
          return memo + p.get("score");
        };
        sum = s.reduce(sumScore, 0);
        if (sum === 0) {
          s.each(function(p) {
            return p.addScore(-10);
          });
          sum = s.reduce(sumScore, 0);
        }
        return sum;
      };
      GameView.prototype.process = function() {
        var i, result, _results;
        result = this.game.game_score();
        _results = [];
        for (i = 0; i <= 3; i++) {
          _results.push(this.game.slots.at(i).game_score(result[i]));
        }
        return _results;
      };
      GameView.prototype.reset = function() {
        return this.game.reset();
      };
      GameView.prototype.sessionReset = function() {
        return this.game.sessionReset();
      };
      GameView.prototype.valToGameInt = function(fid, key) {
        var k, s, v;
        v = parseInt(this.$("#" + fid).val());
        k = key != null ? key : fid;
        s = {};
        s[k] = v;
        return this.game.save(s);
      };
      GameView.prototype.setResult = function() {
        return this.valToGameInt("game_result", "result");
      };
      GameView.prototype.renderGameType = function(v) {
        return v[0] + "-" + v[1];
      };
      GameView.prototype.parseGameType = function(v) {
        return _.map(v.split("-", 2), function(x) {
          return parseInt(x);
        });
      };
      GameView.prototype.setGameType = function() {
        var g, t, _ref;
        _ref = this.parseGameType(this.$("#game_type").val()), g = _ref[0], t = _ref[1];
        return this.game.save({
          game_name: g,
          game_type: t
        });
      };
      GameView.prototype.setGameFlek = function() {
        return this.valToGameInt("game_flek", "flek");
      };
      GameView.prototype.setValat = function() {
        return this.valToGameInt("valat");
      };
      GameView.prototype.setValatFlek = function() {
        return this.valToGameInt("valat_flek");
      };
      GameView.prototype.setPagat = function() {
        return this.valToGameInt("pagat");
      };
      GameView.prototype.setPagatFlek = function() {
        return this.valToGameInt("pagat_flek");
      };
      GameView.prototype.setPagatUhrany = function() {
        return this.valToGameInt("pagat_uhrany", "pagat_played");
      };
      return GameView;
    })();
    return window.session = new GameView;
  });
}).call(this);
