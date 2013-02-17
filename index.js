var path = require('path');

//setup our custom modules meta-data
var meta = {
    'model-sync-couchdb': {
        requires: [ 'model' ],

        //Give it a full path on the file system
        fullpath: path.join(__dirname, 'module.js')
    }
};

module.exports = {
    metadata: function() {
        return meta;
    }
};
