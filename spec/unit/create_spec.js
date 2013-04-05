require('yui').getInstance().applyConfig({
  modules: {
    'model-sync-couchdb': require('../../index')
  }
});

var Y = require('yui').use('model-sync-couchdb', 'model', 'model-list');

describe('creating', function () {

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

      spyOn( subject, '_createDocument' ).andCallThrough();

      subject._conn = jasmine.createSpy();

      subject._db = {
        save  : jasmine.createSpy(),
        exists: jasmine.createSpy()
      };

      subject.save();

    });

    it('saves multiple documents', function () {
      expect( subject._db.save ).toHaveBeenCalledWith([
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
      ], jasmine.any(Function));
    });
  });

  describe('a database', function () {
    beforeEach(function () {
      subject = new Kitten({
        name  : 'Whiskers',
        gender: 'male',
        age   : 4
      });

      subject._db = {
        create : jasmine.createSpy()
      };

      subject._createDatabase();
    });

    it('calls database.create', function () {
      expect( subject._db.create ).toHaveBeenCalled();
    });
  });

  describe('a design document', function () {
    var designDocAllView = {
      map: function (doc) {
        if (doc.breed) emit(doc.breed, doc);
      }
    };

    beforeEach(function () {
      subject = new Kitten({
        name  : 'Whiskers',
        gender: 'male',
        age   : 4
      });

      subject.designDocuments = {
        breeds: {
          all: designDocAllView
        }
      };

      subject._db = {
        save : jasmine.createSpy()
      };

      subject._createDesignDocuments();
    });

    it('calls database.save', function () {
      expect( subject._db.save ).toHaveBeenCalledWith(
        '_design/breeds',
         {
          all: designDocAllView
         }
      );
    });
  });

});
