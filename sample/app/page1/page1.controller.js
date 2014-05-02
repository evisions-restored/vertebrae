define([
  'vertebrae/content.controller',
  './page1.view'
], function(BaseContentController, Page1View) {
 
  var Page1Controller = BaseContentController.extend({
 
    setupView: function() {
      this.setView(new Page1View());
    }

  });
 
  return Page1Controller;
});