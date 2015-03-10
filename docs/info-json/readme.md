# Info.json - Spec Description

Specs description lies in `info.json` files next to it, this documents sums up all available options in Info file.

## Used objects

List of used objects in `info.json`:

```js
{
    "title": "Info.json - Spec Description",
    "author": "Robert Haritonov",
    "tag": ["tags, for, search"],
    "info": "Spec description.",
    "role": "navigation",
    "template": "custom"
}
```

* `tag` - tags are used for search, filtering through [API](/docs/api) and [auto-generated navigation](/docs/data-nav)
* `role` - optional parameter, for setting page role, used for setting different `*.src` files templates
* `template` - used for setting custom `*.ejs` template from `user/core/views` for `*.src` file rendering

Feel free to add any custom meta information to `info.json` file for your needs as well.