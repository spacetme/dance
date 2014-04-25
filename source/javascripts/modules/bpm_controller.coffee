
app.define 'bpm_controller', (require) ->

  keys = require('keys')

  controller = { }
  controller.active = new Bacon.Model(false)
  controller.bpm = new Bacon.Bus()

  controller.start = ->
    $('#music-tap').on 'click', ->
      controller.active.set(!controller.active.get())

    controller.active.onValue($('#music-bpm'), 'prop', 'disabled')

  instance = null

  createTapBpm = ->
    data = []
    sum = 0
    count = 0
    times = 0
    return ->
      data.push(new Date().getTime() / 1000)
      last = data.length - 1
      times += 1
      for i in [0...last]
        weight = last - i
        delta = (data[last] - data[i]) / (last - i)
        sum += delta * weight
        count += weight
      return {
        bpm: Math.round(60 / (sum / count))
        progress: Math.min(1, times / 48)
      }

  bpmText = (text) ->
    if text then text else "TAP"

  percentage = (v) ->
    (v * 100).toFixed(2) + '%'

  createInstance = ->
    state = keys.filter((k) -> k == 13).map(createTapBpm())
      .toProperty({ bpm: null, progress: 0 })
    unsub = []
    unsub.push state.map('.bpm').map(bpmText).onValue($('#tap-bpm-tap'), 'text')
    unsub.push state.map('.progress').map(percentage).onValue($('#tap-bpm .progress-bar'), 'width')
    unsub.push state.onValue (s) ->
      if s.bpm
        controller.bpm.push(s.bpm)
      if s.progress >= 1
        controller.active.set(false)
    return ->
      fn() for fn in unsub

  controller.active.onValue (active) ->
    if active
      $('#tap-bpm').slideDown()
      instance = createInstance()
      $('#tap-bpm')[0].focus()
    else
      $('#tap-bpm').slideUp()
      instance() if instance
      instance = null

  return controller

