define(['evisions/object', 'evisions/modal/modal.controller', 'evisions/modal/modal.message.controller', 'evisions/helper'], function(EVIObject, Modal, ModalMessageController, helper) {
  var EVIError = EVIObject.extend({

    properties: ['modal', 'modalVisible', 'messageController'],

    isModalVisible: function() {
      return !!this.getModalVisible();
    },

    showMessage: function(err) {
      var that = this;

      this.ensureModal(err).done(function() { that.showMessageOnModal(err); });
    },

    showMessageOnModal: function(err) {
      var messageController = this.getMessageController();
      messageController.addMessage(this.createMessageFromError(err, true));
    },

    ensureModal: function(message) {
      var modal   = this.getModal(),
          visible = this.isModalVisible(),
          that    = this,
          d       = helper.deferred();

      if (visible) {
        d.resolve();
      } else if (modal) {
        modal.one('hidden', function() { that.showModal(message).always(d.rejecet); });
      } else {
        that.showModal(message).always(d.reject);
      }

      return d;
    },

    createMessageFromError: function(err, br) {
      var message = '';
      if (br) {
        message += '<br />';
      }
      message += '<div class="attributeGroup">';
      message += '<div class="field">'
      message += 'Error Code: ' + (err.code || 0);
      message += '</div>';
      message += '<div class="value">'
      message += err.message;
      message += '</div>';
      message += '</div>';
      return message;
    },
    
    showModal: function(err) {
      var messageController = new ModalMessageController(),
          that = this,
          modal = null;

      messageController.setButtons([
        {
          text: 'Close' ,
          icon: 'share-alt',
          action: 'cancel'
        }
      ]);

      if (err) {
        messageController.setMessage(this.createMessageFromError(err));
      }

      this.setMessageController(messageController);

      modal = Modal.create(messageController, { title: 'Error' });

      this.setModalVisible(true);

      return modal.show()
          .done(that.modalDidShow.proxy(this));
    },

    modalDidShow: function(modal) {
      var that = this;
      this.setModal(modal);
      modal.on('hide', function() { that.setModalVisible(false); });
      modal.on('hidden', this.modalDidHide.proxy(this));
    },

    modalDidHide: function() {
      this.setModal(null); 
    }

  },
  {
    message: function(err) {
      err = err || {};
      err.message = err.message || 'Generic error message';
      this.get().showMessage(err);
    },

    get: function() {
      if (!this._singleton) {
        this._singleton = new this();
      }
      return this._singleton;
    }

  });
  return EVIError;
});