Here you will find migration instructions from different Source versions

## From 0.5.x to 0.6.x

* It's not recommended to install and use SourceJS as a npm dependency, installation via cloning is deprecated and will be removed in the next version.

## From 0.4.0-beta to 0.4.0-rc

* Update engine files, run `npm run build` in the root of engine
* If you have custom `user/core/views`, then add `info.*` namespace to all data in template that is taken from `info.json` (`info.author`, `info.title`, `info.keywords`)
* Set at your views and `*.html` spec files new path to main client-side file: `/source/assets/js/enter-the-source.js`
