console.log('create, 1');

var YUI = require('yui').YUI;

YUI.add('specs:model-sync-couchdb:create', function(Y) {

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

},
'0.1.0',
{
  requires: [
    'model',
    'model-sync-couchdb'
  ]
});




YUI({
  useSync:true,
  modules:{
    'model-sync-couchdb': {
      fullpath: require('path').join(__dirname, 'module.js'),
      requis: [
        'model'
      ],
      type: 'js'
    }
  }
}).use('specs:model-sync-couchdb:create', function (Y) {

  console.log('runner, 2');

  Y.log('kittens','debug',this.constructor.NAME);

});