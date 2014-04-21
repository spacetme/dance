
# A timer runner that is bound to the audio system
app.define 'audio_timer', (require, context) ->

  start: ->
    context.log('timer started')
    timer = require('timer')
    audio = require('audio')
    setInterval (-> timer.update(audio.currentTime)), 1000 / 60
