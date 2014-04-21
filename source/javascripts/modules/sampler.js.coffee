
app.define 'sampler', (require) ->

  sendXH = (xh, value) ->
    defer = Q.defer()
    xh.onload = defer.resolve
    xh.onerror = defer.reject
    xh.send(value)
    defer.promise
  
  loadSample = (url) ->
    xh = new XMLHttpRequest()
    xh.open 'GET', url, true
    xh.responseType = 'arraybuffer'
    sendXH(xh, null).then(-> xh.response)

  convertToAudioBuffer = (arrayBuffer) ->
    defer = Q.defer()
    require('audio').decodeAudioData arrayBuffer, defer.resolve, defer.reject
    defer.promise

  # must refactor
  createSampler = (audioBuffer) ->
    sampler = {}
    audio = require('audio')
    master = require('master')
    sampler.play = (volume, delay) ->
      source = audio.createBufferSource()
      source.buffer = audioBuffer
      gain = audio.createGain()
      gain.gain.value = volume
      source.connect(gain)
      gain.connect(master.node)
      source.start(audio.currentTime + delay)
    sampler

  create: (url) ->
    loadSample url
    .then convertToAudioBuffer
    .then createSampler

