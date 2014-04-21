define(['vertebrae/object'], function(BaseObject) {

  describe('BaseObject', function() {

    it('should create a new instance', function() {
      var obj = new BaseObject();
      expect(obj).to.be.instanceof(BaseObject);
    });

    it('should create a new class by extending', function() {
      var initialized   = false,
          extendedClass = BaseObject.extend({
            initialize: function() { initialized = true; }
          }),
          extendedObj   = new extendedClass();

      // Verify extended obj is instance of base object
      expect(extendedObj).to.be.instanceof(BaseObject, 'Base Object instance created');
      expect(initialized).to.equal(true, 'Object instantiate function called');
    });

    it('should create getters and setters', function() {
      var testClass = BaseObject.extend({
                        properties: ['test'],
                        initialize: function() {}
                      }),
          obj       = new testClass();

      // Verify functions exists
      // console.log(obj);

      // expect(obj).to.include.keys('test', 'setTest', 'getTest');

      // obj.setTestProperty('Hello World');
      // expect(obj.testProperty).to.equal('Hello World');
      // expect(obj.getTestProperty()).to.equal('Hello World');
    });


    it('_super', function () {
      var extendObj = BaseObject.extend({ properties: ['testProperty'] }),
          testObj = new extendObj();

      expect(testObj._super).to.exists;
      expect(testObj._super()).to.equal(testObj);
    }); // BaseObject.prototype._super

    
    it('set(k, v, silent), get(k) & destroy()', function () {
      var extendObj = BaseObject.extend({ properties: ['testProperty'] }),
          testObj = new extendObj();

      // Verify set and get methods
      testObj.set('testProperty', 'a');
      expect(testObj.get('testProperty')).to.equal('a');

      var anotherObj = new extendObj();
      pass = false;
      testObj.listenTo(anotherObj, 'change:testProperty', function () {
        pass = true;
      });

      // Verify destroy method
      testObj.destroy();
      expect(testObj.destroyed).to.be.true;
      expect(testObj.testProperty).to.be.null;

      // Verify object stopped listening
      anotherObj.setTestProperty('b');
      expect(pass).to.be.false;
    }); // BaseObject.prototype.set


    it('applyProperties(jsonObject)', function () {
      var extendObj = BaseObject.extend({ properties: ['aProp'] }),
          testObj = new extendObj();

      testObj.applyProperties({ "aProp": "a"});
      expect(testObj.aProp).to.equal('a');

      // Verify properties added if no setter exists
      testObj.applyProperties({ "bProp": "b", "cProp": "c" });
      expect(testObj.bProp).to.equal('b');
      expect(testObj.cProp).to.equal('c');
    }); // BaseObject.prototype.applyProperties


    it('getProperties()', function () {
      var extendObj = BaseObject.extend({ properties: ['testProperty', 'bProperty'] }),
          testObj = new extendObj();

      testObj.setTestProperty('a');
      testObj.setBProperty('b');
      
      var propPairs = testObj.getProperties();
      expect(propPairs).to.deep.equal({testProperty: 'a', bProperty: 'b'});
    }); // BaseObject.prototype.getProperties


    it('#getPropertyByNamespace', function() {
      var obj = { hello: { my: { property: 'success' }}};

      expect(BaseObject.getPropertyByNamespace(obj, 'hello.my.property')).to.equal('success');
      expect(BaseObject.getPropertyByNamespace(obj, 'fake.property.test')).to.equal(null);
    });


    

  });

});