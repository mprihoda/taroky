# Backbone models
$ ->
  class window.PlayerSlot extends Backbone.Model

    defaults:
      name: "Player"
      licitator: false
      revealing: 0
      score: 0

    licitator: ->
      @get("licitator")

    score: ->
      @get("score")

    revealing: ->
      @get("revealing")

    addScore: (score) ->
      @set({"score": @get("score") + score})

  class window.PlayerSlots extends Backbone.Collection

    model: PlayerSlot
    localStorage: new Store("slots")

    defaultSlots: ->
      new PlayerSlot({name: "Player " + i}) for i in [1..4]

    add: (models, options) ->
      if (_.isArray(models) and (@models.length + models.length <= 4)) or @models.length < 4
        super(models, options)
      else
        log("WARNING: attempting to add player slots above 4, impossible!")

    remove: (models, options) ->
      if options.really?
        super(models, options)
      else
        log("WARNING: attempting to remove player slots, impossible!")

    create: ->
      log("WARNING: attempting to create player slots, impossible!")

    refresh: (models, options) ->
      if models? and (models.length == 4)
        super(models, options)
      else
        # Refresh with default slots, if necessary
        @remove(models,
          really: true
        )
        super(@defaultSlots(), options)

  class window.PlayerSlotView extends Backbone.View

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

    localStorage: new Store("game")

    defaults:
      game_type: 1
      flek: 1
      # Valat announced: 0 - no announcements, 1 - licitator, -1 - anti-licitator team
      valat: 0
      valat_flek: 1
      # Pagat announced: 0 - no announcements, 1 - licitator, -1 - anti-licitator team
      pagat: 0
      pagat_flek: 1
      pagat_played: 0
      result: 0

    jew_score: ->
      -@total_score()

    total_score: ->
      sum_score = (memo, s) -> memo + s.score()
      @slots.reduce sum_score, 0

    licitator_count: ->
      @slots.reduce ((memo, p) ->
        if p.licitator()
          memo + 1
        else
          memo
        ), 0

    base_score: ->
      r = @get("result")
      v = @get("valat")
      if Math.abs(r) == 35
        b = if v * r > 0
          r * 4
        else
          r * 2
        b * @get("valat_flek")
      else if v != 0
        -v * 70 * @get("valat_flek")
      else
        r

    game_score: ->
      @aux_game_score(@team_revealing_score())

    aux_game_score: (rev_score) ->
      sc = @base_score()
      t = @licitator_count()
      kt = 4 - t
      bonus = rev_score[0] - rev_score[1]
      pagat = @pagat_score()
      total = kt * ((sc * @get("game_type") * @get("flek")) + bonus)
      result_t = (pagat[0] + total) / t
      result_kt = (pagat[1] - total) / kt
      @slots.map((p) ->
        if p.licitator()
          result_t
        else
          result_kt
      )

    team_revealing_score: ->
      @slots.reduce ((memo, s) ->
        if s.licitator()
          memo[0] = memo[0] + s.revealing()
          memo
        else
          memo[1] = memo[1] + s.revealing()
          memo
        ), [0, 0]


    pagat_score: ->
      jew = @jew_score()
      pp = @get("pagat_played")
      p = @get("pagat")
      pf = @get("pagat_flek")
      inverse = (inv, score) ->
        if inv == 1 then score else [score[1], score[0]]
      to_winner = (score) ->
        antiscore = if pf > 1 then jew - score else 0
        inverse(pp, [score, antiscore])
      to_announcer = (score) ->
        antiscore = if pf > 1 then jew else 0
        inverse(p, [score, antiscore])
      if p != 0 and pp != p
        to_announcer(-jew * pf)
      else if pp != 0
        k = if p == pp then 1 else 2
        pb = jew / (k / pf)
        to_winner(pb)
      else
        [0, 0]

    # TODO: bind game props to form elements

  class window.GameView extends Backbone.View
    el: $("#main")
    jew_template: _.template $("#jew-template").html()
    events:
      "click #reset": "reset"
      "click #session_reset": "sessionReset"
      "click #process": "process"

    initialize: ->
      slots = new PlayerSlots()
      game = new Game()
      game.slots = slots
      @game = game

      slots.bind("add", @addPlayer)
      slots.bind("refresh", @addAllPlayers)
      slots.bind("all", @render)
      game.bind("all", @render)

      game.fetch()
      slots.fetch()

    render: =>
      @$("#jew").html(@jew_template
        'score': -@playerScore())

    addPlayer: (p) =>
      view = new PlayerSlotView
        model: p
      @$("#player-list").append(view.render().el)

    addAllPlayers: (s) =>
      s.each(@addPlayer)

    playerScore: ->
      s = @game.slots
      sumScore = (memo, p) -> memo + p.get("score")
      sum = s.reduce sumScore, 0
      if sum == 0
        s.each (p) -> p.addScore(-10)
        sum = s.reduce sumScore, 0
      sum

    process: ->
      @game.slots.each (p) -> p.setGameScore(10)

    reset: ->
      @game.slots.each (p) -> p.reset()

    sessionReset: ->
      @game.slots.each (p) -> p.sessionReset()


  window.session = new GameView
