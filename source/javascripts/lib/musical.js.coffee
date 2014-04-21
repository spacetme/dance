
@musical =
  name: (note) ->
    ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][(note % 12 + 12) % 12]
