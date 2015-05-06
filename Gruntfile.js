module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jsdoc : {
        dist : {
            src: ['lib/*.js', 'config/*.js'],
            options: {
                destination: 'docs'
            }
        }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-jsdoc');

};