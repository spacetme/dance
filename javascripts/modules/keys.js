(function() {
  app.define('keys', function() {
    var keyEvents, keys;
    keyEvents = $(window).asEventStream('keydown').filter(function() {
      var _ref, _ref1;
      return !((_ref = (_ref1 = document.activeElement) != null ? _ref1.nodeName : void 0) === 'TEXTAREA' || _ref === 'INPUT');
    });
    keyEvents.onValue(function(e) {
      var _ref;
      if ((_ref = e.which) === 32) {
        return e.preventDefault();
      }
    });
    return keys = keyEvents.map('.which');
  });

}).call(this);
