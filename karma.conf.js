// Karma configuration
// Generated on Thu Sep 05 2013 15:08:10 GMT-0700 (Pacific Daylight Time)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '../',


    // frameworks to use
    frameworks: ['mocha', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
    ],


    // list of files to exclude
    exclude: [
      'libs/**/ut_*', // Old tests files
      'libs/researchsuite/main.js',

      'admin/app/main.js',
      'irb/app/main.js',
      'launcher/app/main.js',
    ],

    /* To run coverage tests, add reporter "coverage" 
       and uncomment the preprocessor and coverageReporter objects */

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['spec'],

    // Files used for coverage
    preprocessors: {
    },

    // Coverage output options
    coverageReporter: {
      type: 'html',
      dir: 'tests/coverage/',
      file: 'irbcoverage.html'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,


    // SauceLabs Configuration
    sauceLabs: {
      username: 'jzdev',
      accessKey: 'e9d35485-c4c4-4fe8-9ab1-26ae5112a507',
      startConnect: false,
      testName: 'Front-End Unit Tests'
    },

    customLaunchers: {
      sl_chrome_linux: {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'Windows 7'
      }
    }

  });
};
