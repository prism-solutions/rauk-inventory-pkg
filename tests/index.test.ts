import { RaukInventory, RaukInventoryClient, InventoryItem, OperationCreateItem, OperationQuery } from '../src/index';

describe('RaukInventory', () => {
    const config = {
        apiKeyId: "test-key",
        apiSecret: "test-secret",
        apiPublicKey: "test-public",
        apiBaseUrl: "https://inventory.rauk.local",
    };

    beforeEach(() => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => [{ sku: "ITEM-001", packageQuantity: 10 }],
        } as Response);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        // Reset singleton for clean tests
        (RaukInventory as any).instance = null;
    });

    it('should throw if config is incomplete', () => {
        expect(() => new RaukInventory({ apiKeyId: "", apiSecret: "", apiPublicKey: "" }))
            .toThrow('apiKeyId, apiSecret and apiPublicKey are required');
    });

    it('should throw if instantiated twice', () => {
        new RaukInventory(config);
        expect(() => new RaukInventory(config)).toThrow('RaukInventory is already initialized');
    });

    it('should find items via instance method', async () => {
        const client = new RaukInventory(config);
        const query = { "color.name": "ITEM-001" };
        const items = await client.find(query);
        expect(items).toEqual([{ sku: "ITEM-001", packageQuantity: 10 }]);
        expect(fetch).toHaveBeenCalledWith(
            `${config.apiBaseUrl}/query`,
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(["find", query]),
            })
        );
    });

    it('should find items via static method', async () => {
        new RaukInventory(config);
        const query = { sku: "ITEM-001" };
        const items = await RaukInventory.find(query);
        expect(items).toEqual([{ sku: "ITEM-001", packageQuantity: 10 }]);
        expect(fetch).toHaveBeenCalledWith(
            `${config.apiBaseUrl}/query`,
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(["find", query]),
            })
        );
    });

    it('should throw on static method without initialization', async () => {
        await expect(RaukInventory.find({ sku: "ITEM-001" }))
            .rejects.toThrow('RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.');
    });

    it('should updateBatch via static method', async () => {
        new RaukInventory(config);
        const updates: [OperationQuery, Record<string, any>][] = [
            [{ id: "68e7f70f8d21cb8e86067aff" }, { "color.name": "Traffic Red" }],
        ];
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ ok: true }),
        } as Response);
        const result = await RaukInventory.updateBatch(updates);
        expect(result).toEqual({ ok: true });
    });

    it('should aggregate', async () => {
        new RaukInventory(config);
        const aggregate = await RaukInventory.aggregate([{ $match: { "color.name": "Traffic Red" } }]);
        expect(aggregate).toEqual([{ packageQuantity: 10, sku: "ITEM-001" }]);
    });
});

describe('RaukInventoryClient', () => {
    const config = {
        apiKeyId: "test-key",
        apiSecret: "test-secret",
        apiPublicKey: "test-public",
        apiBaseUrl: "https://inventory.rauk.local",
    };

    beforeEach(() => {
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ sku: "ITEM-002", packageQuantity: 5 }),
        } as Response);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should create an item', async () => {
        const client = new RaukInventoryClient(config);
        const item: OperationCreateItem = {
            entities: { apiId: "123", entityId: "456", factoryId: "789", brandId: "101" },
            sku: "ITEM-002",
            transitTo: { id: "warehouse-2" },
            packageQuantity: 5,
            color: { name: "Blue" },
            currentLocation: { id: "warehouse-2" }
        };
        const result = await client.create(item);
        expect(result).toEqual({ sku: "ITEM-002", packageQuantity: 5 });
    });
});