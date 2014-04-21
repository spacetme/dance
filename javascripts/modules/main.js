(function() {
  app.define('main', function(require, context) {
    var Pattern, convert, loadUI, times, velocity;
    loadUI = require('load_ui');
    Pattern = require('models').Pattern;
    times = function(array, count) {
      var _i, _results;
      return (function() {
        _results = [];
        for (var _i = 0; 0 <= count ? _i < count : _i > count; 0 <= count ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this).reduce((function(a, b) {
        return a.concat(array);
      }), []);
    };
    velocity = function(char) {
      switch (char) {
        case '.':
          return null;
        case '#':
          return 1;
        case '+':
          return 0.8;
        case 'x':
          return 0.6;
        case 'd':
          return 'down';
        case 'u':
          return 'up';
        default:
          throw new Error("Unknown character " + char);
      }
    };
    convert = function(string) {
      var char, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = string.length; _i < _len; _i++) {
        char = string[_i];
        _results.push(velocity(char));
      }
      return _results;
    };
    return {
      main: function() {
        var assets;
        assets = {
          kick: require('sampler').create('samples/kick.mp3'),
          crash: require('sampler').create('samples/crash.mp3'),
          snare: require('sampler').create('samples/snare.mp3'),
          hat1: require('sampler').create('samples/hat1.mp3'),
          hat2: require('sampler').create('samples/hat2.mp3'),
          yo: require('sampler').create('samples/yo.mp3'),
          cowbell: require('sampler').create('samples/cowbell.mp3')
        };
        return loadUI(require('loader').load(assets)).then(function(result) {
          require('resources').put(result);
          require('audio_timer').start();
          require('music_controller').start();
          require('playback_controller').start();
          require('bass').start();
          require('transpose_controller').start();
          require('bass_controller').start();
          return require('visualizer').start();
        }).then(function() {
          var bass, patterns, player, playlist, resources;
          resources = require('resources');
          player = require('player');
          bass = require('bass');
          resources.put({
            bass: {
              play: function(value, delay) {
                switch (value) {
                  case 'down':
                    return bass.down(delay);
                  case 'up':
                    return bass.up(delay);
                }
              }
            }
          });
          patterns = {};
          patterns.bass = new Pattern(16).fill('bass', convert('d...u.dud...u.du'));
          patterns.crash = new Pattern(16).fill('crash', convert('#...............'));
          patterns.roll = new Pattern(16).fill('snare', convert('#####.#.#####.#.'));
          patterns.normal = new Pattern(16).fill('cowbell', convert('#.......#.......')).fill('kick', convert('#.....#.#.....#.')).fill('hat1', convert('..#.......#.....')).fill('hat2', convert('...#.......#....')).fill('snare', convert('....#.......#...'));
          patterns.addSnare = new Pattern(16).fill('snare', convert('...+.......+..+.'));
          patterns.yo = new Pattern(16).fill('yo', convert('..x...x...x...x.'));
          playlist = [['roll', 'bass'], ['normal', 'yo', 'crash', 'bass'], ['normal', 'yo', 'bass'], ['normal', 'yo', 'bass'], ['normal', 'addSnare', 'yo', 'bass'], ['normal', 'yo', 'crash', 'bass'], ['normal', 'yo', 'bass'], ['normal', 'yo', 'bass']];
          console.log(resources);
          player.set(patterns, playlist, 0.1);
          return player.events.onValue(function(_arg) {
            var channel, delay, value;
            channel = _arg.channel, value = _arg.value, delay = _arg.delay;
            return resources[channel].play(value, delay);
          });
        }).done();
      }
    };
  });

}).call(this);
