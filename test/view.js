define([
        'jquery',
        'handlebars',
        'vertebrae/view',
        'vertebrae/controller'
], function(
        $, 
        Handlebars,
        BaseView, 
        BaseController) {

  describe('BaseView', function() {

    var SimpleView,
      SimpleController,
      myView,
      myDelegate,
      myElement;

    beforeEach(function() {
      SimpleView       = BaseView.extend({
        templates: {
          'defined.template' : 'renderDefinedTemplate'
        },

        templateName: 'default.template'
      }, {});

      SimpleController = BaseController.extend({
        setupView: function() {
          this.setView(new SimpleView());
        }
      }, {});

      $(document.body).empty();

      myElement = $("<div>").appendTo(document.body);
      myDelegate    = new SimpleController();
      myDelegate.setup(myElement);
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


    it('prototype.isAvailable', function() {
      assert.isTrue(myView.isAvailable());

      // Should be unavailable
      myView.set('hidden', true, { silent: true });
      myView.set('rendered', false, { silent: true });
      assert.isFalse(myView.isAvailable());

      // Should be unavailable
      myView.set('hidden', false, { silent: true });
      myView.set('rendered', false, { silent: true });
      assert.isFalse(myView.isAvailable());

      // Should be unavailable
      myView.set('hidden', true, { silent: true });
      myView.set('rendered', true, { silent: true });
      assert.isFalse(myView.isAvailable());

      // Should be the only case where it is available
      myView.set('hidden', false, { silent: true });
      myView.set('rendered', true, { silent: true });
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

      assert.equal(counter, 2, 'available event should have fired twice from this.')

      myView.setAvailable(false, { silent: true });//should not listeners
      assert.equal(counter, 2, 'available event should not fire when noTrigger is true')
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

      assert.equal(counter,1 , 'hidden should have triggered events, but didnt')
      assert.isTrue(myView.hidden);

      myView.setHidden(false, { silent: true });
      assert.equal(counter, 1, 'hidden should not have triggered events, but did')
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
      // Setup a handlebars template and context to be rendered
      var context = { test: 'value-here' };
      var source = "<div class='{{test}}'>{{test}}</div>"

      var template = Handlebars.compile(source);

      // Load the template into the view
      BaseView.setupTemplates({
        'render.frag.test': template
      });

      // Get the resulting DocumentFragment rendered
      var result = myView.renderFragment('render.frag.test', context);
      
      // Verify the output of the render
      assert.instanceOf(result, $);
      assert.lengthOf(result, 1);
      assert.instanceOf(result.get(0), DocumentFragment);
      result.appendTo(myElement)

      // Make sure the html generated is what it should be
      assert.equal(myElement.html(),"<div class=\"value-here\">value-here</div>");

      // Make sure there is no datum (since we didn't bind any data to it)
      assert.isUndefined(myView.getElementDatum($(".value-here")));

      // Lets render the template again, this time binding data
      context = {test: 'has-data'};
      result = myView.renderFragment('render.frag.test', context,true);
      result.appendTo(document.body);

      // Retrieve any data on the element
      var data = myView.getElementDatum($(".has-data"));

      // Make sure the data retrieved is what it should be
      assert.equal(data, context);
    });

    it('prototype.renderFragments', function() {
      var multicontext = [
        { test: 'value-1' },
        { test: 'value-2' }
      ];
      var source = "<div class='{{test}}'>{{test}}</div>"

      var template = Handlebars.compile(source);

      // Load the template into the view
      BaseView.setupTemplates({
        'render.frag.test': template
      });

      // Get the resulting DocumentFragments rendered
      var result = myView.renderFragments('render.frag.test', multicontext);

      // Verify the output of the render
      assert.instanceOf(result, $);
      assert.lengthOf(result, 1);
      assert.instanceOf(result.get(0), DocumentFragment);
      result.appendTo(myElement);

      assert.equal(myElement.html(), "<div class=\"value-1\">value-1</div><div class=\"value-2\">value-2</div>");
    
      // Make sure there is no datum (since we didn't bind any data to it)
      assert.isUndefined(myView.getElementDatum($(".value-1")));
      assert.isUndefined(myView.getElementDatum($(".value-2")));

      myElement.empty();
      // Make sure data binding works.
      result = myView.renderFragments('render.frag.test', multicontext,true);
      result.appendTo(myElement);
      assert.equal(myElement.html(), "<div class=\"value-1 __data__\">value-1</div><div class=\"value-2 __data__\">value-2</div>");
    
      // Make sure the data retrieved is what it should be
      assert.equal(myView.getElementDatum($(".value-1")), multicontext[0]);
      assert.equal(myView.getElementDatum($(".value-2")), multicontext[1]);
    });

    it('prototype.setDelegate', function() {
      myView.setDelegate(null);
      assert.isNull(myView.getDelegate());
      assert.isNull(myView.delegate);

      myView.setDelegate(myDelegate);
      assert.equal(myView.getDelegate(),myDelegate);
      assert.equal(myView.delegate,myDelegate);
    });

    it('prototype.template', function() {
      var c = Handlebars.compile;
      // Load the template into the view
      BaseView.setupTemplates({
        'default.template' : c("<div class='{{test}}'>{{test}}</div>"),
        'extra.template'   : c("<div class='{{test}}'>{{test}}-cookies</div>")
      });

      var data = {test:'hello'};

      var result = myView.template(data);
      assert.instanceOf(result, $);
      assert.lengthOf(result, 1);
      assert.instanceOf(result.get(0), DocumentFragment);
      result.appendTo(myElement);
      assert.equal(myElement.html(), "<div class=\"hello\">hello</div>");
      myElement.empty();

      // Make sure it accepts arrays, too
      result = myView.template('extra.template',[data, data]);
      assert.instanceOf(result, $);
      assert.lengthOf(result, 1);
      assert.instanceOf(result.get(0), DocumentFragment);
      result.appendTo(myElement);
      assert.equal(myElement.html(), "<div class=\"hello\">hello-cookies</div><div class=\"hello\">hello-cookies</div>");
    });

    it('prototype.unload', function() {
      myElement.html('test');
      var flag = false;
      myView.unload(function() {
        flag = true;
      });
      assert.equal(myElement.html(), '', 'view element was not emptied');
      assert.isTrue(flag,'unload callback was not called');

      // Just need to make sure these don't break
      myView.unload("this shouldn't break anything");
      myView.unload({value: "nor this"});
    });

    it('prototype.watchDelegateProperties', function() {
      assert.isFunction(myView.watchDelegateProperties);
    });

    it('static.setup', function() {
      //Re-initialize these variables
      myElement  = $("<div>");
      myDelegate = new SimpleController();

      var flag = false;
      SimpleView.prototype.watchDelegateProperties = function() {
        flag = true;
      };

      myView     = SimpleView.setup(myElement, myDelegate);


      assert.instanceOf(myView, BaseView);
      assert.instanceOf(myView, SimpleView);
      assert.equal(myView.getDelegate(), myDelegate);
      assert.equal(myView.delegate, myDelegate);
      assert.isTrue(flag, 'watchDelegateProperties was never called');
    });

    it('static.datum', function() {
      var el = $("<div>");

      assert.isUndefined(BaseView.datum(el));

      BaseView.datum(el, 'somedata');
      assert.equal(BaseView.datum(el), 'somedata', 'couldnt load datum set on element');
      assert.isTrue(el.hasClass("__data__"));
      
      var obj = {'key': 'value'};
      BaseView.datum(el, obj);
      assert.equal(BaseView.datum(el), obj, 'couldnt load datum set on element');
    
      BaseView.datum(el, undefined);
      assert.isUndefined(BaseView.datum(el));

      BaseView.datum(el, null);
      assert.isNull(BaseView.datum(el));
    });

    it('static.getTemplates', function() {
      //Make sure the template object exists, even before i set it.
      assert.isObject(BaseView.getTemplates());

      // Setup a handlebars template to be added
      var template = Handlebars.compile("<div class='{{test}}'>{{test}}</div>");

      // Load the template into the view
      BaseView.setupTemplates({
        'render.frag.test': template
      });

      //Make sure the template is defined on the object
      assert.isFunction(BaseView.getTemplates()['render.frag.test'], 'The template function doesn\'t exist.');
      assert.equal(BaseView.getTemplates()['render.frag.test'], template, 'The template function isn\; what we set it to');
    });

    it('static.setupTemplates', function() {
      //Make sure the template object exists, even before i set it.
      assert.isObject(BaseView.getTemplates());

      // Setup a handlebars template to be added
      var template = Handlebars.compile("<div class='{{test}}'>{{test}}</div>");

      // Load the template into the view
      BaseView.setupTemplates({
        'render.frag.test': template
      });

      // Make sure the template is defined on the object
      assert.isFunction(BaseView.getTemplates()['render.frag.test'], 'The template function doesn\'t exist.');
      assert.equal(BaseView.getTemplates()['render.frag.test'], template, 'The template function isn\; what we set it to');
    });

    it('static.template', function() {
      // Setup a handlebars template and context to be rendered
      var context = { test: 'value-here' };
      var source = "<div class='{{test}}'>{{test}}</div>"

      var template = Handlebars.compile(source);

      // Load the template into the view
      BaseView.setupTemplates({
        'render.frag.test': template
      });

      // Get the resulting DocumentFragment rendered
      var result = BaseView.template('render.frag.test', context);

      // Make sure the html generated is what it should be
      assert.equal(result,"<div class='value-here'>value-here</div>");

      assert.equal('', BaseView.template('not.defined'), 'Accessing an undefined template should return empty string.')
    });

    it('static.extend', function() {
      var NewView = SimpleView.extend({
        templates: {
          'second.defined.template' : 'renderSecondDefinedTemplate'
        }
      }, {});

      var myNewView = NewView.setup($("<div>"),myDelegate);

      assert.instanceOf(myNewView, BaseView);
      assert.instanceOf(myNewView, SimpleView);
      assert.instanceOf(myNewView, NewView);

      // Make sure we have template functions from the old and new classes
      assert.isFunction(myNewView.renderDefinedTemplate);
      assert.isFunction(myNewView.renderSecondDefinedTemplate);

      assert.isObject(SimpleView.prototype.templates);
      assert.isObject(NewView.prototype.templates);

      // Make sure the first template exists on both the sub and super class
      assert.equal(SimpleView.prototype.templates['defined.template'],'renderDefinedTemplate');
      assert.equal(NewView.prototype.templates['defined.template'],'renderDefinedTemplate');
     
      // Make sure the second template is only on the sub class
      assert.isUndefined(SimpleView.prototype.templates['second.defined.template']);
      assert.equal(NewView.prototype.templates['second.defined.template'],'renderSecondDefinedTemplate');
    });

  }); // BaseView Unit Test

});