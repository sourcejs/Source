# Migration instructions

Here you will find migration instructions from different Source versions

## From 0.4.0 to 0.4.1

* We removed Section Folding feature, if you called it from somewhere, please remove all usages
** Now sections does not have class `source_section__open`
* `sections.js` API changes:
** `subHeaderElements` is now jQuery nodelist, instaed of array
* Support of legacy code highlight with `brush : css` is now removed

## From 0.4.0-beta to 0.4.0-rc

* Update engine files, run `npm i` and `grunt` at root of engine
* If you have custom `user/core/views`, then add `info.*` namespace to all data in template that is taken from `info.json` (`info.author`, `info.title`, `info.keywords`)
* Set at your views and `*.html` spec files new path to main client-side file: `/source/assets/js/enter-the-source.js`