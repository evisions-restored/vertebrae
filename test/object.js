define([
        'vertebrae/object'
], function(
        BaseObject) {

  describe('BaseObject', function() {

    var myClass;

    beforeEach(function() {
      myClass = BaseObject.extend({ properties: ['property1'] });
    });

    afterEach(function() {
      myClass = null;
    });

    it('should create a new instance', function() {
      var obj = new BaseObject();
      expect(obj).to.be.instanceof(BaseObject);
    }); // BaseObject instantiation


    it('static.extend - should create a new extended class', function() {
      var initialized   = false,
          extendedClass = BaseObject.extend({
            initialize: function() { initialized = true; }
          }),
          extendedObj   = new extendedClass();

      // Verify extended obj is instance of base object
      expect(extendedObj).to.be.instanceof(BaseObject, 'Base Object instance created');
      expect(initialized).to.equal(true, 'Object instantiate function called');
    }); // BaseObject.extend


    it('prototype.instantiate - should create getters and setters', function() {
      var myObject = new myClass();

      expect(myObject).to.respondTo('getProperty1');
      expect(myObject).to.respondTo('setProperty1');

      myObject.setProperty1('value1');

      expect(myObject.property1).to.equal('value1');
      expect(myObject.getProperty1()).equal('value1');
    }); // BaseObject Getters/Setters


    it('prototype._super() - should return parent function', function () {
      var func1   = function() { return 'function1' },
          func2   = function() { return this._super(); },
          extend1 = BaseObject.extend({ superfy: func1 }),
          extend2 = extend1.extend({ superfy: func2 }),
          testObj = new extend2();

      expect(testObj.superfy()).to.equal('function1');
    }); // BaseObject.prototype._super


    it('prototype.applyProperties(jsonObject) - should apply an object\'s property values', function () {
      var myObject = new myClass();

      // Apply existing properties and their values
      myObject.applyProperties({ property1: 'appValue1' });
      
      expect(myObject.property1).to.equal('appValue1');

      // Apply new properties and their values
      myObject.applyProperties({ property1: undefined, property2: 'appValue2' });

      expect(myObject.property1).to.be.undefined;
      expect(myObject.property2).to.equal('appValue2');
    }); // BaseObject.prototype.applyProperties


    it('prototype.destroy() - should clear properties and listeners', function () {
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
    }); // BaseObject.prototype.destroy


    it('prototype.get(k) - should return the property value', function() {
      var myObject = new myClass();

      myObject.property1 = 'value1';
      expect(myObject.get('property1')).to.equal('value1');

      // Verify use of namespace
      myObject.property1 = { property2: 'value2' };
      expect(myObject.get('property1.property2')).to.equal('value2');
    }); // BaseObject.prototype.get


    it('prototype.getProperties() - should return obj containing valid property values', function() {
      var myObject = new myClass();

      myObject.property1 = 'value1';
      myObject.property2 = 'value2';

      expect(myObject.getProperties()).to.deep.equal({ property1: 'value1' });

      // Verify undefined properties are not returned
      myObject.property1 = undefined;

      expect(myObject.getProperties()).to.deep.equal({});
    }); // BaseObject.prototype.getProperties


    it('prototype.set(k, v, silent) - should set the property value', function() {
      var myObject = new myClass();

      myObject.set('property1', 'value1');

      expect(myObject.property1).to.equal('value1');
    }); // BaseObject.prototype.set


    it('prototype.set(k, v, silent) - should trigger listener on set', function() {
      var aObject  = new myClass(),
          bObject  = new myClass(),
          listened = false;

      bObject.listenTo(aObject, 'change:property1', function() { listened = true; });

      // Do not set off the listener
      aObject.set('property1', 'value1', true);
      expect(aObject.property1).to.equal('value1');

      expect(listened).to.equal(false, 'Listener should not have been triggered.');

      // Set off listener
      aObject.set('property1', 'value2');
      expect(aObject.property1).to.equal('value2');

      expect(listened).to.be.true;
    }); // BaseObject.prototype.set

    it('static.setPropertyByNamespace(obj, key, value) - should set an objects property value by namespace', function() {
      var myObject = { property1: null },
          property = 'property1.property2',
          value    = 'value1';

      BaseObject.setPropertyByNamespace(myObject, property, value);

      expect(myObject.property1).to.have.property('property2').to.equal('value1');
    }); // BaseObject.static.setPropertyByNamespace


    it('static.getPropertyByNamespace(obj, key) - should return the objects property value using a namespace', function() {
      var myObject = { property1: { property2: 'value2' } },
          value    = null;

      // Verify valid namespace value
      value = BaseObject.getPropertyByNamespace(myObject, 'property1.property2');

      expect(value).to.equal('value2');

      // Verify null value for invalid namespace
      value = BaseObject.getPropertyByNamespace(myObject, 'fakeProperty.property2');

      expect(value).to.equal(null);
    }); // BaseObject.static.getPropertyByNamespace

  }); // BaseObject Unit Test

});