define(['evisions/controller'], function(EVIController) {
  /**
   * @class 
   * @memberOf Evisions.Modal
   */
  var ModalSectionController = EVIController.extend(
    /** @lends  Evisions.Modal.ModalSectionController */
  {
    properties: ['modal'],

    /**
     * Called when a modal section needs to make an api call in order to get its data
     *
     * @function
     * @instance
     * @override
     * 
     * @return {None} 
     */
    refresh: function() {
      //do nothing
    },

    /**
     * Called when a section is ready for rendering/manipulation
     *
     * @function
     * @instance
     * @override
     * 
     * @return {None} 
     */
    sectionIsReady: function() {
      this.getView().render();
    },

    /**
     * Called when a section has finished animating into place.  Often used for focusing on elements.
     *
     * @function
     * @instance
     * @override
     * 
     * @return {None}
     */
    sectionDidLoad: function() {
      //lets us know the section finished animating
    },

    viewIsReady: function() {
      //do nothing on purpose
    },

    /**
     * Showing a loading wheel
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    showLoading: function() {
      this.getModal().showSectionBusy();
    },

    /**
     * Hide a loading wheel
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    hideLoading: function() {
      this.getModal().hideSectionBusy();
    },

    /**
     * Load a section into the modal
     *
     * @function
     * @instance
     * 
     * @param  {Evisions.Modal.ModalSectionController} section
     * 
     * @return {None}         
     */
    loadSection: function(section) {
      this.getModal().loadSection(section);
    },

    getPreviousSection: function() {
      return this.getModal().getPreviousSection();
    },

    /**
     * Load the previous section
     *
     * @function
     * @instance 
     * 
     * @return {None} 
     */
    previousSection: function() {
      this.getModal().previousSection();
    },

    /**
     * Sets the title of the modal.  Will also restore the previously set title when this section is unloaded.
     * 
     * @param  {STring} text The modal title
     */
    setTitle: function(text) {
      if (this._oldTitle == null) {
        this._oldTitle = this.getModal().getView().getTitle();
      }
      return this.getModal().getView().setTitle(text);
    },

    /**
     * Called when this controller needs to unload
     *
     * @function
     * @instance
     * @override
     * 
     * @return {None} 
     */
    unload: function() {
      // If we have a saved old title then restore it.
      if (this._oldTitle) {
        this.getModal().getView().setTitle(this._oldTitle);
        this._oldTitle = null;
      }
    }
    
  });
  return ModalSectionController;
});