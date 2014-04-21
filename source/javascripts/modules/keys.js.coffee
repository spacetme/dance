
app.define 'keys', ->

  keyEvents = $(window).asEventStream('keydown')
    .filter(-> !(document.activeElement?.nodeName in ['TEXTAREA', 'INPUT']))

  keyEvents.onValue (e) ->
    e.preventDefault() if e.which in [32]

  keys = keyEvents
    .map('.which')
