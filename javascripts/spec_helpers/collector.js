(function() {
  this.collector = function() {
    var contents;
    contents = [];
    return {
      push: function(value) {
        return contents.push(value);
      },
      get: function() {
        var result;
        result = contents;
        contents = [];
        return result;
      }
    };
  };

}).call(this);
