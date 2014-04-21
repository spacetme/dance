(function() {
  describe('playback', function() {
    var playback, time, timer;
    playback = null;
    timer = null;
    time = 0;
    beforeEach(function() {
      var instance;
      instance = app.create();
      playback = instance.require('playback');
      timer = instance.require('timer');
      return playback.time.onValue(function(t) {
        return time = t;
      });
    });
    describe('when not started', function() {
      return it('should not update the time value', function() {
        timer.update(0);
        expect(time).to.equal(void 0);
        timer.update(1);
        expect(time).to.equal(void 0);
        timer.update(2);
        expect(time).to.equal(void 0);
        timer.update(3);
        return expect(time).to.equal(void 0);
      });
    });
    describe('when start', function() {
      return it('should set time to 0', function() {
        timer.update(20);
        expect(time).to.equal(void 0);
        playback.start();
        return expect(time).to.equal(0);
      });
    });
    return describe('during start', function() {
      return it('should add the time only when start', function() {
        timer.update(0);
        expect(time).to.equal(void 0);
        timer.update(1);
        expect(time).to.equal(void 0);
        playback.start();
        timer.update(2);
        expect(time).to.equal(1);
        playback.stop();
        timer.update(3);
        return expect(time).to.equal(void 0);
      });
    });
  });

}).call(this);
