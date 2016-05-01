From 0.4.0 version, SourceJS started to grow own REST API for flexible plugins development and easy side services integration. API provides full access to Spec contents, navigation tree and other useful features.

## GET Specs

[Get](/api/specs) access to Specs navigation tree with filtering by various options. This Navigation tree is used to build search, catalog pages and digests, here you can also read all `info.json` configuration of each Spec.

```
GET http://localhost:8080/api/specs
```

### Parameters

All parameters must be passed as JSON with request, except `id` that accepts regular param as well. List of available params:

| Param | Value | Description |
|---|---|---|
| id | String | Get specific Spec information by ID - `base/btn`, `docs/spec` ([example](/api/specs?id=docs/spec)). |
| cats | Boolean | Set to true, if you want to get categories info either. |
| filter | Object | Return list of items by filter (filter something that we want to see). |
| filterOut | Object | Return list of items by filter (filter something that we DON'T want to see). |

Possible combinations:

```
[cats], [id|filter|filterOut], [filter|filterOut]
```

### Filters

These parameters are equal for `filter` and `filterOut` objects:

| Param | Value | Description |
|---|---|---|
| filter.cats, filterOut.cats | Array with strings | Filter by Spec categories. |
| filter.fields, filterOut.fields | Array with strings | Filter by existing files in `info.json`. |
| filter.tags, filterOut.tags | Array with strings | Filter by specified tags in `info.json`. |

And another custom param for filter:

| Param | Value | Description |
|---|---|---|
| filter.forceTags | Array with strings | Filter by specified tags in `info.json`. |

`filter.forceTags` has priority over `filterOut.tags`, if you want to force get all specs having specific tags.

### Raw

Get raw, nested Navigation tree:

```
GET http://localhost:8080/api/specs/raw
```

### Examples

Return all specs that has info field:

```
$ curl -H "Content-Type: application/json" -X GET -d '{"filter":{"fields":["info"]}}' http://localhost:8080/api/specs
```

Return all specs except those, which have info field:

```
$ curl -H "Content-Type: application/json" -X GET -d '{"filterOut":{"fields":["info"]}}' http://localhost:8080/api/specs
```

## GET HTML

[Get](/api/specs/html) access to Spec examples HTML content.

```
GET http://localhost:8080/api/specs/html
```

### Parameters

| Param | Value | Description |
|---|---|---|
| id | String | Get specific Spec examples HTML information by ID - `base/btn`, `docs/spec` ([example](/api/specs/html?id=docs/spec)). |

## POST HTML

```
POST http://localhost:8080/api/specs/html
```

### Parameters

Params must be passed as JSON. List of possible params:

| Param | Value | Description |
|---|---|---|
| data | Object | Data to post, will be extended on existing data. |
| unflatten | Boolean | Set true, to unflatten object from `some/spec` before extending on current data. |

#### Data example

Data object must contain spec ID and `specFile` pointer, to follow current API storage structure.

By default API expects to get nested object `docs.api.rest-api.specFile`, but you can also define a flat ID `docs/api/rest-api/specFile`, passing `unflatten:true` together with post request.

```js
{
    "docs/api/rest-api/specFile": {
        "headResources": {},
        "bodyResources": {},
        "contents": []
    }
}
```

## DELETE HTML

```
DELETE http://localhost:8080/api/specs/html
```

### Parameters

| Param | Value | Description |
|---|---|---|
| id | String | Spec ID (`some/spec`), that will be deleted from current data.|