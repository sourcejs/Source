`info.json` file in spec folder is used for defining page meta information and local options set-up. Use it for customizing global navigation or with your custom fields.

This file is also what the engine is looking for when looking for child-specs in [auto-generated navigation](/docs/data-nav).

## Engine options

List of options in `info.json` (example):

```js
{
    "title": "Info.json - Spec Description",
    "author": "Robert Haritonov",
    "tag": ["tags", "for", "search"],
    "info": "Spec description.",
    "role": "navigation",
    "template": "$(context)/template.ejs",
    "specFile": "index.custom.hmtl",
    "thumbnailPath": "custom-thumbnail.png",
    "sourcejs": { "assets" :{} }
}
```

* `title` - the only mandatory parameter, defines spec title in [auto-generated navigation](/docs/data-nav)
* `author` - shown in [auto-generated navigation](/docs/data-nav)
* `tag` - tags are used for search, filtering through [API](/docs/api) and [auto-generated navigation](/docs/data-nav)
* `info` - spec description
* `role` - set the page role ("navigation" or "spec"), used for setting different `*.src.html` files templates
* `thumbnailPath` - custom relative path to spec page preview image

### template

`template` field allows defining custom parent template for rendering the spec page. Available values:

* `tpl-name` - `*.ejs` template in `/core/views` folder
* `$(context)/tpl-name.ejs` - path to template relative to current `info.json` location, other available placeholders - `$(sourcejs)`, `$(user)`

### specFile

`specFile` - allows to define custom spec files source, overriding `options.rendering.specFiles` configuration.

### tag

`tag` - if defined, it should be an array of strings. This allows spec pages to be found by keyword by search.

### sourcejs

`sourcejs` - this field accepts a local configuration object for configuring spec level context options.

Read more about engine configuration capabilities in [Engine configuration](/docs/configuration/) doc.

## Custom options / properties

Feel free to add **any** custom meta information to `info.json` file for your needs as well. This info will be then available from [Spec API](/docs/api/), in middleware-plugins (`req.specData.info`).

It will also be available to [EJS](/docs/spec-ejs/) during spec rendering:

```js
{
    "title": "My own spec!",
    "yourCustomProperty": "My custom data"
}
```

```html
<​h2​><​%- info.info %​><​/h2​>
<​h3​><​%- info.yourCustomProperty %​><​/h3​>
```
