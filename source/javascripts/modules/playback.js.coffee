
app.define 'playback', (require, context) ->

  timer = require('timer')

  playback = {}

  # api to start/stop
  bus = new Bacon.Bus()
  playback.start = -> bus.push(true)
  playback.stop  = -> bus.push(false)
  playback.state = bus.toProperty(false)

  # delta, with state: when state change, inject 0 delta
  delta = timer.delta.merge(playback.state.changes().map(-> 0))

  playback.time = delta.map(playback.state)
    .zip(delta, (state, delta) -> { state, delta })
    .scan(undefined, (time, event) ->
      if event.state
        (time || 0) + event.delta
      else
        undefined
    )

  playback

