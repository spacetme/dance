(function() {
  describe('resources', function() {
    var resources;
    resources = null;
    beforeEach(function() {
      return resources = app.create().require('resources');
    });
    return it('should put the resources on the module', function() {
      resources.put({
        a: 123,
        b: 456
      });
      expect(resources.a).to.equal(123);
      return expect(resources.b).to.equal(456);
    });
  });

}).call(this);
