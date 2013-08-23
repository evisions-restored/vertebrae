define(['evisions/view', 'evisions/helper'], function(EVIView, helper) {
  /**
   * @class 
   * @memberOf Evisions.Modal
   */
  var ModalView = EVIView.extend(
    /** @lends Evisions.Modal.ModalView */
  {

    templates: {
      'dialog_modal_init': 'renderModalFragment',
      'dialog_modal_header_base' : 'renderHeaderFragment',
      'dialog_modal_footer_base' : 'renderFooterFragment'
    },

    events: {
      'show'          : 'viewDidShow',
      'shown'         : 'viewDidFinishShowing',
      'hide'          : 'viewDidHide',
      'hidden'        : 'viewDidFinishHiding',
      'click .close'  : 'handleCloseAction',
      'click .btn'    : 'handleModalButtonClick',
      'click .action' : 'handleModalButtonClick'
    },

    /**
     * Render the contents of the modal to the DOM
     *
     * @function
     * @instance
     * 
     * @param  {Object} options options that you may want to pass on to the template
     * 
     * @return {None}         
     */
    render: function() {
      var options = this.getDelegate().getOptions(),
          frag = this.renderModalFragment(options);
      this.renderHeaderToElement(frag.children('.modal-header'), options);
      this.renderBodyToElement(frag.children('.modal-body'));
      this.renderFooterToElement(frag.children('.modal-footer'));
      this.$el.html(frag);
      this.setupScroll();
      this.elementIsReady();
    },
    
    /**
     * Called when the modal view's element is ready
     *
     * @function
     * @instance
     * @override
     * 
     * @return {None} 
     */
    elementIsReady: function() {

    },

    /**
     * Load a section controller into the view
     *
     * @function
     * @instance
     * 
     * @param  {Evisions.Modal.ModalSectionController} sectionController      
     * @param  {Evisions.Modal.ModalSectionController} activeSectionController 
     * @param  {Boolean} leftAnimation           Animate left?
     * 
     * @return {Deferred}                         Resolved when the section has finished animating
     */
    loadSection: function(sectionController, activeSectionController, leftAnimation) {
      if (!this._setup) {
        sectionController.getView().show();
        this._setup = true;
        var deferred = helper.deferred();
        deferred.resolve();
        return deferred;
      } else {
        return this.slideModalSection(sectionController.getView().$el, activeSectionController.getView().$el, leftAnimation);
      }
    },

    /**
     * Get the element for a specific modal section view
     *
     * @function
     * @instance
     * 
     * @param  {Evisions.Modal.ModalSectionView} view 
     * 
     * @return {Element}    
     */
    getModalSectionElement: function(view) {
      var body = this.getBodyElement(), 
          container = body,
          el = this.getBodyElement().find('#' + view.cid);
      if (!el.length) {
        el = $('<div/>').addClass('modal-section hide').attr('id', view.cid);
        // Add check to make sure that the custom scroll bar is being used.
        container = $.fn.mCustomScrollbar ? body.find('.mCSB_container') : null; 
        if (container && container.length) {
          container.append(el);
        } else {
          body.append(el);
        }
      }
      return el;
    },

    /**
     * Setup a section controller by giving its view an element
     *
     * @function
     * @instance
     * 
     * @param  {Evisions.Modal.ModalSectionController} sectionController
     * 
     * @return {None}                   
     */
    setupSection: function(sectionController) {
      var sectionElement = this.getModalSectionElement(sectionController.getView());
      sectionController.setupViewProperties(sectionElement);
    },

    setupScroll: function() {
      helper.setupScroll(this.$('.modal-body'),false);
    },

    updateScroll: function() {
      var el = null;
      if (!helper.isTouchDevice() && $.fn.mCustomScrollbar) {
        el = $(".modal-body");
        el.mCustomScrollbar('update');
      }
    },


    /**
     * Passes in the header element and inserts content into it
     * Stub Function: this function is meant to overridden so the subclass can insert content
     *
     * @function
     * @instance
     * 
     * @param  {Element} el The header element
     * 
     * @return {None}
     */
    renderHeaderToElement: function(el, options) {
      el.html(this.renderHeaderFragment(options));
    },

    /**
     * Passes in the body element and inserts content into it
     * Stub Function: this function is meant to overridden so the subclass can insert content
     *
     * @function
     * @instance
     * 
     * @param  {Element} el The body element
     * 
     * @return {None}    
     */
    renderBodyToElement: function(el) {
      el.html('');
    },

    /**
     * Render the footer element for the current section again
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    refreshFooterElement: function() {
      this.renderFooterToElement(this.getFooterElement());
    },

    /**
     * Passes in the footer element and inserts content into to
     * Stub Function: this function is meant to overridden so the subclass can insert content
     *
     * @function
     * @instance
     * @override
     * 
     * @param  {Element} el The footer element
     * 
     * @return {None}    
     */
    renderFooterToElement: function(el) {
      el.html(this.renderFooterFragment({ 
        footText: this.getDelegate().getFootText(),
        buttons: this.getDelegate().getButtons() 
      }));
    },

    setTitle: function(text) {
      return this.$('.modal-title').text(text);
    },

    getTitle: function() {
      return this.$('.modal-title').text();
    },

    /**
     * Returns the header element
     *
     * @function
     * @instance
     * 
     * @return {Element} 
     */
    getHeaderElement: function() {
      return this.$('.modal-header');
    },

    /**
     * Returns the body element
     *
     * @function
     * @instance
     * 
     * @return {Element} 
     */
    getBodyElement: function() {
      return this.$('.modal-body');
    },

    /**
     * Returns the footer element
     *
     * @function
     * @instance
     * 
     * @return {Element} 
     */
    getFooterElement: function() {
      return this.$('.modal-footer');
    },

    /**
     * Kick off the show animation
     *
     * @function
     * @instance
     * 
     * @return {Deferred} A deferred object that will allow you to know when the animation is done
     */
    show: function(options) {
      var d = helper.deferred(),
          options = _.extend({}, options || {}, { show: true });
      this.$el.one('shown', d.resolve).modal(options || {});
      return d;
    },

    /**
     * Kick off the hide animation
     *
     * @function
     * @instance
     * 
     * @return {Deferred} A deferred object that will allow you to know hwne the animation is done
     */
    hide: function() {
      var d = helper.deferred();
      this.$el.one('hidden', d.resolve).modal('hide');
      return d;
    },

    /**
     * Show the loading spinner in the modal
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    showLoading: function() {
      if (this.spinner) {
        $(this.spinner.el).show();
        return;
      }
      try {
        var opts = {
          lines: 9, // The number of lines to draw
          length: 0, // The length of each line
          width: 4, // The line thickness
          radius: 6, // The radius of the inner circle
          corners: 1, // Corner roundness (0..1)
          rotate: 14, // The rotation offset
          color:  '#000', // #rgb or #rrggbb
          speed: 0.8, // Rounds per second
          trail: 58, // Afterglow percentage
          shadow: false, // Whether to render a shadow
          hwaccel: false, // Whether to use hardware acceleration
          className: 'spinner', // The CSS class to assign to the spinner
          zIndex: 2e9, // The z-index (defaults to 2000000000)
          top: 'auto', // Top position relative to parent in px
          left: 'auto' // Left position relative to parent in px
        },
        spinDiv = $('<div/>').addClass('rowSpinner');
        this.spinner = new Spinner(opts);
        this.spinner.spin(spinDiv.get(0));
        this.getFooterElement().append(spinDiv);
      } catch (e) {
        //if we get here then the Spinner is not included
      }
    },

    /**
     * Hide the loading spinner if it was shown previously
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    hideLoading: function() {
      if (this.spinner) {
        $(this.spinner.el).hide();
      }
    },

    /**
     * Called when the show animation starts
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    viewDidShow: function(ev) {
      if (ev.target === this.el) {
        this.callDelegateFunction('viewDidShow');
      }
    },

    /**
     * Called when the show animation is finished
     *
     * @function
     * @instance
     * 
     * @return {None}
     */
    viewDidFinishShowing: function(ev) {
      if (ev.target === this.el) {
        this.callDelegateFunction('viewDidFinishShowing');
      }
    },

    /**
     * Called the the hide animation starts
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    viewDidHide: function(ev) {
      if (ev.target === this.el) {
        this.callDelegateFunction('viewDidHide');
      }
    },

    /**
     * Called when the hide animation is finished
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    viewDidFinishHiding: function(ev) {
      if (ev.target === this.el) {
        this.callDelegateFunction('viewDidFinishHiding');
      }
    },

    /**
     * Helper function to attempt to call a function on the delegate which may not exist
     *
     * @function
     * @instance
     * 
     * @param  {String} name The name of the function you want to call on the delegate
     * @param  {Array} args An array of arguments you want to pass to the function
     * 
     * @return {Unknown}      Either null or w/e the delegate function returns
     */
    callDelegateFunction: function(name, args) {
      var delegate = this.getDelegate();
      if (delegate && _.isFunction(delegate[name])) {
        if (!args) {
          args = [];
        }
        return delegate[name].apply(delegate, args);
      }
      return null;
    },

    /**
     * @override
     * If there is an apply action it is caught here
     * This function should be overridden
     *
     * @function
     * @instance
     * @override
     * 
     * @param  {Event} ev The event that goes with the action
     * 
     * @return {None}    
     */
    handleApplyAction: function(ev) {

    },

    /**
     * If there is a cancel action is is caught here
     * This function should be overridden
     *
     * @function
     * @instance
     * @override
     * 
     * @param  {Event} ev The vent that goes with the action
     * 
     * @return {None}    
     */
    handleCancelAction: function(ev) {
      this.getDelegate().previousSection();
    },

    /**
     * Called when the user has selected something that has a close action attached to it
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    handleCloseAction: function() {
      this.getDelegate().close();
    },

    /**
     * If any button is clicked that has a data-action attached to it, it is caught here
     *
     * @function
     * @instance
     * 
     * @param  {Event} ev THe event that goes with the action
     * 
     * @return {String} The name of the button action
     */
    handleModalButtonClick: function(ev) {
      var el = $(ev.currentTarget),
        view = this.getDelegate().getActiveSection().getView(),
          action = el.attr('data-action') || '',
          fn = 'handle' + helper.camelCase(action) + 'Action';
      if (!el.prop('disabled') && !el.hasClass('disabled')) {
        if (_.isFunction(view[fn])) {
          view[fn].call(view, ev);
        } else if (_.isFunction(this[fn])) {
          this[fn].call(this, ev);
        }
      }
      return action;
    },

    /**
     * Slide a modal section view in/out
     *
     * @function
     * @instance
     * 
     * @param  {jQuery} section 
     * @param  {jQuery} active  
     * @param  {Boolean} left    Slide left?
     * 
     * @return {Deferred}        Resolved when the animation has finished
     */
    slideModalSection: function(section, active, left) {
      var d = helper.deferred();
      if (!active.length) {
        section.removeClass('hide');
        active.addClass('hide');
        d.resolve();
        return d;
      }

      var speed = 'fast',
          easing = 'easeOutCubic';

      var container              = active.parent(),
          styles                 = ['display', 'left', 'top', 'width', 'height', 'position'],
          activeCurrentStyles    = $.styles(active.get(0), styles, true),
          sectionCurrentStyles   = $.styles(section.get(0), styles, true),
          containerCurrentStyles = $.styles(container.get(0), styles, true);

      var allDone = function() {
        active.css(activeCurrentStyles);
        active.hide();
        section.css(sectionCurrentStyles);
        container.css(containerCurrentStyles);
        section.removeClass('hide').show();
        d.resolve();
      };

      allDone = _.after(3, allDone);
      
      var activeOffset        = active.offset(),
          activeHeight          = active.height(),
          activeWidth           = active.outerWidth(true);
          
      section.show();

      var newSectionWidth       = section.outerWidth(true),
          newSectionHeight      = section.height();

      active.hide();

      var containerHeightToBe   = container.height();

      active.show();
      section.hide();

      var containerHeight       = container.height(),
          containerPosition     = container.offset(),
          containerWidth        = container,
          containerPositionType = container.css('position'),
          paddingLeft           = parseInt(container.css('padding-left')) || 0,
          paddingTop            = parseInt(container.css('padding-top')) || 0,
          paddingBottom         = parseInt(container.css('padding-bottom')) || 0,
          paddingRight          = parseInt(container.css('padding-right')) || 0,
          containerTotalWidth   = container.outerWidth(true),
          activePosition     = {
            top: (activeOffset.top - containerPosition.top),
            left: (activeOffset.left - containerPosition.left)
          },
          sectionPosition  = {
            top  : activePosition.top,
            left : activePosition.left + (left ? containerTotalWidth : -containerTotalWidth)
          };
      //make sure that the container is not position static
      if (containerPositionType == 'static') {
        container.css('position', 'relative');
      }

      container
          .height(containerHeight)
          .width(containerWidth)
          // .css({ overflow: 'hidden' })
          .animate({ height : containerHeightToBe }, speed, easing, allDone);


      active
          .removeClass('active')
          .height(activeHeight)
          .width(activeWidth)
          .css(activePosition)
          .css({ position: 'absolute' })
          .animate({ left : (left ? (activePosition.left - containerTotalWidth) : (activePosition.left + containerTotalWidth)) }, speed, easing, allDone);

      section
          .addClass('active')
          .show()
          .height(newSectionHeight)
          .width(newSectionWidth)
          .css(sectionPosition)
          .css({ position: 'absolute' })
          .animate({ left: activePosition.left }, speed, easing, allDone);


      return d;
    },

    /**
     * Call this if you want to clear our the modal and undelegate all events
     * 
     * @return {None}
     */
    remove: function() {
      this.spinner = null;
      this.$el.empty();
      this.undelegateEvents();
    }

  });
  return ModalView;
});