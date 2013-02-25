require('yui').YUI({
  useSync: true,
  modules: {
    'model-sync-couchdb': require('module'),

    // todo use dynamic groups
    'specs:model-sync-couchdb:create': require('/Users/barnaby/Source/barnabyc/yui-couchdb/spec/unit/create.js')
    // 'specs:model-sync-couchdb:read'  : require('/spec/unit/read'),
    // 'specs:model-sync-couchdb:update': require('/spec/unit/update'),
    // 'specs:model-sync-couchdb:delete': require('/spec/unit/delete')
  }
}).use('specs:model-sync-couchdb:create', function (Y) {

  Y.log('kittens','debug',this.constructor.NAME);

});
