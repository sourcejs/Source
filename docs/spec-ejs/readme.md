SourceJS uses powerful [EJS](http://ejs.co/) templating engine for core UI generation and Specs content processing. This means that any Spec file *can* use the full power of EJS templating logic.

## Intro

```html
<​% if (info.title === 'Title') {% ​> Action! <​% } %​>
```

Use plain JavaScript for managing conditions and generating demo content through data loops. All `info.json` file contents are by default available in each Spec scope. Apart from common [meta information](/docs/spec-json/) available in `info.json` files, it's possible to set any of your own custom data.

```html
<​h2​><​%- info.title %​><​/h2​>

<​% var buttons = ['btn-group-lg', '', 'btn-group-sm', 'btn-group-xs'] %​>

<​% buttons.forEach(function(modifier){ %​>
    <​div class="btn-group <​%= modifier %​>" role="group" aria-label="Default button group"​>
      <​button type="button" class="btn btn-default"​>Left<​/button​>
      <​button type="button" class="btn btn-default"​>Middle<​/button​>
      <​button type="button" class="btn btn-default"​>Right<​/button​>
    <​/div​><​br​><​br​>
<​% }); %​>
```

```example
<%- include('examples/buttons.html') %>
```

### Includes

Providing a relative path to current Specs, it's easy to include any file.

```html
<​%- include('examples/include.html') %​>
```

```example
<%- include('examples/include.html') %>
```

Note that by default, SourceJS restricts including files outside project directory for security reasons. To disable this restrictions, change `core.sandboxIncludes` configuration.

<a href="https://github.com/sourcejs/sourcejs/tree/master/docs/spec-helpers/examples" class="source_a_hl">View examples source code.</a>


## EJS Custom Helpers

Starting from v.0.5.6, SourceJS provides a set of custom EJS helpers:

* `includeMD(path)` - include and process Markdown file
* `includeFiles(glob)` - include a set of files by mask (uses [glob](https://github.com/isaacs/node-glob))

Feel free to create Pull Requests with a wider set of helpers.

### includeMD

```html
<​%- includeMD('examples/markdown-file') %​>
```

```example
<%- includeMD('examples/markdown-file') %>
```

### includeFiles

```html
<​%- includeFiles('examples/mask-*.html') %​>
```

```example
<%- includeFiles('examples/mask-*.html') %>
```

<a href="https://github.com/sourcejs/sourcejs/tree/master/docs/spec-helpers/examples" class="source_a_hl">View examples source code.</a>

## Extended features

For any other custom Spec content processing, we recommend building own SourceJS plugins. Follow our [instructions](/docs/api/plugins/) and example plugins for fast kick-off.

It's also possible to configure custom build task, that will generate compatible Spec pages via Grunt/Gulp or any other build tool.
