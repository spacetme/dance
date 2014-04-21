(function() {
  app.define('sampler', function(require) {
    var convertToAudioBuffer, createSampler, loadSample, sendXH;
    sendXH = function(xh, value) {
      var defer;
      defer = Q.defer();
      xh.onload = defer.resolve;
      xh.onerror = defer.reject;
      xh.send(value);
      return defer.promise;
    };
    loadSample = function(url) {
      var xh;
      xh = new XMLHttpRequest();
      xh.open('GET', url, true);
      xh.responseType = 'arraybuffer';
      return sendXH(xh, null).then(function() {
        return xh.response;
      });
    };
    convertToAudioBuffer = function(arrayBuffer) {
      var defer;
      defer = Q.defer();
      require('audio').decodeAudioData(arrayBuffer, defer.resolve, defer.reject);
      return defer.promise;
    };
    createSampler = function(audioBuffer) {
      var audio, master, sampler;
      sampler = {};
      audio = require('audio');
      master = require('master');
      sampler.play = function(volume, delay) {
        var gain, source;
        source = audio.createBufferSource();
        source.buffer = audioBuffer;
        gain = audio.createGain();
        gain.gain.value = volume;
        source.connect(gain);
        gain.connect(master.node);
        return source.start(audio.currentTime + delay);
      };
      return sampler;
    };
    return {
      create: function(url) {
        return loadSample(url).then(convertToAudioBuffer).then(createSampler);
      }
    };
  });

}).call(this);
