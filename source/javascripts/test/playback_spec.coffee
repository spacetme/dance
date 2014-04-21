
describe 'playback', ->

  playback = null
  timer = null
  time = 0

  beforeEach ->
    instance = app.create()
    playback = instance.require('playback')
    timer = instance.require('timer')
    playback.time.onValue (t) -> time = t

  describe 'when not started', ->
    
    it 'should not update the time value', ->
      timer.update(0)
      expect(time).to.equal(undefined)
      timer.update(1)
      expect(time).to.equal(undefined)
      timer.update(2)
      expect(time).to.equal(undefined)
      timer.update(3)
      expect(time).to.equal(undefined)

  describe 'when start', ->

    it 'should set time to 0', ->
      timer.update(20)
      expect(time).to.equal(undefined)
      playback.start()
      expect(time).to.equal(0)

  describe 'during start', ->

    it 'should add the time only when start', ->
      timer.update(0)
      expect(time).to.equal(undefined)
      timer.update(1)
      expect(time).to.equal(undefined)
      playback.start()
      timer.update(2)
      expect(time).to.equal(1)
      playback.stop()
      timer.update(3)
      expect(time).to.equal(undefined)
      


