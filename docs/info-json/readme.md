`info.json` file in spec folder is used for defining page meta information and local options set-up. Use it for customizing global navigation or with your custom fields.

## Used options

List of used options in `info.json`:

```js
{
    "title": "Info.json - Spec Description",
    "author": "Robert Haritonov",
    "tag": ["tags, for, search"],
    "info": "Spec description.",
    "role": "navigation",
    "template": ["custom" | "$(context)/template.ejs"],
    "specFile": "index.custom.hmtl",
    "thumbnailPath": "custom-thumbnail.png"
    "sourcejs": { "assets" :{} }
}
```

* `title` - the only mandatory parameter, defines spec title in navigation
* `author` - used in global navigation
* `tag` - tags are used for search, filtering through [API](/docs/api) and [auto-generated navigation](/docs/data-nav)
* `info` - spec description
* `role` - set the page role ("navigation" or "spec"), used for setting different `*.src.html` files templates
* `thumbnailPath` - custom relative path to spec page preview image

Feel free to add any custom meta information to `info.json` file for your needs as well. This info will be then available from [Spec API](/docs/api), in middleware-plugins (`req.specData.info`) and for adding custom [ESJ templating](/docs/base/#server-side-templating-engines).

### template

`template` field allows defining custom parent template for rendering the spec page. Available values:

* `tpl-name` - `*.ejs` template in `user/core/views` folder
* `$(context)/tpl-name.ejs` - path to template relative to current `info.json` location, other available placeholders - `$(sourcejs)`, `$(user)`

### specFile

`specFile` - allows to define custom spec files source, overriding `options.rendering.specFiles` configuration.

### sourcejs

`sourcejs` - this field accepts a local configuration object for configuring spec level context options.

Read more about engine configuration capabilities in [Engine Configuration](/docs/configuration) doc.