if (typeof define !== 'function') {
  global.chai   = require('chai');
  global.expect = chai.expect;
  chai.should();

  requirejs     = require('requirejs');
  requirejs.config({
    baseUrl: __dirname,
    nodeRequire: require
  });
}

describe('BaseObject', function() {

  before(function(done) {
    requirejs(['./unit/object'], function() {
     done();
    });
  });
  

  it('load', function() {
 
  });

});