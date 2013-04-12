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

        listAllViewPath: 'breeds/all',

        designDocuments: {
          breeds: {
            all: {
              map: function (doc) {
                if (doc.name) emit(doc.name, doc);
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
      spyOn( subject, '_parse' ).andCallThrough();
      spyOn( subject, 'reset' ).andCallThrough();

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

    it('parses the list of documents', function () {
      expect( subject._parse ).toHaveBeenCalledWith(
      // @note we've got duplicate documents because
      // we're on the second iteration of the creation.
      [{
        id: jasmine.any(String),
        key: 'Mr. Fribbles',
        value: {
          _id: jasmine.any(String),
          _rev: '1-4fbc6f6d5463a701c0080ec73840586b',
          name: 'Mr. Fribbles'
        }
      }, {
        id: jasmine.any(String),
        key: 'Mr. Fribbles',
        value: {
          _id: jasmine.any(String),
          _rev: '1-4fbc6f6d5463a701c0080ec73840586b',
          name: 'Mr. Fribbles'
        }
      }, {
        id: jasmine.any(String),
        key: 'Sprinkles',
        value: {
          _id: jasmine.any(String),
          _rev: '1-7247ed5a878f3254c2e9f2fefcd02d0c',
          name: 'Sprinkles'
        }
      }, {
        id: jasmine.any(String),
        key: 'Sprinkles',
        value: {
          _id: jasmine.any(String),
          _rev: '1-7247ed5a878f3254c2e9f2fefcd02d0c',
          name: 'Sprinkles'
        }
      }, {
        id: jasmine.any(String),
        key: 'Toodles',
        value: {
          _id: jasmine.any(String),
          _rev: '1-9ddcea6c4be659d50a600cf1218e0b41',
          name: 'Toodles'
        }
      }, {
        id: jasmine.any(String),
        key: 'Toodles',
        value: {
          _id: jasmine.any(String),
          _rev: '1-9ddcea6c4be659d50a600cf1218e0b41',
          name: 'Toodles'
        }
      }]
      );
    });

    it('resets the subject', function () {
      expect( subject.reset ).toHaveBeenCalledWith(
      [{
        _id: jasmine.any(String),
        _rev: '1-4fbc6f6d5463a701c0080ec73840586b',
        name: 'Mr. Fribbles'
      }, {
        _id: jasmine.any(String),
        _rev: '1-4fbc6f6d5463a701c0080ec73840586b',
        name: 'Mr. Fribbles'
      }, {
        _id: jasmine.any(String),
        _rev: '1-7247ed5a878f3254c2e9f2fefcd02d0c',
        name: 'Sprinkles'
      }, {
        _id: jasmine.any(String),
        _rev: '1-7247ed5a878f3254c2e9f2fefcd02d0c',
        name: 'Sprinkles'
      }, {
        _id: jasmine.any(String),
        _rev: '1-9ddcea6c4be659d50a600cf1218e0b41',
        name: 'Toodles'
      }, {
        _id: jasmine.any(String),
        _rev: '1-9ddcea6c4be659d50a600cf1218e0b41',
        name: 'Toodles'
      }],
      {
        // no options
      }
      );
    })
  });

  describe('can be updated', function () {
    // @todo
  });

  describe('can be deleted', function () {
    // @todo
  });

});
