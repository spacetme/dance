(function() {
  app.define('timer', function(require, context) {
    var lastTime, timer;
    timer = {};
    lastTime = null;
    timer.delta = new Bacon.Bus();
    timer.time = timer.delta.scan(0, function(a, b) {
      return a + b;
    });
    timer.update = function(time) {
      if (lastTime !== null && time > lastTime) {
        timer.delta.push(time - lastTime);
      }
      return lastTime = time;
    };
    return timer;
  });

}).call(this);
