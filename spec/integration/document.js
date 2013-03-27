require('yui').getInstance().applyConfig({
  modules: {
    'model-sync-couchdb': require('../../index')
  }
});

var Y = require('yui').use('model-sync-couchdb', 'model');

describe('a single document', function () {

  var subject,
      Kitten = Y.Base.create('kitten',
        Y.Model,
        [Y.ModelSync.CouchDB],
      {

        databaseName: 'felines'

      });

  describe('can be created', function () {
    var callback;

    beforeEach(function () {
      subject = new Kitten({
        name  : 'Whiskers',
        gender: 'male',
        age   : 4
      });

      spyOn( subject, '_createDocument' ).andCallThrough();

      callback = jasmine.createSpy();

      subject.save( callback );
    });

    it('calls `_createDocument`', function () {
      expect( subject._createDocument ).toHaveBeenCalled();
    });

    it('saves a single document', function () {
      expect( callback ).toHaveBeenCalledWith({
        foo : 'bar'
      });
    });
  });

  describe('can be read', function () {
    // @todo
  });

  describe('can be updated', function () {
    // @todo
  });

  describe('can be deleted', function () {
    // @todo
  });

});
