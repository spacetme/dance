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
