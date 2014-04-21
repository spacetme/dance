

describe 'loader', ->
  
  describe 'load', ->

    loader = null
    beforeEach ->
      loader = app.create().require('loader')

    describe 'when all promises resolve', ->

      assets = null

      beforeEach ->
        assets =
          a: Q.when(123)
          b: Q.when(456)

      it 'should store each result in respective value', promises.resolves ->
        loader.load(assets).then (result) ->
          expect(result.a).to.equal(123)
          expect(result.b).to.equal(456)

      it 'should notify progress', promises.resolves ->
        progresses = []
        loader.load(assets)
        .progress (event) ->
          progresses.push(event)
        .then ->
          expect(progresses.length).to.equal(3)
          expect(progresses[0].total).to.equal(2)
          expect(progresses[0].loaded).to.equal(0)
          expect(progresses[2].loaded).to.equal(2)
    
    describe 'when some promise rejects', ->

      assets = null

      beforeEach ->
        assets =
          a: Q.when(123)
          b: Q.fcall(-> throw new Error "wtf")

      it 'the promise should be rejected', promises.rejects ->
        loader.load(assets)



