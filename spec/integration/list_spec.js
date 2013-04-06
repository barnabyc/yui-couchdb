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
        [],
      {

      }),
      KittenList = Y.Base.create('kittenList',
        Y.ModelList,
        [Y.ModelSync.CouchDB],
      {

        model: Kitten,

        databaseName: 'felines',

        designDocument: {
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
          new Kitten({
            name: 'Sprinkles'
          }),
          new Kitten({
            name: 'Toodles'
          }),
          new Kitten({
            name: 'Mr. Fribbles'
          })
        ]
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

    it('saves a list of documents', function () {
      expect( subject._db.save ).toHaveBeenCalledWith([
        { name : 'Sprinkles',    id : undefined },
        { name : 'Toodles',      id : undefined },
        { name : 'Mr. Fribbles', id : undefined }
      ], jasmine.any(Function));
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
