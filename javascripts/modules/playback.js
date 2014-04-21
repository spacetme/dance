(function() {
  app.define('playback', function(require, context) {
    var bus, delta, playback, timer;
    timer = require('timer');
    playback = {};
    bus = new Bacon.Bus();
    playback.start = function() {
      return bus.push(true);
    };
    playback.stop = function() {
      return bus.push(false);
    };
    playback.state = bus.toProperty(false);
    delta = timer.delta.merge(playback.state.changes().map(function() {
      return 0;
    }));
    playback.time = delta.map(playback.state).zip(delta, function(state, delta) {
      return {
        state: state,
        delta: delta
      };
    }).scan(void 0, function(time, event) {
      if (event.state) {
        return (time || 0) + event.delta;
      } else {
        return void 0;
      }
    });
    return playback;
  });

}).call(this);
