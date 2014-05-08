# Vertebrae

Vertebrae is a tools expansion for Backbone.js created by the developers at [Evisions](http://www.evisions.com/). While Backbone.js is an awesome JavaScript library 
all on its own, we had some additional functionality we need within our single page application.

* 59kb, Full source, tons of comments
* 5k, Packed and gzipped ([Source Map](https://github.com/Evisions/vertebrae/blob/master/dist/vertebrae.min.map))

These toolsets can be used for large scale enterprise applications or your basic run of the mill websites. Fully minified, the library is 15kb.
(which we are currently trying to reduce) Want to know what's included in the project? High level list of included items:

* Auto generating setters/getters
* Event listeners on properties getting set
* Inheritance with _super support
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
#### Deferred Properties

All setters automatically support deferreds.

```javascript
var myDeferred = $.Deferred();

myObject.setMyProperty(myDeferred).then(function() {
  console.log(myObject.getMyProperty()); // -> hi!
});

myDeferred.resolve('hi!');
```

#### Applying Properties

If you have an Object of key/value pairs that you want to apply to an object, you can easily auto-call the setters.

```javascript
var properties = {
  myProperty: 'value'
};

// This will automatically call the myProperty setter. (this.setMyProperty())
myObject.applyProperties(properties);
```

#### Picking Properties

Sometimes you want to grab certain properties and pass them as an isolated object to something else.

```javascript
var data = myObject.pick('myProperty');

console.log(data); // -> { myProperty: 'value' }
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

BaseApp is a wrapper for your entire application. Its main functionality is to help you setup routes that will load a specific controller.
(most likely extended off of BaseController).
  
Some of the features provided by BaseApp:

* Dynamically loaded content area based on hash routing
* Automatically loads and attaches static controllers
* Supports template injecting on load

```javascript
var MyApp = Vertebrae.App.extend({
  
  // load this route when the app is launched if no other route is given
  defaultRoute: 'myRoute1',
  
  // tap into the app lifecycle and override/re-route event handlers
  events: {
    'start': 'myFunction'
  },
  
  // the main content div that route changes will load controllers into
  // if no selector is given then the app element will be used
  content: '#content',
  
  // If templates have been setup (see BaseView), the given template 
  // will be injected into the app element
  template: 'app.init',

  // when navigating to #myRoute1, the myRoute1.controller.js 
  // file's initialize function will be executed
  routes: {
    'myRoute1' : 'app/myRoute1.controller'
  },

  controllers: {
    // automagically initialize and setup controllers that will persist 
    // throughout the duration of your app
    // you will be able to access the header controller instance at app.header
    // the syntax is as follows: 'attachName selector': ControllerConstructor
    'header #header': HeaderController
  },

  myFunction: function() {
    // instead of the routing function being called when this app starts, I am called!

    // since we modified the start event handler in the events object, 
    // we need to manually call routing here in order
    // for hash routing to work!
    this.routing();
  }

});

var app = MyApp.launch(document.body);
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

```javascript
var MyView = new Vertebrae.View();

var MyController = Vertebrae.Controller.extend({
  
  events: {
    // By default the 'view:ready' event calls render
    // By overriding that functionality here, we can change how
    // the controller's lifecycle behaves
    'view:ready': 'renderMyStuff'
  },

  view: MyView,

  renderMyStuff: function() {
    // I can render my view or make an API call since my view is all setup.
    this.render();
  }
});
```

How is my view ready? I have not given it an Element! Well that has to be done OUTSIDE of the controller in a main/app
javascript file via **setup**.

```javascript
var myController = new MyController();

myController.setup(document.getElementById('my-controller'));
// Now the view is setup and 'view:ready' event has been triggered.
```

If a controller has a sub-controller whose view needs to be setup, then the main controller's view should handle it. But we will cover that later.

#### Observers

Many times we want controllers to do things when events happen. Never DOM events, but application events/notifications. You can easly define application observers via the observes property.

```javascript
var MyController = Vertebrae.Controller.extend({

  observes: {
    'global-event': 'handleGlobalEvent'
  },

  handleGlobalEvent: function() {
    // I am called when global-event is triggered.
  }
});

Vertebrae.Event.trigger('global-event');
```

#### Lifecycle

We have created an opininated lifecycle on how a controller's components are setup.  The tricky part is to allow you, the developer, to easily tap
into that lifecycle, make changes, and add new lifecycle events of your own. The way we have solved this problem is with the 'events' object.  We saw
the use of this object earlier when we changed what happend when 'view:ready' was called.  

Here is a list (in order) of the controller's events:

* **init** - the controller has been initialized
* **setup** - the controller has been setup
* **view:ready** - the controller's view is ready (has an element)
* **data:ready** - the controller's start function, which gets data, has finished (only is triggered when a controller is loaded through BaseApp)
* **view:available** - the view has finished rendering and is visible
* **unload** - the controller has been unloaded (extremely useful for unbinding events)
* **destroy** - the controller is about to be destroyed

You can tap into any of these events just by putting the event name and a instance function name in the events object

```javascript
var MyController = Vertebrae.Controller.extend({
  
  events: {
    'view:available': 'handler'
  },

  handler: function() {
    // I will be called when the view is available
  }

});
```

There is only one default lifecyle handler.  When 'view:ready' is triggered, the render function is called.


## BaseView

The view is the magic piece that glues a controller to the DOM and user interaction. It extends off of Backbone.View and includes mixins from BaseObject.

#### Delegate

One of the core ideologies that separates BaseView from Backbone.View is the use of a delegate.  A view should not have application logic it in.
A view's only logic should be to figure out how to render what it needs to render. The retrieval and processing of that data should be handled by the delegate or a model.
Typically the delegate will be a controller.

```javascript
//Create my custom view.
var MyView = Vertebrae.View.extend({
  
  events: {
    'click .item': 'handleItemClick',
    'click .something': 'delegate.doSomething'
  },

  render: function() {
    // Views should get data from their delegate.
    var data = this.getDelegate().getViewProperties();
  },

  handleItemClick: function() {
    // this will be called when .item is clicked
  }

});

// Create my custom controller that will be the delegate.
var Delegate = Vertebrae.Controller.extend({
  
  properties: [
    'name'
  ],

  events: {
    'init': 'init'
  },

  init: function() {
    this.setName('Rob');
  },
  
  view: MyView,

  getViewProperties: function() {
    // Do application logic here.

    // pick allows you to call the getter for properties and return them in an object
    return this.pick('name'); // -> { name: 'Rob' }
  },

  doSomething: function() {
    // this will be called when .something is clicked
  }

});

var delegate = new Delegate();
// setup() will automatically set the delegate.
delegate.setup(document.getElementById('main'));
```

#### Templates

All web apps should use templates of some sort. BaseView makes rendering templates extremely easy and also allows you to clearly see what templates a view is using.
In order to use the template system, you just need to pass your template object into Vertebrae.View.setupTemplates

```javascript
// TemplatesObject should take the following form:
// {
//   my_template: function() { return '<div></div>'; }
// }

Vertebrae.View.setupTemplates(TemplatesObject);

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

The model is very similar to Backbone.Model but has a slightly different paradigm shift.  Backbone.Model assumes that every model will use a standard CRUD interface on the server.  In the applications we have created, we ran accross many situations where our API calls did not adhere to the standard CRUD interface.  To solve this problem, we made the Vertebrae Model use a declarative notation to define how you want your models to communicate with the server.

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
  rootUrl: '/api/resource/',

  routes: {
    'GET :$0': 'requestOne', 
    'PUT :id': 'requestUpdate'
  },

  parsers: {
    // when we get data from the server we want to pass
    // it through the model function to return a new instance
    // of MyModel
    'GET :$0': 'model'
  },

  requestCustomMade: function() {
    // there are 4 built-in static request methods on every model:
    // Vertebrae.Model.get, Vertebrae.Model.post, Vertebrae.Model.put, Vertebrae.Model.del

    // will request GET /api/resource/my/custom/api
    return this.get('my/custom/api');
  }
});

// will make GET request at /api/resource/10
MyModel.requestOne(10).then(function(model) {
  // model will be an instance of MyModel
  // since we parsed it through the model function
  model.setProperty('updated!!!');
  
  // will make PUT request at /api/resource/10
  return model.requestUpdate();
});
```