(function() {
  describe('loader', function() {
    return describe('load', function() {
      var loader;
      loader = null;
      beforeEach(function() {
        return loader = app.create().require('loader');
      });
      describe('when all promises resolve', function() {
        var assets;
        assets = null;
        beforeEach(function() {
          return assets = {
            a: Q.when(123),
            b: Q.when(456)
          };
        });
        it('should store each result in respective value', promises.resolves(function() {
          return loader.load(assets).then(function(result) {
            expect(result.a).to.equal(123);
            return expect(result.b).to.equal(456);
          });
        }));
        return it('should notify progress', promises.resolves(function() {
          var progresses;
          progresses = [];
          return loader.load(assets).progress(function(event) {
            return progresses.push(event);
          }).then(function() {
            expect(progresses.length).to.equal(3);
            expect(progresses[0].total).to.equal(2);
            expect(progresses[0].loaded).to.equal(0);
            return expect(progresses[2].loaded).to.equal(2);
          });
        }));
      });
      return describe('when some promise rejects', function() {
        var assets;
        assets = null;
        beforeEach(function() {
          return assets = {
            a: Q.when(123),
            b: Q.fcall(function() {
              throw new Error("wtf");
            })
          };
        });
        return it('the promise should be rejected', promises.rejects(function() {
          return loader.load(assets);
        }));
      });
    });
  });

}).call(this);
