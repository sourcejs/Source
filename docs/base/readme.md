# Main Engine Documentation

This page contains main information about SourceJS engine and it's set-up.

SourceJS documentation is rendered by the engine itself and is shipped together with each instance.

## Install

Before you start, please make sure that [Git](http://git-scm.com/downloads) and [Node.js](http://nodejs.org/download/) are already installed on your system. Then install these NMP packages:

```html
npm install -g grunt-cli yo generator-sourcejs
```

Having all dependencies in-place you will get a special `yo sourcejs` generator available for new instance initialization:

```html
mkdir sourcejs && cd sourcejs
yo sourcejs
```

To set-up a new engine instance chose the first option `Init SourceJS in this folder`. Generator also allows to bootstrap new Spec pages or plugins.

If you're running Windows and have some issues with [jsdom](https://github.com/tmpvar/jsdom) dependencies compilation, please check this [topic](https://github.com/sourcejs/Source/issues/23).

## Commands

### Run

Installation wizard will offer to start SourceJS right after initialization. To run it manually, trigger this command in newly created folder:

```html
node app
```

To set an alternative server port, pass `-p 8081` flag. Other configuration arguments are described in the help section:

```html
node app -h
```

### Build

During the initial set-up, generator will build everything for you. To re-build the engine, run this command:

```html
npm run build
```

It will trigger `npm i` and `grunt default` commands for updating dependencies and building SourceJS assets. See the full list of [all Grunt tasks available](/docs/grunt).

### Update

For updating SourceJS to a newer version, just pull the latest changes and trigger build:

```html
git pull && npm run build
```

## Creating First Spec

Specs are the main content files in SourceJS engine, in them you define all your component description and UI code for rendered examples. Originally we use `*.src` and `*.md` file templates with custom flavoured syntax. It is also possible to configure other technologies for writing Specs using plugins like [Jade](https://github.com/sourcejs/sourcejs-jade).

We treat Spec files as an interface, you can construct Spec page in many ways following only few simple rules. Each Spec folder must contain `info.json` with it's meta information and SourceJS compliant markup file. As an essential markup, engine requires only few hooks like `.source_section`, `.source_example` to define content sections and the rest is plain semantic HTML.

### Spec Starting Template

<div class="source_note">
    After initialization, you get `sourcejs/user` folder, which is the place for all your custom content. All new Specs and configuration of main engine must be done there.
</div>

The starting template for new Spec pages can be found in `sourcejs/docs/starting` folder. Copy the contents to a new folder in `source/user/specs` and you'll be ready to write a new spec.

<a href="/docs/spec" class="source_a_hl">Check the SourceJS Spec page documentation.</a>

### Server-side Templating Engines

As we mentioned before, it's easy to use other server-side templating engines like Jade, you only need to create a simple SourceJS middleware ([example](https://github.com/sourcejs/sourcejs-jade)) or process your sources with Grunt/Gulp.

By default all files are pre-processed with [EJS](http://ejs.co/), so you're free to use custom EJS features in any spec page - like includes or even plain JavaScript:

```html
&lt;% include filename.html %&gt;
&lt;% if (info.title === 'Title') {% &gt; Action! &lt;% } %&gt;
```

### Client-side Templating Engines

For client-side templating you don't need any magic, just link Mustache or any other JS library to your page and use it whenever you want.

Remember, SourceJS Specs are a simple static pages, that are then enchanted with client-side scripts and internal APIs.

## Examples

Main [project website](http://sourcejs.com) is based on SourceJS platform, as well as all documentation that you're surfing right now. Engine docs are both viewable on [GitHub](https://github.com/sourcejs/Source/tree/master/docs) and in SourceJS environment.

Inspect [Sourcejs.com source code](https://github.com/sourcejs/Sourcejs.com) to get better understanding of the basic `source/user` folder contents with engine configuration.

### Bootstrap Bundle

To show you how SourceJS based documentation pages could be configured, we prepared a [Bootstrap demo bundle](https://github.com/sourcejs/example-bootstrap-bundle). It represents a recommended way of structuring UI components, keeping all module related technologies in one place.

Read our how-to articles, to get more insights on the [SourceJS catalog set-up](https://github.com/sourcejs/blog-howto/tree/master/catalog-setup).

### Specs Showcase

Highlighting the variety of different ways for organizing Spec pages we gathered another special bundle. View it's source code at [showcase repo](https://github.com/sourcejs/example-specs-showcase) and compare with [rendered result](http://sourcejs.com/specs/example-specs-showcase/).

Showcase includes both native Specs examples, and ones that are rendered with plugins like [sourcejs-contrib-dss](http://github.com/sourcejs/sourcejs-contrib-dss) and [sourcejs-jade](http://github.com/sourcejs/sourcejs-jade).

<a href="/docs/spec" class="source_a_hl">Also check the SourceJS Spec page documentation.</a>

## Configuration

All default options for `assets` (front-end) and `core` (back-end) are located in `sourcejs/options.js`. To overwrite basic options, use your own `sourcejs/user/options.js` file in SourceJS instance home directory.

### Page level overrides

All client-side options can be overridden from within any page using the following approach:

```html
<script>
    define('sourceModules/inlineOptions', {
        modulesOptions : {
            globalNav : {
                pageLimit: 6
            }
        }
    })
</script>
```

### Patching core assets

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

## Plugins

As a Style Guide Platform we focus on flexibility and ease of integration. All SourceJS core modules are easy to configure and replace with your customized version.

Plugins are working in the same way as core modules, but are kept outside the main platform, allowing to separate specific features.

Here is a list of official plugins:

* [sourcejs-contrib-dss](http://github.com/sourcejs/sourcejs-contrib-dss)
* [sourcejs-spec-status](https://github.com/sourcejs/sourcejs-spec-status)
* [sourcejs-crowd-voice](https://github.com/sourcejs/sourcejs-crowd-voice)
* [sourcejs-jade](https://github.com/sourcejs/sourcejs-jade)
* [sourcejs-comments](https://github.com/sourcejs/sourcejs-comments)
* [sourcejs-specs-linting](https://github.com/sourcejs/sourcejs-specs-linting)
* [sourcejs-spec-dependencies](https://github.com/sourcejs/sourcejs-spec-dependencies)
* [sourcejs-smiles](https://github.com/sourcejs/sourcejs-smiles)

These extensions are able to extend both front-end and back-end part of the engine. To install any of official plugin, just use `npm install` in your `sourcejs/user` folder (note that some of them needs additional dependencies like [MongoDB](http://www.mongodb.org/) or [CouchDB](http://couchdb.apache.org/)).

Follow [this guide](/docs/api/plugins) to learn how to develop own plugins for SourceJS Platform.

## Contact us

Leave your questions and feedback as [issues](https://github.com/sourcejs/Source/issues) on GitHub. Or [request a consultation](mailto:r@rhr.me) from SourceJS founders.