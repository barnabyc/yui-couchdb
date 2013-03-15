YUI.add('model-sync-couchdb', function (Y) {

  /**
  An extension which provides a CouchDB sync implementation
  that can be mixed into a Model or ModelList subclass.

  @module app
  @submodule model-sync-couchdb
  **/

  var cradle = require('cradle');

  /**
  @class ModelSync.CouchDB
  @extensionfor Model
  @extensionfor ModelList
  **/
  function CouchDBSync () {};

  CouchDBSync.ALL_VIEW_NAME = 'all';
  CouchDBSync.CREATE_MISSING_DB = true;

  /**
  Properties that shouldn't be turned into ad-hoc attributes when passed to a
  Model or ModelList constructor.

  @property _NON_ATTRS_CFG
  @type Array
  @static
  @protected
  **/
  CouchDBSync._NON_ATTRS_CFG = [
    "setup",
    "databaseName",
    "designDocument"
  ];

  CouchDBSync.prototype = {

    /**
    Connection details for the database.
    Defaults to server running locally.

    @property setup
    @type {Object}
    **/
    setup: {
      host:  '127.0.0.1',
      port:  5984,
      cache: true,
      raw:   false
    },

    /**
    The name of the database to use for this Model or ModelList.

    @property databaseName
    @type {String}
    **/
    databaseName: '',

    /**
    Specifies a design document for creation.

    @property designDocument
    @default null
    @type {Object|null}
    **/
    designDocument: null,

    // ----- Lifecycle ----------------------------- //

    initializer: function (config) {
      Y.log('YEAH! COUCH IN DA HOUSE!', 'debug', this.constructor.NAME);

      // @todo decide if we really want to support this
      if (this._isYUIModelList) {
        this.save = this._saveModelList;
      }

      cradle.setup( this.setup );
    },

    // ----- Public -------------------------------- //

    /**
    Communicates with a CouchDB server by using the npm module `cradle`
    methods. This method is called internally by load(), save(), and destroy().

    @method sync
    @param {String} action Sync action to perform. May be one of the following:

      * `create`: Store a newly-created model for the first time.
      * `delete`: Delete an existing model.
      * `read`  : Load an existing model.
      * `update`: Update an existing model.

    @param {Object} [options] Sync options:
      @param ...
      @param ...
    @param {Function} [callback] Called when the sync operation finishes.
      @param {Error|null} callback.err If an error occurred, this parameter will
        contain the error. If the sync operation succeeded, _err_ will be
        falsy.
      @param {Any} [callback.response] The server's response.
    **/
    sync: function (action, options, callback) {
      // @todo handle failure gracefully
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
        // @todo implement updating documents

      } else if (action === 'delete') {
        this._deleteDocument(options, callback);

      }

    },

    // ----- Protected ----------------------------- //

    _saveModelList: function (options, callback) {
      this.sync('create', options, function (err, res) {
        if (err) {
          Y.log('Error creating: ' + err, 'error', this.constructor.NAME);
          Y.log('res: '+JSON.stringify( res), 'debug', this.constructor.NAME);

        } else {
          callback && callback( res );
        }
      });
    },

    _deleteDocument: function (options, callback) {
      // @todo conditionally use revision

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

    _deleteList: function (options, callback) {
      // @todo implement _deleteList
      // @todo confirm whether we need to augment ModelList
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
      // @todo handle options; revision, etc

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
          Y.log('Error verifying database exists: ' + err, 'error', this.constructor.NAME);

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