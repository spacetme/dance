(function() {
  app.define('resources', function(require) {
    var resources;
    resources = {};
    resources.put = function(object) {
      return _.assign(resources, object);
    };
    return resources;
  });

}).call(this);
