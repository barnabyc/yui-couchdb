console.log('create, 1');

require('yui').getInstance().applyConfig({
  useSync: true,
  modules: {
    'model-sync-couchdb': require('../../index')
  }
});

var Y = require('yui').use('model-sync-couchdb');

console.log('create, 2');

describe('create', function () {

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

  describe('a single document', function () {
    beforeEach(function () {

      subject = new Kitten({
        name  : 'Whiskers',
        gender: 'male',
        age   : 4
      });

      spyOn( subject, '_createDocument' ).andCallThrough();
      spyOn( subject._db, 'save' );
    });

    it('creates a single document', function () {
      subject.save();

      expect( subject._createDocument ).toHaveBeenCalled();
      expect( subject._db.save ).toHaveBeenCalledWith({
        name  : 'Whiskers',
        gender: 'male',
        age   : 4
      }, jasmine.any(Function));
    });
  });

  xdescribe('a list of documents', function () {
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
