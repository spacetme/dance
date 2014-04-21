
app.define 'transpose_controller', (require) ->

  start: ->

    options = require('options')

    [-5..6].forEach (transpose) ->

      text = (if transpose <= 0 then '' else '+') + transpose

      button = $('<button class="btn btn-default btn-lg"></button>')
        .html("#{musical.name(transpose)}<br><small>#{text}</small>")
        .on('click', -> options.transpose.set(transpose))
        .appendTo('#bass-key')
        .after(' ')

      options.transpose.map((x) -> x == transpose)
        .onValue(button, 'prop', 'disabled')

