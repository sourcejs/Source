# API docs draft

## Specs

Get all, or filtered specs

```
/api/specs
```

### Params

```
?[id|filter|filterOut],[filter|filterOut]
```

* id (string) - return only one item with ID
* filter (obj) - return list of items by filter (filter something that we want to see)
* filterOut (obj) - return list of items by filter (filter something that we DON'T want to see)

### Examples

```
curl -H "Content-Type: application/json" -X POST -d '{"filter":{"fields":["info"]}}' http://localhost:8080/api/specs
```

Will return all specs that has `info` field.

```
curl -H "Content-Type: application/json" -X POST -d '{"filterOut":{"fields":["info"]}}' http://localhost:8080/api/specs
```

Will return all specs except those, which have `info` field.


### Filter params

Both `filter` and `filterOut` could have this params:

```
{
    cats: [],
    fields: [],
    tags: []
}
```

## HTML

Get all, or specific Spec HTML

```
/api/specs/html
```

### Params

```
?[id]
```

* id (string) - return only one item with ID


## TODO:Categories

Get categories list

```
/api/cats
```

## TODO:Tags

Get tags list

```
/api/tags
```

## Testing

For testing api, stub data is used:

```
test/api-test-html.json
test/api-test-specs.json
```

To activate test data switch pass `test: true` param to API request.