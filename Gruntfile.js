module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    docs:{
      src:['lib/**/*.js','config/*/*.js','README.md'],
      destination:'docs'
    },
    watch:{
      jsdoc:{
        files:'<%= docs.src %>',
        tasks:['jsdoc'],
        options:{
          livereload:true
        }
      },
    },
    jsdoc : {
        dist : {
            src: '<%= docs.src %>',
            options: {
                destination: '<%= docs.destination %>'
            }
        }
    },
    connect:{
      server:{
        options: {
          port: 3225,
          base:'<%= docs.destination %>',
          open:true,
          livereload:true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.registerTask('docs',function(target) {
    grunt.task.run(['jsdoc','connect','watch:jsdoc']);
  });
  grunt.registerTask('serveDocs',function(target) {
    require('open')('http://localhost:3225/');
  })
  // Load the plugin that provides the "uglify" task.

};