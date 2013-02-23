require('yui').YUI({
  modules: {
    'model-sync-couchdb': require('yui-couchdb'),

    // todo use dynamic groups
    'specs:model-sync-couchdb:create': require('./spec/unit/create'),
    'specs:model-sync-couchdb:read'  : require('./spec/unit/read'),
    'specs:model-sync-couchdb:update': require('./spec/unit/update'),
    'specs:model-sync-couchdb:delete': require('./spec/unit/delete')
  }
}).use('specs:model-sync-couchdb:create', function (Y) {

  // todo run specs here

});
