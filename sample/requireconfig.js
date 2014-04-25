require.config({

  baseUrl: './',

  paths: {
    backbone   : '../libs/backbone/backbone',
    jquery     : '../libs/jquery/dist/jquery',
    underscore : '../libs/underscore/underscore',
    handlebars : '../libs/handlebars/handlebars',
    vertebrae  : '../src'
  },

  shim: {
    handlebars: {
      exports: 'Handlebars'
    }
  }

});