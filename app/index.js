'use strict';
var fs = require('fs');
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');

var AAmdGenerator = yeoman.generators.Base.extend({
  init: function () {
    // Build the settings and store in aamd object
    var self = this;
    var aamd = (function () {
      var settingText = fs.readFileSync(__dirname + '/setting.json');
      var settingJson = JSON.parse(settingText);
      var resultJson = JSON.parse(self._.template(settingText, settingJson));
      var appname = self.appname || path.basename(process.cwd());
      resultJson.appname = self._.camelize(self._.slugify(self._.humanize(appname)));
      return resultJson;
    })();
    this.aamd = aamd;


    // Read local config
    var localConfig = this.config.getAll();

    if (this._.isEmpty(localConfig)) {
      this.config.set(aamd.configVars);
    }

    // When done
    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
      this.config.save();
    });
  }
});

AAmdGenerator.prototype.welcome = function () {
  this.log(yosay('Welcome to angularAMD generator.'));
};

/**
 * Prompt user for modules to include
 */
AAmdGenerator.prototype.askForModules = function () {
  var self = this;
  var done = this.async();

  // Add default modules to load
  var answerModules = [
    'angular',
    'angular-route',
    'angularAMD',
    'requirejs',
    // 'es5-shim',
    'json3'
  ];

  this.prompt([this.aamd.askFor.modules], function (props) {
    // Add the result to answerModules
    Array.prototype.push.apply(answerModules, props.modules);
    self.aamd.answerModules = answerModules;
    done();
  });

};


/**
 * Configure dependencies based on result from askFor* tasks:
 *
 * deps.bower:
 *   List of modules to be set in bower.json's `dependencies` entry
 *
 * deps.bowerFiles:
 *   List of files to be copied from bower_componets by grunt setup task
 *
 * deps.mainJs:
 *   List of dependencies to be set in the main.js
 *
 * deps.appDefine:
 *   List of dependencies to be loaded at app.js' define statement
 *
 * deps.appModule:
 *   List of ng-modules to be included in ngApp's dependencies
 *
 * deps.htmlJsFiles:
 *   JS Files to be used only in the index.html
 *
 * deps.cssFile:
 *   List of css files to be minified and concat into main.css
 *
 * deps.cssFont:
 *   List of css font files
 *
 * dpes.npm:
 *   List of dependencies to be set in the packages.json
 */
AAmdGenerator.prototype.configureDependencies = function () {
  var self = this;
  var setting = this.aamd.extdeps.bower;
  var deps = {
    bower: {},
    bowerFiles: [],
    mainJs: {},
    mainJsShim: {},
    appDefine: ['angularAMD'],
    appModule: [],
    htmlJsFiles: [],
    cssFiles: [],
    cssFont: [],
    npm: this.aamd.extdeps.npm
  };

  function addJsFile(jsfile, data, moduleKey) {
    // RequireJS uses the file without js extension
    var basename = path.basename(jsfile, '.js');
    deps.bowerFiles.push(jsfile);

    // Define main.js:paths, excluding requirejs and those js file that should be loaded in index.html
    if (moduleKey !== 'requirejs' && !data.htmlOnly) {
      deps.mainJs[basename] = 'ext/' + basename;
    }

    // Create shim
    if (moduleKey === 'jquery') {
      // jquery should load before angular
      deps.mainJsShim.angular = 'jquery';
    } else if (data.shim) {
      deps.mainJsShim[basename] = data.shim;
    }

    // Create app dependency, skipping the angularAMD and requirejs
    if (self._.indexOf(['angular', 'angularAMD', 'jquery', 'requirejs'], moduleKey) === -1) {
      if (data.htmlOnly) {
        deps.htmlJsFiles.push(jsfile);
      } else {
        deps.appDefine.push(basename);
      }

      if (data.ngName) {
        deps.appModule.push(data.ngName);
      }
    }

  }

  // Build bower entry
  this._.each(this.aamd.answerModules, function (moduleKey) {
    // Build deps.bower
    var entry = setting[moduleKey],
        version = entry.version;

    // If version is an object, assume it's an entry for bower
    if (self._.isObject(version)) {
      self._.assign(deps.bower, version);
    } else {
      // Assuming a version string
      deps.bower[moduleKey] = version;
    }

    // Build deps.bowerFiles and
    self._.each(entry.jsfiles, function (data, jsfile) {
      addJsFile(jsfile, data, moduleKey);
    });
  });

  this.deps = deps;
};

AAmdGenerator.prototype.setupApps = function () {
  var configVars = this.aamd.configVars;

  this.mkdir(configVars.app);
  this.mkdir(configVars.app + '/views');
  this.mkdir(configVars.app + '/images');

  this.template('package.json.ejs', 'package.json');
  this.template('bower.json.ejs', 'bower.json');
  this.template('Gruntconfig.json.ejs', 'Gruntconfig.json');
  this.template('gitignore.ejs', '.gitignore');

  this.copy('_Gruntfile.js', 'Gruntfile.js');
  this.copy('editorconfig', '.editorconfig');
  this.copy('jshintrc', '.jshintrc');

  this.template('app/index.html.ejs', configVars.app + '/index.html');
  this.copy('app/css/main.css', configVars.app + '/' + configVars.appcss + '/main.css');

  this.copy('app/views/home.html', configVars.app + '/' + '/views/home.html');
  this.template('app/js/app.js.ejs', configVars.app + '/' + configVars.appjs + '/app.js');
  this.template('app/js/main.js.ejs', configVars.app + '/' + configVars.appjs + '/main.js');
  this.copy('app/js/controller/home_ctrl.js', configVars.app + '/' + configVars.appjs + '/controller/home_ctrl.js');
};



module.exports = AAmdGenerator;
