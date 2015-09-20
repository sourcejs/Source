## Intro

Spec pages in SourceJS engine are the main content units. They provide a proper sandbox for demoing rendered components, usage examples and module documentation. Therefore, it's really important to make Spec pages development process as easy as possible.

 Apart from plugins, that allow integrating different technologies for generating Specs pages, the engine provides a set of native helpers based on [EJS](http://ejs.co).

 Let's dive deeper into each of available Spec generation features.

 ## Plugins

 It's really important for us to make SourceJS easy adaptable to any project needs. Having a powerful, and easy-to-develop plugins system hugely improves developers user experience working with Living Style Guides.

 Here's a list of all Spec generation focused plugins:

* [sourcejs-slm](https://github.com/venticco/sourcejs-slm) - [Slim](http://slim-lang.com/) templates support
* [sourcejs-md-react](https://github.com/mik01aj/sourcejs-md-react) - Markdown helpers for rendering React components
* [sourcejs-react](https://github.com/szarouski/sourcejs-react) - generate specs from JSX files
* [sourcejs-contrib-dss](http://github.com/sourcejs/sourcejs-contrib-dss) - generating documentation out of CSS comments
* [sourcejs-jade](https://github.com/sourcejs/sourcejs-jade) - [Jade](http://jade-lang.com/) syntax support

Most of the plugins have [live examples](http://sourcejs.com/specs/example-specs-showcase/) on the project website.

 ## Native Templating

 SourceJS uses powerful [EJS](http://ejs.co/) templating engine for core UI generation and Specs content processing. This means that any Spec file can use the full power of EJS templating logic.

 ```html
&lt;% if (info.title === 'Title') {% &gt; Action! &lt;% } %&gt;
```

Use plain JavaScript for managing conditions and generating demo content through data loops. All `info.json` file contents are by default available in each Spec scope. Apart from common [meta information](/docs/info-json) available in `info.json` files, it's possible to set any of your own custom data.

```html
&lt;h2&gt;&lt;%- info.title %&gt;&lt;/h2&gt;

&lt;% var buttons = ['btn-group-lg', '', 'btn-group-sm', 'btn-group-xs'] %&gt;

&lt;% buttons.forEach(function(modifier){ %&gt;
    &lt;div class="btn-group &lt;%= modifier %&gt;" role="group" aria-label="Default button group"&gt;
      &lt;button type="button" class="btn btn-default"&gt;Left&lt;/button&gt;
      &lt;button type="button" class="btn btn-default"&gt;Middle&lt;/button&gt;
      &lt;button type="button" class="btn btn-default"&gt;Right&lt;/button&gt;
    &lt;/div&gt;&lt;br&gt;&lt;br&gt;
&lt;% }); %&gt;
```

```example
<%- include('examples/buttons.html') %>
```

### Includes

Providing a relative path to current Specs, it's easy to include any file.

```html
&lt;%- include('examples/include.html') %&gt;
```

```example
<%- include('examples/include.html') %>
```

Note that by default, SourceJS restricts including files outside project directory for security reasons. To disable this restrictions, change `core.sandboxIncludes` configuration.

<a href="https://github.com/sourcejs/Source/tree/master/docs/spec-helpers/examples" class="source_a_hl">View examples source code.</a>


## EJS Custom Helpers

Starting from v.0.5.6, SourceJS provides a set of custom EJS helpers:

* `includeMD(path)` - include and process Markdown file
* `includeFiles(glob)` - include a set of files by mask (uses [glob](https://github.com/isaacs/node-glob))

Feel free to create Pull Requests with a wider set of helpers.

### includeMD

```html
&lt;%- includeMD('examples/markdown-file') %&gt;
```

```example
<%- includeMD('examples/markdown-file') %>
```

### includeFiles

```html
&lt;%- includeFiles('examples/mask-*.html') %&gt;
```

```example
<%- includeFiles('examples/mask-*.html') %>
```

<a href="https://github.com/sourcejs/Source/tree/master/docs/spec-helpers/examples" class="source_a_hl">View examples source code.</a>

## Extended features

For any other custom Spec content processing, we recommend building own SourceJS plugins. Follow our [instructions](/docs/api/plugins/) and example plugins for fast kick-off.

It's also possible to configure custom build task, that will generate compatible Spec pages via Grunt/Gulp or any other build tool.