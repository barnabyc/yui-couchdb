console.log('runner, 1');

require('yui').YUI({
  useSync: true,
  modules: {
    'model-sync-couchdb': {
      fullpath: require('path').join(__dirname, 'module.js'),
      requis: [
        'model'
      ],
      type: 'js'
    },

    // todo use dynamic groups
    'specs:model-sync-couchdb:create': {
      fullpath: require('path').join(__dirname, 'spec/unit/create.js'),
      requis: [
        'model', 'model-sync-couchdb'
      ],
      type: 'js'
    }
    // 'specs:model-sync-couchdb:read'  : require('/spec/unit/read'),
    // 'specs:model-sync-couchdb:update': require('/spec/unit/update'),
    // 'specs:model-sync-couchdb:delete': require('/spec/unit/delete')
  }
}).use('specs:model-sync-couchdb:create', function (Y) {

  console.log('runner, 2');

  Y.log('kittens','debug',this.constructor.NAME);

});

console.log('runner, 3');