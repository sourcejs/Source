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

```
{
    cats: [],
    fields: [],
    tags: []
}
```

## HTML

Get all, or filtered specs HTML

```
/api/specs/html
```

### Params

```
?[id]
```

* id (string) - return only one item with ID

## Categories

Get categories list or specific category contents

```
/api/cats
```

### Params

```
?[id]
```

* id (string) - return category contents