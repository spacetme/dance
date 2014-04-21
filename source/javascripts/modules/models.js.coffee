
app.define 'models', (require, context) ->

  class Pattern
    constructor: (@size) ->
      @channels = {}
    channel: (name) ->
      @channels[name] ||= (null for i in [0...@size])
    fill: (name, array) ->
      channel = this.channel(name)
      for value, i in array
        channel[i] = value if value? and i < channel.length
      this
    at: (index, callback) ->
      for name, array of @channels
        if array[index]?
          callback(name, array[index])

  { Pattern }

