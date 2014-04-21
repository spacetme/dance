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
