console.log('create, 1');

require('yui').getInstance().applyConfig({
  useSync: true,
  modules: {
    'model-sync-couchdb': require('../../index')
  }
});

var Y = require('yui').use('model-sync-couchdb', 'model', 'model-list');

console.log('create, 2');

describe('creation', function () {

  console.log('create, 3');

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

  console.log('create, 4');

  describe('of a single document', function () {
    beforeEach(function () {

      subject = new Kitten({
        name  : 'Whiskers',
        gender: 'male',
        age   : 4
      });

      spyOn( subject, '_createDocument' ).andCallThrough();

      subject.save();
    });

    it('calls `_createDocument`', function () {
      expect( subject._createDocument ).toHaveBeenCalled();
    });

    it('has establishes a valid connection', function () {
      expect( subject._conn ).not.toBe( null );
    });

    it('has a valid database', function () {
      expect( subject._db ).not.toBe( null );
    });

    it('calls database.save from create document method', function () {
      spyOn( subject._db, 'save' );

      subject.save();

      expect( subject._db.save ).toHaveBeenCalledWith({
        name  : 'Whiskers',
        gender: 'male',
        age   : 4
      }, jasmine.any(Function));
    });
  });

  xdescribe('of a list of documents', function () {
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
          },
        ]
      });

      spyOn( subject, 'save' ).andCallThrough();

    });

    xit('creates a list of documents', function () {

    });
  });

});
