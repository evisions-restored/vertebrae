define(['vertebrae/object'], function(BaseObject) {

  describe('BaseObject', function() {

    it('#getPropertyByNamespace', function() {
      var obj = { hello: { my: { property: 'success' }}};
      expect(BaseObject.getPropertyByNamespace(obj, 'hello.my.property')).to.equal('success');
      expect(BaseObject.getPropertyByNamespace(obj, 'fake.property.test')).to.equal(null);
    });


    

  });

});