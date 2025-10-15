import type {
    OperationCreateItem,
    OperationUpdateItem,
    OperationQuery,
    OperationBulkWrite,
    OperationBulkOperation,
    OperationUpdateOne,
    OperationAggregatePipeline,
    OperationMatchStage,
    OperationRequestOptions,
    OperationDeleteResult,
    OperationUpdateResult,
    OperationInsertResult
} from '../types/operations';
import type { InventoryItem } from '../types/item';
import { signRequest } from '../utils/sign-request';

class RaukInventoryClient {

    protected readonly apiKeyId: string;
    protected readonly apiSecret: string;
    protected readonly apiPublicKey: string;
    protected readonly apiBaseUrl: string;

    constructor({
        apiKeyId,
        apiSecret,
        apiPublicKey,
        apiBaseUrl = 'https://inventory.rauk.app',
    }: {
        apiKeyId: string;
        apiSecret: string;
        apiPublicKey: string;
        apiBaseUrl?: string;
    }) {
        if (!apiKeyId || !apiSecret || !apiPublicKey) {
            throw new Error('apiKeyId, apiSecret and apiPublicKey are required');
        }

        this.apiKeyId = apiKeyId;
        this.apiSecret = apiSecret;
        this.apiPublicKey = apiPublicKey;
        this.apiBaseUrl = apiBaseUrl;

    }

    protected async request<T = any>(requestArray: any[]): Promise<T> {
        const signedRequest = signRequest({
            apiKeyId: this.apiKeyId,
            apiSecret: this.apiSecret,
            apiPublicKey: this.apiPublicKey,
        }, requestArray);

        try {
            const response = await fetch(`${this.apiBaseUrl}/query`, {
                method: 'POST',
                body: JSON.stringify(requestArray),
                headers: {
                    'Rai-Signature': signedRequest,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error(response.statusText);
                const jsonError: { error: { message: string, [key: string]: any } } = await response.json();
                console.error(jsonError);
                throw new Error(jsonError.error?.message);
            }
            return response.json();
        } catch (error) {
            console.error(error);
            throw new Error('Failed to request');
        }
    }

    /**
     * Create a new inventory item
     * @example
     * // Basic item creation
     * const newItem = await raukInventory.create({
     *   entities: {
     *     apiId: "item-api-123",
     *     entityId: "item-entity-456",
     *     factoryId: "factory-789",
     *     brandId: "brand-101"
     *   },
     *   sku: "ITEM-001",
     *   packageQuantity: 10,
     *   color: { name: "Red" },
     *   currentLocation: { id: "warehouse-1" }
     * });
     *
     * // With options
     * const newItemWithOptions = await raukInventory.create({
     *   entities: { apiId: "123", entityId: "456", factoryId: "789", brandId: "101" },
     *   sku: "ITEM-002",
     *   packageQuantity: 5,
     *   color: { name: "Blue" },
     *   currentLocation: { id: "warehouse-2" }
     * }, {
     *   select: { sku: 1, color: 1 }
     * });
     */
    public async create(item: OperationCreateItem, options?: OperationRequestOptions): Promise<InventoryItem> {
        const requestArray = options
            ? ["insertOne", item, options]
            : ["insertOne", item];
        return this.request<InventoryItem>(requestArray);
    }

    /**
     * Find multiple inventory items
     * @example
     * // Find items by SKU
     * const items = await raukInventory.find({
     *   sku: "ITEM-001"
     * });
     *
     * // Find items with structured query
     * const items = await raukInventory.find({
     *   entities: { factoryId: "factory-789" },
     *   packageQuantity: { $gte: 10 }
     * }, {
     *   limit: 20,
     *   sort: { createdAt: -1 },
     *   select: { sku: 1, packageQuantity: 1, color: 1 }
     * });
     */
    public async find(query: OperationQuery, options?: OperationRequestOptions): Promise<InventoryItem[]> {
        const requestArray = options
            ? ["find", query, options]
            : ["find", query];
        return this.request<InventoryItem[]>(requestArray);
    }

    /**
     * Find a single inventory item
     * @example
     * // Find one item by SKU
     * const item = await raukInventory.findOne({
     *   sku: "ITEM-001"
     * });
     *
     * // Find one item with options
     * const item = await raukInventory.findOne({
     *   entities: { factoryId: "factory-789" }
     * }, {
     *   select: { sku: 1, color: 1, packageQuantity: 1 }
     * });
     */
    public async findOne(query: OperationQuery, options?: OperationRequestOptions): Promise<InventoryItem | null> {
        const results = await this.find(query, { ...options, limit: 1 });
        return results.length > 0 ? results[0] : null;
    }


    /**
     * Update inventory items
     * @example
     * // Update one item by SKU
     * const result = await raukInventory.update(
     *   { sku: "ITEM-001" },
     *   { $set: { packageQuantity: 20, currentLocation: { id: "warehouse-2" } } }
     * );
     *
     * // Update with options
     * const result = await raukInventory.update(
     *   { entities: { factoryId: "factory-789" } },
     *   { $set: { color: { name: "Blue" } } },
     *   { select: { sku: 1, color: 1 } }
     * );
     */
    public async update(
        query: OperationQuery,
        update: Record<string, any>,
        options?: OperationRequestOptions
    ): Promise<OperationUpdateResult> {
        const requestArray = options
            ? ["findOneAndUpdate", query, update, options]
            : ["findOneAndUpdate", query, update];
        return this.request<OperationUpdateResult>(requestArray);
    }

    /**
     * Delete inventory items (marks as deleted, doesn't remove)
     * @example
     * // Mark items as deleted by SKU
     * const result = await raukInventory.delete({
     *   sku: "ITEM-001"
     * });
     *
     * // Mark multiple items as deleted
     * const result = await raukInventory.delete({
     *   entities: { factoryId: "factory-789" }
     * }, {
     *   select: { sku: 1, deleted: 1 }
     * });
     */
    public async delete(query: OperationQuery, options?: OperationRequestOptions): Promise<OperationDeleteResult> {
        const requestArray = options
            ? ["findOneAndUpdate", query, { deleted: { status: true } }, options]
            : ["findOneAndUpdate", query, { deleted: { status: true } }];
        return this.request<OperationDeleteResult>(requestArray);
    }

    /**
     * Perform aggregation operations
     * @example
     * await raukInventory.aggregate([
     *   { $match: { "entities.factoryId": "factory-123" } },
     *   { $group: { _id: "$sku", count: { $sum: 1 } } },
     *   { $sort: { count: -1 } }
     * ]);
     */
    public async aggregate(pipeline: OperationAggregatePipeline, options?: OperationRequestOptions): Promise<any[]> {
        const requestArray = options
            ? ["aggregate", pipeline, options]
            : ["aggregate", pipeline];
        return this.request<any[]>(requestArray);
    }

    /**
     * Bulk write operations
     * @example
     * // Multiple update operations
     * const operations = [
     *   {
     *     updateOne: {
     *       filter: { sku: "ITEM-001" },
     *       update: { packageQuantity: 20 }
     *     }
     *   },
     *   {
     *     updateOne: {
     *       filter: { sku: "ITEM-002" },
     *       update: { currentLocation: { id: "warehouse-2" } }
     *     }
     *   }
     * ];
     * const result = await raukInventory.bulkWrite(operations, {
     *   includeDeleted: false
     * });
     */
    public async bulkWrite(operations: OperationBulkWrite, options?: OperationRequestOptions): Promise<any> {
        const requestArray = options
            ? ["bulkWrite", operations, options]
            : ["bulkWrite", operations];
        return this.request<any>(requestArray);
    }

    /**
     * Update multiple inventory items
     * @example
     * // Update all items from a specific factory
     * const result = await raukInventory.updateMany(
     *   { "entities.factoryId": "factory-789" },
     *   { $set: { currentLocation: { id: "warehouse-2" } } }
     * );
     *
     * // Update with options
     * const result = await raukInventory.updateMany(
     *   { packageQuantity: { $lte: 10 } },
     *   { $set: { packageQuantity: 20 } },
     *   { select: { sku: 1, packageQuantity: 1 } }
     * );
     */
    public async updateMany(
        query: OperationQuery,
        update: Record<string, any>,
        options?: OperationRequestOptions
    ): Promise<OperationUpdateResult> {
        const requestArray = options
            ? ["updateMany", query, update, options]
            : ["updateMany", query, update];
        return this.request<OperationUpdateResult>(requestArray);
    }

    /**
     * Delete a single inventory item
     * @example
     * // Delete one item by SKU
     * const result = await raukInventory.deleteOne({
     *   sku: "ITEM-001"
     * });
     *
     * // Delete with options
     * const result = await raukInventory.deleteOne({
     *   entities: { factoryId: "factory-789" }
     * }, {
     *   select: { sku: 1 }
     * });
     */
    public async deleteOne(query: OperationQuery, options?: OperationRequestOptions): Promise<OperationDeleteResult> {
        const requestArray = options
            ? ["deleteOne", query, options]
            : ["deleteOne", query];
        return this.request<OperationDeleteResult>(requestArray);
    }

    /**
     * Delete multiple inventory items
     * @example
     * // Delete all items from a factory
     * const result = await raukInventory.deleteMany({
     *   entities: { factoryId: "factory-789" }
     * });
     *
     * // Delete with options
     * const result = await raukInventory.deleteMany({
     *   packageQuantity: { $lte: 5 }
     * }, {
     *   select: { sku: 1, packageQuantity: 1 }
     * });
     */
    public async deleteMany(query: OperationQuery, options?: OperationRequestOptions): Promise<OperationDeleteResult> {
        const requestArray = options
            ? ["deleteMany", query, options]
            : ["deleteMany", query];
        return this.request<OperationDeleteResult>(requestArray);
    }


    /**
     * Batch update multiple items with a simplified interface
     * This is a wrapper around the bulkWrite method
     * @example
     * // Update multiple items in batch
     * const batchUpdates = [
     *   [{ sku: "ITEM-001" }, { packageQuantity: 20 } ],
     *   [{ sku: "ITEM-002" }, { currentLocation: { id: "warehouse-2" } } ],
     *   [{ entities: { factoryId: "factory-789" } }, { color: { name: "Blue" } } ]
     * ];
     * const result = await raukInventory.updateBatch(batchUpdates);
     */
    public async updateBatch(updates: [OperationQuery, Record<string, any>][], options?: OperationRequestOptions): Promise<any> {
        const bulkOperations = updates.map(([query, update]) => ({
            updateOne: {
                filter: query,
                update: update
            }
        }));
        return this.bulkWrite(bulkOperations, options);
    }
}




// Export the class for users who want to instantiate directly
export { RaukInventoryClient };