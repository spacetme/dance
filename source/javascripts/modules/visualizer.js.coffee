
app.define 'visualizer', (require, context) ->

  start: ->

    audio = require('audio')
    { analyser } = require('master')

    analysis = new Uint8Array(32)

    data = Bacon.interval(1000 / 50)
      .map(-> analyser.getByteFrequencyData(analysis); analysis)
      .map((d) -> x for x in d)

    intensity = data
      .map((d) -> d[2] + d[3] + d[4])
      .scan(0, (a, b) -> a + (b - a) * 0.4)
      .skipDuplicates()

    BASE = 440
    STEP = 32

    createItem = (i) ->
      deg = (i - 5) * 10
      min = if i == 1 then -Infinity else BASE + i * STEP
      max = if i == 10 then Infinity else BASE + (i + 1) * STEP
      size = i * 30
      left = $('<div class="item item'+i+'"></div>').appendTo('#visualizer .go-left')
        .css('transform', "translateX(-50%) translateY(-50%) rotate(#{deg}deg) translateX(-280px)")
      right = $('<div class="item item'+i+'"></div>').appendTo('#visualizer .go-right')
        .css('transform', "translateX(-50%) translateY(-50%) rotate(#{-deg}deg) translateX(280px)")
      center = $('<div class="item item'+i+'"></div>').appendTo('#visualizer .go-center')
        .width(size).height(size)
      active = intensity.map((x) -> min <= x < max)
        .skipDuplicates()
      active.onValue(left, 'toggleClass', 'active')
      active.onValue(right, 'toggleClass', 'active')
      active.onValue(center, 'toggleClass', 'active')

    items = (createItem(i) for i in [1..10])

    # test log
    # data
    #  .map((d) -> ((if x > 220 then '#' else if x > 110 then 'x' else '.') for x in d).reduce(((a, b) -> a + b), ''))
    #  .log()


