import { RaukInventory, RaukInventoryClient } from "../src/index";
import type {
  OperationCreateItem,
  OperationQuery,
  OperationUpdateItem,
} from "../src/types/operations";
import {
  RaukValidationError,
  RaukAuthenticationError,
  RaukNetworkError,
  isValidationError,
  isAuthenticationError,
  isNetworkError,
} from "../src/utils/errors";

describe("RaukInventory", () => {
  const config = {
    apiKeyId: "test-key",
    apiSecret: "test-secret",
    apiPublicKey: "test-public",
    apiBaseUrl: "https://inventory.rauk.local",
  };

  beforeEach(() => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [{ sku: "ITEM-001", packageQuantity: 10 }],
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Reset singleton for clean tests
    (RaukInventory as any).instance = null;
  });

  it("should throw if config is incomplete", () => {
    expect(
      () => new RaukInventory({ apiKeyId: "", apiSecret: "", apiPublicKey: "" })
    ).toThrow("apiKeyId, apiSecret and apiPublicKey are required");
  });

  it("should throw if instantiated twice", () => {
    new RaukInventory(config);
    expect(() => new RaukInventory(config)).toThrow(
      "RaukInventory is already initialized"
    );
  });

  it("should find items via instance method", async () => {
    const client = new RaukInventory(config);
    const query = { "color.name": "ITEM-001" };
    const items = await client.find(query);
    expect(items).toEqual([{ sku: "ITEM-001", packageQuantity: 10 }]);
    expect(fetch).toHaveBeenCalledWith(
      `${config.apiBaseUrl}/query`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(["find", query]),
      })
    );
  });

  it("should find items via static method", async () => {
    new RaukInventory(config);
    const query = { sku: "ITEM-001" };
    const items = await RaukInventory.find(query);
    expect(items).toEqual([{ sku: "ITEM-001", packageQuantity: 10 }]);
    expect(fetch).toHaveBeenCalledWith(
      `${config.apiBaseUrl}/query`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(["find", query]),
      })
    );
  });

  it("should throw on static method without initialization", async () => {
    await expect(RaukInventory.find({ sku: "ITEM-001" })).rejects.toThrow(
      'RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.'
    );
  });

  it("should updateBatch via static method", async () => {
    new RaukInventory(config);
    const updates: [OperationQuery, OperationUpdateItem][] = [
      [{ id: "68e7f70f8d21cb8e86067aff" }, { "color.name": "Traffic Red" }],
    ];
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);
    const result = await RaukInventory.updateBatch(updates);
    expect(result).toEqual({ ok: true });
  });

  it("should aggregate", async () => {
    new RaukInventory(config);
    const aggregate = await RaukInventory.aggregate([
      { $match: { "color.name": "Traffic Red" } },
    ]);
    expect(aggregate).toEqual([{ packageQuantity: 10, sku: "ITEM-001" }]);
  });

  it("should throw RaukValidationError for validation failures", async () => {
    new RaukInventory(config);

    // Mock fetch to return validation error response
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        error: {
          errors: [
            {
              property: "brandDetails",
              constraints: ["brandDetails should not be null or undefined"],
              children: [],
            },
            {
              property: "factoryDetails",
              constraints: ["factoryDetails should not be null or undefined"],
              children: [],
            },
          ],
          name: "ValidationException",
        },
      }),
    } as Response);

    await expect(RaukInventory.find({ sku: "INVALID" })).rejects.toThrow(
      RaukValidationError
    );

    try {
      await RaukInventory.find({ sku: "INVALID" });
    } catch (error) {
      expect(isValidationError(error)).toBe(true);
      if (isValidationError(error)) {
        expect(error.validationErrors).toHaveLength(2);
        expect(error.getAllMessages()).toEqual([
          "brandDetails should not be null or undefined",
          "factoryDetails should not be null or undefined",
        ]);
        expect(error.getErrorsForProperty("brandDetails")).toHaveLength(1);
        expect(error.getErrorsForProperty("factoryDetails")).toHaveLength(1);
        expect(error.statusCode).toBe(400);
        expect(error.originalError).toBeDefined();
      }
    }
  });

  it("should throw RaukAuthenticationError for auth failures", async () => {
    new RaukInventory(config);

    // Mock fetch to return authentication error
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        error: {
          message: "Invalid API credentials",
          name: "AuthenticationError",
        },
      }),
    } as Response);

    await expect(RaukInventory.find({ sku: "TEST" })).rejects.toThrow(
      RaukAuthenticationError
    );

    try {
      await RaukInventory.find({ sku: "TEST" });
    } catch (error) {
      expect(isAuthenticationError(error)).toBe(true);
      if (isAuthenticationError(error)) {
        expect(error.message).toContain("Invalid API credentials");
        expect(error.statusCode).toBe(401);
      }
    }
  });

  it("should throw RaukNetworkError for server errors", async () => {
    new RaukInventory(config);

    // Mock fetch to return server error
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        error: {
          message: "Internal server error",
          name: "ServerError",
        },
      }),
    } as Response);

    await expect(RaukInventory.find({ sku: "TEST" })).rejects.toThrow(
      RaukNetworkError
    );

    try {
      await RaukInventory.find({ sku: "TEST" });
    } catch (error) {
      expect(isNetworkError(error)).toBe(true);
      if (isNetworkError(error)) {
        expect(error.message).toContain("Internal server error");
        expect(error.statusCode).toBe(500);
      }
    }
  });

  it("should handle network failures gracefully", async () => {
    new RaukInventory(config);

    // Mock fetch to throw a network error
    jest
      .spyOn(global, "fetch")
      .mockRejectedValue(new TypeError("fetch failed"));

    await expect(RaukInventory.find({ sku: "TEST" })).rejects.toThrow(
      RaukNetworkError
    );

    try {
      await RaukInventory.find({ sku: "TEST" });
    } catch (error) {
      expect(isNetworkError(error)).toBe(true);
      if (isNetworkError(error)) {
        expect(error.message).toContain("Network request failed");
        expect(error.context?.originalError).toBe("fetch failed");
      }
    }
  });

  it("should update config via static setConfig method", async () => {
    const client = new RaukInventory(config);

    // Update config
    const newConfig = {
      apiKeyId: "new-key",
      apiSecret: "new-secret",
      apiPublicKey: "new-public",
      apiBaseUrl: "https://inventory.rauk.new",
    };

    RaukInventory.setConfig(newConfig);

    // Make a request to verify new config is used
    await RaukInventory.find({ sku: "TEST" });

    expect(fetch).toHaveBeenCalledWith(
      `${newConfig.apiBaseUrl}/query`,
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("should update config via instance setConfig method", async () => {
    const client = new RaukInventory(config);

    // Update config via instance
    const newConfig = {
      apiKeyId: "updated-key",
      apiSecret: "updated-secret",
      apiPublicKey: "updated-public",
      apiBaseUrl: "https://inventory.rauk.updated",
    };

    client.setConfig(newConfig);

    // Make a request to verify new config is used
    await client.find({ sku: "TEST" });

    expect(fetch).toHaveBeenCalledWith(
      `${newConfig.apiBaseUrl}/query`,
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("should throw on static setConfig without initialization", () => {
    expect(() =>
      RaukInventory.setConfig({
        apiKeyId: "key",
        apiSecret: "secret",
        apiPublicKey: "public",
      })
    ).toThrow(
      'RaukInventory must be initialized with "new RaukInventory(config)" before calling static methods.'
    );
  });
});

describe("RaukInventoryClient", () => {
  const config = {
    apiKeyId: "test-key",
    apiSecret: "test-secret",
    apiPublicKey: "test-public",
    apiBaseUrl: "https://inventory.rauk.local",
  };

  beforeEach(() => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ sku: "ITEM-002", packageQuantity: 5 }),
    } as Response);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should create an item", async () => {
    const client = new RaukInventoryClient(config);
    const item: OperationCreateItem = {
      entities: { factoryId: "789", brandId: "101" },
      sku: "ITEM-002",
      transitTo: { id: "warehouse-2" },
      packageQuantity: 5,
      color: { name: "Blue", id: "101" },
      currentLocation: { id: "warehouse-2" },
      brandDetails: { id: "101", name: "Brand 1", type: "Brand" },
      factoryDetails: { id: "789", type: "Factory" },
    };
    const result = await client.create(item);
    expect(result).toEqual({ sku: "ITEM-002", packageQuantity: 5 });
  });
});
