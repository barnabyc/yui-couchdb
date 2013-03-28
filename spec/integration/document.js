require('yui').getInstance().applyConfig({
  modules: {
    'model-sync-couchdb': require('../../index')
  }
});

var Y = require('yui').use('model-sync-couchdb', 'model');

describe('a single document', function () {

  var subject,
      callback,
      Kitten = Y.Base.create('kitten',
        Y.Model,
        [Y.ModelSync.CouchDB],
      {

        databaseName: 'felines'

      });

  describe('can be created', function () {
    beforeEach(function () {
      subject = new Kitten({
        id    : '123456',
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
        foo : 'saved'
      });
    });
  });

  describe('can be read', function () {
    beforeEach(function () {
      subject = new Kitten({
        id    : '123456',
        name  : 'Whiskers',
        gender: 'male',
        age   : 4
      });

      spyOn( subject, '_fetchDocument' ).andCallThrough();

      callback = jasmine.createSpy();

      subject.load( callback );
    });

    it('calls `_fetchDocument`', function () {
      expect( subject._fetchDocument ).toHaveBeenCalled();
    });

    it('loads a single document', function () {
      expect( callback ).toHaveBeenCalledWith({
        foo : 'loaded'
      });
    });
  });

  describe('can be updated', function () {
    // @todo
  });

  describe('can be deleted', function () {
    // @todo
  });

});
