
describe 'step', ->

  step = null
  time = null

  beforeEach ->
    time     = new Bacon.Bus()
    instance = app.create
      playback: (require, context) ->
        time: time.toProperty(undefined)
    step     = instance.require('step')
    step.bpm   = 120
    step.ticks = 4

  describe 'beat property', ->
    it 'should hold the current beat number', ->
      beat = properties.helper(step.beat)
      expect(beat.value).to.equal(undefined)
      time.push(1.1)
      expect(beat.value).to.be.closeTo(2.2, 1e-6)

  describe 'step property', ->
    it 'should hold the current step number', ->
      number = properties.helper(step.step)
      expect(number.value).to.equal(undefined)
      time.push(1.2)
      expect(number.value).to.equal(9)

  describe '_prescheduler state machine', ->

    stateMachine = null
    
    beforeEach -> stateMachine = step._prescheduler(1.5)

    it 'should return full search range when initial state is undefined', ->
      result = stateMachine(undefined, 0)
      expect(result).to.deep.equal([ [0, 1.5], [0, 1.5] ])

    it 'should return full search range when range does not overlap', ->
      result = stateMachine([0, 1.5], 1)
      expect(result).to.deep.equal([ [1, 2.5], [1.5, 2.5] ])

    it 'should return partial search range when range overlap', ->
      result = stateMachine([1.5, 2.5], 5)
      expect(result).to.deep.equal([ [5, 6.5], [5, 6.5] ])

    it 'should reset when undefined', ->
      result = stateMachine([5, 6.5], undefined)
      expect(result).to.deep.equal([ undefined, undefined ])
      
    it 'should keep undefined', ->
      result = stateMachine(undefined, undefined)
      expect(result).to.deep.equal([ undefined, undefined ])

  describe '_range(a, b)', ->

    test = (a, b, expected) ->
      expect(step._range(a, b)).to.deep.equal(expected)

    it 'should return step numbers in [a, b)', ->
      test 0, 0.75, [0, 1, 2, 3, 4, 5]
      test 0, 0.76, [0, 1, 2, 3, 4, 5, 6]
      test 0.01, 0.76, [1, 2, 3, 4, 5, 6]

  describe 'preschedule(seconds)', ->

    it 'should preschedule steps', ->

      preschedule = step.preschedule(0.75)
      container = collector()

      preschedule.onValue(container.push)

      time.push(0)
      expect(container.get()).to.deep.equal([
        { number: 0, time: 0, now: 0 },
        { number: 1, time: 0.125, now: 0 },
        { number: 2, time: 0.25, now: 0 },
        { number: 3, time: 0.375, now: 0 },
        { number: 4, time: 0.5, now: 0 },
        { number: 5, time: 0.625, now: 0 },
      ])

      time.push(0)
      expect(container.get()).to.deep.equal([])

      time.push(0.01)
      expect(container.get()).to.deep.equal([
        { number: 6, time: 0.75, now: 0.01 },
      ])







