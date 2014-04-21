
app.define 'timer', (require, context) ->

  timer = { }

  lastTime = null
  timer.delta = new Bacon.Bus()

  timer.time = timer.delta.scan 0, (a, b) -> a + b

  timer.update = (time) ->
    if lastTime != null && time > lastTime
      timer.delta.push(time - lastTime)
    lastTime = time

  timer

