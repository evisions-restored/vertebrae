define([
  'vertebrae/controller',
  './page1.view'
], function(BaseController, Page1View) {
 
  var Page1Controller = BaseController.extend({
 
    setupView: function() {
      this.setView(new Page1View());
    }

  });
 
  return Page1Controller;
});