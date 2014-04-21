
app.define 'music_controller', (require) ->

  toPlaybackRate = (value) ->
    if isNaN(value)
      1
    else
      160 / value

  start: ->

    # get the audio tag
    media = $('#music-audio')[0]
    file = $('#music-file')[0]

    # load the audio on change
    file.onchange = ->
      media.src = URL.createObjectURL(file.files[0])

    # connect the audio tag to the audio destination
    audio = require('audio')
    master = require('master')

    source = audio.createMediaElementSource(media)

    filter = audio.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 350

    gain = audio.createGain()
    gain.gain.value = 0.8

    connect(source).to(filter).to(gain).to(master.node)

    # utility
    ramp = (param, rate=0.1) -> (value) ->
      param.setTargetAtTime(value, audio.currentTime, rate)

    drift = (button) ->
      button.asEventStream('mousedown').map(-> 1.1)
        .merge($(window).asEventStream('mouseup').map(-> 1))
        .toProperty(1)

    # databindings:
    # bpm
    musicBPM = Bacon.$.textFieldValue($('#music-bpm'), '135')
      .map(parseFloat)

    rate = musicBPM
      .map(toPlaybackRate)
      .combine(drift($('#music-faster')), (rate, adjust) -> rate * adjust)
      .combine(drift($('#music-slower')), (rate, adjust) -> rate / adjust)
      .log()
    
    rate.onValue((rate) -> media.playbackRate = rate)
    rate.map((rate) -> (rate * 100).toFixed(2))
        .onValue($('#music-speed'), 'text')

    # cutoff frequency
    cutoff = Bacon.$.textFieldValue($('#music-cutoff'), '350')
      .map(parseFloat)

    cutoff.onValue(ramp(filter.frequency))
    cutoff.onValue($('#music-cutoff-display'), 'text')
      


