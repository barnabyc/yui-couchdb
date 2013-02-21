module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jasmine: {
      all: {
        src: [
          'spec/**/*.js'
        ],
        options: {
          specs: [
            'spec/**/*_spec.js'
          ],
          // template: 'spec/runner.tmpl',
          junit: {
            path: 'jasmine/reports',
            consolidate: true
          }
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jasmine');
};
