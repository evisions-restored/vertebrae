define([
  'vertebrae/view' 
], function(BaseView) {

  var HeaderView = BaseView.extend({

    templates: {
      header: 'renderContent'
    },

    events: {
      'click .likes-container': 'delegate.increaseLikeCount'
    },

    setCurrentPage: function(page) {
      this.$('.current-page').text(page);
    },

    setLikeCount: function(count) {
      this.$('.like-count').text(count);
    },

    render: function() {
      var delegate = this.getDelegate(),
          user     = delegate.getUser();

      this.$el.html(this.renderContent(user));
    }

  });

  return HeaderView;
});