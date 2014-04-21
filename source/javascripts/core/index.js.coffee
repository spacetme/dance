


class Module
  constructor: (@name, @factory, @require) ->
  instantiate: ->
    @instance = @factory(@require, new Context(this))

class Context
  constructor: (@module) ->
  log: (args...) ->
    console.log "[#{@module.name}]", args...

class App
  constructor: ->
    @factories = {}
  define: (name, factory) ->
    @factories[name] = factory
  create: (mocks = {}) -> new AppInstance(@factories, mocks)

class AppInstance
  constructor: (factories, mocks) ->
    @factories = Object.create(factories)
    _.assign(@factories, mocks)
    @modules = {}
  require: (name) ->
    if @modules[name]
      @modules[name].instance
    else if @factories[name]
      require = (component) => @require(component)
      module = @modules[name] = new Module(name, @factories[name], require)
      module.instantiate()
    else
      throw new Error "Unknown component #{name}"


@app = new App
  




