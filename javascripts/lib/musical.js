(function() {
  this.musical = {
    name: function(note) {
      return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][(note % 12 + 12) % 12];
    }
  };

}).call(this);
