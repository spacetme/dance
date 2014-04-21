(function() {
  describe('player', function() {
    var instance, prescheduled, schedule;
    instance = null;
    schedule = null;
    prescheduled = null;
    beforeEach(function() {
      var bus;
      bus = new Bacon.Bus();
      instance = app.create({
        step: function(require, context) {
          return {
            preschedule: function(seconds) {
              prescheduled = seconds;
              return bus;
            }
          };
        }
      });
      return schedule = function(number, time, now) {
        return bus.push({
          number: number,
          time: time,
          now: now
        });
      };
    });
    return describe('with patterns and playlist', function() {
      var player;
      player = null;
      beforeEach(function() {
        var Pattern, patterns, playlist;
        Pattern = instance.require('models').Pattern;
        patterns = {
          a: new Pattern(5).fill('snare', [null, 1, 1, null, 1]).fill('kick', [1, null, null, 1, null]),
          b: new Pattern(6).fill('snare', [null, 1, 1]).fill('kick', [1]).fill('tom1', [null, null, null, 1]).fill('tom2', [null, null, null, null, 0.7, 1])
        };
        playlist = [['a'], ['b'], ['a', 'b'], ['b', 'a'], ['b']];
        player = instance.require('player');
        return player.set(patterns, playlist, 0.25);
      });
      it('should preschedule the step', function() {
        return expect(prescheduled).to.equal(0.25);
      });
      it('should advance properly', function() {
        var expectations, expected, number, position, _i, _len, _results;
        position = properties.helper(player.position);
        expectations = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [0, 0], [0, 1], [0, 2], [0, 3], [0, 4]];
        _results = [];
        for (number = _i = 0, _len = expectations.length; _i < _len; number = ++_i) {
          expected = expectations[number];
          schedule(number, 1, 0);
          _results.push(expect(position.value).to.deep.equal(expected));
        }
        return _results;
      });
      it('should be able to fast forward or rewind', function() {
        var position;
        position = properties.helper(player.position);
        schedule(2, 1, 0);
        expect(position.value).to.deep.equal([0, 2]);
        schedule(8, 1, 0);
        expect(position.value).to.deep.equal([1, 3]);
        schedule(0, 1, 0);
        return expect(position.value).to.deep.equal([0, 0]);
      });
      it('should be able to queue next', function() {
        var position;
        position = properties.helper(player.position);
        schedule(2, 1, 0);
        expect(position.value).to.deep.equal([0, 2]);
        player.queue.set(2);
        schedule(8, 1, 0);
        expect(position.value).to.deep.equal([2, 3]);
        player.queue.set(0);
        schedule(12, 1, 0);
        expect(position.value).to.deep.equal([0, 1]);
        player.queue.set(3);
        schedule(14, 1, 0);
        expect(position.value).to.deep.equal([0, 3]);
        player.queue.set(4);
        schedule(16, 1, 0);
        return expect(position.value).to.deep.equal([4, 0]);
      });
      return it('should emit play events', function() {
        var c, result;
        c = collector();
        player.events.onValue(c.push);
        schedule(0, 1.5, 0);
        expect(c.get()).to.deep.equal([
          {
            channel: 'kick',
            delay: 1.5,
            value: 1
          }
        ]);
        schedule(1, 2.5, 1);
        result = c.get();
        console.log(result);
        return expect(result).to.deep.equal([
          {
            channel: 'snare',
            delay: 1.5,
            value: 1
          }
        ]);
      });
    });
  });

}).call(this);
