
describe 'timer', ->

  timer = null

  beforeEach ->
    timer = app.create().require('timer')

  describe 'initially', ->
    it 'should have time 0', (done) ->
      timer.time.take(1).onValue (value) ->
        expect(value).to.equal(0)
        done()

  describe 'when running', ->

    run = ->

    it 'should update time', ->
      time = properties.helper(timer.time)
      timer.update(0)
      expect(time.value).to.equal(0)
      timer.update(5)
      expect(time.value).to.equal(5)
      timer.update(0)
      expect(time.value).to.equal(5)
      timer.update(5)
      expect(time.value).to.equal(10)

    it 'delta should emit differences between time', ->
      delta = properties.helper(timer.delta)
      timer.update(0)
      expect(delta.value).to.equal(undefined)
      timer.update(5)
      expect(delta.value).to.equal(5)
      timer.update(0)
      timer.update(6)
      expect(delta.value).to.equal(6)

    

