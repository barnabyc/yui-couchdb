# YUI ModelSync for CouchDB

### Y.ModelSync.CouchDB

Provides a sync layer for YUI Model and ModelList to a CouchDB database.

### Usage

Mix-in to a Model or ModelList as normal, remembering to include a `databaseName` property.

```javascript
var YUI = require('yui').YUI,

YUI.add('felineworld:kitten_list', function (Y) {

  var KittenList = Y.Base.create('kittenList',
    Y.ModelList,
    [Y.ModelSync.CouchDB],
  {

    databaseName: 'felines',

    model: Y.Kitten

  },
  {
    ATTRS: { }
  });

  // Expose API
  Y.namespace('FelineWorld').KittenList = KittenList;

},
'0.0.1',
{
  requires: [
    'model-list',
    'model-sync-couchdb'
  ]
});
```

Then simply call the standard sync methods (`save`, `load`, etc)  as you normally would.

### Specs

Run via `jasmine-node`:

    jasmine-node --verbose spec/unit/

### Caveats

Currently only supports nodejs environments as it depends on the Cradle npm module: https://npmjs.org/package/cradle

