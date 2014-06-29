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
