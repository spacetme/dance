
@properties =
  helper: (property) ->
    helper = { }
    property.onValue (value) -> helper.value = value
    helper

