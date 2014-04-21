(function() {
  this.promises = {
    resolves: function(callback) {
      return function(done) {
        return callback().then((function() {
          return done();
        }), (function(reason) {
          return done(reason);
        })).done();
      };
    },
    rejects: function(callback) {
      return function(done) {
        return callback().then((function() {
          return done(new Error("Should reject!"));
        }), (function() {
          return done();
        })).done();
      };
    }
  };

}).call(this);
