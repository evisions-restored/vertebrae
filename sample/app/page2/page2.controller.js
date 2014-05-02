define([
  'vertebrae/content.controller',
  './page2.view'
], function(BaseContentController, Page2View) {
 
  var Page2Controller = BaseContentController.extend({
 
    setupView: function() {
      this.setView(new Page2View());
    }

  });
 
  return Page2Controller;
});