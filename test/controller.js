define(['vertebrae/controller', 'vertebrae/event', 'vertebrae/view'], function(Controller, Event, View) {

  describe('BaseController', function() {

    var TestController = Controller.extend({

      observes: {
        'test-event': 'handleTestEvent'
      },

      properties: [
        'test'
      ],

      initialize: function() {
        this.testEventCounter = 0;
        this._super();
      },

      setupView: function() {
        this.setView(new View());
      },

      handleTestEvent: function() {
        this.testEventCounter++;
      }

    });

    var controller = null;

    beforeEach(function() {
      controller = new TestController();
    });

    afterEach(function() {
      controller = null;
    });

    it('prototype.observes', function() {
      Event.fire('test-event');

      expect(controller.testEventCounter).to.equal(1);

      controller.destroy();

      Event.fire('test-event');

      expect(controller.testEventCounter).to.equal(1);

      controller = new TestController();
    });

    it('prototype.sync', function() {
      var viewCounter     = 0,
          propertyCounter = 0;

      controller.refreshTestPropertyOnView = function() {
        viewCounter++;
      };
      controller.testDidChange = function() {
        propertyCounter++;
      };

      controller.sync('test');

      expect(viewCounter).to.equal(0);
      expect(propertyCounter).to.equal(0);

      controller.getView().setRendered();

      expect(viewCounter).to.equal(1);
      expect(propertyCounter).to.equal(0);

      controller.setTest('changed!!');

      expect(viewCounter).to.equal(2);
      expect(propertyCounter).to.equal(1);
    });


    it('prototype.destroy', function() {
      var count = 0;

      controller.on('my-event', function() {
        count++;
      });

      controller.listenTo(controller, 'my-event', function() {
        count++;
      });

      controller.destroy();
      controller.trigger('my-event');

      expect(controller._unloaded).to.be.true;
      expect(controller.getView()).to.be.null;

      expect(count).to.equal(0);
    });

    it('prototype.viewIsReady', function() {
      var called = false;

      var TestControllerA = TestController.extend({
        viewIsReady: function() {
          called = true;
        }
      });

      controller = new TestControllerA();
      controller.setupViewProperties(document.body);

      expect(called).to.be.true;
    });

    it('prototype.viewIsAvailable', function() {
      var called = false;

      var TestControllerA = TestController.extend({
        viewIsReady: function() {
        },
        viewIsAvailable: function() {
          called = true;
        }
      });

      controller = new TestControllerA();
      controller.setupViewProperties(document.body);

      expect(called).to.be.false;

      controller.getView().setRendered();

      expect(called).to.be.true;
    });

  });

});