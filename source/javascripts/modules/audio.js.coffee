
app.define 'audio', (require) ->

  # create an audio context
  Constructor = window.AudioContext || window.webkitAudioContext
  context = new Constructor()

  # create a dummy gain and connect it
  gain = context.createGain()
  gain.connect(context.destination)

  # return the audio context
  context

