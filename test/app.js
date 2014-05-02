define([
  'vertebrae/app',
  'vertebrae/controller',
  'vertebrae/view',
  'jquery'
], function(BaseApp, BaseController, BaseView, $) {

  var TestApp, TestView, TestController1, TestController2, test1, test2, app, div;

  test1 = $.Deferred();
  test2 = $.Deferred();

  TestView = BaseView.extend({

    render: function() {
      var data = this.getDelegate().getTemplateProperties();
      this.$el.html(data.name);
    }

  });


  TestController1 = BaseController.extend({

    name: 'test controller 1',

    start: function() {
      test1.resolve();
    },

    setupView: function() {
      this.setView(new TestView());
    },

    getTemplateProperties: function() {
      return { name: this.name };
    }

  });

  TestController2 = TestController1.extend({

    name: 'test controller 2',

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

  app = TestApp.launch(div);

  describe('BaseApp', function() {

    it('proto.routes should handle constructors', function(done) {


      test1.then(function() {
        expect(app.getController()).to.be.an.instanceof(TestController1);
        expect(app.$el.html()).to.equal(app.getController().name);
        expect(app.$el.hasClass('test-controller-1')).to.be.true;
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
        expect(app.$el.html()).to.equal(app.getController().name);
        expect(app.$el.hasClass('test-controller-1')).to.be.false;
        expect(app.$el.hasClass('test-controller-2')).to.be.true;
        window.replace = oldRequire;
        app.navigate('', { trigger: true });
        done();
      });

      app.navigate('test/amd', { trigger: true });

    });

  });

});