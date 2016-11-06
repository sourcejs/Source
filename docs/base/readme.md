This page contains main information about SourceJS engine and it's set-up.

SourceJS documentation is rendered by the engine itself and is shipped together with each instance.

## Install

Before you start, please make sure that [Git](http://git-scm.com/downloads) and [Node.js](http://nodejs.org/download/) are already installed on your system. Then install these NMP packages:

[![npm version](https://badge.fury.io/js/sourcejs.svg)](http://badge.fury.io/js/sourcejs)

To install SourceJS, first clone clean `user` configuration folder and then execute `npm install`.

TODO

```bash
git clone https://github.com/sourcejs/init.git -b npm my-sourcejs && cd my-sourcejs
npm install sourcejs --save
npm start
```

## Commands

### Run

To run it trigger this command in newly created folder with SourceJS app:

```bash
npm start
```

To set an alternative server port, pass `-- -p 8081` option.

Other configuration arguments are described in the help section:

```bash
npm start -- -h
```

### Build

TODO : this should no longer be nessesary

During the initial set-up, generator will build everything for you. To re-build the engine, run this command:

```bash
npm run build
```

It will trigger `npm i` and default build task for updating dependencies and building SourceJS assets. See the full list of [all build tasks available](/docs/build-tasks).

### Update

To check for updates for all NPM modules run this command:

```bash
npm outdated
```

This will list all outdated packages. If a new version of SourceJS is availeble, it will be listed.

It's possible to update the version number in your `package.json` file manually, but it's easier to install [npm check updates](https://www.npmjs.org/package/npm-check-updates):

```bash
npm install -g npm-check-updates
npm-check-updates -u sourcejs
```

## Creating First Spec

Specs are the main content files in SourceJS engine, in them you define all your component description and UI code for rendered examples. Originally we use `*.src.html` and `*.md` file templates with custom flavoured syntax. It is also possible to configure other technologies for writing Specs using plugins like [Jade](https://github.com/sourcejs/sourcejs-jade).

We treat Spec files as an interface, you can construct Spec page in many ways following only few simple rules. Each Spec folder must contain `info.json` with it's meta information and SourceJS compliant markup file. As an essential markup, engine requires only few hooks like `.source_section`, `.source_example` to define content sections and the rest is plain semantic HTML.

### Spec Starting Template

The starting template for new Spec pages can be found in `sourcejs/docs/starting` folder. Copy the contents to a new folder in `source/user/specs` and you'll be ready to write a new spec.

[Check the SourceJS Spec page documentation.](/docs/spec)

### Server-side Templating Engines

As we mentioned before, it's also possible to use *other* server-side templating engines like Jade. You need to create a SourceJS middleware that will perform the rendering. Our [sourcjejs-jade Middleware](https://github.com/sourcejs/sourcejs-jade) may serve as an example of such middleware.

By default all files are pre-processed with [EJS](http://ejs.co/), so you're free to use custom EJS features, which is basicly most JavaScript:

```html
  &lt;% if (info.title === 'Title') {% &gt; Action! &lt;% } %&gt;
```

```html
<ul>
  &lt;% [🐷,🐮,🐶,🐭].forEach(item => {% &gt;
    <li>&lt;%- item %&gt;</li>
  &lt;% }) %&gt;
</ul>
```

And you can even use includes: a very useful EJS feature:

```html
&lt;%- include('filename.ejs', {info: info}) %&gt;
```

[Read more about Spec page generation helpers.](/docs/spec-helpers)

### Client-side Templating Engines

For client-side templating you don't need any magic, just link Mustache or any other JS library to your page and use it whenever you want.

Remember, SourceJS Specs are a simple static pages, that are then enchanted with client-side scripts and internal APIs.

## Examples

Main project site: [sourcejs.com](http://sourcejs.com) is based on SourceJS platform, as well as all documentation that you're surfing right now. Engine docs are both viewable on [GitHub](https://github.com/sourcejs/Source/tree/master/docs) and in SourceJS environment.

### Specs Showcase

Highlighting the variety of different ways for organizing Spec pages we gathered another special bundle. View it's source code at [showcase repo](https://github.com/sourcejs/example-specs-showcase) and compare with [rendered result](http://sourcejs.com/specs/example-specs-showcase/).

Showcase includes both native Specs examples, and ones that are rendered with plugins like [sourcejs-contrib-dss](http://github.com/sourcejs/sourcejs-contrib-dss) and [sourcejs-jade](http://github.com/sourcejs/sourcejs-jade).

[Also check the SourceJS Spec page documentation.](/docs/spec)

### Bootstrap Bundle

To show you how SourceJS based documentation pages could be configured, we prepared a [Bootstrap demo bundle](https://github.com/sourcejs/example-bootstrap-bundle). It represents a recommended way of structuring UI components, keeping all module related technologies in one place.

We highly encourage you setting up Bootstrap bundle on your SourceJS instance, and use it for experimenting and demoing documentation pages. Pull Requests are very welcome, adding more examples to this bundle, you will help yourself and other users getting more insights on how SourceJS specs could be organized.

Read our how-to articles, to get more information about the [SourceJS catalog set-up](https://github.com/sourcejs/blog-howto/tree/master/catalog-setup).

### Style Guide Driven Development

To get more insights about recommended workflow within Style Guide platform check [this example bundle](https://www.youtube.com/watch?v=KeR8Qhgyb6M) together with short screencast.

<div style="max-width: 100%;"><div style="position: relative; padding-bottom: 56.25%;">
<iframe width="100%" height="100%" style="position: absolute;" src="https://www.youtube.com/embed/KeR8Qhgyb6M" frameborder="0" allowfullscreen></iframe>
</div></div>


## Configuration

SourceJS engine is highly configurable. Engine and plugins are configured in 1 place:: `options.js`.

With version 0.5.3 we also introduced context level options `sourcejs-options.js`, which allows to configure any catalog specifically for your needs. Read more about it, and other configuration capabilities in [Engine Configuration](/docs/configuration) doc.

## Plugins

As a Style Guide Platform we focus on flexibility and ease of integration. All SourceJS core modules are easy to configure and replace with your customized version.

Plugins are working in the same way as core modules, but are kept outside the main platform, allowing to separate specific features.

### Available plugins:

#### Spec Language Integrations:
These plugins allow for writing specs pages in your prefered language or method
* [sourcejs-slm](https://github.com/venticco/sourcejs-slm)
* [sourcejs-react](https://github.com/szarouski/sourcejs-react)
* [sourcejs-jade](https://github.com/sourcejs/sourcejs-jade)
* [sourcejs-dss](http://github.com/sourcejs/sourcejs-contrib-dss)

#### Spec Code example languages
These plugins add new ways to incoperate code examples on spec pages
* [sourcejs-react-styleguidist](https://github.com/sourcejs/sourcejs-react-styleguidist)
* [sourcejs-md-react](https://github.com/mik01aj/sourcejs-md-react)

#### Utility
These plugin help with development with SourceJS
* [sourcejs-browser-sync](https://github.com/sourcejs/sourcejs-contrib-browser-sync)

#### Spec Extentions
These plugins add additional functionality that can be used on spec pages
* [sourcejs-comments](https://github.com/sourcejs/sourcejs-comments)
* [sourcejs-react-dependencies](https://github.com/ndelangen/sourcejs-react-dependencies)
* [sourcejs-spec-dependencies](https://github.com/sourcejs/sourcejs-spec-dependencies)
* [sourcejs-spec-status](https://github.com/sourcejs/sourcejs-spec-status)
* [sourcejs-crowd-voice](https://github.com/sourcejs/sourcejs-crowd-voice)
* [sourcejs-specs-linting](https://github.com/sourcejs/sourcejs-specs-linting)

Even more plugin may be found by searching npm: [Search npm for 'sourcejs-'](https://www.npmjs.com/search?q=sourcejs-)

### Installing plugins
These modules are able to extend both front-end and back-end part of the engine. To install any middleware, run `npm install <name>`

After install is finished (re)start your SourceJS instance using: `npm start`.

<div class="source_warn">
    Some plugins may need addition setup!<br/>
    Read their documentation
</div>

Follow [this guide](/docs/api/plugins) to learn how to develop own plugins for SourceJS Platform.

If you have created your own middleware, please let us know! If you'd like to add your middleware to the list above, or you can submit a Pull-Request.

## Contact us

Leave your questions and feedback as [issues](https://github.com/sourcejs/Source/issues) on GitHub or [request a consultation](mailto:r@rhr.me) from SourceJS founders.

If you have any quick questions, or want to share your experience working with SourceJS, drop us a message in Gitter chat:

[![Gitter chat](https://img.shields.io/badge/gitter-join%20chat-1dce73.svg)](https://gitter.im/sourcejs/Source)
