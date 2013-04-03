require('yui').getInstance().applyConfig({
  // filter: 'debug',
  modules: {
    'model-sync-couchdb': require('../../index')
  }
});

var Y = require('yui').use('model-sync-couchdb', 'model');

describe('a single document', function () {

  var subject,
      callback,
      createdId,
      createdRev,
      Kitten = Y.Base.create('kitten',
        Y.Model,
        [Y.ModelSync.CouchDB],
      {

        databaseName: 'felines'

      });

  describe('can be created', function () {
    beforeEach(function () {
      subject = new Kitten({
        name  : 'Whiskers',
        gender: 'male',
        age   : 4
      });

      spyOn( subject, '_createDocument' ).andCallThrough();
      spyOn( subject, 'parse' ).andCallThrough();

      callback = jasmine.createSpy();

      runs(function () {
        subject.save( callback );
      });

      waits(100);
    });

    it('calls `_createDocument`', function () {
      runs(function () {
        expect( subject._createDocument ).toHaveBeenCalled();
      });
    });

    it('parses the response', function () {
      runs(function () {
        expect( subject.parse ).toHaveBeenCalledWith({
          ok  : true,
          id  : subject.get('id'),
          rev : subject.get('rev')
        });
      });
    });

    it('now has an id', function () {
      runs(function () {
        expect( subject.get('id') ).not.toBe( undefined );

        createdId = subject.get('id');
      });
    });

    it('now has a revision', function () {
      runs(function () {
        expect( subject.get('rev') ).not.toBe( undefined );

        createdRev = subject.get('rev');
      });
    });

    it('calls the save callback without error', function () {
      runs(function () {
        expect( callback ).toHaveBeenCalledWith(
          null,
          {
            ok  : true,
            id  : subject.get('id'),
            rev : subject.get('rev')
          }
        );
      });
    });
  });

  describe('can be read', function () {
    beforeEach(function () {
      subject = new Kitten({
        id: createdId
      });

      spyOn( subject, '_fetchDocument' ).andCallThrough();

      callback = jasmine.createSpy();

      runs(function () {
        subject.load( callback );
      });

      waits(100);
    });

    it('calls `_fetchDocument`', function () {
      runs(function () {
        expect( subject._fetchDocument ).toHaveBeenCalled();
      });
    });

    it('loads a single document', function () {
      runs(function () {
        expect( callback ).toHaveBeenCalledWith(
        null,
        {
          _id    : createdId,
          _rev   : createdRev,
          name   : 'Whiskers',
          gender : 'male',
          age    : 4
        });
      });
    });
  });

  xdescribe('can be updated', function () {
    // @todo
  });

  xdescribe('can be deleted', function () {
    // @todo
  });

});
