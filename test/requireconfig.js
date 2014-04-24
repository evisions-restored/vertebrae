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

<<<<<<< HEAD
  shim: {
    handlebars: {
      exports: 'Handlebars'
    }
  },

  deps: tests,
=======
  deps: ['chai', 'jquery'].concat(tests),
>>>>>>> 568f229c7b5f75bf82b574fb5bb67bb033730235

  callback: function(chai) {
    assert  = chai.assert;
    expect  = chai.expect;
    should  = chai.should();
    window.__karma__.start();
  }

});