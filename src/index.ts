import type {
    OperationCreateItem,
    OperationUpdateItem,
    OperationQueryItem,
    OperationBulkWrite,
    OperationAggregateDto,
    OperationMatchStageDto,
    OperationRequestOptions,
    OperationDeleteResult,
    OperationUpdateResult,
    OperationInsertResult
} from './types/operations';
import type { InventoryItem } from './types/item';
import { signRequest } from './utils/api-request';


class RaukInventory {

    private readonly apiKeyId: string;
    private readonly apiSecret: string;
    private readonly apiPublicKey: string;
    private readonly apiBaseUrl: string;

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

    private async request<T = any>(requestArray: any[]): Promise<T> {
        const signedRequest = signRequest({
            apiKeyId: this.apiKeyId,
            apiSecret: this.apiSecret,
            apiPublicKey: this.apiPublicKey,
        }, requestArray);

        try {
            const response = await fetch(`${this.apiBaseUrl}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${signedRequest}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error(response.statusText);
                throw new Error('Failed to request');
            }
            return response.json();

        } catch (error) {
            console.error(error);
            throw new Error('Failed to request');
        }
    }

    /**
     * Create a new inventory item
     */
    public async create(item: OperationCreateItem, options?: OperationRequestOptions): Promise<InventoryItem> {
        const requestArray = options
            ? ["insertOne", item, options]
            : ["insertOne", item];
        return this.request<InventoryItem>(requestArray);
    }

    /**
     * Find multiple inventory items
     */
    public async find(query: OperationQueryItem, options?: OperationRequestOptions): Promise<InventoryItem[]> {
        const requestArray = options
            ? ["find", query, options]
            : ["find", query];
        return this.request<InventoryItem[]>(requestArray);
    }

    /**
     * Find a single inventory item
     */
    public async findOne(query: OperationQueryItem, options?: OperationRequestOptions): Promise<InventoryItem | null> {
        const results = await this.find(query, { ...options, limit: 1 });
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Update inventory items
     */
    public async update(
        query: OperationQueryItem,
        update: OperationUpdateItem,
        options?: OperationRequestOptions
    ): Promise<OperationUpdateResult> {
        const requestArray = options
            ? ["findOneAndUpdate", query, update, options]
            : ["findOneAndUpdate", query, update];
        return this.request<OperationUpdateResult>(requestArray);
    }

    /**
     * Delete inventory items (marks as deleted, doesn't remove)
     */
    public async delete(query: OperationQueryItem, options?: OperationRequestOptions): Promise<OperationDeleteResult> {
        const requestArray = options
            ? ["findOneAndUpdate", query, { deleted: { status: true } }, options]
            : ["findOneAndUpdate", query, { deleted: { status: true } }];
        return this.request<OperationDeleteResult>(requestArray);
    }

    /**
     * Perform aggregation operations
     */
    public async aggregate(pipeline: OperationAggregateDto, options?: OperationRequestOptions): Promise<any[]> {
        const requestArray = options
            ? ["aggregate", pipeline.pipeline, options]
            : ["aggregate", pipeline.pipeline];
        return this.request<any[]>(requestArray);
    }

    /**
     * Bulk write operations
     */
    public async bulkWrite(operations: OperationBulkWrite, options?: OperationRequestOptions): Promise<any> {
        const requestArray = options
            ? ["bulkWrite", operations, options]
            : ["bulkWrite", operations];
        return this.request<any>(requestArray);
    }

    /**
     * Update multiple inventory items
     */
    public async updateMany(
        query: OperationQueryItem,
        update: OperationUpdateItem,
        options?: OperationRequestOptions
    ): Promise<OperationUpdateResult> {
        const requestArray = options
            ? ["updateMany", query, update, options]
            : ["updateMany", query, update];
        return this.request<OperationUpdateResult>(requestArray);
    }

    /**
     * Delete a single inventory item
     */
    public async deleteOne(query: OperationQueryItem, options?: OperationRequestOptions): Promise<OperationDeleteResult> {
        const requestArray = options
            ? ["deleteOne", query, options]
            : ["deleteOne", query];
        return this.request<OperationDeleteResult>(requestArray);
    }

    /**
     * Delete multiple inventory items
     */
    public async deleteMany(query: OperationQueryItem, options?: OperationRequestOptions): Promise<OperationDeleteResult> {
        const requestArray = options
            ? ["deleteMany", query, options]
            : ["deleteMany", query];
        return this.request<OperationDeleteResult>(requestArray);
    }
}

// Export operation types
export * from './types/operations';

// Export item types
export * from './types/item';

export default RaukInventory;