define([
  'vertebrae/stringutils'
], function(
        StringUtils) {
  
  describe('String Utilities', function() {

    it('prototype.camelCase', function() {
      var str = 'falsyCamelCase';
      expect(String.camelCase(str)).to.equal('FalsyCamelCase');
    });

    it('prototype.camelCaseFromNamespace', function() {
      var str = 'camel.case.me';
      expect(String.camelCaseFromNamespace(str)).to.equal('CamelCaseMe');
    });

    it('prototype.fromNumber', function() {
      var num = 1234567.89;
      expect(String.formatNumber(num)).to.equal('1,234,567.89');
    });

  });

});