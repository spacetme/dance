(function() {
  describe('step', function() {
    var step, time;
    step = null;
    time = null;
    beforeEach(function() {
      var instance;
      time = new Bacon.Bus();
      instance = app.create({
        playback: function(require, context) {
          return {
            time: time.toProperty(void 0)
          };
        }
      });
      step = instance.require('step');
      step.bpm = 120;
      return step.ticks = 4;
    });
    describe('beat property', function() {
      return it('should hold the current beat number', function() {
        var beat;
        beat = properties.helper(step.beat);
        expect(beat.value).to.equal(void 0);
        time.push(1.1);
        return expect(beat.value).to.be.closeTo(2.2, 1e-6);
      });
    });
    describe('step property', function() {
      return it('should hold the current step number', function() {
        var number;
        number = properties.helper(step.step);
        expect(number.value).to.equal(void 0);
        time.push(1.2);
        return expect(number.value).to.equal(9);
      });
    });
    describe('_prescheduler state machine', function() {
      var stateMachine;
      stateMachine = null;
      beforeEach(function() {
        return stateMachine = step._prescheduler(1.5);
      });
      it('should return full search range when initial state is undefined', function() {
        var result;
        result = stateMachine(void 0, 0);
        return expect(result).to.deep.equal([[0, 1.5], [0, 1.5]]);
      });
      it('should return full search range when range does not overlap', function() {
        var result;
        result = stateMachine([0, 1.5], 1);
        return expect(result).to.deep.equal([[1, 2.5], [1.5, 2.5]]);
      });
      it('should return partial search range when range overlap', function() {
        var result;
        result = stateMachine([1.5, 2.5], 5);
        return expect(result).to.deep.equal([[5, 6.5], [5, 6.5]]);
      });
      it('should reset when undefined', function() {
        var result;
        result = stateMachine([5, 6.5], void 0);
        return expect(result).to.deep.equal([void 0, void 0]);
      });
      return it('should keep undefined', function() {
        var result;
        result = stateMachine(void 0, void 0);
        return expect(result).to.deep.equal([void 0, void 0]);
      });
    });
    describe('_range(a, b)', function() {
      var test;
      test = function(a, b, expected) {
        return expect(step._range(a, b)).to.deep.equal(expected);
      };
      return it('should return step numbers in [a, b)', function() {
        test(0, 0.75, [0, 1, 2, 3, 4, 5]);
        test(0, 0.76, [0, 1, 2, 3, 4, 5, 6]);
        return test(0.01, 0.76, [1, 2, 3, 4, 5, 6]);
      });
    });
    return describe('preschedule(seconds)', function() {
      return it('should preschedule steps', function() {
        var container, preschedule;
        preschedule = step.preschedule(0.75);
        container = collector();
        preschedule.onValue(container.push);
        time.push(0);
        expect(container.get()).to.deep.equal([
          {
            number: 0,
            time: 0,
            now: 0
          }, {
            number: 1,
            time: 0.125,
            now: 0
          }, {
            number: 2,
            time: 0.25,
            now: 0
          }, {
            number: 3,
            time: 0.375,
            now: 0
          }, {
            number: 4,
            time: 0.5,
            now: 0
          }, {
            number: 5,
            time: 0.625,
            now: 0
          }
        ]);
        time.push(0);
        expect(container.get()).to.deep.equal([]);
        time.push(0.01);
        return expect(container.get()).to.deep.equal([
          {
            number: 6,
            time: 0.75,
            now: 0.01
          }
        ]);
      });
    });
  });

}).call(this);
