(function() {
  app.define('audio', function(require) {
    var Constructor, context, gain;
    Constructor = window.AudioContext || window.webkitAudioContext;
    context = new Constructor();
    gain = context.createGain();
    gain.connect(context.destination);
    return context;
  });

}).call(this);
