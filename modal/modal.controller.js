/**
 * @namespace Evisions.Modal
 */
define([
  'jquery', 
  'underscore', 
  'evisions/controller', 
  'evisions/modal/modal.view', 
  'evisions/modal/modal.section.controller',
  'evisions/helper'
  ], function($, _, EVIController, ModalView, ModalSectionController, helper) {
  /**
   * @class
   * @memberOf Evisions.Modal
   */
  var ModalController = EVIController.extend(
    /** @lends  Evisions.Modal.ModalController */
  {

    properties: ['mainSection', 'title', 'sectionStack','options','loginDisabled', 'modalDeferred'],

    initialize: function() {
      this._super();
      this.setSectionStack([]);
      this.setTitle("evisions");
      this.setModalDeferred(helper.deferred());
    },

    setupView: function() {
      this.setView(new ModalView());
    },

    /**
     * Show the modal
     *
     * @function
     * @instance
     * 
     * @return {Deferred} Resolved when modal has finished showing
     */
    show: function() {
      //loads the main section and displays the modal
      var main = this.getMainSection();
      
      if (main) {
        this.loadSection(main);
      }

      var d = helper.deferred(),
          modalDeferred = this.getModalDeferred(),
          that = this;

      this.getView().show(this.getOptions())
          .done(function() {
            modalDeferred.resolve(that);
            d.resolve(that);
          })
          .fail(d.reject)

      return d;
    },

    getPreviousSection: function() {
      var stack = this.getSectionStack(),
          previous = stack[stack.length-2];

      return previous;
    },

    /**
     * Transition to the previous section.  Close if there are no more sections
     *
     * @function
     * @instance
     * 
     * @return {Deferred} 
     */
    previousSection: function() {
      var that = this,
          args = arguments,
          stack = this.getSectionStack(),
          current = stack[stack.length-1],
          previousSection = stack[stack.length-2];

      if (current) {
        current.unload();
      }
      
      //will close if there is no prevous section
      if (stack.length > 1) {
        return this.loadSection(previousSection)
            .always(function() { stack.pop(); });
      } else {
        stack.pop();
        return this.close();
      }
    },

    /**
     * Get the section controller that is currently active
     *
     * @function
     * @instance
     * 
     * @return {Evisions.Modal.ModalSectionController}
     */
    getActiveSection: function() {
      return (_.last(this.getSectionStack()) || this.getMainSection());
    },

    /**
     * Get the buttons for the active section
     *
     * @function
     * @instance
     * 
     * @return {Array} The array of button definitions
     */
    getButtons: function() {
      var section = this.getActiveSection();
      if (_.isFunction(section.getButtons)) {
        return section.getButtons() || [];
      } else {
        return section.getView().buttons || [];
      }
    },

    /**
     * Get the footer text for the active section
     *
     * @function
     * @instance
     * 
     * @return {Object} Object containing the footer text options
     */
    getFootText: function() {
      var section = this.getActiveSection();
      if (_.isFunction(section.getFootText)) {
        return section.getFootText() || null;
      } else {
        return section.getView().footerText || null;
      }
    },

    /**
     * Close the modal
     *
     * @function
     * @instance
     * 
     * @return {Deferred} Resolved when the modal has finished closing
     */
    close: function() {
      return this.getView().hide();
    },

    /**
     * Unload the Modal
     *
     * @function
     * @instance
     * 
     * @return {None}
     */
    unload: function() {
      var main = this.getMainSection();
      main.unload();
      return this._super();
    },

    /**
     * Destroy the modal and the main section
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    destroy: function() {
      var main = this.getMainSection();
      main.destroy();
      this._super();
    },

    /**
     * Show that a section is busy
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    showSectionBusy: function() {
      this.getView().showLoading();
    },

    /**
     * Hide the section busy
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    hideSectionBusy: function() {
      this.getView().hideLoading();
    },

    setupSectionScroll: function() {
    },

    sectionDidLoad: function() {
      this.getView().updateScroll();
    },

    /**
     * Load a section into the modal
     *
     * @function
     * @instance
     * 
     * @param  {Evisions.Modal.ModalSectionController} section
     * 
     * @return {Deferred}   Resolved when the section has finished showing
     */
    loadSection: function(section) {
      if (!section._sectionSetup) {
        section.setModal(this);
        this.getView().setupSection(section);
        section._sectionSetup = true;
      }
      //call refresh on the section to let it know it is about to be shown
      var refreshDeferred = section.refresh(),
          allDoneDeferred = helper.deferred(),
          that = this,
          stack = this.getSectionStack(),
          goingToNewSection = section !== stack[stack.length-2],
          active = this.getActiveSection(),
          sectionIsLoaded = function() {
            section.sectionIsReady.apply(section, arguments);
            _.defer(function() {
              that.getView().loadSection(section, active, goingToNewSection)
              .always(function() {
                that.getModalDeferred().always(function() { 
                  section.sectionDidLoad();
                  that.sectionDidLoad();
                  allDoneDeferred.resolve();
                });
              });
            });
          };
      //push new the section onto the stack
      this.getSectionStack().push(section);
      //refresh the foote element which will use that new section 
      this.getView().refreshFooterElement();
      //if we are going back to a preious section though, we want to remove it from the stack since we already have it
      //event if we are going back, the section has to be added so refreshFooterElement can properly find it at the end of the stack
      if (!goingToNewSection) {
        this.getSectionStack().pop();
      }
      //if calling refresh returned a deferred then wait for it to finish
      if (refreshDeferred) {
        this.getView().showLoading();

        refreshDeferred
          .done(sectionIsLoaded)
          .always(function() { that.getView().hideLoading(); });
      } else {
        sectionIsLoaded();
      }
      return allDoneDeferred;
    },

    /**
     * Called when a modal has started to show
     *
     * @function
     * @instance
     * 
     * @return {None}
     */
    viewDidShow: function() {
      this.trigger('show');
    },

    /**
     * Called when a modal has finished showing
     *
     * @function
     * @instance
     * 
     * @return {None}
     */
    viewDidFinishShowing: function() {
      this.trigger('shown');
    },

    /**
     * Called when a modal has started to hide
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    viewDidHide: function() {
      this.trigger('hide');
    },

    /**
     * Called when a modal has finished hiding
     *
     * @function
     * @instance
     * 
     * @return {None} 
     */
    viewDidFinishHiding: function() {
      this.unload();
      this.destroy();
      this.trigger('hidden');
    }
  },
  /** @lends  Evisions.Modal.ModalController */
  {
    //static

    /**
     * Default element selector for a modal
     * @type {String}
     */
    defaultModalElement :"#modalGlobal",
    
    /**
     * Create a modal controller
     * @example
     * //possible options to pass in to create
     * {
     *   dismiss: false,
     *   keyboard: false,
     *   backdrop: false,
     *   title: "My Modal Title"
     * }
     *
     * @function
     * @static
     * 
     * @param  {Evisions.Modal.ModalSectionController} mainSectionController
     * @param  {Object} options               Display options for the modal
     * 
     * @return {Evisions.Modal.ModalController}               
     */
    create: function(mainSectionController, options) {
      if (!(mainSectionController instanceof ModalSectionController)) {
        throw new Error('A modal must be created with an instance of ModalSectionController');
      }

      var newMC = new ModalController(),
          options = _.extend({
            title: "Untitled",
            element: $(this.defaultModalElement)
          }, options || {});
      //cannot close this modal
      if (options.dismiss === false) {
        if (options.keyboard == null) {
          options.keyboard = false;
        }
        if (options.backdrop == null) {
          options.backdrop = 'static'
        }
        options.noClose = true;
      }

      newMC.setOptions(options);
      newMC.setMainSection(mainSectionController);
      newMC.setTitle(options.title);
      newMC.setupViewProperties(options.element);

      return newMC;
    }

  });
  return ModalController;
});
