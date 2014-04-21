(function() {
  app.define('playback_controller', function(require) {
    return {
      start: function() {
        var currentItem, keys, playback, player;
        playback = require('playback');
        player = require('player');
        keys = require('keys');
        $('#playback-start').on('click', function() {
          return playback.start();
        });
        $('#playback-stop').on('click', function() {
          return playback.stop();
        });
        keys.filter(function(x) {
          return x === 71;
        }).onValue(function() {
          return playback.start();
        });
        keys.filter(function(x) {
          return x === 72;
        }).onValue(function() {
          return playback.stop();
        });
        playback.state.onValue($('#playback-start'), 'prop', 'disabled');
        playback.state.not().onValue($('#playback-stop'), 'prop', 'disabled');
        currentItem = player.position.map('.0').skipDuplicates().log();
        player.position.map(function(_arg) {
          var a, b;
          a = _arg[0], b = _arg[1];
          return "[" + a + ":" + b + "]";
        }).onValue($('#playback-time'), 'text');
        return [0, 1, 2, 3, 4, 5, 6, 7].forEach(function(item) {
          var $td;
          $td = $('<td></td>').appendTo('#playback-bar-display tr').html("" + item).click(function() {
            return player.queue.set(item);
          });
          require('keys').filter(function(k) {
            return k === 48 + item;
          }).onValue(function() {
            return player.queue.set(item);
          });
          currentItem.map(function(x) {
            return x === item;
          }).onValue($td, 'toggleClass', 'active');
          return player.queue.map(function(x) {
            return x === item;
          }).onValue($td, 'toggleClass', 'queued');
        });
      }
    };
  });

}).call(this);
