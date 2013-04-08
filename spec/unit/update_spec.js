require('yui').getInstance().applyConfig({
  modules: {
    'model-sync-couchdb': require('../../index')
  }
});

var Y = require('yui').use('model-sync-couchdb', 'model', 'model-list');

describe('updating', function () {

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
        id    : '123abc456def',
        name  : 'Whiskers',
        gender: 'male',
        age   : 4
      });

      spyOn( subject, '_updateDocument' ).andCallThrough();

      subject._conn = jasmine.createSpy();

      subject._db = {
        save  : jasmine.createSpy(),
        exists: jasmine.createSpy()
      };

      subject.save();

    });

    it('calls `_updateDocument`', function () {
      expect( subject._updateDocument ).toHaveBeenCalled();
    });

    it('saves the document', function () {
      expect( subject._db.save ).toHaveBeenCalledWith(
        '123abc456def',
        {
          name  : 'Whiskers',
          gender: 'male',
          age   : 4
        },
        jasmine.any(Function)
      );
    });

    describe('at a specific revision', function () {
      beforeEach(function () {
        subject.addAttr('revision', 'version-2-0-9');
      });

      it('saves the revision', function () {
        expect( subject._db.save ).toHaveBeenCalledWith(
          '123abc456def',
          'version-2-0-9',
          {
            name  : 'Whiskers',
            gender: 'male',
            age   : 4
          },
          jasmine.any(Function)
        );
      });
    });

    describe('specific fields', function () {
      // @todo
    });

  });

  describe('design documents', function () {
    // @todo ensure we're actually updating existing design docs... how?
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
