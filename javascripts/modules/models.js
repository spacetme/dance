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
