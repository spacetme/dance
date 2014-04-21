
app.define 'loader', (require, context) ->

  load: (assets) ->

    defer = Q.defer()

    # count the number of promises
    total = 0
    loaded = 0
    tasks = []
    for own name, promise of assets
      total += 1
      tasks.push { name, promise }

    # map each promise to put value to result
    # pipe them to the defer
    result = {}
    mapper = ({ name, promise }) ->
      promise
      .then((value) ->
        loaded += 1
        context.log "Loaded #{name} (#{loaded} / #{total})"
        defer.notify { loaded, total }
        result[name] = value
      )
      .catch((reason) ->
        context.log "Unable to load #{name}", reason
        throw reason
      )

    Q.fcall(-> defer.notify { loaded, total })
      .done()

    Q.all(tasks.map(mapper)).then(-> result)
      .then(defer.resolve, defer.reject)
      .done()

    defer.promise

