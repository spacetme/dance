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
