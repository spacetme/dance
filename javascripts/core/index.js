(function() {
  var App, AppInstance, Context, Module,
    __slice = [].slice;

  Module = (function() {
    function Module(name, factory, require) {
      this.name = name;
      this.factory = factory;
      this.require = require;
    }

    Module.prototype.instantiate = function() {
      return this.instance = this.factory(this.require, new Context(this));
    };

    return Module;

  })();

  Context = (function() {
    function Context(module) {
      this.module = module;
    }

    Context.prototype.log = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return console.log.apply(console, ["[" + this.module.name + "]"].concat(__slice.call(args)));
    };

    return Context;

  })();

  App = (function() {
    function App() {
      this.factories = {};
    }

    App.prototype.define = function(name, factory) {
      return this.factories[name] = factory;
    };

    App.prototype.create = function(mocks) {
      if (mocks == null) {
        mocks = {};
      }
      return new AppInstance(this.factories, mocks);
    };

    return App;

  })();

  AppInstance = (function() {
    function AppInstance(factories, mocks) {
      this.factories = Object.create(factories);
      _.assign(this.factories, mocks);
      this.modules = {};
    }

    AppInstance.prototype.require = function(name) {
      var module, require;
      if (this.modules[name]) {
        return this.modules[name].instance;
      } else if (this.factories[name]) {
        require = (function(_this) {
          return function(component) {
            return _this.require(component);
          };
        })(this);
        module = this.modules[name] = new Module(name, this.factories[name], require);
        return module.instantiate();
      } else {
        throw new Error("Unknown component " + name);
      }
    };

    return AppInstance;

  })();

  this.app = new App;

}).call(this);
