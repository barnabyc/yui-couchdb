require('yui').getInstance().applyConfig({
  filter: 'debug',
  modules: {
    'model-sync-couchdb': require('../../index')
  }
});

var Y = require('yui').use('model-sync-couchdb', 'model');

describe('a single document', function () {

  var subject,
      callback,
      // id = (new Date).toISOString() + Math.random(),
      createdDocumentId,
      Kitten = Y.Base.create('kitten',
        Y.Model,
        [Y.ModelSync.CouchDB],
      {

        databaseName: 'felines'

      });

  describe('can be created', function () {
    beforeEach(function () {
      subject = new Kitten({
        // _id   : id,
        name  : 'Whiskers',
        gender: 'male',
        age   : 4
      });

      spyOn( subject, '_createDocument' ).andCallThrough();

      callback = jasmine.createSpy();

      subject.save( callback );

      createdDocumentId = subject.get('id');
    });

    it('calls `_createDocument`', function () {
      expect( subject._createDocument ).toHaveBeenCalled();
    });

    it('calls the save callback', function () {
      expect( callback ).toHaveBeenCalledWith({
        foo : 'saved'
      });
    });

    it('now has an id', function () {
      expect( createdDocumentId ).toBe( 123 );
    });
  });

  xdescribe('can be read', function () {
    beforeEach(function () {
      subject = new Kitten({
        _id   : id
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

  xdescribe('can be updated', function () {
    // @todo
  });

  xdescribe('can be deleted', function () {
    // @todo
  });

});