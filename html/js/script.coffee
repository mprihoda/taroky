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
        @save({"licitator": v})
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

    revealing: ->
      @get("revealing")

    addScore: (score) ->
      @save({"score": @get("score") + score})

    reset: ->
      @game_score(0)
      @licitator(false)
      @save
        revealing: 0

    sessionReset: ->
      @reset()
      @save
        score: 0

    commit: ->
      @addScore(@game_score())
      @game_score(0)

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

    commit: ->
      @.each((s) -> s.commit())
      @trigger("commit")

  class window.PlayerSlotView extends Backbone.View

    events:
      "click .player-name": "edit"
      "keypress .player-name-input": "updateOnEnter"
      "click .renonc": "renonc"
      "change .licitator": "toggleLicitator"
      "change .hlasky": "updateHlasky"
      "change .game-score": "updateGameScore"

    initialize: (options) ->
      order = if options? and options.order? then options.order else 1
      @el = $("#player#{ order }")
      @delegateEvents()
      @model.bind("all", @render)
      @model.view = @

    render: =>
      @setName()
      @setHlasky()
      @setLicitator()
      @setScore()
      @setGameScore()
      @

    setName: ->
      name = @model.get("name")
      @$('.player-name .display').text(name)
      @input = @$ '.player-name-input'
      @input.bind 'blur', @close
      @input.val name

    setHlasky: ->
      @$('.hlasky').val @model.get("revealing")

    setLicitator: ->
      if @model.licitator()
        @$('.licitator').attr('checked', 'checked')
      else
        @$('.licitator').removeAttr('checked')

    setScore: ->
      @$('.player-score').text(@model.get("score"))

    setGameScore: ->
      @$('.game-score').val(@model.game_score())

    toggleLicitator: ->
      @model.licitator(!@model.licitator())

    updateHlasky: ->
      @model.save
        revealing: parseInt(@$('.hlasky').val())

    updateGameScore: ->
      @model.game_score(parseInt(@$('.game-score').val()))

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
      # FIXME: breaks Law of Demeter
      @model.collection.trigger("commit")

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

    pagat: ->
      if @get("game_name") == 2
        1
      else
        @get("pagat")

    pagat_score: ->
      jew = @jew_score()
      pp = @get("pagat_played")
      p = @pagat()
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
      @save(@defaults)
      @slots.each (p) -> p.reset()

    sessionReset: ->
      @reset()
      @slots.each (p) -> p.sessionReset()

    process: ->
      result = @game_score()
      for i in [0..3]
        @slots.at(i).game_score(result[i])

    commit: ->
      @slots.commit()
      @reset()

  class window.HistoryLine extends Backbone.Model

    defaults:
      p1: 0
      p2: 0
      p3: 0
      p4: 0
      jew: 0

  class window.History extends Backbone.Collection

    model: HistoryLine
    localStorage: new Store("history")

    defaultLine: ->
      @fromArray([-10, -10, -10, -10, 40])

    fromArray: (a) ->
      new HistoryLine
        p1: a[0]
        p2: a[1]
        p3: a[2]
        p4: a[3]
        jew: a[4]

    toArray: (h) ->
      [h.get("p1"), h.get("p2"), h.get("p3"), h.get("p4"), h.get("jew")]

    arrayAt: (i) ->
      @toArray(@at(i))

    refresh: (models, options) ->
      if models? and (models.length > 0)
        super(models, options)
      else
        l = @defaultLine()
        r = super(l, options)
        l.save()
        r

    clear: ->
      _.each(@models.slice(), (m) -> m.destroy())
      @refresh()

  class window.HistoryView extends Backbone.View

    el: $(".history")

    initialize: (options) ->
      if options? and options.game?
        @game = options.game
        @game.slots.bind("refresh", @renderNames)
        @game.slots.bind("refresh", @bindslots)
        @game.slots.bind("commit", @commit)
      @table = @$("table")
      @model = new History
      @model.bind("refresh", @render)
      @model.bind("add", @addRow)

      @model.fetch()

    renderNames: =>
      for i in [1..4]
        @$("#p#{ i }").text(@game.slots.at(i - 1).get("name"))

    render: =>
      $("tr.data", @table).remove()
      @model.each((r) => @addRow(r))

    addRow: (r) =>
      @getRow(@model.toArray(r)).appendTo(@table)

    getRow: (values) ->
      cells = _.reduce(_.map(values, (s) -> "<td>#{s}</td>"), ((m, t) -> m + t), "")
      $("<tr class='data'>#{cells}</tr>")

    bindslots: =>
      @game.slots.each (s) ->
        s.bind("change:name", @renderName)

    commit: =>
      values = []
      for i in [0..3]
        values[i] = @game.slots.at(i).get("score")
      values[4] = @game.jew_score()
      l = @model.fromArray(values)
      @model.add(l)
      l.save()

    sessionReset: ->
      @model.clear()

  class window.GameView extends Backbone.View
    el: $("#container")
    events:
      "click #reset": "reset"
      "click #session_reset": "sessionReset"
      "click #process": "process"
      "click #commit": "commit"
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
      @hist = new HistoryView
        game: game

      slots.bind("add", @addPlayer)
      slots.bind("refresh", @addAllPlayers)
      slots.bind("all", @render)
      game.bind("all", @render)

      game.fetch()
      slots.fetch()

    render: =>
      @$("#jew .player-score").text(-@playerScore())
      gt = @renderGameType([@game.get("game_name"), @game.get("game_type")])
      @$("#game_type").val(gt)
      @$("#game_result").val(@game.get("result"))
      @$("#valat").val(@game.get("valat"))
      @$("#valat_flek").val(@game.get("valat_flek"))
      @$("#pagat").val(@game.pagat())
      if @game.get("game_name") == 2
        @$("#pagat").attr("disabled", "disabled")
      else
        @$("#pagat").removeAttr("disabled")
      @$("#pagat_flek").val(@game.get("pagat_flek"))
      @$("#pagat_uhrany").val(@game.get("pagat_played"))

    addPlayer: (p, o) =>
      view = new PlayerSlotView
        model: p
        order: o
      view.render()

    addAllPlayers: (s) =>
      for i in [1..4]
        @addPlayer(s.at(i-1), i)

    playerScore: ->
      s = @game.slots
      sumScore = (memo, p) -> memo + p.get("score")
      sum = s.reduce sumScore, 0
      if sum == 0
        s.each (p) -> p.addScore(-10)
        sum = s.reduce sumScore, 0
      sum

    process: ->
      @game.process()

    commit: ->
      @game.commit()

    reset: ->
      @game.reset()

    sessionReset: ->
      @hist.sessionReset()
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
