var tests = [];
for (var file in window.__karma__.files) {
  if (window.__karma__.files.hasOwnProperty(file)) {
    if (file.indexOf('/base/test/unit') == 0) {
      tests.push(file);
    }
  }
}

require.config({

  baseUrl: '/base',

  paths: {
    backbone   : './libs/backbone/backbone',
    jquery     : './libs/jquery/dist/jquery',
    qunit      : './libs/qunit/qunit/qunit',
    underscore : './libs/underscore/underscore',
    chai       : './libs/chai/chai',
    vertebrae  : './src'
  },

  deps: tests,

  callback: function() {
    require([
      'chai',
      'jquery'
    ], function (chai, jquery) {
      $ = jquery;
      
      // Global Assertion Libraries
      assert  = chai.assert;
      expect  = chai.expect;
      chai.should();

      window.defaultTimeout = 30000;

      window.__karma__.start();

    });
  }
});