/* Author: Michal Příhoda

*/


var Player = Backbone.Model.extend({
    initialize: function() {
        this.set({"score": 0});
    }
});

var Session = Backbone.Model.extend({
    initialize: function() {
        this.players = new Array();
        for (var i = 0; i < 4; i++) {
            this.players[i] = new Player({name: "Player " + (i + 1)});
        }
    }
});























