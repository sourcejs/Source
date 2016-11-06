Spec load event API helps to organize Spec loading flow, and define the final load event of all content, modules and plugins.

## The Problem

As SourceJS is modular engine, any Spec page could be featured with many client-side plugins, which will operate with DOM during the page load. To resolve those cases, when modules or plugins need to interact with each other, or wait till all DOM operations are done, we made Spec Load Event.

Load event is recommended to use in any SourceJS plugins that make changes to DOM during Spec load. Currently used by HTML API for PhantomJS, and various client-side plugins.

Example use cases:
* When Specs page is loaded through PhantomJS, we must know when page is done building, considering all DOM interactions from plugins
* When we open Spec page with link to section, we must be sure, that page scroll will remain in the right position after load

## Basics

Each plugin that interacts with DOM must be registered at Load Event API global object `window.source.loadEvents`.

Recommended plugin definition:

```js
window.source = window.source || {};
window.source.loadEvents = window.source.loadEvents || {};
window.source.loadEvents.moduleName = window.source.loadEvents.moduleName || {
    timeout: '300',
    finishEvent: 'moduleNameFinished',
    updateEvent: 'moduleNameFinishedUpdated'
};
```

As module load sequence could be random, first we init main data object `window.source.loadEvent`, then define options for our module.

Note: if you are using RequireJS, then be sure that module is registered before any `define`/`require` call.

```js
window.source = window.source || {};
...
define([], function(){ ... });
```


## Options

Registering new module to Load Event API we pass these options:

| Key | Type | Description |
|---|---|---|
| finishEvent | String | Name of the Finish event, that registered module will emit, when finishes it's work with DOM. |
| updateEvent | String | Name of the Update event, that module will emit to postpone ready state and reset timeout counter. |
| [timeout] | Number | Timeout (optional, by default is set to `1000`) is used to define approximate eval time. |

Emit `finishEvent`, when you know that your module done working with the DOM, if it won't be called, API will rely on timeout. The default timeout is always used for any registered module, when it's passed, we consider that module is done his job.

If the module is working with DOM quite actively with few iterations, it's recommended to emit `updateEvent`, to reset timeout counter on each iteration.


## Emitting Events

Recommended way of emitting `finishEvent` or `updateEvent` is:

```js
if (window.CustomEvent) {
    new CustomEvent('moduleNameFinished');
} else {
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('moduleNameFinished', true, true);
}
```

Where event name `moduleNameFinished` is the same as we defined during module registration.

## Global Finish Event

When all registered modules to Load Event API are loaded, or timeout is passed, API emits event named `allPluginsFinish`.

### Check plugin status without event

If event was shouted before you subscribe, you can check global storage object for any status of registered plugins.

```js
window.source.loadEvents.moduleName.finish
window.source.loadEvents.pluginName.finish
```

## Grouping modules

To define module bundles, and control their load state, you can also define a group with array of module names:

```js
window.source = window.source || {};
window.source.loadEvents = window.source.loadEvents || {};
window.source.loadEvents.groupName1 = ['moduleName1', 'pluginName2'];
```

When all modules and plugins in group are done their job, we emit `groupName1GroupFinish` event, where `groupName1` is your defined name.
