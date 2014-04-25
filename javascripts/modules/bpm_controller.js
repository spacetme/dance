(function() {
  app.define('bpm_controller', function(require) {
    var bpmText, controller, createInstance, createTapBpm, instance, keys, percentage, playback, player;
    keys = require('keys');
    playback = require('playback');
    player = require('player');
    controller = {};
    controller.active = new Bacon.Model(false);
    controller.bpm = new Bacon.Bus();
    controller.start = function() {
      $('#music-tap').on('click', function() {
        return controller.active.set(!controller.active.get());
      });
      return controller.active.onValue($('#music-bpm'), 'prop', 'disabled');
    };
    instance = null;
    createTapBpm = function() {
      var count, data, sum, times;
      data = [];
      sum = 0;
      count = 0;
      times = 0;
      return function() {
        var delta, i, last, weight, _i;
        data.push(new Date().getTime() / 1000);
        last = data.length - 1;
        times += 1;
        for (i = _i = 0; 0 <= last ? _i < last : _i > last; i = 0 <= last ? ++_i : --_i) {
          weight = last - i;
          delta = (data[last] - data[i]) / (last - i);
          sum += delta * weight;
          count += weight;
        }
        return {
          bpm: Math.round(60 / (sum / count)),
          progress: Math.min(1, times / 49)
        };
      };
    };
    bpmText = function(text) {
      if (text) {
        return text;
      } else {
        return "TAP";
      }
    };
    percentage = function(v) {
      return (v * 100).toFixed(2) + '%';
    };
    createInstance = function() {
      var state, unsub;
      state = keys.filter(function(k) {
        return k === 13;
      }).map(createTapBpm()).toProperty({
        bpm: null,
        progress: 0
      });
      unsub = [];
      unsub.push(state.map('.bpm').map(bpmText).onValue($('#tap-bpm-tap'), 'text'));
      unsub.push(state.map('.progress').map(percentage).onValue($('#tap-bpm .progress-bar'), 'width'));
      unsub.push(state.onValue(function(s) {
        if (s.bpm) {
          controller.bpm.push(s.bpm);
        }
        if (s.progress >= 1) {
          controller.active.set(false);
          player.queue.set(1);
          return playback.start();
        }
      }));
      return function() {
        var fn, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = unsub.length; _i < _len; _i++) {
          fn = unsub[_i];
          _results.push(fn());
        }
        return _results;
      };
    };
    controller.active.onValue(function(active) {
      if (active) {
        $('#tap-bpm').slideDown();
        instance = createInstance();
        return $('#tap-bpm')[0].focus();
      } else {
        $('#tap-bpm').slideUp();
        if (instance) {
          instance();
        }
        return instance = null;
      }
    });
    return controller;
  });

}).call(this);
