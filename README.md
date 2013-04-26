# vertebrae

Evisions' expansion for Backbone.js


## EVIObject

EVIObject is the base Class that all non-views should extend off of.  EVIView extends off of Backbone.View and therefore only mixins are applied from EVIObject.

#### Properties

Properties provide a way to auto-generate setters/getters for your properties.  
It also serves the purpose of clearly defining which properties are on an Object.
Those familar with @synthesize in Objective-C should feel right at home.

```javascript
var MyObject = EVIObject.extend({
  properties: ['myProperty']
});

var myObject = new MyObject();
myObject.setMyProperty('i have a setter!');
```

#### Applying Properties

If you have an Object of key/value pairs that you want to apply to an object, you can easily auto-call the setters.

```javascript
var properties = {
  myProperty: 'i need to be set....'
};
//this will automatically call the myProperty setter
myObject.applyProperties(properties);
```

#### Events

All EVIObjects have Backbone.Events mixed in and thus you can listen for changes via the generated setters.

```javascript
myObject.on('change:myProperty', function() {
  //i have changed!
});
myObject.setMyProperty('i will call the change event');
```

#### Super

We all know Class inheritance can be a real pain in Javascript.  Fortunately, we have build this._super into EVIObject.

```javascript
var MyBaseClass = EVIObject.extend({
  myFunction: function() {
  }
});

var MySubClass = MyBaseClass.extend({
  myFunction: function() {
    //this will call myFunction on MyBaseClass
    this._super();
  }
});
```

#### Clean Up

If you use events and you do not want memory leaks, you need to unbind those events.  With EVIObject you just destroy and forget.
The trick is to always use **listenTo** instead of **on**.

```javascript
var anotherObject = new MyObject();

anotherObject.listenTo(myObject, 'change:myProperty', function() {
});
//i want to kill anotherObject...
anotherObject.destroy();
anotherObject = null;
```

## EVIController

EVIController is really just a glorified Class but it has a very opinionated purpose.  Below are the intended directives.

* Should NEVER directly apply the Element of a view
* Should not be specific to a particular area of your app
* Should NEVER interact with the DOM

But wait.....I need set the Element of my views.  And I need to write logic that is specific to an area of my app.   And I need to interact with the DOM.
These problems are solve as such.

* All Elements should be passed in from outside the controller
* All specific logic should be abstracted via view functions
* All DOM interaction should be done through a view


#### Setting up the View

In order to follow our convention of setting up a view, you need two functions.

**setupView**
: should initialize the object via this.setView()

**viewIsReady**
: should kick off the main logic of the controller since the view is ready

```javascript
var MyController = EVIController.extend({
  setupView: function() {
    this.setView(new MyView());
  },
  viewIsReady: function() {
    //i can do logic or make an API call since my view is all setup
  }
});
```

But wait...how is my view ready?  I have not given it an Element!
Well that has to be done OUTSIDE of the controller in a main/config/bootstrap javascript file via **setupViewProperties**.


```javascript
var config = {
  main: 'main'
};
var myController = new MyController();
myController.setupViewProperties(document.getElementById(config.main));
//now the view is setup and viewIsReady has been called
```

If a controller has a sub-controller whose view needs to be setup, then the main controller's view should handle it.  But we will cover that later.

#### Observers

Many times we want controllers to do things when events happen. NEVER DOM events but application events/notifications.  You can easly define application observers via the observes property.
(I will go over the helper object later)

```javascript
var myController = EVIController.extend({
  observes: {
    'global-event': 'handleGlobalEvent'
  },
  handleGlobalEvent: function() {
    //i am called when global-event was triggered
  }
});
helper.fire('global-event');
```

#### Validation

Lets face it.  Users are stupid.  Input ALWAYS needs some form of validation.  EVIController makes validating stupid simple.

```javascript
var emptyValidator = function() {
  return value ? true : 'This field cannot be empty' ;
};

var MyValidationController = EVIController.extend({
  validators: {
    validationProperty: [emptyValidator, 'instanceValidationMethod']
  },
  instanceValidationMethod: function(value, property) {
    //i am called but only if the emptyValidator returned true
    return true;
  }
});

var MyModel = EVIObject.extend({
  properties: ['validationProperty']
});

var myValidationController = new MyValidationController();
var myModel = new MyModel();

if (myValidationController.validate(myModel)) {
  //i am valid!!!
}
```