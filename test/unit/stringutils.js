define([
  'vertebrae/stringutils'
], function(StringUtils) {
  
  describe('String Utilities', function() {

    it('String.prototype.camelCase(str) - should return the string with the first letter capitalized', function() {
      var str = 'falsyCamelCase';
      expect(String.camelCase(str)).to.equal('FalsyCamelCase');
    }); // StringUTils.camelCase


    it('String.prototype.camelCaseFromNamespace(str) - should return a namespace string as camel cased', function() {
      var str = 'camel.case.me';
      expect(String.camelCaseFromNamespace(str)).to.equal('CamelCaseMe');
    }); // StringUTils.camelCaseFromNamespace


    it('Number.prototype.fromNumber(num) - should return the number representation', function() {
      var num = 1234567.89;
      expect(String.formatNumber(num)).to.equal('1,234,567.89');
    });

  }); // StringUtils

});