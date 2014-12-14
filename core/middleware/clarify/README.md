# Clarify - separation of spec examples

It's very useful to break your feature rich Spec page to small parts, especially for development and testing.

To render only one example on Spec request, add special parameters to URL:

```
http://localhost:8080/spec/?clarify=true&sections=1
```

## List of params

| Param | Value | Default setting | Description |
|---|---|---|
| clarify | Boolean | false | Turn on clarify middleware. |
| sections | '1, 1.1, 3' | empty (lists all sections) | List of sections to show. |
| fromApi | Boolean | false | Set to `true`, if want to get rendered HTML from API in response. |
| js | Boolean | true | Turn on and of JS injection from the Spec. |
| tpl | 'template name' | 'default' | Define EJS template name to render sections. Templates are defined in `core/views/clarify/` and `user/core/views/clarify/`, user templates overrides core. |