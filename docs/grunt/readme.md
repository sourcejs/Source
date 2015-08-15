## Intro

[Grunt](http://gruntjs.com/) tasks are used to build dev and production assets for Source.

```js
$ grunt
$ grunt update

$ grunt build

$ grunt watch-css
$ grunt watch-all

$ grunt test
```

* `grunt update` - same as `grunt` (default), runs dev build
* `grunt build` - runs production build with all assets minification
* `grunt watch-css`, `grunt watch-all` - watch helper tasks for Source development
* `grunt test` - runs all mocha tests

## Custom tasks

You can use as many custom tasks as you want in private folder `source/user`.

For Source and Specs deployment we recommend using Version Control Systems (like git), with auto-pull.