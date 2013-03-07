require('yui').getInstance().applyConfig({
  useSync: true,
  modules: {
    'model-sync-couchdb': require('../../index')
  }
});

var Y = require('yui').use('model-sync-couchdb', 'model', 'model-list');

describe('reading', function () {

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

  beforeEach(function () {
    subject = new Kitten({
      id : '123456'
    });

    spyOn( subject, '_fetchDocument' ).andCallThrough();

    subject._conn = jasmine.createSpy();

    subject._db = {
      get   : jasmine.createSpy(),
      exists: jasmine.createSpy()
    };
  });

  describe('a single document', function () {
    beforeEach(function () {

      subject.load();

    });

    it('calls `_fetchDocument', function () {
      expect( subject._fetchDocument ).toHaveBeenCalledWith({
        // no options passed
      }, jasmine.any(Function));
    });

    it('calls database.get', function () {
      expect( subject._db.get ).toHaveBeenCalledWith(
        '123456',
        jasmine.any(Function));
    });
  });

  describe('a list of documents', function () {

  });

  describe('a view', function () {

  });

});

