(function() {
  app.define('music_controller', function(require) {
    var toPlaybackRate;
    toPlaybackRate = function(value) {
      if (isNaN(value)) {
        return 1;
      } else {
        return 160 / value;
      }
    };
    return {
      start: function() {
        var audio, cutoff, drift, file, filter, gain, master, media, musicBPM, ramp, rate, source;
        media = $('#music-audio')[0];
        file = $('#music-file')[0];
        file.onchange = function() {
          return media.src = URL.createObjectURL(file.files[0]);
        };
        audio = require('audio');
        master = require('master');
        source = audio.createMediaElementSource(media);
        filter = audio.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 350;
        gain = audio.createGain();
        gain.gain.value = 0.8;
        connect(source).to(filter).to(gain).to(master.node);
        ramp = function(param, rate) {
          if (rate == null) {
            rate = 0.1;
          }
          return function(value) {
            return param.setTargetAtTime(value, audio.currentTime, rate);
          };
        };
        drift = function(button) {
          return button.asEventStream('mousedown').map(function() {
            return 1.1;
          }).merge($(window).asEventStream('mouseup').map(function() {
            return 1;
          })).toProperty(1);
        };
        musicBPM = Bacon.$.textFieldValue($('#music-bpm'), '135').map(parseFloat);
        rate = musicBPM.map(toPlaybackRate).combine(drift($('#music-faster')), function(rate, adjust) {
          return rate * adjust;
        }).combine(drift($('#music-slower')), function(rate, adjust) {
          return rate / adjust;
        }).log();
        rate.onValue(function(rate) {
          return media.playbackRate = rate;
        });
        rate.map(function(rate) {
          return (rate * 100).toFixed(2);
        }).onValue($('#music-speed'), 'text');
        cutoff = Bacon.$.textFieldValue($('#music-cutoff'), '350').map(parseFloat);
        cutoff.onValue(ramp(filter.frequency));
        return cutoff.onValue($('#music-cutoff-display'), 'text');
      }
    };
  });

}).call(this);
