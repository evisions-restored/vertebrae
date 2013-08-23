define(['evisions/modal/modal.section.view'], function(ModalSectionView) {
  var ShareCompleteSectionView = ModalSectionView.extend({

    className: 'modalMessageView',

    templates: {
      'modal.message.default' : 'renderDefaultTemplate'
    },

    /**
     * If a custom template is specified in the delegate then that is render.  Otherwise the default template is used.
     *
     * @function
     * @instance
     */
    render: function() {
      var delegate = this.getDelegate(),
          template = delegate.getTemplate();

      if (template) {
        this.$el.html(this.template(template, delegate.getViewData()));
      } else {
        this.$el.html(this.renderDefaultTemplate(delegate.getViewData()));
      }

    },

    addMessage: function(message) {
      this.$el.append(message);
    }
    
  });
  return ShareCompleteSectionView;
});