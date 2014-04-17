if (typeof define !== 'function') {
  requirejs = require('requirejs');
  requirejs.config({
    nodeRequire: require
  });
}


if (typeof QUnit == 'undefined') {
  QUnit = require('qunit-cli');
}

requirejs([
  './unit/controller'
], function() {

  console.log('here');

  test('Test me', function() {
    ok(true, 'it passed!!');
  });

  QUnit.start();

});