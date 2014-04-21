
app.define 'master', (require, context) ->

  audio = require('audio')
  master = audio.createGain()
  analyser = audio.createAnalyser()
  master.connect(analyser)
  analyser.fftSize = 1024
  analyser.smoothingTimeConstant = 0.1
  analyser.connect(audio.destination)

  node: master
  analyser: analyser

