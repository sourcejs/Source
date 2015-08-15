SourceJS engine is highly configurable and allows to override almost any options for your special needs.

## Configuration Hierarchy

Starting from default configuration to spec page overrides, it's possible to re-define options on any level, before it reaches execution phase. This is the priority list of all available configuration levels (starting from default):

* `sourcejs/options.js` - default engine configuration file with examples and documented fields, located next to engine sources
* `sourcejs/user/options.js` - user level settings, as well as other configuration layers, it follows the same structure as default engine options
* `sourcejs/user/**/sourcejs-options.js` - context level settings allows to specify custom configuration per catalogue (have some limitations), supports inheritance for child specs and catalogs
* `info.json` `sourcejs` field - spec context level options, similar to `sourcejs-options.js` but affects only current spec page

Each configuration layer has the same options structure as default reference `sourcejs/options.js`.

### Context Options

Following the options priority hierarchy, context options allows to define highest priority configuration per catalog and spec.

`sourcejs-option.js` file could be placed into any catalog in `sourcejs/user` folder and will affect all nested items. In this example, `catalog1/sourcejs-options.js` will affect both `catalog1/component1`, `catalog1/component2` specs and it's children:

```html
/user
    catalog1
        component1
        component2
        sourcejs-options.js

    catalog2
```

On each spec page call, engine gathers all the context configuration files up the tree and merges it on top of each other. The same process will happen with spec context level options in `info.json`, with only difference that it won't be shared with child items.

Here's an example of local `info.json` configuration:

```js
{
    "title": "Spec Title",
    "sourcejs": {
        "plugins": {
            "plugins": "options"
        }
    }
}
```

Since not all the configuration is dynamic, comparing to user level options, context options allows to change only these groups:

* `assets`
* `plugins`
* `rendering`

Note that context options does not allow changing `core` setting, to override them use `sourcejs/user/options.js` level instead. This limitation is defined by the fact, that only user level options are activated during the application start.

## Patching core assets

<div class="source_warn">
    Patching is not recommended approach, it's supposed to be used only for edge cases, before your changes will be merged in SourceJS core.
</div>

To extend core Front-end assets, that are stored in `sourcejs/assets` we provide a patching feature.

To use your own version of any core assets, all you need is to place your new files to `sourcejs/user/core/assets` folder. Custom routing will handle the rest:

```html
sourcejs/assets/js/modules/ntf.js < sourcejs/user/source/assets/js/modules/ntf.js
sourcejs/assets/js/modules/css.js < sourcejs/user/source/assets/js/modules/css.js
```

In this example, on request for `localhost:8080/source/assets/js/modules/ntf.js` engine will provide version from `sourcejs/user/source/assets` folder, instead of version from core `sourcejs/assets`.