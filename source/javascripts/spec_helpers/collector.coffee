
# a collector is a simple data structure that has 2 methods
#
@collector = ->
  contents = []

  # pushes a value to this collector
  push: (value) ->
    contents.push value

  # returns an array of all push values and reset
  get: ->
    result = contents
    contents = []
    result
