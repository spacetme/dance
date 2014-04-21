(function() {
  app.define('bass', function(require, context) {
    var bass;
    return bass = {
      start: function() {
        var Gain, audio, enable, gain, lowpass, master, sawtooth1, sine;
        audio = require('audio');
        master = require('master');
        Gain = function(value) {
          var g;
          g = audio.createGain();
          g.gain.value = value;
          return g;
        };
        sawtooth1 = audio.createOscillator();
        sawtooth1.type = 'sawtooth';
        sawtooth1.frequency.value = 110;
        sawtooth1.start();
        sine = audio.createOscillator();
        sine.type = 'sine';
        sine.frequency.value = 55;
        sine.start();
        lowpass = audio.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 256;
        gain = audio.createGain();
        gain.gain.value = 0;
        enable = Gain(1);
        connect(sawtooth1).to(Gain(0.3)).to(lowpass);
        connect(lowpass).to(gain);
        connect(sine).to(Gain(0.7)).to(gain);
        connect(gain).to(enable).to(master.node);
        bass.down = function(delay) {
          delay += 0.03;
          gain.gain.setTargetAtTime(1, audio.currentTime + delay, 0.01);
          lowpass.frequency.setTargetAtTime(400, audio.currentTime + delay, 0.01);
          return lowpass.frequency.setTargetAtTime(50, audio.currentTime + 0.02 + delay, 0.3);
        };
        bass.up = function(delay) {
          return gain.gain.setTargetAtTime(0, audio.currentTime + delay, 0.03);
        };
        bass.setFrequency = function(freq) {
          if (freq != null) {
            enable.gain.value = 1;
            sawtooth1.frequency.setTargetAtTime(freq, audio.currentTime, 0.001);
            return sine.frequency.setTargetAtTime(freq / 2, audio.currentTime, 0.001);
          } else {
            return enable.gain.value = 0;
          }
        };
        return bass.setFrequency(null);
      }
    };
  });

}).call(this);
