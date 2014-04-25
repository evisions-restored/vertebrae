module.exports = function(grunt) {

  var browsers    = grunt.option('browsers'),
      reporters   = grunt.option('r');

  // Reporters: spec,beep,html,dots,progress
  if (reporters) {
    reporters = reporters.split(',');
  }

  // Browsers: PhantomJS,Chrome,Firefox,IE
  if (browsers) {
    browsers = browsers.split(',');
  }


  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    karma: {
      options: {
        browsers: browsers || ['PhantomJS'],
        configFile: 'karma.conf.js',
        reporters: reporters || ['spec']
      },
      vertebrae: {
        singleRun: true
      },
      auto: {
        autoWatch: true,
        singleRun: false
      }
    },

    build: {
      all: {
        dest: 'dist/vertebrae.js',
        ignore: ['jquery', 'underscore', 'backbone']
      }
    },

    uglify: {
      all: {
        files: {
          "dist/vertebrae.min.js": [ "dist/vertebrae.js" ]
        },
        options: {
          preserveComments: false,
          sourceMap: "dist/vertebrae.min.map",
          sourceMappingURL: "vertebrae.min.map",
          report: "min",
          beautify: {
            ascii_only: true
          },
          banner: "/*! Vertebrae v<%= pkg.version %> */",
          compress: {
            hoist_funs: false,
            loops: false,
            unused: false
          }
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  // grunt.loadNpmTasks('grunt-karma');
  grunt.loadTasks('tasks');

  grunt.registerTask('test', ['karma:vertebrae']);
  grunt.registerTask('auto', ['karma:auto']);

  grunt.registerTask('default', ['auto']);

  grunt.registerTask('dist', ['build:*:*', 'uglify']);
};