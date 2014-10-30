# Migration instructions

Here you will find migration instructions from different Source versions

## From 0.4.0-beta to 0.4.0-rc

* Update engine files, run `npm i` and `grunt` at root of engine
* If you have custom `user/core/views`, then add `info.*` name space to all data that is taken from `info.json` (`info.author`, `info.title`, `info.keywords`)
* Set at your views and `*.html` spec files new path to main client-side file: `/source/assets/js/enter-the-source.js`