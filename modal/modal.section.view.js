define(['evisions/view'], function(EVIView) {
  /**
   * @class 
   * @memberOf Evisions.Modal
   */
  var ModalSectionView = EVIView.extend(
    /** @lends  Evisions.Modal.ModalSectionView */
  {

    // buttons: [
      // {
      //   color     : 'blue',
      //   icon      : 'pencil',
      //   text      : 'Update',
      //   action    : 'update',
      // },
      // {
      //   icon    : 'pencil',
      //   text    : 'Unlink',
      //   color   : 'red',
      //   action  : 'unlink',
      // },
      // {
      //   icon    : 'pencil',
      //   text    : 'Link',
      //   color   : 'green',
      //   action  : 'link',
      // },
      // {
      //   icon   : 'share-alt',
      //   text   : 'Cancel',
      //   action : 'cancel'
      // }
    // ],
    
    /**
     * Set the element for a view
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    setElement: function() {
      var ret = this._super.apply(this, arguments);
      if (this.className) {
        this.$el.addClass(this.className);
      }
      return ret;
    },

    /**
     * Show the modal section
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
  	show: function() {
  		this.$el.removeClass('hide').show();
  	},

    updateScroll: function() {
      this.getDelegate().getModal().getView().updateScroll();
    },

    /**
     * Hide the modal section
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
  	hide: function() {
  		this.$el.addClass('hide').hide();
  	}
    
  });
  return ModalSectionView;
});