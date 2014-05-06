require.config({

  baseUrl: './',

  paths: {
    backbone   : '../libs/backbone/backbone',
    jquery     : '../libs/jquery/dist/jquery',
    underscore : '../libs/underscore/underscore',
    handlebars : '../libs/handlebars/handlebars.runtime',
    vertebrae  : '../src'
  },

  shim: {
    handlebars: {
      exports: 'Handlebars'
    }
  },

  deps: ['jquery', 'app/app'],

  callback: function($, App) {
    $(function() {

      App.launch(document.body);
      
    });
  }

});