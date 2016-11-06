Note that these commands are related only to **SourceJS engine build and development** cycle.

For building specs and other project related content use own build tasks.

## Scripts

All automation tasks are triggered through NPM scripts listed in `package.json`.

Here's a list of most common commands:

```bash
$ npm run build
$ npm start

$ npm run watch
$ npm run watch:css

$ npm run lint

$ npm test
$ npm run test:unit
$ npm run test:func
```

* `npm run build` - default build command for preparing SourceJS assets, used as a post-install hook and after plugin installation
* `npm start` - runs the engine
* `npm run watch` - runs engine sources watcher, used in core client-side modules development
