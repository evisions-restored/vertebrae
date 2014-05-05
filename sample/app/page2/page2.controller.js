define([
  'vertebrae/controller',
  './page2.view'
], function(BaseController, Page2View) {
 
  var Page2Controller = BaseController.extend({
 
    setupView: function() {
      this.setView(new Page2View());
    }

  });
 
  return Page2Controller;
});