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

    // Add default packages to load.  True value means it should be copied to appjs/ext directory
    this.aamd.bowerPackages = [
      'angular',
      'angular-route',
      'angularAMD',
      'requirejs',
      'es5-shim',
      'json3'
    ];

    // When done
    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
  }
});


/**
 * Prompt user for modules to include
 */
AAmdGenerator.prototype.askForModules = function () {
  var self = this, cb = this.async();

  this.prompt([this.aamd.prompts.module], function (props) {
    // Add the result to bowerPackages
    this._.each(props.modules, function (value, index) {
      self.aamd.bowerPackages.push(value);
    });

    cb();
  }.bind(this));

};

AAmdGenerator.prototype.configureExtDeps = function () {
  var self = this;

  // Build bower entry
  var bowerDeps = this.aamd.extdeps.bower,
      bower = {}, bowerFiles = [], mainJsFiles = [];

  this._.forEach(this.aamd.bowerPackages, function (key, index) {
    var entry = bowerDeps[key].entry;
    if (self._.isObject(entry)) {
      self._.assign(bower, entry);
    } else {
      bower[key] = entry;
    }

    var file = bowerDeps[key].file;
    if (self._.isArray(file)) {
      self._.each(file, function (value, index) {
        bowerFiles.push(value);
        mainJsFiles.push(path.basename(value, '.js'));
      });
    } else {
      bowerFiles.push(file);
      mainJsFiles.push(path.basename(file, '.js'));
    }
  });

  this.aamd.bower = bower;
  this.aamd.bowerFiles = bowerFiles;
  this.aamd.mainJsFiles = mainJsFiles;

  // Build package entry
  var pkg = {};
  this._.assign(pkg, this.aamd.extdeps.package);
  this.aamd.package = pkg;
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

  this.config.save();
};



module.exports = AAmdGenerator;
