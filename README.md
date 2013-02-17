# YUI ModelSync for CouchDB

`Y.ModelSync.CouchDB`

Provides a syncing layer for YUI Model and ModelList to a CouchDB storage system.


# =usage
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

