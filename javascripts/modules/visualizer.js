(function() {
  app.define('visualizer', function(require, context) {
    return {
      start: function() {
        var BASE, STEP, analyser, analysis, audio, createItem, data, i, intensity, items;
        audio = require('audio');
        analyser = require('master').analyser;
        analysis = new Uint8Array(32);
        data = Bacon.interval(1000 / 50).map(function() {
          analyser.getByteFrequencyData(analysis);
          return analysis;
        }).map(function(d) {
          var x, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = d.length; _i < _len; _i++) {
            x = d[_i];
            _results.push(x);
          }
          return _results;
        });
        intensity = data.map(function(d) {
          return d[2] + d[3] + d[4];
        }).scan(0, function(a, b) {
          return a + (b - a) * 0.4;
        }).skipDuplicates();
        BASE = 440;
        STEP = 32;
        createItem = function(i) {
          var active, center, deg, left, max, min, right, size;
          deg = (i - 5) * 10;
          min = i === 1 ? -Infinity : BASE + i * STEP;
          max = i === 10 ? Infinity : BASE + (i + 1) * STEP;
          size = i * 30;
          left = $('<div class="item item' + i + '"></div>').appendTo('#visualizer .go-left').css('transform', "translateX(-50%) translateY(-50%) rotate(" + deg + "deg) translateX(-280px)");
          right = $('<div class="item item' + i + '"></div>').appendTo('#visualizer .go-right').css('transform', "translateX(-50%) translateY(-50%) rotate(" + (-deg) + "deg) translateX(280px)");
          center = $('<div class="item item' + i + '"></div>').appendTo('#visualizer .go-center').width(size).height(size);
          active = intensity.map(function(x) {
            return (min <= x && x < max);
          }).skipDuplicates();
          active.onValue(left, 'toggleClass', 'active');
          active.onValue(right, 'toggleClass', 'active');
          return active.onValue(center, 'toggleClass', 'active');
        };
        return items = (function() {
          var _i, _results;
          _results = [];
          for (i = _i = 1; _i <= 10; i = ++_i) {
            _results.push(createItem(i));
          }
          return _results;
        })();
      }
    };
  });

}).call(this);
