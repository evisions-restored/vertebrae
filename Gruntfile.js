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
    }
  });

  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('test', ['karma:vertebrae']);
  grunt.registerTask('auto', ['karma:auto']);

  grunt.registerTask('default', ['auto']);
};