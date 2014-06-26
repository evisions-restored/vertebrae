define([
  'vertebrae/object',
  'underscore',
  'jquery'
], function(
        BaseObject,
        _,
        $) {

  describe('BaseObject', function() {

    var myClass;

    beforeEach(function() {
      myClass = BaseObject.extend({ properties: ['property1'] });
    });

    afterEach(function() {
      myClass = null;
    });

    it('constructor', function() {
      var obj = new BaseObject();

      expect(obj).to.be.instanceof(BaseObject);
    });

    it('static.extend', function() {
      var initialized   = false,
          extendedClass = BaseObject.extend({
            initialize: function() { initialized = true; }
          }),
          extendedObj   = new extendedClass();

      // Verify extended obj is instance of base object
      expect(extendedObj).to.be.instanceof(BaseObject, 'Base Object instance created');
      expect(initialized).to.equal(true, 'Object instantiate function called');
    });

    it('prototype.instantiate', function() {
      var myObject = new myClass();

      expect(myObject).to.respondTo('getProperty1');
      expect(myObject).to.respondTo('setProperty1');

      myObject.setProperty1('value1');

      expect(myObject.property1).to.equal('value1');
      expect(myObject.getProperty1()).equal('value1');
    });

    it('prototype._super', function () {
      var func1   = function() { return 'function1' },
          func2   = function() { return this._super(); },
          extend1 = BaseObject.extend({ superfy: func1 }),
          extend2 = extend1.extend({ superfy: func2 }),
          testObj = new extend2();

      expect(testObj.superfy()).to.equal('function1');
    });

    it('prototype.applyProperties', function () {
      var myObject = new myClass();

      // Apply existing properties and their values
      myObject.applyProperties({ property1: 'appValue1' });
      
      expect(myObject.property1).to.equal('appValue1');

      // Apply new properties and their values
      myObject.applyProperties({ property1: undefined, property2: 'appValue2' });

      expect(myObject.property1).to.be.undefined;
      expect(myObject.property2).to.equal('appValue2');
    });

    it('prototype.destroy', function () {
      var aObject  = new myClass(),
          bObject  = new myClass(),
          listened = false;

      aObject.listenTo(bObject, 'change:property1', function() { listened = true; });
      aObject.set('property1', 'value1');
      
      aObject.destroy();

      // Verify properties cleared
      expect(aObject.property1).to.equal(null);

      // Verfy listeners not triggered
      bObject.setProperty1('value2');
      expect(listened).to.be.false;
    }); 

    it('prototype.get', function() {
      var myObject = new myClass();

      myObject.property1 = 'value1';
      expect(myObject.get('property1')).to.equal('value1');

      // Verify use of namespace
      myObject.property1 = { property2: 'value2' };
      expect(myObject.get('property1.property2')).to.equal('value2');
    });

    it('prototype.getProperties', function() {
      var myObject = new myClass();

      myObject.property1 = 'value1';
      myObject.property2 = 'value2';

      expect(myObject.getProperties()).to.deep.equal({ property1: 'value1' });

      // Verify undefined properties are not returned
      myObject.property1 = undefined;

      expect(myObject.getProperties()).to.deep.equal({});
    });

    it('prototype.set', function() {
      var myObject = new myClass();

      myObject.set('property1', 'value1');

      expect(myObject.property1).to.equal('value1');
    }); 

    // this tests deferreds on set....we need to re-think these
    // it('prototype.set', function() {
    //   var aObject    = new myClass(),
    //       bObject    = new myClass(),
    //       myDeferred = $.Deferred(),
    //       listened   = false;

    //   bObject.listenTo(aObject, 'change:property1', function() { listened = true; });

    //   // Do not set off the listener
    //   aObject.set('property1', 'value1', true);
    //   expect(aObject.property1).to.equal('value1');


    //   expect(listened).to.equal(false, 'Listener should not have been triggered.');

    //   // Set off listener
    //   aObject.set('property1', 'value2');
    //   expect(aObject.property1).to.equal('value2');

    //   expect(listened).to.be.true;

    //   listened = false;

    //   // listen to deferredProperty changes
    //   aObject.listenTo(aObject, 'change:deferredProperty', function() { listened = true; });
    //   // set the deferredProperty with a deferred object
    //   aObject.set('deferredProperty', myDeferred);

    //   expect(listened).to.be.false;

    //   // resolve the deferred
    //   myDeferred.resolve('deferredValue');

    //   expect(listened).to.be.true;
    //   expect(aObject.get('deferredProperty')).to.equal('deferredValue');

    //   listened = false;

    //   myDeferred = $.Deferred();

    //   aObject.set('deferredProperty', myDeferred, { deferred: false });

    //   expect(listened).to.be.true;
    //   expect(aObject.get('deferredProperty')).to.equal(myDeferred);

    // });

    it('prototype.pick', function() {

      var MyClass = BaseObject.extend({

        properties: [
          'first',
          'last'
        ]

      });

      var myObject = new MyClass();
      
      myObject.applyProperties({
        first: 'first',
        last: 'last'
      })

      var data = myObject.pick('first');

      expect(_.size(data)).to.equal(1);
      expect(data.first).to.equal('first');

      data = myObject.pick('last', 'first');

      expect(_.size(data)).to.equal(2);

      expect(data.last).to.equal('last');

      data = myObject.pick(['first', 'last']);

      expect(_.size(data)).to.equal(2);

    });

    it('static.setPropertyByNamespace', function() {
      var myObject = { property1: null },
          property = 'property1.property2',
          value    = 'value1';

      BaseObject.setPropertyByNamespace(myObject, property, value);

      expect(myObject.property1).to.have.property('property2').to.equal('value1');
    });


    it('static.getPropertyByNamespace', function() {
      var myObject = { property1: { property2: 'value2' } },
          value    = null;

      // Verify valid namespace value
      value = BaseObject.getPropertyByNamespace(myObject, 'property1.property2');

      expect(value).to.equal('value2');

      // Verify null value for invalid namespace
      value = BaseObject.getPropertyByNamespace(myObject, 'fakeProperty.property2');

      expect(value).to.equal(null);
    });

  });

});