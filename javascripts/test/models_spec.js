(function() {
  describe('models', function() {
    var Pattern;
    Pattern = app.create().require('models').Pattern;
    return describe('Pattern', function() {
      it('should return empty pattern', function() {
        return expect(new Pattern(6).channel('kick')).to.deep.equal([null, null, null, null, null, null]);
      });
      it('fill should add more', function() {
        var pattern;
        pattern = new Pattern(6);
        expect(pattern.fill('kick', [null, 0, null, 2]).channel('kick')).to.deep.equal([null, 0, null, 2, null, null]);
        return expect(pattern.fill('kick', [1, 2, 3, null, 5]).channel('kick')).to.deep.equal([1, 2, 3, 2, 5, null]);
      });
      return it('should allow getting item at time', function() {
        var pattern, test;
        pattern = new Pattern(6).fill('a', [1, null, 1]).fill('b', [null, 1, 1]);
        test = function(index, expected) {
          var actual;
          actual = [];
          pattern.at(index, function(channel, value) {
            return actual.push([channel, value]);
          });
          return expect(actual).to.deep.equal(expected);
        };
        test(0, [['a', 1]]);
        test(1, [['b', 1]]);
        return test(2, [['a', 1], ['b', 1]]);
      });
    });
  });

}).call(this);
