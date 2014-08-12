var tests = [],
    assert, expect, should;

try {
  for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
      if (file.indexOf('/base/test') == 0) {
        tests.push(file);
      }
    }
  }
} catch (e) {}

require.config({

  baseUrl: '/base',

  paths: {
    backbone   : './libs/backbone/backbone',
    jquery     : './libs/jquery/dist/jquery',
    underscore : './libs/underscore/underscore',
    chai       : './libs/chai/chai',
    handlebars : './libs/handlebars/handlebars',
    bluebird   : './libs/bluebird/js/browser/bluebird',
    vertebrae  : './src'
  },

  shim: {
    handlebars: {
      exports: 'Handlebars'
    }
  },

  deps: ['chai', 'vertebrae/view', 'bluebird', 'jquery'].concat(tests),

  callback: function(chai, BaseView, Promise) {
    window.Promise = Promise;
    assert  = chai.assert;
    expect  = chai.expect;
    should  = chai.should();
    window.__karma__.start();
  }

});