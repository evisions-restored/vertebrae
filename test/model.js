define([
  'underscore',
  'vertebrae/model',
  'bluebird'
], function(
  _,
  Model,
  Promise
) {

  // Define some variables that are typically reused in each test
  var SimpleModel,
      instA,
      instB;

  describe('BaseModel', function() {

    // Setup a simple class to test with
    // and empty out some variables I use alot
    beforeEach(function() {
      SimpleModel = Model.extend({
          properties: [
            'prop1',
            'prop2'
          ] 
        }, 
        {
          rootURI: '/api/',
          parsers: {
            'test1': function(data) { 
              return 'test1';
            },
            'PUT puttest': function(data) { 
              return 'puttest'; 
            },
            'getId/:id': function(data) { 
              return 'someid'; 
            }
          },

          getResponseSuccessPayload: function(resp) {
            return resp.data;
          },

          getResponseDefaults: function() {
            return { valid: false };
          },

          isValidResponse: function(resp) {
            return resp.valid;
          }
        });
      // Setup up some simple models with defined properties
      instA = new SimpleModel({
        prop1: 'a',
        prop2: 'b'
      });

      instB = new SimpleModel({
        prop1: 'c',
        prop2: 'd'
      });
    });

    it('constructor', function() {
      var obj = new Model();
      expect(obj).to.be.instanceof(Model);
      obj = new SimpleModel();
      expect(obj).to.be.instanceof(SimpleModel);
    });
    
    it('prototype.updateWith', function() {
      //Run the function in question
      instA.updateWith(instB);

      // Make sure that the properties copied
      assert.equal(instA.prop1, 'c', 'Property not set on instantiation.');
      assert.equal(instA.prop2, 'd', 'Property not set on instantiation.');

      // Setup a new model with more interesting properties,
      // (undefined shouldn't copy)
      instB = new SimpleModel({
        prop1: null,
        prop2: undefined
      });

      // Copy it over
      instA.updateWith(instB);

      assert.isNull(instA.prop1, 'Property wasn\'t set to null.');
      assert.equal(instA.prop2, 'd', 'Property was set when it shouldn\'t have been');
    });

    it('prototype.toJSON', function() {
      // Setup initial instance with no server properties
      instA.serverProperties = [];
      var output = instA.toJSON();

      assert.isUndefined(output.prop1);
      assert.isUndefined(output.prop2);

      // redefine instance server properties for differrent output
      instA.serverProperties = ['prop1'];
      output = instA.toJSON();

      assert.equal(output.prop1, 'a');
      assert.isUndefined(output.prop2);

      // redefine instance server properties for differrent output
      instA.serverProperties = ['prop1', 'prop2'];
      output = instA.toJSON();

      assert.equal(output.prop1, 'a');
      assert.equal(output.prop2, 'b');
    });

    it('static.defaultHandler', function() {
      var input = {
        someData: true
      };

      var output = Model.defaultHandler(input);

      assert.equal(input,output);
    });

    it('static.model', function() {
      var data = {
        prop1: 'cats',
        prop2: 'dogs'
      };
      instA = SimpleModel.model(data);

      assert.instanceOf(instA, SimpleModel);
      assert.instanceOf(instA, Model);
      assert.equal(instA.prop1, 'cats');
      assert.equal(instA.prop2, 'dogs');
    });

    it('static.models', function() {
      var data = 
        [{
          prop1: 'cats1',
          prop2: 'cats2'
        }, {
          prop1: 'dogs1',
          prop2: 'dogs2'
        }];
      var models = SimpleModel.models(data);

      assert.lengthOf(models, 2);

      instA = models[0];
      instB = models[1];

      assert.instanceOf(instA, SimpleModel);
      assert.instanceOf(instA, Model);
      assert.equal(instA.prop1, 'cats1');
      assert.equal(instA.prop2, 'cats2');

      assert.instanceOf(instB, SimpleModel);
      assert.instanceOf(instB, Model);
      assert.equal(instB.prop1, 'dogs1');
      assert.equal(instB.prop2, 'dogs2');
    });

    it('static.getAjaxTimeout', function() {
      SimpleModel.timeout = 12345;
      assert.equal(SimpleModel.getAjaxTimeout(), 12345);

      SimpleModel.timeout = undefined;
      // We should still get a number even if we set it to undefined.
      assert.typeOf(SimpleModel.getAjaxTimeout(), "number");
    });

    it('static.request', function(done) {
      // Don't delete this line! need to replace ajax
      var originalAjax = $.ajax,
          params       = { "key1" : "value1" },
          ajaxValid    = true,
          ajaxData     = { "key2" : "value2" };

      // Setup ajax to respond as a success
      $.ajax = function(opts) {
        return Promise
            .delay(1)
            .then(function() {
              return {
                valid: ajaxValid,
                data: ajaxData
              };
            });
      };

      SimpleModel.request('/test/endpoint', params,{})
        .then(function(data) {
          assert.isObject(data);
          assert.equal(data.key2, "value2");

          // setup a failure
          ajaxValid = false;
          ajaxData = {error:'message'};

          // lets ttest a failure now.
          return SimpleModel.request('/test/endpoint', params, {})
        })
        .then(null, function(error) {
          assert.isObject(error);
          assert.isFalse(error.valid);
          assert.isObject(error.data);
          assert.equal(error.data.error, "message");

          // Dont delete this line!  Need to restore ajax!
          $.ajax = originalAjax;
          done();
        })
    });

    it('static.getParser', function() {
      var p1 = SimpleModel.getParser('test1');
      assert.isFunction(p1);
      assert.equal(p1(), 'test1');

      var p2 = SimpleModel.getParser('puttest', 'put');
      assert.isFunction(p2);
      assert.equal(p2(), 'puttest');

      var p3 = SimpleModel.getParser('getId/3', 'put');
      assert.isFunction(p3);
      assert.equal(p3(), 'someid');

      assert.isUndefined(SimpleModel.getParser('nothingHere'));
      assert.isUndefined(SimpleModel.getParser('puttest'));
    });

    it('static.parseParsers', function() {
      var NewModel = SimpleModel.extend({}, {
        parsers: {
          'additionalParser': function() { return 'brandnew'; },
          'stringParser': 'model'
        }
      });

      assert.lengthOf(NewModel._parsers, 5);
      assert.equal(NewModel._parsers[0].callback(), 'brandnew');
      assert.instanceOf(NewModel._parsers[1].callback.call(NewModel, { hello: 'world' }), NewModel);
    });

    it('static.post', function() {
      var p = {"key": "value"};
      SimpleModel.request = function(uri, params, options) {
        assert.equal(uri, 'post/test');
        assert.isObject(params);
        assert.equal(params, p);
        assert.isObject(options);
        assert.equal(options.type.toLowerCase(), 'post');
      };

      SimpleModel.post('post/test', p);
      SimpleModel.post('post/test', p, {jsonBody:true});
    });

    it('static.get', function() {
      var p = {"key": "value"};
      SimpleModel.request = function(uri, params, options) {
        assert.equal(uri, 'get/test');
        assert.isObject(params);
        assert.equal(params, p);
        assert.isObject(options);
        assert.equal(options.type.toLowerCase(), 'get');
      };

      SimpleModel.get('get/test', p);
      SimpleModel.get('get/test', p, {jsonBody:true});
    });

    it('static.put', function() {
      var p = {"key": "value"};
      SimpleModel.request = function(uri, params, options) {
        assert.equal(uri, 'put/test');
        assert.isObject(params);
        assert.equal(params, p);
        assert.isObject(options);
        assert.equal(options.type.toLowerCase(), 'put');
      };

      SimpleModel.put('put/test', p);
      SimpleModel.put('put/test', p, {jsonBody:true});
    });

    it('static.del', function() {
      var p = {"key": "value"};
      SimpleModel.request = function(uri, params, options) {
        assert.equal(uri, 'del/test');
        assert.isObject(params);
        assert.equal(params, p);
        assert.isObject(options);
        assert.equal(options.type.toLowerCase(), 'delete');
      };

      SimpleModel.del('del/test', p);
      SimpleModel.del('del/test', p, {jsonBody:true});
    });

    it('static.generateLink', function() {
      var output = SimpleModel.generateLink('testingLink'), 
          prefix = window.location.origin;
      assert.equal(output, prefix  + "/api/testingLink");
    });

    it('static.extend', function() {
      // need to check that new subclasses contain
      // the old properties and _parsers and serverProperties
      var NewModel = SimpleModel.extend({

        properties: ['newprop'],
        serverProperties: ['serverProp']

      }, 
      {
        parsers: {
          'newParser': function() { return 'static.extend.test'}
        }
      });

      // All the parsers are there (3 from old, 1 from new)
      assert.lengthOf(NewModel._parsers, 4);
      assert.equal(NewModel._parsers[0].callback(), 'static.extend.test');

      // All the properties are there (1 regular and 1 server additional, 2 on SimpleModel)
      assert.lengthOf(NewModel.prototype.properties, 4);
      assert.include(NewModel.prototype.properties, 'newprop');
      assert.include(NewModel.prototype.properties, 'serverProp');
      assert.include(NewModel.prototype.properties, 'prop1');
      assert.include(NewModel.prototype.properties, 'prop2');

      // Verify server properties is what it should be.
      assert.lengthOf(NewModel.prototype.serverProperties, 1);
      assert.include(NewModel.prototype.serverProperties, 'serverProp');
    });

    it('static.routes', function(done) {
      var originalAjax = $.ajax,
          parserCount  = 0;

      // Setup ajax to respond as a success
      $.ajax = function(opts) {
        
        if (opts.type == 'GET') {

          expect(opts.url).to.equal('/api/test/api');
          return Promise.resolve({ valid: true })
          // opts.success({ valid: true });
        } else if (opts.type == 'POST') {
          expect(opts.url).to.equal('/api/test/10');
          return Promise.resolve({ valid: true, data: { id: 10 } });
        } else if (opts.type == 'PUT') {
          expect(opts.url).to.equal('/api/resource/10');
          return Promise.resolve({ data: { updated: true } })
        }
      };

      var NewModel = Model.extend({

      },
      {
        routes: {
          'GET api/test/api'     : 'requestTestMethod',
          // keep extra space to test parsing
          'POST    api/test/:id' : 'requestPost',
          'CRUD api/resource'    : 'resource'
        },

        parsers: {
          'api/test/api': function(data) {
            parserCount++;
            return data;
          },
          'api/test/:id': function(data) {
            parserCount++;
            return data;
          }
        },

        getResponseSuccessPayload: function(resp) {
          return resp.data;
        }
      });

      expect(NewModel).itself.to.respondTo('requestTestMethod');
      expect(NewModel).itself.to.respondTo('requestPost');
      expect(NewModel).itself.to.respondTo('requestOneResource');
      expect(NewModel).itself.to.respondTo('requestCreateResource');
      expect(NewModel).itself.to.respondTo('requestUpdateResource');
      expect(NewModel).itself.to.respondTo('requestDeleteResource');

      NewModel.requestTestMethod().then(function() {

        return NewModel.requestPost({ id: 10 });
      }).then(function(data) {

        expect(data.id).to.equal(10);
        expect(parserCount).to.equal(2);

        return NewModel.requestUpdateResource({ id: 10 });
      }).then(function(data) {

        expect(data.updated).to.be.true;

        $.ajax = originalAjax;

        done();
      });

    });

  });

});