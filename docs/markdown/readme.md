SourceJS supports markdown as pure `.md` files and renders it in any other extension files using `<markdown>` HTML tag.

## Basics

Engine treats `index.md` and `readme.md` as main Spec files. Readme file is taken with lowest priority after `index.src.html`, `index.md` and others.

In case if Spec folder contains `index.src.html` and `index.md`, first one will have higher priority.

## Markup examples

[Check out source code of this file](/docs/markdown/readme.md) and compare with this rendered Markdown page.

* List 1
* List 2


1. Ordered list 1
2. Ordered list 2

| Table | Value |
|---|---|
| Td | value |

```html
&#96;``example
code example
&#96;``
```

```example
Mark code with `example` keyword to define `.source_example` with your rendered component view.
<br><br>
<a class="btn btn-primary" href="#777">Example button</a>
```

## Code examples

SourceJS code blocks are aligned with standard Markdown style. List of demo code examples:

```
Some random code
.css {
    color:red;
}
```

```css
.css {
    color:red;
}
```

```js
var test = function(){};
```

```html
<div class="some-html"></div>
```

```example
rendered example
```

## h2

```example
code example in h2
```

### h3

Text

```example
code example in h3
```

* list
* list

#### h4

Text

```example
code example in h4
```
