define(['vertebrae/validator'], function(Validator) {
  
  describe('Validator', function() {

    describe('Default Validations', function() {

      var validators = Validator.validators;

      it('checkLength(min, max, minMessage, maxMessage) - should pass if length is within indicated range', function() {
        var min     = 2,
            max     = 6,
            minMsg  = 'Minimum',
            maxMsg  = 'Maximum'
            test    = function() {};

        // Minimum Length Validation
        test = validators.checkLength(min);

        expect(test).to.be.a.function;

        expect(test('Hello')).to.be.true;
        expect(test('H')).to.be.a.String;
        expect(test('')).to.be.true; // Only test length if string exists

        // Minimum Length Validation w/ Custom Msg
        test = validators.checkLength(min, null, minMsg);

        expect(test('H')).to.equal(minMsg);

        // Max Length Validation
        test = validators.checkLength(null, max);

        expect(test('Hello')).to.be.true;
        expect(test('Hello World')).to.be.a.String;
        expect(test('')).to.be.true;

        // Max Length Validation w/ Custom Msg
        test = validators.checkLength(null, max, '', maxMsg);

        expect(test('Hello World')).to.equal(maxMsg);

        // Min and Max Validation
        test = validators.checkLength(min, max, minMsg, maxMsg);

        expect(test('Hello')).to.be.true;
        expect(test('a')).to.equal(minMsg);
        expect(test('abcdefghi')).to.equal(maxMsg);
      });

      it('empty(msg) - should test whether string is empty', function() {
        var msg  = 'Empty',
            test = null,

        // Empty Validation
        test = validators.empty();

        expect(test).to.be.a.function;

        expect(test('Hello')).to.be.true;
        expect(test('')).to.be.a.String;
        expect(test('  ')).to.be.a.String;

        // Empty Validation w/ Custom Msg
        test = validators.empty(msg);

        expect(test('')).to.equal(msg);
      });

      it('date(message) - should test whether a date object', function() {
        var msg   = 'Invalid Date',
            test  = null;

        test = validators.date();

        expect(test(new Date())).to.be.true;
        expect(test()).to.be.true;

        expect(test('FailMe')).to.be.a.String;

        // Date Validation w/ Custom Msg
        test = validators.date(msg);

        expect(test(new Date())).to.be.true;        
        expect(test('FailMe')).to.equal(msg);
      });

    });

  });

});