
describe 'resources', ->
  
  resources = null
  beforeEach -> resources = app.create().require('resources')

  it 'should put the resources on the module', ->

    resources.put
      a: 123
      b: 456

    expect(resources.a).to.equal(123)
    expect(resources.b).to.equal(456)



