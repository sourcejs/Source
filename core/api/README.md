# API docs draft

## Specs

Get all, or filtered specs

```
GET
/api/specs
```

### Params

```
?[id|filter|filterOut],[filter|filterOut]
```

* id (string, JSON or param) - return only one item with ID
* filter (obj, JSON only) - return list of items by filter (filter something that we want to see)
* filterOut (obj, JSON only) - return list of items by filter (filter something that we DON'T want to see)

### Examples

```
curl -H "Content-Type: application/json" -X GET -d '{"filter":{"fields":["info"]}}' http://localhost:8080/api/specs
```

Will return all specs that has `info` field.

```
curl -H "Content-Type: application/json" -X GET -d '{"filterOut":{"fields":["info"]}}' http://localhost:8080/api/specs
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

## Specs raw

Get all, or filtered specs

```
GET
/api/specs/raw
```

## HTML

Get all, or specific Spec HTML

```
GET
/api/specs/html
```

### Params

```
?[id]
```

* id (string, JSON or param) - return only one item with ID


## TODO:Categories

Get categories list

```
GET
/api/cats
```

## TODO:Tags

Get tags list

```
GET
/api/tags
```

## Testing

For testing api, stub data is used:

```
test/data/api-test-html.json
test/data/api-test-specs.json
```

And requests are prefixed with `-test`:

```
/api-test/specs
/api-test/specs/html
...
```