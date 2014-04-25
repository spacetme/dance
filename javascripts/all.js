(function() {
  var App, AppInstance, Context, Module,
    __slice = [].slice;

  Module = (function() {
    function Module(name, factory, require) {
      this.name = name;
      this.factory = factory;
      this.require = require;
    }

    Module.prototype.instantiate = function() {
      return this.instance = this.factory(this.require, new Context(this));
    };

    return Module;

  })();

  Context = (function() {
    function Context(module) {
      this.module = module;
    }

    Context.prototype.log = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return console.log.apply(console, ["[" + this.module.name + "]"].concat(__slice.call(args)));
    };

    return Context;

  })();

  App = (function() {
    function App() {
      this.factories = {};
    }

    App.prototype.define = function(name, factory) {
      return this.factories[name] = factory;
    };

    App.prototype.create = function(mocks) {
      if (mocks == null) {
        mocks = {};
      }
      return new AppInstance(this.factories, mocks);
    };

    return App;

  })();

  AppInstance = (function() {
    function AppInstance(factories, mocks) {
      this.factories = Object.create(factories);
      _.assign(this.factories, mocks);
      this.modules = {};
    }

    AppInstance.prototype.require = function(name) {
      var module, require;
      if (this.modules[name]) {
        return this.modules[name].instance;
      } else if (this.factories[name]) {
        require = (function(_this) {
          return function(component) {
            return _this.require(component);
          };
        })(this);
        module = this.modules[name] = new Module(name, this.factories[name], require);
        return module.instantiate();
      } else {
        throw new Error("Unknown component " + name);
      }
    };

    return AppInstance;

  })();

  this.app = new App;

}).call(this);
(function() {
  var connect,
    __slice = [].slice;

  this.connect = connect = function(source) {
    return {
      to: function() {
        var args, target;
        target = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        source.connect.apply(source, [target].concat(__slice.call(args)));
        return connect(target);
      }
    };
  };

}).call(this);
(function() {
  this.maybe = function(fn) {
    return function(val) {
      if (val != null) {
        return fn(val);
      } else {
        return val;
      }
    };
  };

}).call(this);
(function() {
  this.musical = {
    name: function(note) {
      return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][(note % 12 + 12) % 12];
    }
  };

}).call(this);
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
        sawtooth1.start(0);
        sine = audio.createOscillator();
        sine.type = 'sine';
        sine.frequency.value = 55;
        sine.start(0);
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
(function() {
  app.define('bass_controller', function(require, context) {
    return {
      start: function() {
        var active, bass, keyCodes, keyNames, keys, midiNote, note, noteClickBus, options;
        bass = require('bass');
        options = require('options');
        keys = $(window).asEventStream('keydown').map('.which').log();
        keyCodes = [83, 68, 70, 32, 74, 75, 76];
        keyNames = ['S', 'D', 'F', '_', 'J', 'K', 'L'];
        midiNote = [12, 14, 4, 5, 7, 9, 11];
        noteClickBus = new Bacon.Bus();
        note = keys.map(function(key) {
          return keyCodes.indexOf(key);
        }).filter(function(i) {
          return i > -1;
        }).merge(keys.filter(function(i) {
          return i === 65;
        }).map(function() {
          return null;
        })).merge(noteClickBus).toProperty(null);
        note.map(maybe(function(i) {
          return midiNote[i];
        })).combine(options.transpose, function(note, transpose) {
          if (note != null) {
            return note + transpose;
          } else {
            return null;
          }
        }).map(maybe(function(tone) {
          return tone + 3 - 12;
        })).map(maybe(function(tone) {
          return tone + (tone < -6 ? 12 : 0);
        })).map(maybe(function(note) {
          return 110 * Math.pow(2, note / 12);
        })).onValue(function(freq) {
          return bass.setFrequency(freq);
        });
        active = function(button, onState) {
          if (onState == null) {
            onState = 'primary';
          }
          return function(state) {
            button.prop('disabled', state);
            button.toggleClass('btn-default', !state);
            return button.toggleClass('btn-' + onState, state);
          };
        };
        (function() {
          var button;
          button = $('<button class="btn btn-default btn-lg"><strong>[A]</strong><br><small>(Off)</small></button>').on('click', function() {
            return noteClickBus.push(null);
          }).appendTo('#bass-note').after(' ');
          return note.map(function(n) {
            return n === null;
          }).onValue(active(button, 'danger'));
        })();
        return keyNames.forEach(function(name, index) {
          var button, html;
          button = $('<button class="btn btn-default btn-lg"></button>').appendTo('#bass-note').on('click', function() {
            return noteClickBus.push(index);
          }).after(' ');
          note.map(function(n) {
            return index === n;
          }).onValue(active(button, 'warning'));
          return html = options.transpose.map(function(transpose) {
            return transpose + midiNote[index];
          }).map(musical.name).map(function(text) {
            return "<strong>[" + name + "]</strong><br><small>" + text + "</small>";
          }).onValue(button, 'html');
        });
      }
    };
  });

}).call(this);
(function() {
  app.define('bpm_controller', function(require) {
    var bpmText, controller, createInstance, createTapBpm, instance, keys, percentage;
    keys = require('keys');
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
          progress: Math.min(1, times / 48)
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
          return controller.active.set(false);
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
(function() {
  app.define('keys', function() {
    var keyEvents, keys;
    keyEvents = $(window).asEventStream('keydown').filter(function() {
      var _ref, _ref1;
      return !((_ref = (_ref1 = document.activeElement) != null ? _ref1.nodeName : void 0) === 'TEXTAREA' || _ref === 'INPUT');
    });
    keyEvents.onValue(function(e) {
      var _ref;
      if ((_ref = e.which) === 32) {
        return e.preventDefault();
      }
    });
    return keys = keyEvents.map('.which');
  });

}).call(this);
(function() {
  app.define('load_ui', function(require) {
    return function(promise) {
      var $loading;
      $loading = $('#loading');
      $loading.show();
      return promise.progress(function(event) {
        return $loading.find('.progress-bar').width((event.loaded / event.total * 100).toFixed(2) + '%');
      }).then(function(result) {
        $loading.fadeOut();
        return result;
      });
    };
  });

}).call(this);
(function() {
  var __hasProp = {}.hasOwnProperty;

  app.define('loader', function(require, context) {
    return {
      load: function(assets) {
        var defer, loaded, mapper, name, promise, result, tasks, total;
        defer = Q.defer();
        total = 0;
        loaded = 0;
        tasks = [];
        for (name in assets) {
          if (!__hasProp.call(assets, name)) continue;
          promise = assets[name];
          total += 1;
          tasks.push({
            name: name,
            promise: promise
          });
        }
        result = {};
        mapper = function(_arg) {
          var name, promise;
          name = _arg.name, promise = _arg.promise;
          return promise.then(function(value) {
            loaded += 1;
            context.log("Loaded " + name + " (" + loaded + " / " + total + ")");
            defer.notify({
              loaded: loaded,
              total: total
            });
            return result[name] = value;
          })["catch"](function(reason) {
            context.log("Unable to load " + name, reason);
            throw reason;
          });
        };
        Q.fcall(function() {
          return defer.notify({
            loaded: loaded,
            total: total
          });
        }).done();
        Q.all(tasks.map(mapper)).then(function() {
          return result;
        }).then(defer.resolve, defer.reject).done();
        return defer.promise;
      }
    };
  });

}).call(this);
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
          require('visualizer').start();
          return require('bpm_controller').start();
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
(function() {
  app.define('models', function(require, context) {
    var Pattern;
    Pattern = (function() {
      function Pattern(size) {
        this.size = size;
        this.channels = {};
      }

      Pattern.prototype.channel = function(name) {
        var i, _base;
        return (_base = this.channels)[name] || (_base[name] = (function() {
          var _i, _ref, _results;
          _results = [];
          for (i = _i = 0, _ref = this.size; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            _results.push(null);
          }
          return _results;
        }).call(this));
      };

      Pattern.prototype.fill = function(name, array) {
        var channel, i, value, _i, _len;
        channel = this.channel(name);
        for (i = _i = 0, _len = array.length; _i < _len; i = ++_i) {
          value = array[i];
          if ((value != null) && i < channel.length) {
            channel[i] = value;
          }
        }
        return this;
      };

      Pattern.prototype.at = function(index, callback) {
        var array, name, _ref, _results;
        _ref = this.channels;
        _results = [];
        for (name in _ref) {
          array = _ref[name];
          if (array[index] != null) {
            _results.push(callback(name, array[index]));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      return Pattern;

    })();
    return {
      Pattern: Pattern
    };
  });

}).call(this);
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
        var audio, bpmController, cutoff, drift, file, filter, gain, master, media, model, musicBPM, ramp, rate, source;
        media = $('#music-audio')[0];
        file = $('#music-file')[0];
        file.onchange = function() {
          return media.src = URL.createObjectURL(file.files[0]);
        };
        audio = require('audio');
        master = require('master');
        bpmController = require('bpm_controller');
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
        model = Bacon.$.textFieldValue($('#music-bpm'), '160');
        model.addSource(bpmController.bpm);
        musicBPM = model.map(parseFloat);
        rate = musicBPM.map(toPlaybackRate).combine(bpmController.active, function(rate, active) {
          if (active) {
            return 1;
          } else {
            return rate;
          }
        }).combine(drift($('#music-faster')), function(rate, adjust) {
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
        cutoff = Bacon.$.textFieldValue($('#music-cutoff'), '350').map(parseFloat).combine(bpmController.active, function(value, active) {
          if (active) {
            return 0;
          } else {
            return value;
          }
        });
        cutoff.onValue(ramp(filter.frequency));
        return cutoff.onValue($('#music-cutoff-display'), 'text');
      }
    };
  });

}).call(this);
(function() {
  app.define('options', function() {
    return {
      transpose: new Bacon.Model(0)
    };
  });

}).call(this);
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
(function() {
  app.define('playback_controller', function(require) {
    return {
      start: function() {
        var currentItem, keys, playback, player;
        playback = require('playback');
        player = require('player');
        keys = require('keys');
        $('#playback-start').on('click', function() {
          return playback.start();
        });
        $('#playback-stop').on('click', function() {
          return playback.stop();
        });
        keys.filter(function(x) {
          return x === 71;
        }).onValue(function() {
          return playback.start();
        });
        keys.filter(function(x) {
          return x === 72;
        }).onValue(function() {
          return playback.stop();
        });
        playback.state.onValue($('#playback-start'), 'prop', 'disabled');
        playback.state.not().onValue($('#playback-stop'), 'prop', 'disabled');
        currentItem = player.position.map('.0').skipDuplicates().log();
        player.position.map(function(_arg) {
          var a, b;
          a = _arg[0], b = _arg[1];
          return "[" + a + ":" + b + "]";
        }).onValue($('#playback-time'), 'text');
        return [0, 1, 2, 3, 4, 5, 6, 7].forEach(function(item) {
          var $td;
          $td = $('<td></td>').appendTo('#playback-bar-display tr').html("" + item).click(function() {
            return player.queue.set(item);
          });
          require('keys').filter(function(k) {
            return k === 48 + item;
          }).onValue(function() {
            return player.queue.set(item);
          });
          currentItem.map(function(x) {
            return x === item;
          }).onValue($td, 'toggleClass', 'active');
          return player.queue.map(function(x) {
            return x === item;
          }).onValue($td, 'toggleClass', 'queued');
        });
      }
    };
  });

}).call(this);
(function() {
  app.define('player', function(require, context) {
    var Machine, player, positionBus;
    player = {};
    positionBus = new Bacon.Bus();
    player.events = new Bacon.Bus();
    player.queue = new Bacon.Model(null);
    player.position = positionBus.toProperty([0, 0]).skipDuplicates(_.isEqual);
    Machine = (function() {
      function Machine(patterns, playlist) {
        this.patterns = patterns;
        this.playlist = playlist;
        this.current = -1;
        this.item = 0;
        this.index = 0;
      }

      Machine.prototype.advanceAndPlay = function(number, delay) {
        var _results;
        if (this.current > number) {
          throw new Error("Cannot advance to past!");
        } else if (this.current === number) {

        } else {
          _results = [];
          while (this.current < number) {
            this.current += 1;
            _results.push(this._next(this.current === number, delay));
          }
          return _results;
        }
      };

      Machine.prototype._next = function(play, delay) {
        var finishedAll, pattern, patternName, patternsToPlay, queued, _i, _len;
        if (this.item >= this.playlist.length) {
          this.item = 0;
        }
        patternsToPlay = this.playlist[this.item];
        finishedAll = true;
        positionBus.push([this.item, this.index]);
        for (_i = 0, _len = patternsToPlay.length; _i < _len; _i++) {
          patternName = patternsToPlay[_i];
          pattern = this.patterns[patternName];
          if (this.index + 1 < pattern.size) {
            finishedAll = false;
          }
          pattern.at(this.index, function(channel, value) {
            return player.events.push({
              channel: channel,
              value: value,
              delay: delay
            });
          });
        }
        if (finishedAll) {
          this.index = 0;
          queued = player.queue.get();
          if (queued != null) {
            this.item = queued;
            return player.queue.set(null);
          } else {
            return this.item += 1;
          }
        } else {
          return this.index += 1;
        }
      };

      return Machine;

    })();
    player.set = function(patterns, playlist, preschedule) {
      var createMachine, machine, steps;
      createMachine = function() {
        context.log("creating a new state machine");
        return new Machine(patterns, playlist);
      };
      machine = createMachine();
      steps = require('step').preschedule(preschedule);
      return steps.onValue(function(_arg) {
        var delay, now, number, time;
        number = _arg.number, time = _arg.time, now = _arg.now;
        delay = time - now;
        try {
          return machine.advanceAndPlay(number, delay);
        } catch (_error) {
          machine = createMachine();
          return machine.advanceAndPlay(number, delay);
        }
      });
    };
    return player;
  });

}).call(this);
(function() {
  app.define('resources', function(require) {
    var resources;
    resources = {};
    resources.put = function(object) {
      return _.assign(resources, object);
    };
    return resources;
  });

}).call(this);
(function() {
  app.define('sampler', function(require) {
    var convertToAudioBuffer, createSampler, loadSample, sendXH;
    sendXH = function(xh, value) {
      var defer;
      defer = Q.defer();
      xh.onload = defer.resolve;
      xh.onerror = defer.reject;
      xh.send(value);
      return defer.promise;
    };
    loadSample = function(url) {
      var xh;
      xh = new XMLHttpRequest();
      xh.open('GET', url, true);
      xh.responseType = 'arraybuffer';
      return sendXH(xh, null).then(function() {
        return xh.response;
      });
    };
    convertToAudioBuffer = function(arrayBuffer) {
      var defer;
      defer = Q.defer();
      require('audio').decodeAudioData(arrayBuffer, defer.resolve, defer.reject);
      return defer.promise;
    };
    createSampler = function(audioBuffer) {
      var audio, master, sampler;
      sampler = {};
      audio = require('audio');
      master = require('master');
      sampler.play = function(volume, delay) {
        var gain, source;
        source = audio.createBufferSource();
        source.buffer = audioBuffer;
        gain = audio.createGain();
        gain.gain.value = volume;
        source.connect(gain);
        gain.connect(master.node);
        return source.start(audio.currentTime + delay);
      };
      return sampler;
    };
    return {
      create: function(url) {
        return loadSample(url).then(convertToAudioBuffer).then(createSampler);
      }
    };
  });

}).call(this);
(function() {
  app.define('step', function(require, context) {
    var getPeriod, maybe, step, time;
    step = {};
    step.bpm = 160;
    step.ticks = 4;
    maybe = function(callback) {
      return function(value) {
        if (value === void 0) {
          return void 0;
        } else {
          return callback(value);
        }
      };
    };
    time = require('playback').time;
    step.beat = time.map(maybe(function(seconds) {
      return (seconds / 60) * step.bpm;
    }));
    step.step = step.beat.map(maybe(function(beat) {
      return Math.floor(beat * step.ticks);
    }));
    step._prescheduler = function(seconds) {
      var overlaps;
      overlaps = function(range, time) {
        if (range === void 0) {
          return false;
        }
        return time >= range[0] && time < range[1];
      };
      return function(state, time) {
        if (time === void 0) {
          return [void 0, void 0];
        } else if (overlaps(state, time)) {
          return [[time, time + seconds], [state[1], time + seconds]];
        } else {
          return [[time, time + seconds], [time, time + seconds]];
        }
      };
    };
    getPeriod = function() {
      return 60 / step.bpm / step.ticks;
    };
    step._range = function(a, b) {
      var number, out, period;
      period = getPeriod();
      number = Math.ceil(a / period);
      out = [];
      while (step._seconds(number) < b) {
        out.push(number);
        number += 1;
      }
      return out;
    };
    step._seconds = function(number) {
      return number * getPeriod();
    };
    step.preschedule = function(seconds) {
      var prescheduler;
      prescheduler = step._prescheduler(seconds);
      return time.withStateMachine(void 0, function(state, event) {
        var end, events, nextState, now, range, start, _ref;
        now = event.value();
        _ref = prescheduler(state, now), nextState = _ref[0], range = _ref[1];
        if (range === void 0) {
          events = [];
        } else {
          start = range[0], end = range[1];
          events = step._range(start, end).map(function(number) {
            return new Bacon.Next({
              number: number,
              time: step._seconds(number),
              now: now
            });
          });
        }
        return [nextState, events];
      });
    };
    return step;
  });

}).call(this);
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
(function() {
  app.define('transpose_controller', function(require) {
    return {
      start: function() {
        var options;
        options = require('options');
        return [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].forEach(function(transpose) {
          var button, text;
          text = (transpose <= 0 ? '' : '+') + transpose;
          button = $('<button class="btn btn-default btn-lg"></button>').html("" + (musical.name(transpose)) + "<br><small>" + text + "</small>").on('click', function() {
            return options.transpose.set(transpose);
          }).appendTo('#bass-key').after(' ');
          return options.transpose.map(function(x) {
            return x === transpose;
          }).onValue(button, 'prop', 'disabled');
        });
      }
    };
  });

}).call(this);
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



