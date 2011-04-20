# Backbone models
$ ->
  class window.PlayerSlot extends Backbone.Model

    defaults:
      name: "Player"
      licitator: false
      revealing: 0
      score: 0

    _game_score: 0

    licitator: (v) ->
      if v?
        @set({"licitator": v})
      else
        @get("licitator")

    score: ->
      @get("score")

    game_score: (s) ->
      if s?
        @_game_score = s
        @change()
      else
        @_game_score

    toRender: ->
      x = @toJSON()
      x['game_score'] = @game_score()
      x

    revealing: ->
      @get("revealing")

    addScore: (score) ->
      @save({"score": @get("score") + score})

    reset: ->
      @game_score(0)
      @licitator(false)
      @set
        revealing: 0

    sessionReset: ->
      @reset()
      @set
        score: 0

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
      "change .licitator": "toggleLicitator"
      "change .hlasky": "updateHlasky"

    initialize: ->
      @model.bind("change", @render)
      @model.view = @

    render: =>
      $(@el).html(@template(@model.toRender()))
      @setName()
      @setHlasky()
      @

    setName: ->
      name = @model.get("name")
      @$('.player-name .display').text(name)
      @input = @$ '.player-name-input'
      @input.bind 'blur', @close
      @input.val name

    setHlasky: ->
      @$('.hlasky').val @model.get("revealing")

    toggleLicitator: ->
      @model.licitator(!@model.licitator())

    updateHlasky: ->
      @model.save
        revealing: parseInt(@$('.hlasky').val())

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
      # Game "name", eg. 0 - Varsava, 1 - Prvni, 2 - Druha, 3 - Preferans, 4 - Solo
      game_name: 1
      # Game "type", means game value, times
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

    reset: ->
      @save({"result": 0})
      @slots.each (p) -> p.reset()

    sessionReset: ->
      @reset()
      @slots.each (p) -> p.sessionReset()

    # TODO: bind game props to form elements

  class window.GameView extends Backbone.View
    el: $("#main")
    jew_template: _.template $("#jew-template").html()
    events:
      "click #reset": "reset"
      "click #session_reset": "sessionReset"
      "click #process": "process"
      "change #game_result": "setResult"
      "change #game_type": "setGameType"
      "change #game_flek": "setGameFlek"
      "change #valat": "setValat"
      "change #valat_flek": "setValatFlek"
      "change #pagat": "setPagat"
      "change #pagat_flek": "setPagatFlek"
      "change #pagat_uhrany": "setPagatUhrany"

    initialize: ->
      slots = new PlayerSlots()
      game = new Game()
      game.id = "Main"
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
        score: -@playerScore()
      )
      gt = @renderGameType([@game.get("game_name"), @game.get("game_type")])
      @$("#game_type").val(gt)
      @$("#game_result").val(@game.get("result"))
      @$("#valat").val(@game.get("valat"))
      @$("#valat_flek").val(@game.get("valat_flek"))
      @$("#pagat").val(@game.get("pagat"))
      @$("#pagat_flek").val(@game.get("pagat_flek"))
      @$("#pagat_uhrany").val(@game.get("pagat_played"))

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
      result = @game.game_score()
      for i in [0..3]
        @game.slots.at(i).game_score(result[i])

    reset: ->
      @game.reset()

    sessionReset: ->
      @game.sessionReset()

    valToGameInt: (fid, key) ->
      v = parseInt(@$("##{ fid }").val())
      k = if key? then key else fid
      s = {}
      s[k] = v
      @game.save s

    setResult: ->
      @valToGameInt("game_result", "result")

    renderGameType: (v) ->
      v[0] + "-" + v[1]

    parseGameType: (v) ->
      _.map(v.split("-", 2), (x) -> parseInt(x))

    setGameType: ->
      [g, t] = @parseGameType(@$("#game_type").val())
      @game.save(
        game_name: g
        game_type: t
      )

    setGameFlek: ->
      @valToGameInt("game_flek", "flek")

    setValat: ->
      @valToGameInt("valat")

    setValatFlek: ->
      @valToGameInt("valat_flek")

    setPagat: ->
      @valToGameInt("pagat")

    setPagatFlek: ->
      @valToGameInt("pagat_flek")

    setPagatUhrany: ->
      @valToGameInt("pagat_uhrany", "pagat_played")

  window.session = new GameView
