// create.js
var cradle = require('cradle');
var Y = require('yui').use(
  'model',
  'model-list',
  'model-sync-couchdb'
);

describe('create', function () {

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
        model: Y.Kitten

      });

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
          },
        ]
      });

      spyOn( subject, 'save' ).andCallThrough();

    });

    it('creates a list of documents', function () {

    });
  });

});
