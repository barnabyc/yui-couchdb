require('yui').getInstance().applyConfig({
  modules: {
    'model-sync-couchdb': require('../../index')
  }
});

var Y = require('yui').use('model-sync-couchdb', 'model', 'model-list');

describe('a list of documents', function () {

  var subject,
      Kitten = Y.Base.create('kitten',
        Y.Model,
        [Y.ModelSync.CouchDB],
      {

        databaseName: 'felines'

      }),
      KittenList = Y.Base.create('kittenList',
        Y.ModelList,
        [Y.ModelSync.CouchDB],
      {

        databaseName: 'felines',
        model: Kitten

      });

  describe('can be created', function () {
    beforeEach(function () {

      subject = new Kitten({
        name  : 'Whiskers',
        gender: 'male',
        age   : 4
      });

      spyOn( subject, '_createDocument' ).andCallThrough();

      subject._conn = jasmine.createSpy();

      subject._db = {
        save  : jasmine.createSpy(),
        exists: jasmine.createSpy()
      };

      subject.save();

    });

    it('calls `_createDocument`', function () {
      expect( subject._createDocument ).toHaveBeenCalled();
    });

    it('saves a single document', function () {
      expect( subject._db.save ).toHaveBeenCalledWith({
        name  : 'Whiskers',
        gender: 'male',
        age   : 4
      }, jasmine.any(Function));
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
