define([
  'vertebrae/controller',
  './page1.view'
], function(BaseController, Page1View) {
 
  var Page1Controller = BaseController.extend({
    
    name: 'page1',

    view: Page1View

  });
 
  return Page1Controller;
});