var tests = [],
    assert, expect, should;

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
    handlebars : './libs/handlebars/handlebars',
    vertebrae  : './src'
  },

  shim: {
    handlebars: {
      exports: 'Handlebars'
    }
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
      should  = chai.should();

      window.__karma__.start();
    });
  }

});