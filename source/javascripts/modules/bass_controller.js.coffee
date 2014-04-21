
app.define 'bass_controller', (require, context) ->

  start: ->

    bass = require('bass')
    options = require('options')

    keys = $(window).asEventStream('keydown').map('.which').log()

    keyCodes = [83, 68, 70, 32, 74, 75, 76]
    keyNames = ['S', 'D', 'F', '_', 'J', 'K', 'L']
    midiNote = [12, 14, 4, 5, 7, 9, 11]

    noteClickBus = new Bacon.Bus()

    note = keys
      .map((key) -> keyCodes.indexOf(key))
      .filter((i) -> i > -1)
      .merge(keys.filter((i) -> i == 65).map(-> null))
      .merge(noteClickBus)
      .toProperty(null)

    note
      .map(maybe (i) -> midiNote[i])
      .combine(options.transpose, (note, transpose) ->
        if note? then note + transpose else null)
      .map(maybe (tone) -> tone + 3 - 12)
      .map(maybe (tone) -> tone + (if tone < -6 then 12 else 0))
      .map(maybe (note) -> 110 * Math.pow(2, note / 12))
      .onValue((freq) -> bass.setFrequency(freq))

    active = (button, onState='primary') -> (state) ->
      button.prop('disabled', state)
      button.toggleClass('btn-default', !state)
      button.toggleClass('btn-' + onState, state)

    do ->

      button = $('<button class="btn btn-default btn-lg"><strong>[A]</strong><br><small>(Off)</small></button>')
        .on('click', -> noteClickBus.push(null))
        .appendTo('#bass-note')
        .after(' ')

      note
        .map((n) -> n == null)
        .onValue(active(button, 'danger'))

    keyNames.forEach (name, index) ->

      button = $('<button class="btn btn-default btn-lg"></button>')
        .appendTo('#bass-note')
        .on('click', -> noteClickBus.push(index))
        .after(' ')

      note
        .map((n) -> index == n)
        .onValue(active(button, 'warning'))

      html = options.transpose
        .map((transpose) -> transpose + midiNote[index])
        .map(musical.name)
        .map((text) -> "<strong>[#{name}]</strong><br><small>#{text}</small>")
        .onValue(button, 'html')







