// Base types with ObjectId replaced by string

// Color types
export interface OperationColor {
    id?: string;
    name?: string;
}

// Deleted types
export interface OperationDeleted {
    status: boolean;
    deletionDate?: string;
}

// Location History Entry types
export interface OperationLocationHistoryEntry {
    id: string;
    name: string;
    date: string;
}

// Status Details types
export interface OperationStatusDetails {
    orderId?: string;
    date?: string;
    temporary?: boolean;
    expiration?: string;
}

// Entities types
export interface OperationEntities {
    apiId?: string;
    entityId?: string;
    factoryId?: string;
    brandId?: string;
}

// Location types
export interface OperationLocation {
    id?: string;
    name?: string;
    details?: Record<string, any>;
}

// Transit To types
export interface OperationTransitTo {
    id?: string;
    client?: string;
}

// Brand Details types
export interface OperationBrandDetails {
    id?: string;
    name?: string;
    type?: string;
    subType?: string;
}

// Factory Details types
export interface OperationFactoryDetails {
    id?: string;
    name?: string;
    type?: string;
    subType?: string;
}

// Availability types
export interface OperationAvailability {
    produced?: OperationStatusDetails;
    reserved?: OperationStatusDetails;
    sold?: OperationStatusDetails;
}

// Base Item types (for create/update operations)
export interface OperationBaseItem {
    hardcode?: string;
    entities?: OperationEntities;
    currentLocation?: OperationLocation;
    transitTo?: OperationTransitTo;
    availability?: OperationAvailability;
    sku?: string;
    packageQuantity?: number;
    color?: OperationColor;
    brandDetails?: OperationBrandDetails;
    factoryDetails?: OperationFactoryDetails;
    deleted?: OperationDeleted;
    locationHistory?: OperationLocationHistoryEntry[];
}

// Create operation types
export interface OperationCreateItem extends OperationBaseItem {
    currentLocation: OperationLocation;
    transitTo: OperationTransitTo;
    entities: OperationEntities;
    sku: string;
    packageQuantity: number;
    color: OperationColor;
    brandDetails?: OperationBrandDetails;
    factoryDetails?: OperationFactoryDetails;
}

// Update operation types
export interface OperationUpdateItem extends OperationBaseItem {
    // entities and locationHistory are excluded from updates
}

// Query operation types (for filtering)
export interface OperationQueryColor {
    name?: string | Record<string, any>;
    id?: string | Record<string, any>;
}

export interface OperationQueryDeleted {
    status?: boolean | Record<string, any>;
    deletionDate?: string | Record<string, any>;
}

export interface OperationQueryEntities {
    apiId?: string | Record<string, any>;
    entityId?: string | Record<string, any>;
    factoryId?: string | Record<string, any>;
    brandId?: string | Record<string, any>;
}

export interface OperationQueryLocation {
    id?: string | Record<string, any>;
    name?: string | Record<string, any>;
    details?: Record<string, any> | Record<string, any>;
}

export interface OperationQueryTransitTo {
    id?: string | Record<string, any>;
    client?: string | Record<string, any>;
}

export interface OperationQueryBrandDetails {
    id?: string | Record<string, any>;
    name?: string | Record<string, any>;
    type?: string | Record<string, any>;
    subType?: string | Record<string, any>;
}

export interface OperationQueryFactoryDetails {
    id?: string | Record<string, any>;
    name?: string | Record<string, any>;
    type?: string | Record<string, any>;
    subType?: string | Record<string, any>;
}

export interface OperationQueryStatusDetails {
    orderId?: string | Record<string, any>;
    date?: string | Record<string, any>;
    temporary?: boolean | Record<string, any>;
    expiration?: string | Record<string, any>;
}

export interface OperationQueryAvailability {
    produced?: OperationQueryStatusDetails;
    reserved?: OperationQueryStatusDetails;
    sold?: OperationQueryStatusDetails;
}

export interface OperationQueryItem {
    id?: string | Record<string, any>;
    hardcode?: string | Record<string, any>;
    entities?: OperationQueryEntities;
    currentLocation?: OperationQueryLocation;
    transitTo?: OperationQueryTransitTo;
    availability?: OperationQueryAvailability;
    sku?: string | Record<string, any>;
    packageQuantity?: number | Record<string, any>;
    color?: OperationQueryColor;
    brandDetails?: OperationQueryBrandDetails;
    factoryDetails?: OperationQueryFactoryDetails;
    deleted?: OperationQueryDeleted;
    locationHistory?: OperationLocationHistoryEntry[];
}

// Query DTO types (for complex queries)
export interface OperationQueryDto extends OperationQueryItem {
    $and?: OperationQueryDto[];
    $or?: OperationQueryDto[];
    $nor?: OperationQueryDto[];
    $not?: OperationQueryDto;
    $in?: any[];
    $nin?: any[];
    $exists?: boolean;
    $regex?: string;
    $options?: string;
    $gt?: any;
    $gte?: any;
    $lt?: any;
    $lte?: any;
    $ne?: any;
    $eq?: any;
    $size?: number;
    $all?: any[];
    $elemMatch?: OperationQueryDto;
    $type?: string | number;
}

// Flexible query type that supports dot notation and any MongoDB operators
export interface OperationFlexibleQuery {
    [key: string]: any | OperationFlexibleQuery | OperationFlexibleQuery[];
}

// Bulk Write operation types
export interface OperationUpdateOne {
    filter: OperationQueryDto;
    update: OperationUpdateItem; // MongoDB update operators like $set, $inc, etc.
}

export interface OperationInsertOne {
    document: OperationCreateItem;
}

export interface OperationDeleteOne {
    filter: OperationQueryDto;
}

export interface OperationReplaceOne {
    filter: OperationQueryDto;
    replacement: OperationCreateItem;
}

// Union type for all possible bulk operations
export type OperationBulkOperation =
    | { updateOne: OperationUpdateOne }
    | { insertOne: OperationInsertOne }
    | { deleteOne: OperationDeleteOne }
    | { replaceOne: OperationReplaceOne };

// The bulk write array
export type OperationBulkWrite = OperationBulkOperation[];

// Aggregate operation types

// Match stage
export interface OperationMatchStage {
    $match: OperationFlexibleQuery;
}

// Group stage
export interface OperationGroupStage {
    $group: {
        _id?: string | { [key: string]: any };
        [key: string]: any;
    };
}

// Sort stage
export interface OperationSortStage {
    $sort: { [key: string]: 1 | -1 };
}

// Project stage
export interface OperationProjectStage {
    $project: { [key: string]: 0 | 1 | { [key: string]: any } };
}

// Limit stage
export interface OperationLimitStage {
    $limit: number;
}

// Skip stage
export interface OperationSkipStage {
    $skip: number;
}

// Unwind stage
export interface OperationUnwindStage {
    $unwind: string | { path: string; includeArrayIndex?: string; preserveNullAndEmptyArrays?: boolean };
}

// AddFields stage
export interface OperationAddFieldsStage {
    $addFields: { [key: string]: any };
}

// Count stage
export interface OperationCountStage {
    $count: string;
}

// Union of all aggregate stages
export type OperationAggregateStage =
    | OperationMatchStage
    | OperationGroupStage
    | OperationSortStage
    | OperationProjectStage
    | OperationLimitStage
    | OperationSkipStage
    | OperationUnwindStage
    | OperationAddFieldsStage
    | OperationCountStage;

// Aggregate DTO - directly an array of stages
export type OperationAggregateDto = OperationAggregateStage[];

// Match stage specific types
export interface OperationMatchQueryDto extends OperationQueryItem {
    $and?: OperationMatchQueryDto[];
    $or?: OperationMatchQueryDto[];
    $nor?: OperationMatchQueryDto[];
    $not?: OperationMatchQueryDto;
}

export interface OperationMatchStageDto {
    $match: OperationMatchQueryDto;
}


// Request Options types
export interface OperationRequestOptions {
    select?: Record<string, 0 | 1>;
    limit?: number;
    sort?: Record<string, 1 | -1>;
    includeDeleted?: boolean;
}

export interface OperationIncludeDeletedOnly {
    includeDeleted?: boolean;
}

// Response types
export interface OperationDeleteResult {
    deletedCount: number;
}

export interface OperationUpdateResult {
    matchedCount: number;
    modifiedCount: number;
    acknowledged: boolean;
}

export interface OperationInsertResult {
    acknowledged: boolean;
    insertedId: string;
}

// Export all operation types
export type OperationTypes = {
    CreateItem: OperationCreateItem;
    UpdateItem: OperationUpdateItem;
    QueryItem: OperationQueryItem;
    QueryDto: OperationQueryDto;
    FlexibleQuery: OperationFlexibleQuery;
    BulkWrite: OperationBulkWrite;
    BulkOperation: OperationBulkOperation;
    UpdateOne: OperationUpdateOne;
    InsertOne: OperationInsertOne;
    DeleteOne: OperationDeleteOne;
    ReplaceOne: OperationReplaceOne;
    AggregateStage: OperationAggregateStage;
    AggregateDto: OperationAggregateDto;
    MatchStageDto: OperationMatchStageDto;
    RequestOptions: OperationRequestOptions;
    IncludeDeletedOnly: OperationIncludeDeletedOnly;
    DeleteResult: OperationDeleteResult;
    UpdateResult: OperationUpdateResult;
    InsertResult: OperationInsertResult;
};
