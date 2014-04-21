
describe 'player', ->

  instance = null
  schedule = null
  prescheduled = null

  beforeEach ->

    bus = new Bacon.Bus()

    instance = app.create
      step: (require, context) ->
        preschedule: (seconds) ->
          prescheduled = seconds
          return bus

    schedule = (number, time, now) ->
      bus.push({ number, time, now })

  describe 'with patterns and playlist', ->
  
    player = null

    beforeEach ->

      { Pattern } = instance.require('models')

      patterns = {
        a: new Pattern(5)
            .fill('snare', [null, 1, 1, null, 1])
            .fill('kick', [1, null, null, 1, null])
        b: new Pattern(6)
            .fill('snare', [null, 1, 1])
            .fill('kick', [1])
            .fill('tom1', [null, null, null, 1])
            .fill('tom2', [null, null, null, null, 0.7, 1])
      }

      playlist = [ ['a'], ['b'], ['a', 'b'], ['b', 'a'], ['b'] ]

      player = instance.require('player')
      player.set(patterns, playlist, 0.25)

    it 'should preschedule the step', ->
      expect(prescheduled).to.equal(0.25)

    it 'should advance properly', ->
      position = properties.helper(player.position)
      expectations = [
        [0, 0], [0, 1], [0, 2], [0, 3], [0, 4]
        [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]
        [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5]
        [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5]
        [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5]
        [0, 0], [0, 1], [0, 2], [0, 3], [0, 4]
      ]
      for expected, number in expectations
        schedule(number, 1, 0)
        expect(position.value).to.deep.equal(expected)

    it 'should be able to fast forward or rewind', ->
      position = properties.helper(player.position)
      schedule(2, 1, 0)
      expect(position.value).to.deep.equal([0, 2])
      schedule(8, 1, 0)
      expect(position.value).to.deep.equal([1, 3])
      schedule(0, 1, 0)
      expect(position.value).to.deep.equal([0, 0])

    it 'should be able to queue next', ->
      position = properties.helper(player.position)
      schedule(2, 1, 0)
      expect(position.value).to.deep.equal([0, 2])
      player.queue.set(2)
      schedule(8, 1, 0)
      expect(position.value).to.deep.equal([2, 3])
      player.queue.set(0)
      schedule(12, 1, 0)
      expect(position.value).to.deep.equal([0, 1])
      player.queue.set(3)
      schedule(14, 1, 0)
      expect(position.value).to.deep.equal([0, 3])
      player.queue.set(4)
      schedule(16, 1, 0)
      expect(position.value).to.deep.equal([4, 0])

    it 'should emit play events', ->

      c = collector()
      player.events.onValue(c.push)

      schedule(0, 1.5, 0)
      expect(c.get()).to.deep.equal([ { channel: 'kick', delay: 1.5, value: 1 } ])

      schedule(1, 2.5, 1)
      result = c.get()
      console.log result
      expect(result).to.deep.equal([ { channel: 'snare', delay: 1.5, value: 1 } ])








