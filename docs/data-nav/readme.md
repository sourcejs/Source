Navigation blocks in SourceJS are automatically generated on client-side, replacing a defined HTML hook with hand-crafted configuration.

## Embedding

Copy and modify this HTML snippet to set-up your custom navigation.

```html
&lt;div class="source_catalog" data-nav="/docs">&lt;/div>
```

`data-nav` attribute defines the catalogue to be displayed. Inserting mentioned code in any SourceJS page a navigation like this will be generated:

<div class="source_catalog" data-nav="/docs"></div>


### Absolute paths

We recommend using absolute paths as most stable and predictable.

```html
&lt;div class="source_catalog" data-nav="/docs/api">&lt;/div>
```

Renders this navigation block:

<div class="source_catalog" data-nav="/docs/api"></div>


### Relative paths

Relative paths are also supported. During hook initialization, engine will replace `./` with current navigation URL.

```html
&lt;div class="source_catalog" data-nav="./api">&lt;/div>
```

If you put this HTML snippet in `localhost:8080/docs` page, it will be resolved to `/docs/api/` catalog, same as with absolute path.

This feature is especially useful for nested catalogs and stand-alone collections like [example-specs-showcase](https://github.com/sourcejs/example-specs-showcase/blob/master/index.src.html).


## Headings and description automatic output

Auto-generated title and description in navigation block are taked directly from `info.json` meta file.

```html
&lt;div class="source_catalog" data-nav="./example">&lt;/div>
```

<div class="source_catalog" data-nav="./example"></div>

If there is no description, or you want to leave custom text, just use this extra markup:

```html
&lt;div class="source_catalog" data-nav="./example">
    &lt;h2>Custom Title&lt;/h2>
    &lt;p>Custom description for catalogue.&lt;p>
&lt;/div>
```

<div class="source_catalog" data-nav="./example">
    <h2>Custom Title</h2>
    <p>Custom description for catalogue.</p>
</div>


## Filtering by tag

As it's possible to define different tags for specs in `info.json` files (more in [docs](/docs/info-json/)), we can use them to filter custom navigation tree.


```html
&lt;div class="source_catalog" data-nav="/docs" data-tag="templates">&lt;/div>
```

<div class="source_catalog" data-nav="/docs" data-tag="templates">
    <h2>Specs with "templates" tag</h2>
</div>

To call all specs without a tags, you can filter by `"without-tag"` string.