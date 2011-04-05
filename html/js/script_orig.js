/* Author: Michal Prihoda

 */


$(function() {
    window.Player = Backbone.Model.extend({

        defaults: {
            "score": 0,
            "game_score": 0,
            "licitator": false
        },
        licitator: function() {
            this.get("licitator");
        },
        addScore: function(score) {
            this.set({"score": this.get("score") + score});
            return score;
        }
    });

    window.PlayerList = Backbone.Collection.extend({
        model: Player,
        localStorage: new Store("players"),
        initPlayers: function() {
            // If the number of players is not 4, reinit
            if (this.length != 4) {
                this.forEach(function(p) {
                    p.destroy();
                });
                for (var i = 0; i < 4; i++) {
                    var player = new Player({name: "Player " + (i + 1), order: i});
                    this.add(player);
                    player.save();
                }
            }
        },
        comparator: function(player) {
            return player.get('order');
        }
    });

    window.PlayerView = Backbone.View.extend({

        tagName: "li",
        template: _.template($("#player-template").html()),
        events: {
            "click div.player-name" : "edit",
            "keypress .player-name-input" : "updateOnEnter",
            "click .renonc" : "renonc"
        },

        initialize: function() {
            _.bindAll(this, 'render', 'close');
            this.model.bind('change', this.render);
            this.model.view = this;
        },

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            this.setName();
            return this;
        },

        setName: function() {
            var name = this.model.get("name");
            this.$('.player-name').text(name);
            this.input = this.$('.player-name-input');
            this.input.bind('blur', this.close);
            this.input.val(name);
        },

        edit: function() {
            $(this.el).addClass("editing");
            this.input.focus();
        },

        close: function() {
            this.model.save({name: this.input.val()});
            $(this.el).removeClass("editing");
        },

        updateOnEnter: function(e) {
            if (e.keyCode == 13) { this.close(); }
        },

        renonc: function(e) {
            var current = this.model.get("game_score");
            this.model.save({"game_score": current - 20});
        }
    });

    window.Session = Backbone.Model.extend({
        localStorage: new Store("session"),
        initialize: function() {
            var players = new PlayerList();
            players.session = this;
            players.fetch();
            players.initPlayers();


            // Create a view for each player
            players.forEach(function(p) {
                var view = new PlayerView({model: p});
                this.$("#player-list").append(view.render().el);
            });

            this.players = players;
        },

        playerScore: function() {
            return this.players.reduce(function(memo, p) {
                return memo + p.get("score");
            }, 0);
        },

        playerGameScore: function() {
            return this.players.reduce(function(memo, p) {
                return memo + p.get("game_score");
            }, 0);
        }
    });

    window.SessionView = Backbone.View.extend({

        el: $("#main"),
        jew_template: _.template($("#jew-template").html()),

        initialize: function() {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render);
            this.model.view = this;
        },

        render: function() {
            this.$('#jew').html(this.jew_template({
                'name': 'Jew',
                'score': -this.model.playerScore(),
                'game_score': -this.model.playerGameScore()
            }));
        }
    });

    window.session = new Session();
    new SessionView({model: session}).render();
});























