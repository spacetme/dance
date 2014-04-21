
app.define 'player', (require, context) ->

  player = { }

  positionBus = new Bacon.Bus()

  player.events = new Bacon.Bus()

  player.queue = new Bacon.Model(null)

  player.position = positionBus.toProperty([0, 0])
    .skipDuplicates(_.isEqual)

  class Machine

    constructor: (@patterns, @playlist) ->
      @current = -1
      @item = 0
      @index = 0

    advanceAndPlay: (number, delay) ->
      if @current > number
        throw new Error "Cannot advance to past!"
      else if @current == number
        return
      else
        while @current < number
          @current += 1
          this._next(@current == number, delay)

    _next: (play, delay) ->

      # check item, just to be sure
      @item = 0 if @item >= @playlist.length

      # find the patterns to play
      patternsToPlay = @playlist[@item]
      finishedAll = true
      positionBus.push([ @item, @index ])

      for patternName in patternsToPlay
        pattern = @patterns[patternName]
        if @index + 1 < pattern.size
          finishedAll = false
        pattern.at @index, (channel, value) ->
          player.events.push({ channel, value, delay })

      if finishedAll
        @index = 0
        queued = player.queue.get()
        if queued?
          @item = queued
          player.queue.set(null)
        else
          @item += 1
      else
        @index += 1



  player.set = (patterns, playlist, preschedule) ->

    createMachine = ->
      context.log "creating a new state machine"
      new Machine(patterns, playlist)

    machine = createMachine()
    steps = require('step').preschedule(preschedule)

    steps.onValue ({ number, time, now }) ->
      delay = time - now
      try
        machine.advanceAndPlay(number, delay)
      catch
        machine = createMachine()
        machine.advanceAndPlay(number, delay)

  player



