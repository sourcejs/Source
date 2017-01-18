# SourceJS - Living Style Guide Platform

[![npm version](https://badge.fury.io/js/sourcejs.svg)](https://www.npmjs.com/package/sourcejs)
[![Build Status](https://travis-ci.org/sourcejs/Source.svg?branch=master)](https://travis-ci.org/sourcejs/Source)
[![Windows Build status](https://ci.appveyor.com/api/projects/status/ctvr9lsiaxpbhecm/branch/master?svg=true)](https://ci.appveyor.com/project/operatino/source/branch/master)

**The most advanced tool for documenting, testing and managing Front-end Components achieving productive team work.**

🚀 [**Quick Start**](http://sourcejs.com/docs/getting-started/)

SourceJS powered workflow allows developers to **code new components directly in the documentation.** Combining web components development with documentation and team communication processes, makes SourceJS a powerful tool for Front-end developers and designers.

🎥 Check out short video overview:

[![image](http://d.pr/i/7Ax4+)](http://youtu.be/y4KHmX8vCc0)

Our main goal is to provide flexible, modular environment for managing reusable Front-end components library. We don't focus on specific technologies, allowing to seamlessly integrate SourceJS workflow with your existing codebase.

___


[**Source engine project page**](http://sourcejs.com) &nbsp;&nbsp;&nbsp; [**Documentation**](http://sourcejs.com/docs) &nbsp;&nbsp;&nbsp; [**Examples**](http://sourcejs.com/docs/getting-started/#examples) &nbsp;&nbsp;&nbsp;[**How-to's**](https://github.com/sourcejs/blog-howto)

___

SourceJS component management engine was originally developed in [OK.ru](http://corp.mail.ru/en/communications/odnoklassniki) front-end development team and is recommended for big and middle sized projects. Especially for fast growing web portals, outsource teams with similar project and companies with multiple services.

Have questions? Just reach our community through Gitter Chat:

[![Gitter chat](https://img.shields.io/badge/gitter-join%20chat-1dce73.svg)](https://gitter.im/sourcejs/Source)

## SourceJS is NOT

To clear some confusion around Living Style Guide Platforms comparison, let us define few main differences.

### Static site builder

**SourceJS is a dynamic Node.js application**, and does not build static website as Pattern Lab, KSS, StyleDocco are doing. Dynamic environment allows to connect unlimited number of plugins and middlewares for compiling docs, styles, text right on the flight.

### CSS Documentation parser

Engine is based on gathering special documentation templates (`index.src.html`, `readme.md` and others), where you leave your HTML examples, template includes and description. All Specs are located in `sourcejs/user/specs` folder, and could contain any catalogue structure, with focus on component folders.

**But you can use official SourceJS plugin based on DSS, CSS Documentation parser - [github.com/sourcejs/sourcejs-contrib-dss](https://github.com/sourcejs/sourcejs-contrib-dss).**

## Join the community

Many teams are already using SourceJS for building and managing Front-end components libraries for themselves and their clients. To join the community, you just need to follow few simple rules - check our docs about [Maintaining](MAINTAINING.md) and [Contribution](CONTRIBUTING.md).

If you notice some bugs, or need to help finding a better solution in your process, feel free to create an issue, and we will solve your problem together.

[Materials for presentations](https://github.com/sourcejs/pres).

## Updates
* 20.09.15 [0.5.6](https://github.com/sourcejs/sourcejs/releases/tag/0.5.6) and  [0.5.6-no-jsdom](https://github.com/sourcejs/sourcejs/releases/tag/0.5.6-no-jsdom) with EJS helpers, NPM 3 support and navigation improvements
* 16.08.15 [0.5.5](https://github.com/sourcejs/sourcejs/releases/tag/0.5.5) and  [0.5.5-no-jsdom](https://github.com/sourcejs/sourcejs/releases/tag/0.5.5-no-jsdom) patch release with `<markdown>` tag fix and set of functional tests
* 15.08.15 [0.5.4](https://github.com/sourcejs/sourcejs/releases/tag/0.5.4) and  [0.5.4-no-jsdom](https://github.com/sourcejs/sourcejs/releases/tag/0.5.4-no-jsdom) with middleware loader, relative paths in navigation support and other improvements
* 28.05.15 [0.5.3](https://github.com/sourcejs/sourcejs/releases/tag/0.5.3) context options support, source-as-npm package, CI integration, watcher stability improvements and other great features
* 28.05.15 [0.5.3-no-jsdom](https://github.com/sourcejs/sourcejs/releases/tag/0.5.3-no-jsdom) special release without JSDom for Windows users
* 15.04.15 [0.5.2](https://github.com/sourcejs/sourcejs/releases/tag/0.5.2) patch release with improved markdown support and `index.src.html`
* 28.03.15 [0.5.1](https://github.com/sourcejs/sourcejs/releases/tag/0.5.1) patch release with EJS pre-rendering and various bugfixes
* 28.03.15. SourceJS [Bootstrap example bundle](https://github.com/sourcejs/example-bootstrap-bundle) and [How-to articles blog](https://github.com/sourcejs/blog-howto)
* 15.03.15. New example [Specs showcase](http://sourcejs.com/specs/) ([source code](https://github.com/sourcejs/example-specs-showcase))
* 15.03.15. CSS Documentation support with [SourceJS DSS plugin](https://github.com/sourcejs/sourcejs-contrib-dss)
* 12.03.15. **[0.5.0](https://github.com/sourcejs/sourcejs/releases/tag/0.5.0) release** with full Markdown support, GitHub auth, `info.json` watchers and other improvements
* 24.02.15. [0.4.1](https://github.com/sourcejs/sourcejs/releases/tag/0.4.1) patch release
* 05.02.15. Mentioned at in-depth [Style Guides Tools overview talk](http://youtu.be/Fr23VpM6wl4ds)
* 18.01.15. Published an [intro video about SourceJS](http://youtu.be/y4KHmX8vCc0)
* 07.01.15. **[0.4.0](https://github.com/sourcejs/sourcejs/releases/tag/0.4.0) stable release.** From now, we move to fast, semantic release cycle. No globally breaking changes till 1.0.0
* 08.10.14. 0.4.0-rc release, migration [instructions](https://github.com/sourcejs/sourcejs/tree/master/docs/migration)
* 01.08.14. [Video review](http://youtu.be/ukFeZnJjrLs?list=PL20zJcC2wnX7RY1CDrKLhSvYxEe6jtMbB) of SourceJS engine and workflow example (RU with EN subtitles)
* 31.07.14. 0.4.0-beta release
* 01.05.14. Engine presentation from [Front-end Ops Conf](http://www.feopsconf.com/), San Francisco - [Taking Development Tools To The Next Level](http://rhr.me/pres/ime/) with [video](https://www.youtube.com/watch?v=cMIad0zl00I)
* 31.01.14. [Preview](http://youtu.be/cefy_U5NU4o) of Source companion tool for prototyping interfaces using existing components
* 31.12.13. **0.3.2 release**
* 09.10.13. Engine [presentation](http://rhr.me/pres/source-min/) on [Fronteers Jam](http://fronteers.nl/congres/2013/jam-session) ([video](https://vimeo.com/77989211))
* 23.09.13. Published [video recording](http://www.youtube.com/watch?v=3HNW5Bru0Ws) of Source engine presentation from [RIT++](http://ritconf.ru/) 2013 (RU)

## Upcoming updates

Respecting open source community, we track all our tasks publicly on GitHub. Follow our [milestones](https://github.com/sourcejs/example-bootstrap-bundle) and twitter announcements [@SourceJS](http://sourcejs.com) to keep in sync with latest plans.

List of few global upcoming features

* Remove JSDom dependency, for making engine faster and easier to install
* SourceJS as npm module official support
* Refactored code snippets API and tab view
* Integrations with JSDoc and drop-in replacement setup for other Style Guide tools like KSS/Pattern Lab
* More screencasts and engine usage demos

SourceJS follows semantic versioning and we do our best to keep as less breaking changes as possible.

Preparing to 1.0 release, we plan to keep migration path very smooth and painless. So if you will keep in sync with minor releases and API deprecation announcements, you won't face any problems setting up major release updates.

## Useful information

### Browser support

SourceJS client-side part is supported in all latest major browsers and IE8+ in [Clarify](http://sourcejs.com/docs/clarify) for testing components.

___

Copyright © 2013-2015 [SourceJS](http://sourcejs.com)

Licensed under [MIT License](http://en.wikipedia.org/wiki/MIT_License), read more at [license page](http://github.com/sourcejs/sourcejs/wiki/MIT-License).
