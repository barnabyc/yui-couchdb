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

  describe('a single document', function () {
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

    xit('calls the passed callback', function () {
      // @todo
    });
  });

  describe('a list of documents', function () {
    beforeEach(function () {
      subject = new KittenList({
        items: [
          {
            name  : 'Sparkles',
            gender: 'female',
            age   : 3
          },
          {
            name  : 'Tinkles',
            gender: 'female',
            age   : 4
          },
          {
            name  : 'Ernest',
            gender: 'male',
            age   : 5
          }
        ]
      });

      spyOn( subject, '_queryAll' ).andCallThrough();
      spyOn( subject, '_queryView' ).andCallThrough();

      subject._conn = jasmine.createSpy();

      subject._db = {
        view  : jasmine.createSpy(),
        exists: jasmine.createSpy()
      };

      subject.load();
    });

    it('calls `_queryAll`', function () {
      expect( subject._queryAll ).toHaveBeenCalledWith({
        // no options passed
      }, jasmine.any(Function));
    });

    describe('via an `all` view', function () {
      it('calls `_queryView` with the default ALL_VIEW_NAME', function () {
        expect( subject._queryView ).toHaveBeenCalledWith(
          'all',
          {
            // no options passed
          },
          jasmine.any(Function)
        );
      });

      it('calls database.view', function () {
        expect( subject._db.view ).toHaveBeenCalledWith(
          'all',
          jasmine.any(Function)
        );
      });

      xit('calls the passed callback', function () {
        // @todo
      });
    });
  });

  describe('a specific view', function () {
    var callback;

    beforeEach(function () {
      subject = new Kitten({
        id : '123456'
      });

      spyOn( subject, '_fetchDocument' ).andCallThrough();

      subject._conn = jasmine.createSpy();

      subject._db = {
        view  : jasmine.createSpy(),
        exists: jasmine.createSpy()
      };

      callback = jasmine.createSpy();

      subject._queryView('characters', {}, callback);
    });

    it('calls database.view', function () {
      expect( subject._db.view ).toHaveBeenCalledWith(
        'characters',
        jasmine.any(Function)
      );
    });

    xit('calls the passed callback', function () {
      // @todo
    });
  });

});

