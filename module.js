console.log('module, 1');

YUI.add('model-sync-couchdb', function (Y) {

  console.log('module, 2');

  var cradle = require('cradle');

  console.log('module, 3');

  function CouchDBSync () {};

  CouchDBSync.ALL_VIEW_NAME = 'all';
  CouchDBSync.CREATE_MISSING_DB = true;
  CouchDBSync._NON_ATTRS_CFG = [
    "setup", // Cradle Setup
    "databaseName", "designDocument",
    "_db", "_conn"
  ];

  CouchDBSync.prototype = {

    setup: {
      host:  '127.0.0.1',
      port:  5984,
      cache: true,
      raw:   false
    },

    databaseName: '',

    designDocument: null,

    _db: null,
    _conn: null,

    initializer: function (config) {
      Y.log('YEAH! COUCH IN DA HOUSE!', 'debug', this.constructor.NAME);

      cradle.setup( this.setup );
    },

    // todo; decide if we really want to support this
    // ONLY FOR ModelList
    save: function (options, callback) {
      // todo properly
      this.sync('create', options, function (err, res) {
        if (err) {
          Y.log('Error creating: ' + err, 'error', this.constructor.NAME);
          Y.log('res: '+JSON.stringify( res), 'debug', this.constructor.NAME);

        } else {
          callback && callback( res );
        }
      });
    },

    sync: function (action, options, callback) {
      // todo handle failure
      this._connect();

      if (action === 'create') {
        this._createDocument(options, callback);

      } else if (action === 'read') {
        if (this._isYUIModelList) {
          this._queryAll(options, callback);

        } else {
          this._fetchDocument(options, callback);
        }

      } else if (action === 'update') {
        // todo

      } else if (action === 'delete') {
        this._deleteDocument(options, callback);

      }

    },

    // ----- Protected ----------------------------- //

    _deleteDocument: function (options, callback) {
      // todo check for id
      // todo check for revision

      this._db.remove(
        this.get('id'),
        this.get('revision'),
        function (err, res) {
          if (err) {
            Y.log('Error deleteing document: ' + err, 'error', this.constructor.NAME);

          } else {
            callback && callback( res );
          }
        }
      );
    },

    _createDocument: function (options, callback) {
      var doc = this.toJSON();

      this._db.save(
        doc,
        function (err, res) {
          if (err) {
            Y.log('Error saving document: ' + err, 'error', this.constructor.NAME);

          } else {
            callback && callback( err, res );
          }
        }
      );
    },

    _fetchDocument: function (options, callback) {
      // todo handle options; revision, etc

      this._db.get(
        this.get('id'),
        function (err, doc) {
          if (err) {
            Y.log('Error querying ' + view + ': ' + err, 'error', this.constructor.NAME);

          } else {
            callback && callback( doc );
          }
        }
      );
    },

    _queryAll: function (options, callback) {
      this._queryView(
        CouchDBSync.ALL_VIEW_NAME,
        options,
        callback
      );
    },

    _queryView: function(viewName, options, callback) {
      var view = this.constructor.NAME + '/' + viewName;

      this._db.view(
        viewName,
        function (err, documents) {
          if (err) {
            Y.log('Error querying ' + view + ': ' + err, 'error', this.constructor.NAME);

          } else {
            callback && callback( documents );
          }
        }
      );
    },

    _connect: function () {
      if (!this.databaseName) {
        Y.log('No database name specified!', 'error', this.constructor.NAME);

        return false;
      }

      this._conn = this._conn || new(cradle.Connection);
      this._db   = this._db   || this._conn.database(
                     this.databaseName
                   );

      this._verifyDatabase();
    },

    _verifyDatabase: function () {
      this._db.exists(Y.bind(function (err, exists) {
        if (err) {
          Y.log('Error verifying existence: ' + err, 'error', this.constructor.NAME);

        } else if (!exists) {
          Y.log('Database does not exist: ' + this.databaseName, 'info', this.constructor.NAME);

          this._createDatabase();
        }
      }, this));
    },

    _createDatabase: function () {
      if (CouchDBSync.CREATE_MISSING_DB) {
        this._db.create();
        this._createDesignDocument();
      }
    },

    _createDesignDocument: function () {
      if (this.designDocument) {
        db.save(
          '_design/' + this.constructor.NAME,
          this.designDocument
        );
      }
    }

  };

  Y.namespace('ModelSync').CouchDB = CouchDBSync;

},
'0.1.0',
{
  requires: [
    'model'
  ]
});