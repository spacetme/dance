(function() {
  app.define('bass_controller', function(require, context) {
    return {
      start: function() {
        var active, bass, keyCodes, keyNames, keys, midiNote, note, noteClickBus, options;
        bass = require('bass');
        options = require('options');
        keys = $(window).asEventStream('keydown').map('.which').log();
        keyCodes = [83, 68, 70, 32, 74, 75, 76];
        keyNames = ['S', 'D', 'F', '_', 'J', 'K', 'L'];
        midiNote = [12, 14, 4, 5, 7, 9, 11];
        noteClickBus = new Bacon.Bus();
        note = keys.map(function(key) {
          return keyCodes.indexOf(key);
        }).filter(function(i) {
          return i > -1;
        }).merge(keys.filter(function(i) {
          return i === 65;
        }).map(function() {
          return null;
        })).merge(noteClickBus).toProperty(null);
        note.map(maybe(function(i) {
          return midiNote[i];
        })).combine(options.transpose, function(note, transpose) {
          if (note != null) {
            return note + transpose;
          } else {
            return null;
          }
        }).map(maybe(function(tone) {
          return tone + 3 - 12;
        })).map(maybe(function(tone) {
          return tone + (tone < -6 ? 12 : 0);
        })).map(maybe(function(note) {
          return 110 * Math.pow(2, note / 12);
        })).onValue(function(freq) {
          return bass.setFrequency(freq);
        });
        active = function(button, onState) {
          if (onState == null) {
            onState = 'primary';
          }
          return function(state) {
            button.prop('disabled', state);
            button.toggleClass('btn-default', !state);
            return button.toggleClass('btn-' + onState, state);
          };
        };
        (function() {
          var button;
          button = $('<button class="btn btn-default btn-lg"><strong>[A]</strong><br><small>(Off)</small></button>').on('click', function() {
            return noteClickBus.push(null);
          }).appendTo('#bass-note').after(' ');
          return note.map(function(n) {
            return n === null;
          }).onValue(active(button, 'danger'));
        })();
        return keyNames.forEach(function(name, index) {
          var button, html;
          button = $('<button class="btn btn-default btn-lg"></button>').appendTo('#bass-note').on('click', function() {
            return noteClickBus.push(index);
          }).after(' ');
          note.map(function(n) {
            return index === n;
          }).onValue(active(button, 'warning'));
          return html = options.transpose.map(function(transpose) {
            return transpose + midiNote[index];
          }).map(musical.name).map(function(text) {
            return "<strong>[" + name + "]</strong><br><small>" + text + "</small>";
          }).onValue(button, 'html');
        });
      }
    };
  });

}).call(this);
