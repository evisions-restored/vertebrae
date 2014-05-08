define([
  'vertebrae',
  './page2.view'
], function(Vertebrae, Page2View) {
 
  var Page2Controller = Vertebrae.Controller.extend({
    
    name: 'page2',

    view: Page2View

  });
 
  return Page2Controller;
});