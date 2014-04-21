(function() {
  describe('timer', function() {
    var timer;
    timer = null;
    beforeEach(function() {
      return timer = app.create().require('timer');
    });
    describe('initially', function() {
      return it('should have time 0', function(done) {
        return timer.time.take(1).onValue(function(value) {
          expect(value).to.equal(0);
          return done();
        });
      });
    });
    return describe('when running', function() {
      var run;
      run = function() {};
      it('should update time', function() {
        var time;
        time = properties.helper(timer.time);
        timer.update(0);
        expect(time.value).to.equal(0);
        timer.update(5);
        expect(time.value).to.equal(5);
        timer.update(0);
        expect(time.value).to.equal(5);
        timer.update(5);
        return expect(time.value).to.equal(10);
      });
      return it('delta should emit differences between time', function() {
        var delta;
        delta = properties.helper(timer.delta);
        timer.update(0);
        expect(delta.value).to.equal(void 0);
        timer.update(5);
        expect(delta.value).to.equal(5);
        timer.update(0);
        timer.update(6);
        return expect(delta.value).to.equal(6);
      });
    });
  });

}).call(this);
