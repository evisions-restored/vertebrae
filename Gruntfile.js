var path = require("path");

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

    connect: {
      sample_server: {
        options: {
          port: 1234,
          hostname: '*',
          base: './',
          keepalive: true
        }
      }
    },

    handlebars: {
      sample_hbs_compile: {
        options: {
          amd: true,
          namespace: 'Templates',
          processName: function(filePath) {
            var ext = path.extname(filePath);
            return path.basename(filePath).slice(0, -ext.length);
          }
        },
        files: {
          'sample/app/templates.js': [
            'sample/**/*.hbs',
          ]
        }
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

  grunt.registerTask('sample', ['handlebars','connect:sample_server']);

  grunt.registerTask('dist', ['build:*:*', 'uglify']);
};