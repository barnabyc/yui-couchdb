require('yui').getInstance().applyConfig({
  useSync: true,
  modules: {
    'model-sync-couchdb': require('../../index')
  }
});

var Y = require('yui').use('model-sync-couchdb', 'model', 'model-list');

describe('creation', function () {

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

  xdescribe('of a database', function () {
    // @todo
  });

  xdescribe('of a design document', function () {
    // @todo
  });

  describe('of a single document', function () {
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

    // @todo move to integration tests
    // it('has a valid connection', function () {
    //   expect( subject._conn ).not.toBe( null );
    // });

    // it('has a valid database', function () {
    //   expect( subject._db ).not.toBe( null );
    // });

    it('saves a single document', function () {
      expect( subject._db.save ).toHaveBeenCalledWith({
        name  : 'Whiskers',
        gender: 'male',
        age   : 4
      }, jasmine.any(Function));
    });
  });

  describe('of a list of documents', function () {
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

});
