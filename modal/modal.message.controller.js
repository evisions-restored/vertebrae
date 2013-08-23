define([
  'evisions/modal/modal.section.controller',
  'evisions/modal/modal.message.view',
  'evisions/helper'
  ], function(ModalSectionController, ModalMessageView, helper) {
    var ModalMessageController = ModalSectionController.extend({

    properties: ['template', 'message', 'data'],

    setupView: function() {
      this.setView(new ModalMessageView());
    },

    /**
     * Get the data that drives the template
     *
     * @function
     * @instance
     * 
     * @return {Object} 
     */
    getViewData: function() {
      var data = null;

      data = _.extend({}, this.getData(), { message: this.getMessage() });

      return data;
    },

    setButtons: function(buttons) {
      this.getView().buttons = buttons;
      return this;
    },

    setFootText: function (footerText) {
      this.getView().footerText = footerText;
      return this;
    },

    addMessage: function(message) {
      this.getView().addMessage(message);
      this.getModal().getView().updateScroll();
    },

    onAction: function(action, fn) {
      var view = this.getView(),
          actionHandler = 'handle' + helper.camelCase(action) + 'Action';

      if (!view[actionHandler]) {
        view[actionHandler] = fn;
      }
      return this;
    }
  },
  {
    /**
     * Create a new modal message section controller with the given message/template and buttons
     *
     * @function
     * 
     * @param  {String} message Either a message for the template or a template to replace the default template.
     * @param  {Array} buttons Array of buttons to use.
     * 
     * @return {Evisions.ArgosWeb.Modals.ModalMessageController}         
     */
    create: function(message, buttons) {
      var controller = new this();

      controller.setButtons(buttons);

      if (helper.templateExists(message)) {
        controller.setTemplate(message);
      } else {
        controller.setMessage(message);
      }

      return controller;
    }
  });

  return ModalMessageController;
});