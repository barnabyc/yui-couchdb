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
    var model1, model2, model3;

    beforeEach(function () {
      model1 = new Kitten({
        id    : 123,
        name  : 'Sparkles',
        gender: 'female',
        age   : 3
      });

      model2 = new Kitten({
        id    : 456,
        name  : 'Tinkles',
        gender: 'female',
        age   : 4
      });
      model3 = new Kitten({
        id    : 789,
        name  : 'Ernest',
        gender: 'male',
        age   : 5
      });

      subject = new KittenList({
        items: [
          model1,
          model2,
          model3
        ]
      });

      subject._conn = jasmine.createSpy();

      subject._db = {
        view  : jasmine.createSpy(),
        exists: jasmine.createSpy()
      };

      spyOn( model1, 'destroy' ).andCallThrough();
      spyOn( model2, 'destroy' ).andCallThrough();
      spyOn( model3, 'destroy' ).andCallThrough();

      subject.destroy();
    });

    it('calls destroy for each list item', function () {
      expect( model1.destroy ).toHaveBeenCalledWith({
        remove: true
      });
      expect( model2.destroy ).toHaveBeenCalledWith({
        remove: true
      });
      expect( model3.destroy ).toHaveBeenCalledWith({
        remove: true
      });
    });

    it('results in an empty list', function () {
      expect( subject.isEmpty() ).toBe( true );
    });
  });

  describe('specific fields', function () {
    // @todo
  });

  describe('a design document', function () {
    // @todo
  });

});
