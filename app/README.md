Design Concept of angularAMD generator
=============

The main purpose of the generator are:

1. Define the directory structure of the app
   * root app directory: ./app
   * js directory: ./scripts
   * css directory: ./styles
   * view directory: ./views
   
2. Allow users to choose preset packages to include:
   * ui-router / angular-route
   * Restangular / angular-resource
   * Other AngularJS packages
   * ui-bootstrap
   * jquery
   * boostrap

3. Allow generator to function after customization

## Configuration Driven

In order to make the generator as flexible as possible, it should be driven by configuration.  More specifically

### Directory Structure: `dirs` **local**
Defines the directory structure of the app and need to be saved in the local config so that it will be followed
after initial generation.

### Module Dependencies: `modules`
Defines the available modules and it's content.  It's used as a lookup from `prompts`.

### Prompts: `prompts`
Define different prompts to be asked from user.




setting.json
=============

Configuration file that will drive the content of `bower.json`, `package.json` and `Gruntfile.js`.

## Entry Definition

An 

`bower` and `package` uses entry definition as:

Simple Definition:
```
<<package name>>: {
  "entry": <<version number>>
}
```

`entry` as an object, used when name in the repository does not reflect the package name:
```
<<package name>>: {
  "entry": { <<repo name>>: <<version number>> }
}
```

`entry` as an array for 
