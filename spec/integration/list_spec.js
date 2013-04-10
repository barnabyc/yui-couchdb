require('yui').getInstance().applyConfig({
  modules: {
    'model-sync-couchdb': require('../../index')
  }
});

var Y = require('yui').use('model-sync-couchdb', 'model', 'model-list');

describe('a list of documents', function () {

  var subject,
      callback,
      Kitten = Y.Base.create('kitten',
        Y.Model,
        [],
      {

      }),
      KittenList = Y.Base.create('kittenList',
        Y.ModelList,
        [Y.ModelSync.CouchDB],
      {

        model: Kitten,

        databaseName: 'felines',

        designDocuments: {
          breeds: {
            all: {
              map: function (doc) {
                if (doc.breed) emit(doc.breed, doc);
              }
            }
          }
        }

      });

  describe('can be created', function () {
    beforeEach(function () {

      subject = new KittenList({
        items: [
          { name: 'Sprinkles' },
          { name: 'Toodles' },
          { name: 'Mr. Fribbles' }
        ]
      });

      spyOn( subject, '_createDocument' ).andCallThrough();
      spyOn( subject, 'parse' ).andCallThrough();

      callback = jasmine.createSpy();

      runs(function () {
        subject.save( callback );
      });

      waits(100);

    });

    it('calls `_createDocument`', function () {
      runs(function () {
        expect( subject._createDocument ).toHaveBeenCalled();
      });
    });

    it('parses the response', function () {
      runs(function () {
        expect( subject.parse ).toHaveBeenCalledWith([
          { name : 'Sprinkles',    id : undefined },
          { name : 'Toodles',      id : undefined },
          { name : 'Mr. Fribbles', id : undefined }
        ]);
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
