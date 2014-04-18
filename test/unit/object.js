define(['../../object'], function(BaseObject) {

  it('#getPropertyByNamespace', function() {
    var obj = { hello: { my: { property: 'success' }}};
    BaseObject.getPropertyByNamespace(obj, 'hello.my.property').should.equal('success');
    BaseObject.getPropertyByNamespace(obj, 'fake.property.test').should.equal(null);
  });

});