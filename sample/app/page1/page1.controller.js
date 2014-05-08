define([
  'vertebrae',
  './page1.view'
], function(Vertebrae, Page1View) {
 
  var Page1Controller = Vertebrae.Controller.extend({
    
    name: 'page1',

    view: Page1View

  });
 
  return Page1Controller;
});