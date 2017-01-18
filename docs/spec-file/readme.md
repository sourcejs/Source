Spec pages consist of a specFile and a [specInfo](docs/spec-json): `info.json`.

## Intro

Spec pages in SourceJS engine are the main content units. They provide a proper sandbox for demoing rendered components, usage examples and module documentation.

Out of the box you've got 3 options on how you can write your spec pages. Choose whichever makes your development process as easy as possible

* [HTML](/docs/spec-html/)
* [Markdown](/docs/spec-markdown/)
* [EJS](/docs/spec-ejs/)

These 3 options are not mutually exclusive, on a single spec page, you can use all 3!

## Plugins

It's really important for us to make SourceJS easy adaptable to any project needs. Having a powerful, and easy-to-develop plugins system hugely improves developers user experience working with Living Style Guides.

Here's a list of all Spec generation focused plugins:

* [sourcejs-jade](https://github.com/sourcejs/sourcejs-jade) - [Jade](http://jade-lang.com/) syntax support
* [sourcejs-slm](https://github.com/venticco/sourcejs-slm) - [Slim](http://slim-lang.com/) templates support
* [sourcejs-dss](http://github.com/sourcejs/sourcejs-contrib-dss) - generating documentation out of CSS comments
* [sourcejs-md-react](https://github.com/mik01aj/sourcejs-md-react) - Markdown helpers for rendering React components
* [sourcejs-react](https://github.com/szarouski/sourcejs-react) - generate specs from JSX files

Most of the plugins have [live examples](http://sourcejs.com/specs/example-specs-showcase/) on the project website.

## Extended features

For any other custom Spec content processing, we recommend building own SourceJS plugins. Follow our [instructions](/docs/api/plugins/) and example plugins for fast kick-off.

It's also possible to configure custom build task, that will generate compatible Spec pages via Grunt/Gulp or any other build tool.
