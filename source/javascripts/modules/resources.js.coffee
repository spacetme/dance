
app.define 'resources', (require) ->
  
  resources = {}
  resources.put = (object) ->
    _.assign resources, object

  resources
