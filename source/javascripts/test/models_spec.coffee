
describe 'models', ->

  { Pattern } = app.create().require 'models'

  describe 'Pattern', ->
    
    it 'should return empty pattern', ->
      expect(new Pattern(6).channel('kick')).to.deep.equal(
        [null, null, null, null, null, null]
      )

    it 'fill should add more', ->
      pattern = new Pattern(6)
      expect(pattern.fill('kick', [null, 0, null, 2]).channel('kick'))
        .to.deep.equal([null, 0, null, 2, null, null])
      expect(pattern.fill('kick', [1, 2, 3, null, 5]).channel('kick'))
        .to.deep.equal([1, 2, 3, 2, 5, null])

    it 'should allow getting item at time', ->

      pattern = new Pattern(6)
        .fill('a', [1, null, 1])
        .fill('b', [null, 1, 1])

      test = (index, expected) ->
        actual = []
        pattern.at index, (channel, value) ->
          actual.push([channel, value])
        expect(actual).to.deep.equal(expected)

      test 0, [['a', 1]]
      test 1, [['b', 1]]
      test 2, [['a', 1], ['b', 1]]

