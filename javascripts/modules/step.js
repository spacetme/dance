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
