(function() {
  app.define('player', function(require, context) {
    var Machine, dequeue, player, positionBus;
    player = {};
    positionBus = new Bacon.Bus();
    player.events = new Bacon.Bus();
    player.queue = new Bacon.Model(null);
    player.position = positionBus.toProperty([0, 0]).skipDuplicates(_.isEqual);
    dequeue = function() {
      var value;
      value = player.queue.get();
      if (value != null) {
        player.queue.set(null);
      }
      return value;
    };
    Machine = (function() {
      function Machine(patterns, playlist) {
        this.patterns = patterns;
        this.playlist = playlist;
        this.current = -1;
        this.item = -1;
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
        var finishedAll, next, pattern, patternName, patternsToPlay, _i, _len;
        if (this.item < 0) {
          this.item = dequeue() || 0;
        }
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
          next = dequeue();
          if (next != null) {
            return this.item = next;
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
