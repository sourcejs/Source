# API docs draft

## Specs

### GET

Get all, or filtered specs

```
GET
/api/specs
```

#### Params

Params must be passed as JSON. List of possible params:

```
[id|filter|filterOut],[filter|filterOut]
```

* `id` (string, JSON or param) - return only one item with ID
* `filter` (obj, JSON only) - return list of items by filter (filter something that we want to see)
* `filterOut` (obj, JSON only) - return list of items by filter (filter something that we DON'T want to see)

#### Examples

```
curl -H "Content-Type: application/json" -X GET -d '{"filter":{"fields":["info"]}}' http://localhost:8080/api/specs
```

Will return all specs that has `info` field.

```
curl -H "Content-Type: application/json" -X GET -d '{"filterOut":{"fields":["info"]}}' http://localhost:8080/api/specs
```

Will return all specs except those, which have `info` field.


#### Filter params

Both `filter` and `filterOut` could have this params:

```
{
    cats: [],
    fields: [],
    tags: []
}
```

And another custom param for `filter`:

```
{
    forceTags: []
}
```

`forceTags` has priority over `filterOut.tags`.

## Specs raw

Get all raw spec list in nested object.

```
GET
/api/specs/raw
```

## HTML

### GET

Get all, or specific Spec HTML

```
GET
/api/specs/html
```

#### Params

Available params:

```
[id]
```

* `id` (string, JSON or param) - return only one item with ID

### POST

```
POST
/api/specs/html
```

#### Params

Params must be passed as JSON. List of possible params:

```
[data],[data, unflatten]
```

* `data` (object) — data to post, will be extended on current data
* `unflatten` (boolean) — set true, to unflatten object from `some/spec` before extending on current data

### DELETE

```
DELETE
/api/specs/html
```

#### Params

```
[id]
```

* `id` (string, JSON or param) — spec ID (`some/spec`), that will be deleted from current data

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