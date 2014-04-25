define([
        'vertebrae/view',
], function(
        BaseView) {

  var MainView = BaseView.extend({

    render: function() {
      console.log('here');
      
      this._super.apply(this, arguments);
    }

  });

  return MainView;

});
