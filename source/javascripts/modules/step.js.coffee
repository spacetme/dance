
app.define 'step', (require, context) ->

  step = {}
  step.bpm   = 160
  step.ticks = 4

  maybe = (callback) -> (value) ->
    if value is undefined then undefined else callback(value)

  time = require('playback').time

  step.beat = time
    .map(maybe (seconds) -> (seconds / 60) * step.bpm)

  step.step = step.beat
    .map(maybe (beat) -> Math.floor(beat * step.ticks))

  step._prescheduler = (seconds) ->
    overlaps = (range, time) ->
      return false if range is undefined
      return time >= range[0] && time < range[1]
    return (state, time) ->
      if time is undefined
        [undefined, undefined]
      else if overlaps(state, time)
        [[time, time + seconds], [state[1], time + seconds]]
      else
        [[time, time + seconds], [time, time + seconds]]

  getPeriod = -> 60 / step.bpm / step.ticks

  step._range = (a, b) ->
    period = getPeriod()
    number = Math.ceil(a / period)
    out = [ ]
    while step._seconds(number) < b
      out.push(number)
      number += 1
    out

  step._seconds = (number) ->
    number * getPeriod()

  step.preschedule = (seconds) ->
    prescheduler = step._prescheduler(seconds)
    time.withStateMachine(undefined, (state, event) ->
      now = event.value()
      [nextState, range] = prescheduler(state, now)
      if range is undefined
        events = []
      else
        [start, end] = range
        events = step._range(start, end).map (number) ->
          new Bacon.Next({ number, time: step._seconds(number), now })
      return [nextState, events]
    )

  step







