(function() {
  app.define('load_ui', function(require) {
    return function(promise) {
      var $loading;
      $loading = $('#loading');
      $loading.show();
      return promise.progress(function(event) {
        return $loading.find('.progress-bar').width((event.loaded / event.total * 100).toFixed(2) + '%');
      }).then(function(result) {
        $loading.fadeOut();
        return result;
      });
    };
  });

}).call(this);
