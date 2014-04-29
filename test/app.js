define([
  'vertebrae/app',
  'vertebrae/controller',
  'vertebrae/view',
  'jquery'
], function(BaseApp, BaseController, BaseView, $) {

  var TestApp, TestController1, TestController2, test1, test2, app, div;

  test1 = $.Deferred();
  test2 = $.Deferred();

  TestController1 = BaseController.extend({

    start: function() {
      test1.resolve();
    },

    setupView: function() {
      this.setView(new BaseView());
    }

  });

  TestController2 = TestController1.extend({

    start: function() {
      test2.resolve();
    }

  });

  TestApp = BaseApp.extend({

    defaultRoute: '',

    routes: {
      'test/constructor' : TestController1,
      'test/amd'         : 'my/amd/test'
    }

  });

  div = $('<div/>');

  // $(document.body).append(div);

  app = TestApp.launch();


  describe('BaseApp', function() {

    it('proto.routes should handle constructors', function(done) {


      test1.then(function() {
        expect(app.getController()).to.be.an.instanceof(TestController1);

        done();
      });

      app.navigate('test/constructor', { trigger: true });
    });


    it('proto.routes should handle amd paths', function(done) {
      var oldRequire = window.require;

      require = function(deps, fn) {
        expect(deps[0]).to.equal('my/amd/test');
        fn(TestController2);
      };


      test2.then(function() {
        expect(app.getController()).to.be.an.instanceof(TestController2);

        window.replace = oldRequire;
        // app.navigate('', { trigger: true });

        done();
      });

      app.navigate('test/amd', { trigger: true });

    });

  });

});