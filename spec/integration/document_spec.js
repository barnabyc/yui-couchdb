var uuid = require('node-uuid');

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
      databaseName = 'felines_'+uuid.v4(),
      Kitten = Y.Base.create('kitten',
        Y.Model,
        [Y.ModelSync.CouchDB],
      {

        databaseName: databaseName

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

    it('calls the save callback', function () {
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

    it('now has the loaded values', function () {
      runs(function () {
        expect( subject.toJSON() ).toEqual({
          id     : createdId,
          _id    : createdId,
          _rev   : createdRev,
          name   : 'Whiskers',
          gender : 'male',
          age    : 4
        });
      });
    });

    it('calls the load callback', function () {
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

  describe('can be updated', function () {
    it('updates successfully', function () {
      expect( true ).toBe( false );
    });
  });

  describe('can be deleted', function () {
    describe('from the client', function () {
      beforeEach(function () {
        var callbackFired = false,
            callback = function () {
              debugger;
              callbackFired = true;
            };

        subject = new Kitten({
          id: createdId
        });

        runs(function () {
          subject.load();
        });

        waits(100);

        runs(function () {
          subject.destroy(
          {
            remove: true
          },
          callback);
        });

        waitsFor(function () {
          return callbackFired;
        }, 'Destroy callback never fired', 5000);
      });

      it('is now destroyed on the client', function () {
        runs(function () {
          expect( subject.get('destroyed') ).toBe( true );
        });
      });
    });

    describe('from the database', function () {
      beforeEach(function () {
        subject = new Kitten({
          id: createdId
        });

        spyOn( subject, '_syncResponseHandler' );

        runs(function () {
          subject.load();
        });

        waits(100);
      });

      it('does not exist in the database', function () {
        runs(function () {
          expect( subject._syncResponseHandler ).toHaveBeenCalledWith(
            jasmine.any(Function),
            {
              error : 'not_found',
              reason: 'deleted'
            },
            undefined
          );
        });
      });
    });

  });

});
