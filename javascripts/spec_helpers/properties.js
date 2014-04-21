(function() {
  this.properties = {
    helper: function(property) {
      var helper;
      helper = {};
      property.onValue(function(value) {
        return helper.value = value;
      });
      return helper;
    }
  };

}).call(this);
