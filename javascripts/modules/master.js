(function() {
  app.define('master', function(require, context) {
    var analyser, audio, master;
    audio = require('audio');
    master = audio.createGain();
    analyser = audio.createAnalyser();
    master.connect(analyser);
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.1;
    analyser.connect(audio.destination);
    return {
      node: master,
      analyser: analyser
    };
  });

}).call(this);
