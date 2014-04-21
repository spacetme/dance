(function() {
  app.define('transpose_controller', function(require) {
    return {
      start: function() {
        var options;
        options = require('options');
        return [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].forEach(function(transpose) {
          var button, text;
          text = (transpose <= 0 ? '' : '+') + transpose;
          button = $('<button class="btn btn-default btn-lg"></button>').html("" + (musical.name(transpose)) + "<br><small>" + text + "</small>").on('click', function() {
            return options.transpose.set(transpose);
          }).appendTo('#bass-key').after(' ');
          return options.transpose.map(function(x) {
            return x === transpose;
          }).onValue(button, 'prop', 'disabled');
        });
      }
    };
  });

}).call(this);
