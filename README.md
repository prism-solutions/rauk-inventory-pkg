# Requests examples

## Create
```json
[
    "insertOne",
    {
    "entities": {
      "brandId": "Shoes",
      "factoryId": "Ducon Factory"
    },
    "color": {
      "name": "Traffic Red",
      "id":"673c72fe0f62a7ce266db182"
    },
    "packageQuantity": "1",
    "currentLocation": {
      "id": "Ducon Factory"
    },
    "sku": "026.22.MEG",
    "brandDetails": {
      "id": "64a53ca170e81e4d404dc418",
      "type": "test-product-type"
    },
    "factoryDetails": {
      "id": "64a53ca170e81e4d404dc418",
      "type": "test-product-type"
    },
    "productType": "Sneakers"
    }
]
```

## Find

```json
[
    "find",
    { 
        "$not":{
            "color.name":"blue"
        }
    },
    {
            "select":{
                "color":1
            
            }
    }
]
```

## Aggregate

```json
[
    "aggregate",
    [
        
        {
            "$group":{
                "_id":"$sku",
                "count":{"$sum":1}
            }
        }
    
    ]
]
```

## UpdateOne

This can also be updateMany, and takes no options and will respond with a different output.
```json
[
    "findOneAndUpdate",
    {
        "id":"68e7f70f8d21cb8e86067aff"
    },
    {   
        "color.name":"blue"
    },
    {
        // select can go here to filter the result

    }
]
```


## Bulk Ops

Follow dtos

```json
[
    "bulkWrite",
    [{
        "updateOne":{
        "filter": {
           "sku":"026.22.MEG"
        },
        "update":{
           "currentLocation.id":"drove"
        }
    }
    }]
    
]
```