# Vertebrae

Vertebrae is a tools expansion for Backbone.js created by the developers at [Evisions](http://www.evisions.com/). While Backbone.js is an awesome JavaScript library 
all on its own, we had some additional functionality we need within our single page application.

* 59kb, Full source, tons of comments
* 5k, Packed and gzipped ([Source Map](https://github.com/Evisions/vertebrae/blob/master/dist/vertebrae.min.map))

These toolsets can be used for large scale enterprise applications or your basic run of the mill websites. Fully minified, the library is 15kb.
(which we are currently trying to reduce) Want to know what's included in the project? High level list of included items:

* Auto generating setters/getters
* Event listeners on properties getting set
* Inheritance with the _.super() command
* Object cleanup
* View functionality (templates/observers/functions)
* Route handling

Don't worry, we will be going through each of the above items in greater detail. 

[![Build Status](https://travis-ci.org/Evisions/vertebrae.svg?branch=master)](https://travis-ci.org/Evisions/vertebrae)

## BaseObject

BaseObject is the base Class that all non-views should extend off of.  BaseView extends off of Backbone.View and therefore only mixins are 
applied from BaseObject.

#### Properties

Properties provide a way to auto-generate setters/getters for your properties.
It also serves the purpose of clearly defining which properties are on an Object.
Those familar with @synthesize in Objective-C should feel right at home.

```javascript
var MyObject = Vertebrae.Object.extend({
  // A setter will automatically be created for this.setMyProperty()
  properties: ['myProperty']
});

var myObject = new MyObject();
myObject.setMyProperty('I have a setter!');
```

#### Applying Properties

If you have an Object of key/value pairs that you want to apply to an object, you can easily auto-call the setters.

```javascript
var properties = {
  myProperty: 'I need to be set.'
};

// This will automatically call the myProperty setter. (this.setMyProperty())
myObject.applyProperties(properties);
```

#### Events

All BaseObjects have Backbone.Events mixed in and thus you can listen for changes via the generated setters.

```javascript
myObject.on('change:myProperty', function() {
  // The myProperty has changed, do something.
});
myObject.setMyProperty('I will call the change event for myProperty.');
```

#### Super

We all know Class inheritance can be a real pain in Javascript.  Fortunately, we have build this._super into BaseObject.

```javascript
var MyBaseClass = Vertebrae.Object.extend({
  myFunction: function() { 
  }
});

var MySubClass = MyBaseClass.extend({
  myFunction: function() {
    // This will call myFunction() on MyBaseClass.
    this._super();
  }
});
```

#### Clean Up

If you use events and you do not want memory leaks, you need to unbind those events. With BaseObject you just destroy and forget.
The trick is to always use **listenTo()** instead of **on()**.

```javascript
var anotherObject = new MyObject();

anotherObject.listenTo(myObject, 'change:myProperty', function() { });

// I want to kill anotherObject.
anotherObject.destroy();
anotherObject = null;
```

## BaseApp

BaseApp is a wrapper for your entire application. Its main functionality is to help you setup routes that will call a specific controller.
(most like extended off of BaseController)

```javascript
var MyApp = Vertebrae.App.extend({

  // When navigating to #myRoute1, the myRoute1.controller.js file's initialize function will be executed.
  routes: {
    'myRoute1' : 'app/myRoute1.controller'
  }

});
```

## BaseController

BaseController is really just a glorified class but it has a very opinionated purpose. Below are the intended directives:

* Should NEVER directly apply the Element of a view.
* Should not be specific to a particular area of your app.
* Should NEVER interact with the DOM.

But wait, I need set the element of my views. And I need to write logic that is specific to an area of my app. And I need to interact with the DOM.
These problems are solve as such:

* All Elements should be passed in from outside the controller.
* All specific logic should be abstracted via view functions.
* All DOM interaction should be done through a view.


#### Setting up the View

In order to follow our convention of setting up a view, you need two functions.

**setupView**: should initialize the object via this.setView()

**viewIsReady**: should kick off the main logic of the controller since the view is ready

```javascript
var MyView = new Vertebrae.View.extend({ });

var MyController = Vertebrae.Controller.extend({
  setupView: function() {
    this.setView(new MyView());
  },

  viewIsReady: function() {
    // I can render my view or make an API call since my view is all setup.
  }
});
```

How is my view ready? I have not given it an Element! Well that has to be done OUTSIDE of the controller in a main/config/bootstrap
javascript file via **setupViewProperties**.

```javascript
var config = {
  main: 'main'
};

var myController = new MyController();
myController.setupViewProperties(document.getElementById(config.main));
// Now the view is setup and viewIsReady has been called.
```

If a controller has a sub-controller whose view needs to be setup, then the main controller's view should handle it. But we will cover that later.

#### Observers

Many times we want controllers to do things when events happen. NEVER DOM events but application events/notifications. You can easly define application observers via the observes property.

```javascript
var myController = Vertebrae.Controller.extend({
  observes: {
    'global-event': 'handleGlobalEvent'
  },

  handleGlobalEvent: function() {
    // I am called when global-event was triggered.
  }
});
Vertebrae.Event.trigger('global-event');
```

## BaseView

The view is the magic piece that glues a controller to the DOM and user interaction. It extends off of Backbone.View and includes mixins from BaseObject.

#### Delegate

One of the core ideologies that separates BaseView from Backbone.View is the use of a delegate.  A view should not have application logic it in.
A view's only logic should be to figure out how to render what it needs to render. The retrieval and processing of that data should be handled by the delegate.
Typically the delegate will be a controller.

```javascript
//Create my custom view.
var MyView = Vertebrae.View.extend({
  render: function() {
    // Views should get data from their delegate.
    var data = this.getDelegate().getViewProperties();
  }
});

// Create my custom controller that will be the delegate.
var Delegate = Vertebrae.Controller.extend({
  setupView: function() {
    this.setView(new MyView());
  },

  getViewProperties: function() {
    // Do application logic here.
    return {};
  }
});

var delegate = new Delegate();
// setupViewProperties() will automatically set the delegate.
delegate.setupViewProperties(document.getElementById('main'));
```

#### Templates

All web apps need templates of some sort. BaseView makes rendering templates extremely easy and also allows you to clearly see what templates a view is using.

```javascript
var MyView = Vertebrae.View.extend({
  templates: {
    'my_template': 'renderTemplateFragment'
  },

  render: function() {
    var data = this.getDelegate().getViewProperties();

    this.$el.html(this.renderTemplateFragment(data));
  }
});
```

## BaseModel

The model is very similar to Backbone.Model but has a lightly different paradigm shift.  Backbone.Model assumes that every model will use a standard CRUD interface on the server.  In the applications we have created, we ran accross many situations where our API calls did not adhere to the standard CRUD interface.  To solve this problem, we made the Vertebrae Model use a declarative notation to define how you want your models to communicate with the server.

```javascript
var MyModel = Vertebrae.Model.extend({
  
  serverProperties: [
    'property'
  ],

  requestUpdate: function() {
    return this.constructor.requestUpdate(this);
  }
  
},
{
  rootURI: '/api/resource/',

  routes: {
    'GET :id': 'requestOne', 
    'PUT :id': 'requestUpdate'
  }
});

// will make GET request at /api/resource/10
MyModel.requestOne({ id : 10 }).then(function(model) {
  
  model.setProperty('updated!!!');
  
  // will make PUT request at /api/resource/10
  return model.requestUpdate();
});
```