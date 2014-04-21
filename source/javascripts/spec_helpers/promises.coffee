
@promises =
  resolves: (callback) -> (done) ->
    callback().then((-> done()), ((reason) -> done reason)).done()
  rejects: (callback) -> (done) ->
    callback().then((-> done new Error "Should reject!"), (-> done())).done()

