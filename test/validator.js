define([
  'vertebrae/controller',
  'vertebrae/view',
  'vertebrae/validator'
], function(BaseController, BaseView, Validator) {

  var TestView = BaseView.extend({

    properties: [
      'email',
      'empty',
      'date',
      'max',
      'min',
      'number',
      'phone',
      'postalCode',
      'numberBetween'
    ],

    min: '',
    max: 'yes',
    email: 'test@evisions.com',
    phone: '(555) 555 5555',
    postalCode: '55555-5555',
    empty: 'skdlsld',
    date: new Date(),
    number: 1,
    numberBetween: 10

  });

  var TestController = BaseController.extend({

    view: TestView,

    validators: {
      min           : [Validator.validators.checkLength(1, 3)],
      max           : [Validator.validators.checkLength(1, 3)],
      email         : [Validator.validators.email()],
      phone         : [Validator.validators.phone()],
      postalCode    : [Validator.validators.postalCode()],
      empty         : [Validator.validators.empty()],
      date          : [Validator.validators.date()],
      number        : [Validator.validators.number()],
      numberBetween : [Validator.validators.numberBetween(1, 10)]
    }
  });

  var tc = new TestController();

  describe('Validator', function() {

    it('validate - min', function() {
      expect(tc.validate(['min'])).to.be.false;
    });

    it('validate - max', function() {
      expect(tc.validate(['max'])).to.be.true;
    });

    it('validate - email', function() {
      expect(tc.validate(['email'])).to.be.true;

      tc.view.setEmail('testevisoins.com');

      expect(tc.validate(['email'])).to.be.false;
    });

    it('validate - phone', function() {
      expect(tc.validate(['phone'])).to.be.true;

      tc.view.setPhone('555-55-5555');

      expect(tc.validate(['phone'])).to.be.false;
    });

    it('validate - postalCode', function() {
      expect(tc.validate(['postalCode'])).to.be.true;

      tc.view.setPostalCode('5555-5555');

      expect(tc.validate(['postalCode'])).to.be.false;
    });

    it('validate - empty', function() {
      expect(tc.validate(['empty'])).to.be.true;

      tc.view.setEmpty('');

      expect(tc.validate(['empty'])).to.be.false;
    });

    it('validate - date', function() {
      expect(tc.validate(['date'])).to.be.true;

      tc.view.setDate(new Date('blah'));

      expect(tc.validate(['date'])).to.be.false;
    });

    it('validate - number', function() {
      expect(tc.validate(['number'])).to.be.true;

      tc.view.setNumber('blah');

      expect(tc.validate(['number'])).to.be.false;
    });

    it('validate - numberBetween', function() {
      expect(tc.validate(['numberBetween'])).to.be.true;

      tc.view.setNumberBetween(0);

      expect(tc.validate(['numberBetween'])).to.be.false;

      tc.view.setNumberBetween(11);
      
      expect(tc.validate(['numberBetween'])).to.be.false;
    });

  });

});