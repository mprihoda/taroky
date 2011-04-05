# Backbone models
$ ->
  class window.Player extends Backbone.Model

    defaults:
      score: 0
      game_score: 0
      licitator: false

    licitator: ->
      @get("licitator")

    addScore: (score) ->
      @save({score: @get("score") + score})
      # TODO: should this return the whole score?
      score

    setGameScore: (score) ->
      @set({game_score: score})
      score

    reset: ->
      @save({game_score: 0})

    sessionReset: ->
      @save
        game_score: 0
        score: 0

  class window.PlayerList extends Backbone.Collection

    model: Player

    localStorage: new Store("players")

    fetch: ->
      super
      if (@length != 4)
        p.destroy() for p in this
        for i in [0..3]
          player = new Player
            name: "Player #{i + 1}"
            order: i
          @add(player)
          player.save()

    comparator: (player) ->
      player.get('order')

  window.Players = new PlayerList

  class window.PlayerView extends Backbone.View

    tagName: "li"
    template: _.template($("#player-template").html())
    events:
      "click div.player-name": "edit"
      "keypress .player-name-input": "updateOnEnter"
      "click .renonc": "renonc"

    initialize: ->
      @model.bind("change", @render)
      @model.view = @

    render: =>
      $(@el).html(@template(@model.toJSON()))
      @setName()
      @

    setName: ->
      name = @model.get("name")
      @$('.player-name .display').text(name)
      @input = @$ '.player-name-input'
      @input.bind 'blur', @close
      @input.val name

    edit: ->
      $(@el).addClass "editing"
      @input.focus()

    close: =>
      @model.save
        name: @input.val()
      $(@el).removeClass "editing"

    updateOnEnter: (e) ->
      @close() if e.keyCode == 13

    renonc: (e) ->
      @model.addScore -20

  class window.Game extends Backbone.Model

    defaults:
      game_type: 1
      valat: 0
      pagat: 0
      result: 0

    # TODO: bind game props to form elements

  class window.SessionView extends Backbone.View
    el: $("#main")
    jew_template: _.template $("#jew-template").html()
    events:
      "click #reset": "reset"
      "click #session_reset": "sessionReset"
      "click #process": "process"

    initialize: ->
      Players.bind("add", @addPlayer)
      Players.bind("refresh", @addAllPlayers)
      Players.bind("all", @render)

      Players.fetch()

    render: =>
      @$("#jew").html(@jew_template
        'score': -@playerScore()
        'game_score': -@playerGameScore())

    addPlayer: (p) =>
      view = new PlayerView
        model: p
      @$("#player-list").append(view.render().el)

    addAllPlayers: (ps) =>
      ps.each(@addPlayer)

    playerScore: ->
      sumScore = (memo, p) -> memo + p.get("score")
      sum = Players.reduce sumScore, 0
      if sum == 0
        Players.each (p) -> p.addScore(-10)
        sum = Players.reduce sumScore, 0
      sum

    playerGameScore: ->
      sumScore = (memo, p) -> memo + p.get("game_score")
      Players.reduce sumScore, 0

    process: ->
      Players.each (p) -> p.setGameScore(10)

    reset: ->
      Players.each (p) -> p.reset()

    sessionReset: ->
      Players.each (p) -> p.sessionReset()


  window.session = new SessionView
