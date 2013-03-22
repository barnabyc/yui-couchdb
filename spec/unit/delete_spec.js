require('yui').getInstance().applyConfig({
  modules: {
    'model-sync-couchdb': require('../../index')
  }
});

var Y = require('yui').use('model-sync-couchdb', 'model', 'model-list');

describe('deleting', function () {

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

      spyOn( subject, '_deleteDocument' ).andCallThrough();

      subject._conn = jasmine.createSpy();

      subject._db = {
        remove: jasmine.createSpy(),
        exists: jasmine.createSpy()
      };

    });

    it('calls `_deleteDocument`', function () {
      subject.destroy({
        remove: true
      });

      expect( subject._deleteDocument ).toHaveBeenCalled();
    });

    it('deletes the document', function () {
      subject.destroy({
        remove: true
      });

      expect( subject._db.remove ).toHaveBeenCalledWith(
        '123abc456def',
        jasmine.any(Function)
      );
    });

    describe('at a specific revision', function () {
      beforeEach(function () {
        subject.addAttr('revision', 'version-2-0-9');
      });

      it('deletes the revision', function () {
        expect( subject._db.remove ).toHaveBeenCalledWith(
          '123abc456def',
          'version-2-0-9',
          jasmine.any(Function)
        );
      });
    });
  });

  describe('a list of documents', function () {
    beforeEach(function () {
      subject = new KittenList({
        items: [
          {
            id    : 123,
            name  : 'Sparkles',
            gender: 'female',
            age   : 3
          },
          {
            id    : 456,
            name  : 'Tinkles',
            gender: 'female',
            age   : 4
          },
          {
            id    : 789,
            name  : 'Ernest',
            gender: 'male',
            age   : 5
          }
        ]
      });

      spyOn( subject, '_deleteList' ).andCallThrough();

      subject._conn = jasmine.createSpy();

      subject._db = {
        view  : jasmine.createSpy(),
        exists: jasmine.createSpy()
      };

      subject.delete({
        remove: true
      });
    });

    it('calls `_deleteList`', function () {
      expect( subject._deleteList ).toHaveBeenCalledWith([
        123,
        456,
        789
      ], jasmine.any(Function));
    });
  });

  xdescribe('specific fields', function () {
    // @todo
  });

  xdescribe('a design document', function () {
    // @todo
  });

});
