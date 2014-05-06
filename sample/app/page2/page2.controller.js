define([
  'vertebrae/controller',
  './page2.view'
], function(BaseController, Page2View) {
 
  var Page2Controller = BaseController.extend({
    
    name: 'page2',

    view: Page2View

  });
 
  return Page2Controller;
});