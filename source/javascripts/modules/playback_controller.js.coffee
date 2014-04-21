
app.define 'playback_controller', (require) ->
  start: ->

    playback = require('playback')
    player = require('player')
    keys = require('keys')

    $('#playback-start').on 'click', -> playback.start()
    $('#playback-stop').on  'click', -> playback.stop()

    keys.filter((x) -> x == 71).onValue -> playback.start()
    keys.filter((x) -> x == 72).onValue -> playback.stop()

    playback.state.onValue($('#playback-start'), 'prop', 'disabled')
    playback.state.not().onValue($('#playback-stop'), 'prop', 'disabled')

    currentItem = player.position.map('.0').skipDuplicates().log()
    player.position.map(([a, b]) -> "[#{a}:#{b}]")
          .onValue($('#playback-time'), 'text')

    [0...8].forEach (item) ->

      $td = $('<td></td>').appendTo('#playback-bar-display tr')
        .html("#{item}")
        .click(-> player.queue.set(item))

      require('keys')
        .filter((k) -> k == 48 + item)
        .onValue(-> player.queue.set(item))
      
      currentItem.map((x) -> x == item)
        .onValue($td, 'toggleClass', 'active')

      player.queue.map((x) -> x == item)
        .onValue($td, 'toggleClass', 'queued')
    
