<link rel="stylesheet" href="css/starting.css">

# Markdown Spec Page Template

Developer: Name<br>
Designer: Name

Useful information regarding this spec can be left for your team members here.

## Spec Section Heading

<a class="source_a_hl" href="/docs/spec">Spec Page Documentation</a>

Useful notes.

```example
<p>Rendered code examples.</p>
```

This spec uses <code>readme.md</code> template, view it's <a href="readme.md">source</a>.

## Code examples plugins

Code example plugins are a list of actions to perform on a code example on the server.

```markdown
​`​`​`{language}:{plugin1,plugin2,plugin3}

- your code -

​`​`​`
```


### pseudo plugin

This plugin will make the example code be rendered multiple times, wrapped in a div with a class mimicking a psuedo-class.

```example:pseudo
<p>Rendered code examples.</p>
```
