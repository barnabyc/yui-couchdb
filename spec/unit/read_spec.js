require('yui').getInstance().applyConfig({
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
        model: Kitten,
        listAllViewPath: 'breeds/all'

      });

  describe('a single document', function () {
    var callback;

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

      callback = jasmine.createSpy();

      subject.load( callback );
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

      subject._conn = jasmine.createSpy();

      subject._db = {
        view  : jasmine.createSpy(),
        exists: jasmine.createSpy()
      };

      subject.load();
    });

    it('calls `_queryAll`', function () {
      expect( subject._queryAll ).toHaveBeenCalledWith(
        {
          // no options passed
        },
        jasmine.any(Function)
      );
    });

    describe('via a view', function () {
      it('calls database.view', function () {
        expect( subject._db.view ).toHaveBeenCalledWith(
          'breeds/all',
          jasmine.any(Function)
        );
      });
    });
  });

  describe('a specific view', function () {
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

      subject._queryView(
        'breeds',
        'all',
        {
          // no options
        },
        function () {}
      );
    });

    it('calls database.view', function () {
      expect( subject._db.view ).toHaveBeenCalledWith(
        'breeds/all',
        jasmine.any(Function)
      );
    });
  });

});

