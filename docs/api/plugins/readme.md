SourceJS core contains only default APIs for most common use cases, all specific features we move to plugins, that could contain back-end and client-side improvements.

## Starting Templates

To easily bootstrap new SourceJS items, we extended our official [SourceJS Generator](https://github.com/sourcejs/generator-sourcejs) with default templates for all types of engine components:

```html
$ yo sourcejs:plugin
$ yo sourcejs:middleware
```

Besides generators, we also have abstract plugin demos, which will be always updated to current engine APIs:

* [sourcejs-tpl-plugin](https://github.com/sourcejs/sourcejs-tpl-plugin)
* [sourcejs-tpl-middleware](https://github.com/sourcejs/sourcejs-tpl-middleware)

We are continuously improving mentioned demos, adding new best practices and API usage examples.

## SourceJS Plugins and Middleware Structure

The recommended way of structuring SourceJS plugins is to define them as [NPM packages](https://docs.npmjs.com/misc/developers). All public plugins must be named by corresponding prefix `sourcejs-*`, so they could be easily searchable through global repository.

All plugins must be installed in `/` directory:

```html
/
    package.json
    node_modules
        sourcejs-plugin1
        sourcejs-plugin2
```

### Internal plugins

SourceJS is an open source project, and we expect our community to be open as we do, sharing their features and engine extends to public. But in case you prefer to have private plugins, there are few ways solving this case:

* Create private NPM plugins, installing them from your closed repositories
* Commit `/node_modules` contents to your common repository
* Using `/plugins` folder for your custom client-side dependencies and `/app.js` to extend SourceJS back-end

Last mentioned option is deprecated, and not recommended to use, yet you can still find some mentions of this approach in `options.js` and `moduleLoader.js`.

## Plugins

### Client-side

The entry point of plugins client-side is `assets/index.js` file in root of plugin folder.

Each plugin works the same as any internal JavaScript module and is loaded through [RequireJS](http://requirejs.org/) using `moduleLoader.js`. With only one difference - internal modules must be enabled in `options.js` (`assets.modulesEnabled`) but plugin JavaScript modules are enabled by default.

From your plugin, you can call any libraries and internal APIs, defining your dependencies in AMD module:

```js
define([
    'jquery',
    'sourceModules/module',
    'sourceModules/css'
], function ($, module, css) {});
```

To access other plugin assets, you can use direct path to your component:

```js
define([
    'node_modules/sourcejs-plugin/assets/js/innerDep',
    'text!node_modules/sourcejs-plugin/assets/templates/tpl.html'
], function (innerDep, tpl) {});
```

#### Connecting Plugin JS Modules

As we mentioned above, when SourceJS plugin is installed through NPM, main client-side module of your plugin (`index.js`) is connected by default.

To achieve this, we generate custom RequireJS configuration through default build task and dynamically extend `options.js`, filling installed modules to `assets.npmPluginsEnabled` with `true`.

To disable client-side module of any installed npm Plugins, you can edit the module definition in `/options.js`:

```js
{
  core: {},
  assets: {
    npmPluginsEnabled: {
      'sourcejs-plugin': false
    }
  }
}
```

### Back-end

Plugins back-end is exposed in `/node_modules/sourcejs/core/index.js` and is automatically loaded during SourceJS app initialization, before importing `/app.js` extender. It's a simple Node.js module, from which you can use any existing dependencies in SourceJS or define your own.

As SourceJS back-end uses [ExpressJS](http://expressjs.com), it's recommended to use this framework for creating APIs and custom routers.

### Examples

* [sourcejs-react](https://www.npmjs.com/package/sourcejs-react) - rendering React components in specs
* [sourcejs-bubble](https://github.com/sourcejs/sourcejs-bubble) - comments for examples (have client-side and back-end features)
* [sourcejs-spec-dependencies](https://github.com/sourcejs/sourcejs-spec-dependencies) - exposing Spec Dependencies (have client-side and back-end features)
* [sourcejs-spec-status](https://github.com/sourcejs/sourcejs-spec-status)
* [sourcejs-specs-linting](https://github.com/sourcejs/sourcejs-specs-linting)

## Middlewares

SourceJS Middleware is basically the same as Plugin item, but it has only back-end part and its entry point must be defined in `/node_modules/sourcejs/core/middleware/index.js` path.

As SourceJS uses [ExpressJS](http://expressjs.com), middleware development constraints are bound to this framework.

Most common use cases of middleware in SourceJS in modification of Spec file contents during the request.

### Connecting The Middleware

Middlewares are automatically loaded after installation, and are evaluated on each request before `/node_modules/sourcejs/core/middleware/wrap.js` and `sourcejs/core/middleware/send.js`.

`wrap.js` is wrapping spec page (`index.src.html`, `index.md` and etc) contents in a pre-defined a view template from `/node_modules/sourcejs/core/views` or user custom path `/node_modules/sourcejs/user/core/views` using [EJS](http://www.embeddedjs.com/).

`send.js` is used in case when we modify Spec contents, as we do with `*.src.html` and all other middlewares. Modified Spec content is passed through `req.specData.renderedHtml` object, which each middleware can modify during the request handling process and which then is sent to the client's browser.

### Modifying Spec contents

We already mentioned before that Middlewares use `req.specData.renderedHtml` object to get processed Spec contents and modify them.

As any other basic ExpressJS middleware, at the processing start, we get `req` object on input and pass it to the next handler on each request. This architecture allows us to modify `req` contents on each step.

It's possible to define middleware group/order and control group execution sequence. By default all middlewares (and older plugins) will be placed in default group. Here's the default group execution order:

```js
loadGroupsOrder: [
  'request',
  'pre-html',
  'default',
  'html',
  'response'
]
```

####Example configurations

In SourceJS core (configurable from `user/options.js`):
```js
{
  core: {
    middlewares: {
        list: {
          md: {
            enabled: true,
            order: -1,
            group: 'pre-html',
            indexPath: path.join(appRoot, 'core/middlewares/md.js')
         }
         'sourcejs-plugin-name': {
           order: -2
         }
      }
    }
  }
}
```
Plugin level configuration in `sourcejs-plugin-name/options.js`, will be merged on-top of defaults:
```js
module.exports = {
  order: 1,
  group: 'pre-html'
};
```
To override core middlewares, changing their order or replacing with alternative plugins, user will need to modify his `options.js` file. For the security reason, plugin level options can't override core middlewares or set an execution order option lower than 0 (zero).

### Examples

* [sourcejs-jade](https://github.com/sourcejs/sourcejs-jade)
* [sourcejs-smiles](https://github.com/sourcejs/sourcejs-smiles)
