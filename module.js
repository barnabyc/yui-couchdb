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
    "listAllViewPath",
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
    The path within a design to a view to be used for ModelList
    `all` queries.

    @property listAllViewPath
    @default null
    @type {String|null}
    @example 'breeds/all'
    **/
    listAllViewPath: null,

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

      // Extend ModelList subclass instances
      // with `save` and `_parse`.
      //
      if (this._isYUIModelList) {
        this.save   = this._saveModelList;
        this._parse = this._parseModelList;
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

    @param {Object} [options] sync options
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
    Extend ModelList subclasses with a `_parse` method
    to handle `all` view list responses.

    @method _parseModelList
    @param {Object} response
    @protected
    **/
    _parseModelList: function (response) {
      var massaged;

      if (typeof response.toArray === 'function') {
        massaged = response.toArray();
      }

      return this.parse(massaged);
    },

    /**
    Remove a single document from the database.

    @note
      Deleting without a revision forces cradle
      to attempt to use the latest cached revision.
      You should always try to use a revision-based
      delete whenever possible.

    @method _deleteDocument
    @param {Object} [options]
    @param {Function} [callback]
      @param {Object|null} callback.err
      @param {Object} callback.response
    @protected
    **/
    _deleteDocument: function (options, callback) {
      this._db.remove(
        this.get('id'),
        function (err, response) {
          if (err) {
            Y.log('Error deleteing document: ' + JSON.stringify( err ), 'error', this.constructor.NAME);

          } else {
            callback && callback( err, response );
          }
        }
      );
    },

    /**
    Remove a revision of a document from the database.

    @method _deleteRevision
    @param {Object} [options]
    @param {Function} [callback]
      @param {Object|null} callback.err
      @param {Object} callback.response
    @protected
    **/
    _deleteRevision: function (options, callback) {
      // @todo ensure we have a revision
      this._db.remove(
        this.get('id'),
        this.get('revision'),
        function (err, response) {
          if (err) {
            Y.log('Error deleteing revision: ' + err, 'error', this.constructor.NAME);

          } else {
            callback && callback( err, response );
          }
        }
      );
    },

    /**
    Remove a list of documents from the database.

    @method _deleteList
    @param {Object} [options]
    @param {Function} [callback]
      @param {Object|null} callback.err
      @param {Object} callback.response
    @protected
    **/
    _deleteList: function (options, callback) {
      // @todo extend ModelList subclasses with a `destructor`
    },

    /**
    Create a single new document.

    @method _createDocument
    @param {Object} [options]
    @param {Function} [callback]
      @param {Object|null} callback.err
      @param {Object} callback.doc
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
      @param {Object|null} callback.err
      @param {Object} callback.doc
    @protected
    **/
    _fetchDocument: function (options, callback) {
      // @todo handle options; revision, etc

      this._db.get(
        this.get('id'),
        Y.bind(
          this._syncResponseHandler,
          this,
          callback
        )
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
      var doc = this.toJSON();

      // @todo change this to a serialize call or something similar
      delete doc.id;
      delete doc.revision;

      // @todo use db.merge instead for dirty attrs
      this._db.save(
        this.get('id'),
        this.get('revision'),
        doc,
        function (err, response) {
          if (err) {
            Y.log('Error updating document: ' + JSON.stringify( err ), 'error', this.constructor.NAME);

          } else {
            callback && callback( err, response );
          }
        }
      );
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
      // @todo validate listAllViewPath first
      this._db.view(
        this.listAllViewPath,
        function (err, documents) {
          if (err) {
            Y.log('Error querying ' + view + ': ' + JSON.stringify( err ), 'error', this.constructor.NAME);

          } else {
            callback && callback( err, documents );
          }
        }
      );
    },

    /**
    Query a specific view for a list of documents.

    @method _queryView
    @param {Object} [options] Query options
      @param {String} [options.path] The direct path to the view in question
      @param {String} [options.design] The design which holds the view
      @param {String} [options.view] The view name
    @param {Function} callback
      @param {Object|null} callback.err An error object
      @param {Array[Object]} callback.documents Response of the query
    @protected
    **/
    _queryView: function(options, callback) {
      var viewPath;

      if (options) {
        if (options.path) {
          viewPath = options.path;
        }
        else if (options.design && options.view) {
          viewPath = options.design + '/' + options.view;
        }
      }

      // @todo throw error more gracefully
      if (!viewPath) return;

      this._db.view(
        viewPath,
        function (err, documents) {
          if (err) {
            Y.log('Error querying ' + view + ': ' + JSON.stringify( err ), 'error', this.constructor.NAME);

          } else {
            callback && callback( err, documents );
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
    },

    /**
    Generic response handler.

    @method _syncResponseHandler
    @param {Function} callback
    @param {Object|null} error
      Any error details that may have occurred during the sync operation.
    @param {Object|null} response
      A single document or an array of documents successfully retreived.
    @protected
    **/
    _syncResponseHandler: function (callback, error, response) {
      if (error) {
        Y.log('Error fetching ' + JSON.stringify( this ) + ': ' + JSON.stringify( error ), 'error', this.constructor.NAME);

      } else {
        callback && callback( error, response );
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