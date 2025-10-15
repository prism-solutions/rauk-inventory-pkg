# Rauk Inventory SDK

A type-safe TypeScript SDK for inventory management operations with built-in validation and MongoDB-style query support.

## Installation

```bash
npm install @rauk/rauk-inventory
```

## Setup

Initialize the client with your API credentials:

```typescript
import RaukInventory from "rauk-inventory";

const client = new RaukInventory({
    apiKeyId: "your-api-key-id",
    apiSecret: "your-api-secret",
    apiPublicKey: "your-api-public-key",
});
```

## Usage

### Static Method Usage (Singleton Pattern)

After initialization, you can use static methods directly.

```typescript
// Create an item
const newItem = await RaukInventory.create({
    entities: {
        apiId: "item-api-123",
        entityId: "item-entity-456",
        factoryId: "factory-789",
        brandId: "brand-101"
    },
    sku: "ITEM-001",
    packageQuantity: 10,
    color: { name: "Red" },
    currentLocation: { id: "warehouse-1" }
});

// Find items
const items = await RaukInventory.find({
    sku: "ITEM-001"
});

// Update items
const result = await RaukInventory.update(
    { sku: "ITEM-001" },
    { $set: { packageQuantity: 20 } }
);

// Aggregate data
const aggregated = await RaukInventory.aggregate([
    { $match: { "entities.factoryId": "factory-789" } },
    { $group: { _id: "$sku", count: { $sum: 1 } } }
]);
```

### Instance Method Usage

You can also use instance methods:

```typescript
const client = new RaukInventory({
    apiKeyId: "your-api-key-id",
    apiSecret: "your-api-secret",
    apiPublicKey: "your-api-public-key"
});

// Use instance methods
const items = await client.find({ sku: "ITEM-001" });
const item = await client.findOne({ sku: "ITEM-001" });
const result = await client.update({ sku: "ITEM-001" }, { $set: { packageQuantity: 20 } });
```

## API Reference

### CRUD Operations

#### Create
Creates a new inventory item. All required fields must be provided.

```typescript
await RaukInventory.create(item: OperationCreateItem, options?: OperationRequestOptions): Promise<InventoryItem>
```

**Required fields:**
- `entities`: Object containing `factoryId`, `brandId`
- `currentLocation`: Object with location details
- `sku`: Stock keeping unit identifier
- `packageQuantity`: Number of items in package
- `color`: Object with color information
- `brandDetails`: Object with details from the brand
- `factoryDetails`: Object with details from the brand

#### Find
Retrieves multiple items based on query criteria.

```typescript
await RaukInventory.find(query: OperationQuery, options?: OperationRequestOptions): Promise<InventoryItem[]>
```

#### Find One
Retrieves a single item based on query criteria.

```typescript
await RaukInventory.findOne(query: OperationQuery, options?: OperationRequestOptions): Promise<InventoryItem | null>
```

#### Update
Updates items matching the query criteria.

```typescript
await RaukInventory.update(query: OperationQuery, update: OperationUpdateItem, options?: OperationRequestOptions): Promise<OperationUpdateResult>
```

#### Update Many
Updates multiple items matching the query criteria.

```typescript
await RaukInventory.updateMany(query: OperationQuery, update: OperationUpdateItem, options?: OperationRequestOptions): Promise<OperationUpdateResult>
```

#### Delete
Marks items as deleted (soft delete).

```typescript
await RaukInventory.delete(query: OperationQuery, options?: OperationRequestOptions): Promise<OperationDeleteResult>
```

#### Delete One / Delete Many
Delete operations for single or multiple items.

```typescript
await RaukInventory.deleteOne(query: OperationQuery, options?: OperationRequestOptions): Promise<OperationDeleteResult>
await RaukInventory.deleteMany(query: OperationQuery, options?: OperationRequestOptions): Promise<OperationDeleteResult>
```

### Advanced Operations

#### Aggregate
Performs MongoDB-style aggregation operations.

```typescript
await RaukInventory.aggregate(pipeline: OperationAggregatePipeline, options?: OperationRequestOptions): Promise<any[]>
```

**Example aggregation pipeline:**
```typescript
const result = await RaukInventory.aggregate([
    {
        $group: {
            _id: "$sku",
            count: { $sum: 1 },
            totalQuantity: { $sum: "$packageQuantity" }
        }
    },
    { $sort: { count: -1 } }
]);
```

#### Bulk Write
Performs multiple write operations in a single request.

```typescript
await RaukInventory.bulkWrite(operations: OperationBulkWrite, options?: OperationRequestOptions): Promise<any>
```

**Example bulk operations:**
```typescript
const operations = [
    {
        updateOne: {
            filter: { sku: "ITEM-001" },
            update: { $set: { packageQuantity: 20 } }
        }
    },
    {
        insertOne: {
            document: {
                entities: { apiId: "123", entityId: "456", factoryId: "789", brandId: "101" },
                sku: "ITEM-003",
                packageQuantity: 5,
                color: { name: "Blue" },
                currentLocation: { id: "warehouse-2" }
            }
        }
    }
];

const result = await RaukInventory.bulkWrite(operations);
```

#### Update Batch
Simplified batch update interface.

```typescript
await RaukInventory.updateBatch(updates: [OperationQuery, OperationUpdateItem][], options?: OperationRequestOptions): Promise<any>
```

**Example:**
```typescript
const batchUpdates = [
    [{ sku: "ITEM-001" }, { $set: { packageQuantity: 20 } }],
    [{ sku: "ITEM-002" }, { $set: { color: { name: "Blue" } } }]
];

const result = await RaukInventory.updateBatch(batchUpdates);
```

## Query Options

All query operations support optional parameters:

```typescript
interface OperationRequestOptions {
    select?: Record<string, 0 | 1>;      // Field selection
    limit?: number;                       // Limit results
    sort?: Record<string, 1 | -1>;       // Sort order
    includeDeleted?: boolean;             // Include soft-deleted items
}
```

## Type Safety

The SDK provides full TypeScript support with:

- **Compile-time validation** of all operations
- **IntelliSense support** for all methods and parameters
- **Type-safe query builders** with MongoDB-style operators
- **Strict typing** for create, update, and query operations

## Error Handling

The SDK provides structured error handling with specific error types for different scenarios:

### Error Types

- **`RaukValidationError`** - Validation failures with detailed field-level error information
- **`RaukAuthenticationError`** - Authentication/authorization issues (401/403 responses)
- **`RaukNetworkError`** - Network connectivity issues and server errors (5xx responses)
- **`RaukError`** - Base error class for all SDK errors

### Error Structure

```typescript
import {
    isValidationError,
    isAuthenticationError,
    isNetworkError,
    RaukValidationError
} from 'rauk-inventory';

// Handle errors with proper typing
try {
    const items = await RaukInventory.find({ sku: "ITEM-001" });
} catch (error) {
    if (isValidationError(error)) {
        // Access detailed validation errors
        console.log("Validation failed for properties:", error.validationErrors);
        console.log("All error messages:", error.getAllMessages());

        // Get errors for specific property
        const brandErrors = error.getErrorsForProperty("brandDetails");
        console.log("Brand errors:", brandErrors);
    } else if (isAuthenticationError(error)) {
        console.log("Authentication failed:", error.message);
    } else if (isNetworkError(error)) {
        console.log("Network error:", error.message);
    } else {
        console.log("Other error:", error.message);
    }

    // Access common error properties
    console.log("Status code:", error.statusCode);
    console.log("Request ID:", error.requestId);
    console.log("Timestamp:", error.timestamp);
    console.log("Original API response:", error.originalError);
}
```

### Error Response Format

The SDK parses API error responses and converts them into structured TypeScript errors:

```typescript
// API returns:
{
    "success": false,
    "error": {
        "errors": [
            {
                "property": "brandDetails",
                "constraints": [
                    "brandDetails should not be null or undefined"
                ],
                "children": []
            }
        ],
        "name": "ValidationException"
    }
}

// SDK converts to:
const error = new RaukValidationError(
    "Validation failed",
    [
        {
            property: "brandDetails",
            constraints: ["brandDetails should not be null or undefined"],
            children: []
        }
    ],
    { statusCode: 400 }
);
```

## Examples

See the code samples in the method documentation above for comprehensive usage examples.
