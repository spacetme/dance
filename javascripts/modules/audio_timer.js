(function() {
  app.define('audio_timer', function(require, context) {
    return {
      start: function() {
        var audio, timer;
        context.log('timer started');
        timer = require('timer');
        audio = require('audio');
        return setInterval((function() {
          return timer.update(audio.currentTime);
        }), 1000 / 60);
      }
    };
  });

}).call(this);
