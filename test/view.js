define([
  'jquery',
  'vertebrae/view',
  'vertebrae/controller',
  'handlebars'
], function($, BaseView, BaseController, Handlebars) {

  describe('BaseView', function() {

    var SimpleView,
      SimpleController,
      myView,
      myDelegate,
      myElement;

    beforeEach(function() {
      SimpleView       = BaseView.extend({}, {});

      SimpleController = BaseController.extend({
        setupView: function() {
          this.setView(new SimpleView());
        }
      }, {});

      $(document.body).empty();

      myElement = $("<div>").appendTo(document.body);
      myDelegate    = new SimpleController();
      myDelegate.setupViewProperties(myElement);
      myView = myDelegate.getView();

    });

    it('constructor', function() {
      expect(myView).to.be.instanceof(BaseView);
      expect(myView).to.be.instanceof(SimpleView);

      // The constructor sets up 2 events, hidden and rendered
      // lets make sure they were bound correctly
      assert.ok(myView._events['change:hidden']);
      assert.ok(myView._events['change:rendered']);
      assert.equal(myView._events['change:hidden'][0].ctx.el, myView.el);
      assert.equal(myView._events['change:rendered'][0].ctx.el, myView.el);
    }); // BaseObject instantiation

    it('prototype.destroy', function() {
      myView.destroy();
      assert.isNull(myView.$el);
      assert.isNull(myView.el);
    });

    it('prototype.getDelegate', function() {
      assert.equal(myView.getDelegate(),myDelegate);
    });

    it('prototype.getElementDatum', function() {
      var someData = {
        'key': 'value'
      };
      BaseView.datum(myElement,someData);

      var output = myView.getElementDatum(myElement);
      assert.equal(someData,output);
    });

    it('prototype.refreshAvailable', function() {
      //Should be available initially
      assert.isTrue(myView.isAvailable());

      //changing properties should trigger refreshAvailable to be called
      myView.setHidden(true);
      assert.isFalse(myView.isAvailable(), 'Hidden is true, so it should be unavailble.');

      myView.setHidden(false);
      assert.isTrue(myView.isAvailable(), 'Hidden is back to false, so it should be available');

      myView.set('rendered',false);
      assert.isFalse(myView.isAvailable(), 'Rendered is false, so it should be unavailble.');
      
      myView.setRendered();
      assert.isTrue(myView.isAvailable(), 'Rendered is back to true, so it should be available.');
    });

    it('prototype.whenAvailable', function() {
      // should be available immedietly
      var flag = false;
      myView.whenAvailable()
        .done(function() {
          flag = true;
        });

      assert.isTrue(flag, 'whenAvailable should immedietly resolve');

      // Should make it unavailable
      myView.setHidden(true);
      assert.isFalse(myView.isAvailable());
      flag = false;

      myView.whenAvailable()
        .done(function() {
          flag = true;
        });
      assert.isFalse(flag, 'Flag should not have been set yet since the view isnt available');

      // should make it available again
      myView.setHidden(false);

      assert.isTrue(flag, 'available should have updated, resolving the deferred and setting the flag to true, but didnt');
    });

    it('prototype.isAvailable', function() {
      assert.isTrue(myView.isAvailable());

      // Should be unavailable
      myView.set('hidden', true, true);
      myView.set('rendered', false, true);
      assert.isFalse(myView.isAvailable());

      // Should be unavailable
      myView.set('hidden', false, true);
      myView.set('rendered', false, true);
      assert.isFalse(myView.isAvailable());

      // Should be unavailable
      myView.set('hidden', true, true);
      myView.set('rendered', true, true);
      assert.isFalse(myView.isAvailable());

      // Should be the only case where it is available
      myView.set('hidden', false, true);
      myView.set('rendered', true, true);
      assert.isTrue(myView.isAvailable());
    });

    it('prototype.getAvailable', function() {
      myView.available = false;
      assert.isFalse(myView.getAvailable());

      myView.available = true;
      assert.isTrue(myView.getAvailable());
    });

    it('prototype.setAvailable', function() {
      var counter = 0;
      myView.listenTo(myView, "change:available", function() {
        counter++;
      });

      myView.setAvailable(false);
      assert.isFalse(myView.getAvailable());

      myView.setAvailable(true);
      assert.isTrue(myView.getAvailable());

      assert.equal(counter,2,'available event should have fired twice from this.')

      myView.setAvailable(false,true);//should not listeners
      assert.equal(counter,2,'available event should not fire when noTrigger is true')
    });

    it('prototype.setRendered', function() {
      myView.rendered = false;
      assert.isFalse(myView.rendered);
      myView.setRendered();

      assert.isTrue(myView.rendered);
    });

    it('prototype.isRendered', function() {
      myView.rendered = undefined;
      assert.isFalse(myView.isRendered());
      myView.rendered = false;
      assert.isFalse(myView.isRendered());
      myView.rendered = true;
      assert.isTrue(myView.isRendered());
    });

    it('prototype.setHidden', function() {
      var counter = 0;
      myView.listenTo(myView, "change:hidden", function() {
        counter++;
      });

      myView.hidden = false;
      assert.isFalse(myView.hidden);
      myView.setHidden(true);

      assert.equal(counter,1,'hidden should have triggered events, but didnt')
      assert.isTrue(myView.hidden);

      myView.setHidden(false,true);
      assert.equal(counter,1,'hidden should not have triggered events, but did')
    });

    it('prototype.isHidden', function() {
      myView.hidden = undefined;
      assert.isFalse(myView.isHidden());
      myView.hidden = false;
      assert.isFalse(myView.isHidden());
      myView.hidden = true;
      assert.isTrue(myView.isHidden());
    });

    it('prototype.getRendered', function() {
      myView.rendered = false;
      assert.isFalse(myView.getRendered());

      myView.rendered = true;
      assert.isTrue(myView.getRendered());
    });

    it('prototype.renderFragment', function() {
      var context = { test: 'value-here' };
      var source = "<div class='{{test}}'>{{test}}</div>"

      var template = Handlebars.compile(source);

      BaseView.setupTemplates({
        'render.frag.test': template
      });

      var result = myView.renderFragment('render.frag.test', context);
      
      assert.instanceOf(result,$);
      assert.lengthOf(result,1);
      assert.instanceOf(result.get(0), DocumentFragment);
      result.appendTo(document.body)

      assert.equal(document.body.innerHTML,"<div></div><div class=\"value-here\">value-here</div>");

      assert.isUndefined(myView.getElementDatum($(".value-here")));

      context = {test:'has-data'};
      result = myView.renderFragment('render.frag.test', context,true);
      result.appendTo(document.body);

      var data = myView.getElementDatum($(".has-data"));

      assert.equal(data,context);

    });


  }); // BaseView Unit Test

});