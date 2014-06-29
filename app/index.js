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

    // Build bower entry
    var bower = {};
    this._.forEach(this.aamd.extdeps.bower, function (value, key) {
      var entry = value.entry;
      if (self._.isObject(entry)) {
        self._.assign(bower, entry);
      } else {
        bower[key] = value.entry;
      }
    });
    this.aamd.bower = bower;

    // Build package entry
    var pkg = {};
    this._.forEach(this.aamd.extdeps.package, function (value, key) {
      var entry = value.entry;
      if (self._.isObject(entry)) {
        self._.assign(pkg, entry);
      } else {
        pkg[key] = value.entry;
      }
    });
    this.aamd.package = pkg;

    // When done
    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
  },

  askFor: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay('Welcome to angularAMD generator!'));

    var prompts = [{
      type: 'confirm',
      name: 'someOption',
      message: 'Would you like to enable this option?',
      default: true
    }];

    this.prompt(prompts, function (props) {
      this.someOption = props.someOption;

      done();
    }.bind(this));
  },

  sayIt: function () {
    this.log(yosay(this.aamd.sayIt));
  },

  app: function () {
    this.mkdir('app');
    this.mkdir('app/templates');

    this.template('_package.json', 'package.json');
    this.template('_bower.json', 'bower.json');
    this.copy('_Gruntfile.js', 'Gruntfile.js');
    this.copy('_Gruntconfig.json', 'Gruntconfig.json');
  },

  projectfiles: function () {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
  }
});



module.exports = AAmdGenerator;
