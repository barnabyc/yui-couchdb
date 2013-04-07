# YUI ModelSync for CouchDB

### Y.ModelSync.CouchDB

Provides a sync layer for YUI Model and ModelList to a CouchDB database.

### Caveats

Currently only supports nodejs environments as it depends on the Cradle npm module: https://npmjs.org/package/cradle

### Usage

Mix-in to a Model or ModelList as normal, remembering to include a `databaseName` property.

#### Model
```javascript
var YUI = require('yui').getInstance().applyConfig({
  modules: {
    'model-sync-couchdb': require('yui-couchdb')
  }
});

YUI.add('felines:kitten', function (Y) {

  var Kitten = Y.Base.create('kitten',
    Y.ModelList,
    [Y.ModelSync.CouchDB],
  {

    // The CouchDB database storing these documents
    databaseName: 'felines',

  },
  {
    ATTRS: { }
  });

  // Expose API
  Y.namespace('Felines').Kitten = Kitten;

},
'0.0.1',
{
  requires: [
    'model',
    'model-sync-couchdb'
  ]
});
```

#### ModelList
```javascript
var YUI = require('yui').getInstance().applyConfig({
  modules: {
    'model-sync-couchdb': require('yui-couchdb')
  }
});

YUI.add('canines:puppy_list', function (Y) {

  var PuppyList = Y.Base.create('kittenList',
    Y.ModelList,
    [Y.ModelSync.CouchDB],
  {

    model: Y.Canines.Puppy

    // The CouchDB database storing these documents
    databaseName: 'canines',

    // An `all` design document view to allow querying for a list
    designDocument: {
      breeds: {
        all: {
          map: function (doc) {
            if (doc.breed) emit(doc.breed, doc);
          }
        }
      }
    }

  },
  {
    ATTRS: { }
  });

  // Expose API
  Y.namespace('Canines').PuppyList = PuppyList;

},
'0.0.1',
{
  requires: [
    'model-list',
    'model-sync-couchdb'
  ]
});
```

Then simply call sync methods (`save`, `load`, etc)  as you normally would.

## Tests

Run via `jasmine-node`:

### Units

    jasmine-node --verbose spec/unit/

### Integrations

Requires CouchDB server running locally

    jasmine-node --verbose spec/integration/


