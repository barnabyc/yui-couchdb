var uuid = require('node-uuid');

require('yui').getInstance().applyConfig({
  // filter: 'debug',
  modules: {
    'model-sync-couchdb': require('../../index')
  }
});

var Y = require('yui').use('model-sync-couchdb', 'model', 'model-list');

describe('a list of documents', function () {

  var subject,
      callback,
      databaseName = 'felines_'+uuid.v4(),
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

        databaseName: databaseName,

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

      spyOn( subject, '_createDesignDocuments' ).andCallThrough();
      spyOn( subject, '_createDocument' ).andCallThrough();
      spyOn( subject, 'parse' ).andCallThrough();

      callback = jasmine.createSpy();

      runs(function () {
        subject.save( callback );
      });

      waits(100);
    });

    it('calls `_createDesignDocuments`', function () {
      runs(function () {
        expect( subject._createDesignDocuments ).toHaveBeenCalled();
      });
    });

    it('calls `_createDocument`', function () {
      runs(function () {
        expect( subject._createDocument ).toHaveBeenCalled();
      });
    });

    // @todo this isn't going to be called as we're
    // extending ModelList with `save`
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
    beforeEach(function () {
      spyOn( subject, '_queryAll' ).andCallThrough();
      spyOn( subject, '_queryView' ).andCallThrough();
      spyOn( subject, 'parse' ).andCallThrough();

      callback = jasmine.createSpy();

      runs(function () {
        subject.load( callback );
      });

      waits(100);
    });

    it('calls `_queryAll', function () {
      expect( subject._queryAll ).toHaveBeenCalledWith(
      {
        // no options
      },
      jasmine.any(Function));
    });

    it('calls `_queryView', function () {
      expect( subject._queryView ).toHaveBeenCalledWith(
      'all',
      {
        // no options
      },
      jasmine.any(Function));
    });

    it('parses the list of documents', function () {
      expect( subject.parse ).toHaveBeenCalledWith({
        pickles: 'yum'
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
