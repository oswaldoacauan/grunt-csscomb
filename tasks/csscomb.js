/*
 * grunt-csscomb
 * https://github.com/csscomb/grunt-csscomb
 *
 * Copyright (c) 2013 Koji Ishimoto, contributors
 * Licensed under the MIT license.
 */
'use strict';
module.exports = function (grunt) {

  grunt.registerMultiTask('csscomb', 'Sorting CSS properties in specific order.', function () {

    var Comb = require('csscomb'),
      defaultConfig = require('../node_modules/csscomb/.csscomb.json');

    // Check if .csscomb.json exist in the project root
    var rootFile = '.csscomb.json';
    if(grunt.file.exists(rootFile)) {
      grunt.log.ok('Using "' + rootFile + '"" as default config file...');
      var rootConfig = grunt.file.readJSON(rootFile);
    }

    // Get config file from task's options and merge with default
    var config = grunt.task.current.options(rootConfig || defaultConfig);

    // Add backward compatibility
    if (typeof config.sortOrder === 'string' &&
        grunt.file.exists(config.sortOrder)) {
      grunt.log.ok('Using custom sortOrder config file "' + config.sortOrder + '"...');
      var sortOrder = grunt.file.readJSON(config.sortOrder)["sort-order"];
      config["sort-order"] = sortOrder;
      delete config.sortOrder;
    }

    this.files.forEach(function (f) {

      // Create a new instance of csscomb and configure it:
      var comb = new Comb();
      comb.configure(config);

      f.src.filter(function (filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).forEach(function (src) {

        // Get CSS from a source file:
        var css = grunt.file.read(src);

        // Comb it:
        grunt.log.ok('Sorting file "' + src + '"...');
        var syntax = src.split('.').pop();
        var combed = comb.processString(css, syntax);
        grunt.file.write(f.dest, combed);
      });
    });
  });
};