
app.define 'load_ui', (require) ->
  (promise) ->
    $loading = $('#loading')
    $loading.show()
    promise
    .progress (event) ->
      $loading.find('.progress-bar').width((event.loaded / event.total * 100).toFixed(2) + '%')
    .then (result) ->
      $loading.fadeOut()
      result
