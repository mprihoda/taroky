page_title = "Score Card for Taroky"

flek = (id) ->
  select id: "#{id}", class: "flek", ->
    option value: '1', "1x"
    option value: '2', "2x"
    option value: '4', "4x"
    option value: '8', "8x"
    option value: '16', "16x"

zavazujici = (id) ->
  select id: "#{id}", class: "zavazujici", ->
    option value: '1', "Pro"
    option value: '0', "Bez"
    option value: '-1', "Proti"

player_row = (id) ->
  li id: "player#{id}", ->
    input class: 'licitator', type: 'checkbox'
    div class: 'player-name', ->
      div class: 'display'
      div class: 'edit', ->
        input class: 'player-name-input', type: 'text', value: ''
    div class: 'field', ->
      select class: 'hlasky', ->
        option value: '0', "0"
        option value: '5', "5"
        option value: '10', "10"
        option value: '15', "15"
        option value: '20', "20"
    div class: 'field', ->
      input class: 'game-score', size: '5', type: 'number'
    div class: 'player-score', "0"
    div class: 'actions', ->
      input class: 'renonc', type: 'button', value: 'R'

doctype 5
# paulirish.com/2008/conditional-stylesheets-vs-css-hacks-answer-neither/
comment """[if lt IE 7]>
<html class="no-js ie6" lang="en"> <![endif]"""
comment """[if IE 7]>
<html class="no-js ie7" lang="en"><![endif]"""
comment """[if IE 8]>
<html class="no-js ie8" lang="en"><![endif]"""
comment '[if (gte IE 9)|!(IE)]<!'
html class: 'no-js', lang: 'en', ->
  comment "<![endif]"
  head ->
    meta charset: 'utf-8'
    ###
    Always force latest IE rendering engine (even in intranet) & Chrome Frame
    Remove this if you use .htaccess
    ###
    meta content: 'IE=edge,chrome=1', 'http-equiv': 'X-UA-Compatible'
    title page_title
    meta content: page_title, name: 'description'
    meta content: 'Michal Příhoda', name: 'author'
    # Mobile viewport optimized: j.mp/bplateviewport
    meta content: 'width=device-width, initial-scale=1.0', name: 'viewport'
    ###
      Place favicon.ico & apple-touch-icon.png in the root of your domain
      and delete these references
    ###
    link href: '/favicon.ico', rel: 'shortcut icon'
    link href: '/apple-touch-icon.png', rel: 'apple-touch-icon'
    # CSS: implied media="all"
    link href: 'css/style.css', rel: 'stylesheet'
    # Uncomment if you are specifically targeting less enabled mobile browsers
    # link ref: 'stylesheet', media: 'handheld', href: 'css/handheld.css?v=2'
    # All JavaScript at the bottom, except for Modernizr which enables HTML5 elements & feature detects
    script src: 'js/libs/modernizr-1.7.min.js'
  body ->
    div id: 'container', ->
      header ->
        h1 "Počítadlo Taroků"
        div class: 'actions', ->
          input id: 'reset', type: 'reset', value: 'Reset'
          input id: 'session_reset', type: 'reset', value: 'New'
      section id: 'main', ->
        div id: 'game-state', ->
          div id: 'game', ->
            h2 "Hra"
            select id: 'game_type', ->
              option value: "0-1", "Varšava"
              option value: "1-1", "První"
              option value: "2-2", "Druhá"
              option value: "3-1", "Preferans prvá"
              option value: "3-2", "Preferans druhá"
              option value: "3-3", "Preferans třetí"
              option value: "4-4", "Sólo"
            flek "game_flek"
          div id: "valat_ann", ->
            h2 "Valát"
            zavazujici "valat"
            flek "valat_flek"
          div id: "pagat_ann", ->
            h2 "Pagát"
            zavazujici "pagat"
            flek "pagat_flek"
            zavazujici "pagat_uhrany"
        div id: 'players', ->
          ul id: 'player-list', ->
            li id: 'jew', ->
              input class: 'licitator', disabled: 'disabled', type: 'checkbox'
              div class: 'player-name', ->
                div class: 'display', "Žid"
              div class: 'field', ->
                select class: 'hlasky', disabled: 'disabled', ->
                  option value: '0', "0"
                  option value: '20', "20"
              div class: 'field', ->
                input id: 'game_result', size: '5', type: 'number'
              span class: 'player-score', "0"
              div class: 'actions', ->
                input id: 'process', type: 'button', value: 'Spočítej'
                input id: 'commit', type: 'button', value: 'Přičti'
            player_row("1")
            player_row("2")
            player_row("3")
            player_row("4")
      section id: 'history', ->
        table ->
          tr class: 'names', ->
            th id: 'p1', "Player 1"
            th id: 'p2', "Player 2"
            th id: 'p3', "Player 3"
            th id: 'p4', "Player 4"
            th id: 'j', "Žid"
    # JavaScript at the bottom for fast page loading
    # Grab Google CDN's jQuery, with a protocol relative URL; fall back to local if necessary
    script src:'//ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.js'
    script """
      window.jQuery || document.write("<script src='js/libs/jquery-1.5.1.min.js'>\\x3C/script>")
    """
    # Additional libraries
    script src: 'js/mylibs/underscore.js'
    script src: 'js/mylibs/backbone.js'
    script src: 'js/mylibs/backbone-localstorage.js'
    # scripts concatenated and minified via ant build script
    script src: 'js/plugins.js'
    script src: 'js/script.js'
    comment """[if lt IE 7]>
      <script src='js/libs/dd_belatedpng.js'></script>
      <script>
        DD_belatedPNG.fix("img, .png_bg"); // Fix any <img> or .png_bg bg-images. Also, please read goo.gl/mZiyb
      </script>
    <![endif]"""
    script """
      var _gaq=[["_setAccount","UA-XXXXX-X"],["_trackPageview"]];
      (function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];g.async=1;
      g.src=("https:"==location.protocol?"//ssl":"//www")+".google-analytics.com/ga.js";
      s.parentNode.insertBefore(g,s)}(document,"script"));
    """
