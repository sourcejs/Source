# Basic Engine Documentation

This page (and the rest of the site) is powered by the SourceJS engine. All documentation comes built in in every SourceJS instance.

The [Sourcejs.com](http://sourcejs.com) client-side source code is stored in our [github repo](https://github.com/sourcejs/Sourcejs.com).

## Install

Before you start, please make sure that you have [Git](http://git-scm.com/downloads) and [Node.js](http://nodejs.org/download/) on your system, then install next NPM packages:

```html
$ npm install -g yo grunt-cli generator-sourcejs
```

After that, you'll have special `yo sourcejs` generator available for init and bootstrapping new items:

```html
$ cd sourcejs-folder
$ yo sourcejs
```

If you're running Windows and have some issues with [jsdom](https://github.com/tmpvar/jsdom) dependencies compilation, check this [topic](https://github.com/sourcejs/Source/issues/23).

### Run Commands

Yeoman generator will suggest you starting SourceJS right after initialization, besides that, here's a run command for main app:

```html
$ node app
```

For first dev build Grunt will run automatically right after Yeoman init, here's a list of [all Grunt tasks available](/docs/grunt).

## Creating First Spec

Specs are the main content files in SourceJS engine, in them you define all your description of chosen components and it's code examples. Originally we use `*.src` and `*.md` file templates, but you're free to configure your own technologies with plugins, like [Jade](https://github.com/sourcejs/sourcejs-jade) for example.

We treat Spec files as an interface, you can construct your Spec page in any ways, following only few simple rules - each Spec must have `info.json` file aside, with meta information for the Engine and output spec page must have SourceJS compliant markup. Special markup contains only few vital classes like `.source_section`, `.source_example` and the rest is plain, semantic HTML.

<div class="source_note">
    After initialization, you get `sourcejs/user` folder, which is the place for all your custom content. All new Specs and configuration of main engine must be done there.
</div>

### Spec Starting Template

The starting template for new **Spec** pages can be found in [/docs/starting](/docs/starting). Copy the contents to a new folder in `source/user/specs` and you'll be ready to write a new spec.

<a href="/docs/spec" class="source_a_hl">Read more about Spec pages here.</a>

### Server-side Templating Engines

As we mentioned before, it's easy to use other server-side templating engines like Jade, you only need to create a simple SourceJS middleware ([example](https://github.com/sourcejs/sourcejs-jade)) or process your sources with Grunt/Gulp.

By default all files are pre-processed with [EJS](http://ejs.co/), so you're free to use custom EJS features in any spec page - like includes or even plain JavaScript:

```html
&lt;% include filename.html %&gt;
&lt;% if (info.title === 'Title') {% &gt; Action! &lt;% } %&gt;
```

### Client-side Templating Eninges

For client-side templating you don't need any magic, just link Mustache or any other JS library to your page and use it whenever you want. Remember, SourceJS Specs are a simple static pages, that are then enchanted with client-side scripts and internal APIs.

## Examples

Main project website [Sourcejs.com](http://sourcejs.com) is based on SourceJS engine, as well as all documentation that you're [surfing](https://github.com/sourcejs/Source/tree/master/docs) right now. To see more complex example of Spec page, check out [this spec](/docs/spec/).

You can inspect [Sourcejs.com source code](https://github.com/sourcejs/Sourcejs.com), that demonstrates basic `source/user` folder contents.

More examples and screencasts coming soon, but for now, you can check this [SourceJS video presentation](https://www.youtube.com/watch?v=ukFeZnJjrLs) (RU with EN subtitles).

## Configuration

All default options for `assets` (front-end) and `core` (back-end) are located in `sourcejs/options.js`. To overwrite basic options, user your own `sourcejs/user/options.js` file, from your SourceJS instance home directory.

Options examples are located in source files.

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

All modules in SourceJS core are configurable and you can add as many plugins as you want. All official public plugins are available in [SourceJS home on Github](https://github.com/sourcejs).

Plugins could have `core` and `assets` parts to improve both back-end and front-end. To install any of official plugin, just use `npm install` (note that some of them needs additional dependencies like [MongoDB](http://www.mongodb.org/) or [CouchDB](http://couchdb.apache.org/)).

Here's few official plugins:

* [sourcejs-spec-status](https://github.com/sourcejs/sourcejs-spec-status)
* [sourcejs-crowd-voice](https://github.com/sourcejs/sourcejs-crowd-voice)
* [sourcejs-jade](https://github.com/sourcejs/sourcejs-jade)
* [sourcejs-comments](https://github.com/sourcejs/sourcejs-comments)
* [sourcejs-specs-linting](https://github.com/sourcejs/sourcejs-specs-linting)
* [sourcejs-spec-dependencies](https://github.com/sourcejs/sourcejs-spec-dependencies)
* [sourcejs-smiles](https://github.com/sourcejs/sourcejs-smiles)

Follow [this guide](/docs/api/plugins) to jump into own SourceJS plugin development.

## Contact us

Leave your questions and feedback as [issues](https://github.com/sourcejs/Source/issues) on GitHub.