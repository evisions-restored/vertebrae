define([
  'vertebrae/app',
  'vertebrae/controller',
  'vertebrae/view',
  'jquery',
  'bluebird'
], function(
  BaseApp,
  BaseController,
  BaseView,
  $,
  Promise
) {

  var TestApp, TestView, TestController1, TestController2, HeaderController, FooterController, test1, test2, app, div, resolve1, resolve2;

  test1 = new Promise(function() { resolve1 = arguments[0]; });
  test2 = new Promise(function() { resolve2 = arguments[0]; });

  TestView = BaseView.extend({

    render: function() {
      var data = this.getDelegate().getTemplateProperties();
      this.$el.html(data.name);
    }

  });


  TestController1 = BaseController.extend({

    name: 'test controller 1',

    view: TestView,

    start: function() {
      resolve1();
    },

    getTemplateProperties: function() {
      return { name: this.name };
    }

  });

  TestController2 = TestController1.extend({

    name: 'test controller 2',

    start: function() {
      resolve2();
    }

  });

  HeaderController = BaseController.extend({

    name: 'header controller',

    view: BaseView,

    start: function() {

    }

  });

  FooterController = BaseController.extend({

    name: 'header controller',

    view: BaseView,

    start: function() {

    }

  });

  TestApp = BaseApp.extend({

    defaultRoute: '',

    content: '#app',

    routes: {
      'test/constructor' : TestController1,
      'test/amd'         : 'my/amd/test'
    },

    controllers: {
      'header #header' : HeaderController,
      'footer #footer' : FooterController
    },

    render: function() {
      this.$el.html('<div id="header"></div><div id="app"></div><div id="footer"></div>');
    }

  });

  div = $('<div/>');

  app = TestApp.launch(div);

  describe('BaseApp', function() {

    it('proto.routes should handle constructors', function(done) {

      test1
          .then(function() {
            expect(app.getContentController()).to.be.an.instanceof(TestController1);
            expect(app.getContentElement().html()).to.equal(app.getContentController().name);
            expect(app.getContentElement().hasClass('test-controller-1')).to.be.true;
          })
          .nodeify(done);

      app.navigate('test/constructor', { trigger: true });
    });


    it('proto.routes should handle amd paths', function(done) {
      var oldRequire = window.require;

      require = function(deps, fn) {
        expect(deps[0]).to.equal('my/amd/test');
        fn(TestController2);
      };

      test2
        .then(function() {
          expect(app.getContentController()).to.be.an.instanceof(TestController2);
          expect(app.getContentElement().html()).to.equal(app.getContentController().name);
          expect(app.getContentElement().hasClass('test-controller-1')).to.be.false;
          expect(app.getContentElement().hasClass('test-controller-2')).to.be.true;
          window.replace = oldRequire;
          app.navigate('', { trigger: true });
        })
        .nodeify(done)

      app.navigate('test/amd', { trigger: true });

    });


    it('proto.controllers should handle controller mapping', function() {

      expect(app.header).to.be.an.instanceof(HeaderController);
      expect(app.footer).to.be.an.instanceof(FooterController);

    });

  });

});