YUI.add('model-sync-couchdb', function (Y) {

  /**
  Node module require imports.

  @uses cradle
  **/
  var cradle = require('cradle');

  /**
  An extension which provides a CouchDB sync implementation
  that can be mixed into a Model or ModelList subclass.

  @module app
  @submodule model-sync-couchdb
  **/

  /**
  @class ModelSync.CouchDB
  @extensionfor Model
  @extensionfor ModelList
  **/
  function CouchDBSync () {};

  /**
  The default query name prefix to use when querying the `all` view.

  @property ALL_VIEW_NAME
  @type {String}
  @static
  @protected
  **/
  CouchDBSync.ALL_VIEW_NAME = 'all';

  /**
  Flag to determine whether missing databases should be created.

  @property CREATE_MISSING_DB
  @type Bool
  @static
  @protected
  **/
  CouchDBSync.CREATE_MISSING_DB = true;

  /**
  Properties that shouldn't be turned into ad-hoc attributes
  when passed to a Model or ModelList constructor.

  @property _NON_ATTRS_CFG
  @type {Array}
  @static
  @protected
  **/
  CouchDBSync._NON_ATTRS_CFG = [
    "setup",
    "databaseName",
    "designDocuments"
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

    @property designDocuments
    @default null
    @type {Object|null}
    **/
    designDocuments: null,

    // ----- Lifecycle ----------------------------- //

    initializer: function (config) {
      Y.log('YEAH! COUCH IN DA HOUSE!', 'debug', this.constructor.NAME);

      // Extend the subclass instance
      // with `save` if a ModelList
      //
      if (this._isYUIModelList) {
        this.save = this._saveModelList;
      }

      cradle.setup( this.setup );
    },

    // ----- Public -------------------------------- //

    /**
    Communicates with a CouchDB database.

    @note
      Initial versions are limited to nodejs as
      they depend upon the npm module `cradle`.

    This method is called internally by load(), save(), and destroy().

    @method sync
    @param {String} action Sync action to perform. May be one of the following:

      * `create`: Store a newly-created model for the first time.
      * `read`  : Load an existing model.
      * `update`: Update an existing model.
      * `delete`: Delete an existing model.

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
        this._updateDocument(options, callback);

      } else if (action === 'delete') {
        if (this.get('revision')) {
          this._deleteRevision(options, callback);

        } else {
          this._deleteDocument(options, callback);
        }


      }

    },

    // ----- Protected ----------------------------- //

    /**
    Extend ModelList subclasses with a `save` method
    to facilitate saving of lists of documents.

    @method _saveModelList
    @param {Object} options
    @param {Function} callback
      @param {Object} response
    @protected
    **/
    _saveModelList: function (options, callback) {
      this.sync('create', options, function (err, response) {
        if (err) {
          Y.log('Error creating: ' + err, 'error', this.constructor.NAME);
          Y.log('response: '+JSON.stringify( response ), 'debug', this.constructor.NAME);

        } else {
          callback && callback( response );
        }
      });
    },

    /**
    Remove a single document from the database.

    @note
      Deleting without a revision forces cradle
      to attempt to use the latest cached revision.
      You should always try to use a revision-based
      delete whenever possible.

    @method _deleteDocument
    @param {Object} options
    @param {Function} callback
      @param {Object} response
    @protected
    **/
    _deleteDocument: function (options, callback) {
      this._db.remove(
        this.get('id'),
        function (err, response) {
          if (err) {
            Y.log('Error deleteing document: ' + err, 'error', this.constructor.NAME);

          } else {
            callback && callback( response );
          }
        }
      );
    },

    /**
    Remove a revision of a document from the database.

    @method _deleteRevision
    @param {Object} options
    @param {Function} callback
      @param {Object} response
    @protected
    **/
    _deleteRevision: function (options, callback) {
      this._db.remove(
        this.get('id'),
        this.get('revision'),
        function (err, response) {
          if (err) {
            Y.log('Error deleteing revision: ' + err, 'error', this.constructor.NAME);

          } else {
            callback && callback( response );
          }
        }
      );
    },

    /**
    Remove a list of documents from the database.

    @method _deleteList
    @param {Object} options
    @param {Function} callback
      @param {Object} response
    @protected
    **/
    _deleteList: function (options, callback) {
      // @todo extend ModelList subclasses with a `destructor`
    },

    /**
    Create a single new document.

    @method _createDocument
    @param {Object} options
    @param {Function} callback
      @param {Object} response
    @protected
    **/
    _createDocument: function (options, callback) {
      var doc = this.toJSON();

      this._db.save(
        doc,
        function (err, response) {
          if (err) {
            Y.log('Error saving document: ' + JSON.stringify( err ), 'error', this.constructor.NAME);

          } else {
            callback && callback( err, response );
          }
        }
      );
    },

    /**
    Fetch a single document.

    @method _fetchDocument
    @param {Object} options
    @param {Function} callback
      @param {Object} doc
    @protected
    **/
    _fetchDocument: function (options, callback) {
      // @todo handle options; revision, etc

      this._db.get(
        this.get('id'),
        function (err, doc) {
          if (err) {
            Y.log('Error querying ' + view + ': ' + err, 'error', this.constructor.NAME);

          } else {
            callback && callback( err, doc );
          }
        }
      );
    },

    /**
    Update a single document.

    @method _updateDocument
    @param {Object} options
    @param {Function} callback
      @param {Object} doc
    @protected
    **/
    _updateDocument: function (options, callback) {
      // @todo ensure we have an id and a revision
    },

    /**
    Query the `all` view for a list of documents.

    @method _queryAll
    @param {Object} options
    @param {Function} callback
      @param {Object} doc
    @protected
    **/
    _queryAll: function (options, callback) {
      this._queryView(
        CouchDBSync.ALL_VIEW_NAME,
        options,
        callback
      );
    },

    /**
    Query a specific view for a list of documents.

    @method _queryView
    @param {String} viewName
    @param {Object} options
    @param {Function} callback
      @param {Object} doc
    @protected
    **/
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

    /**
    Create a connection to the server.

    @method _connect
    @protected
    **/
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

    /**
    Verify the specified database exists.

    Optionally, create the specified database if it does not exist.

    @method _verifyDatabase
    @protected
    **/
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

    /**
    Create the database specified in the server connection.

    Optionally, create any specified design document.

    @method _createDatabase
    @protected
    **/
    _createDatabase: function () {
      if (CouchDBSync.CREATE_MISSING_DB) {
        this._db.create();
        this._createDesignDocuments();
      }
    },

    /**
    Creates one or more design documents if specified.

    @todo make ModelList `all` views some handy default.

    @method _createDesignDocuments
    @protected
    **/
    _createDesignDocuments: function () {
      var docs = this.designDocuments;

      if (docs) {
        for(docName in docs) {
          this._db.save(
            '_design/' + docName,
            docs[ docName ]
          );
        }
      }
    }

  };

  /**
  Expose to the namespace.
  **/
  Y.namespace('ModelSync').CouchDB = CouchDBSync;

},
'0.1.0',
{
  requires: [
    'model'
  ]
});