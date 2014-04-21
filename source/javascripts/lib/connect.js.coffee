
@connect = connect = (source) ->
  to: (target, args...) ->
    source.connect(target, args...)
    connect(target)

