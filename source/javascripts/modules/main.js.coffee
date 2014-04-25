
app.define 'main', (require, context) ->

  loadUI = require('load_ui')
  { Pattern } = require('models')

  times = (array, count) ->
    [0...count].reduce ((a, b) -> a.concat(array)), []

  velocity = (char) ->
    switch char
      when '.' then null
      when '#' then 1
      when '+' then 0.8
      when 'x' then 0.6
      when 'd' then 'down'
      when 'u' then 'up'
      else throw new Error "Unknown character #{char}"

  convert = (string) ->
    velocity(char) for char in string

  main: ->

    # first, load the assets
    assets =
      kick:     require('sampler').create('samples/kick.mp3')
      crash:    require('sampler').create('samples/crash.mp3')
      snare:    require('sampler').create('samples/snare.mp3')
      hat1:     require('sampler').create('samples/hat1.mp3')
      hat2:     require('sampler').create('samples/hat2.mp3')
      yo:       require('sampler').create('samples/yo.mp3')
      cowbell:  require('sampler').create('samples/cowbell.mp3')

    loadUI(require('loader').load(assets))
    .then (result) ->
      require('resources').put(result)
      require('audio_timer').start()
      require('music_controller').start()
      require('playback_controller').start()
      require('bass').start()
      require('transpose_controller').start()
      require('bass_controller').start()
      require('visualizer').start()
      require('bpm_controller').start()
    .then ->

      resources = require('resources')
      player = require('player')
      bass = require('bass')

      resources.put
        bass:
          play: (value, delay) ->
            switch value
              when 'down' then bass.down(delay)
              when 'up' then bass.up(delay)

      patterns = {}
      patterns.bass = new Pattern(16)
        .fill('bass',    convert 'd...u.dud...u.du')
      patterns.crash = new Pattern(16)
        .fill('crash',   convert '#...............')
      patterns.roll = new Pattern(16)
        .fill('snare',   convert '#####.#.#####.#.')
      patterns.normal = new Pattern(16)
        .fill('cowbell', convert '#.......#.......')
        .fill('kick',    convert '#.....#.#.....#.')
        .fill('hat1',    convert '..#.......#.....')
        .fill('hat2',    convert '...#.......#....')
        .fill('snare',   convert '....#.......#...')
      patterns.addSnare = new Pattern(16)
        .fill('snare',   convert '...+.......+..+.')
      patterns.yo = new Pattern(16)
        .fill('yo',      convert '..x...x...x...x.')

      playlist = [
        ['roll', 'bass']
        ['normal', 'yo', 'crash', 'bass']
        ['normal', 'yo', 'bass']
        ['normal', 'yo', 'bass']
        ['normal', 'addSnare', 'yo', 'bass']
        ['normal', 'yo', 'crash', 'bass']
        ['normal', 'yo', 'bass']
        ['normal', 'yo', 'bass']
      ]

      console.log(resources)
      player.set(patterns, playlist, 0.1)
      player.events.onValue ({ channel, value, delay }) ->
        resources[channel].play(value, delay)

    .done()

