import type { InventoryItem } from "./item";
import type { InventoryItemFieldValues, DotNotationPaths } from "./parser";
// MongoDB operator types
interface MongoOperator<T> {
    $eq?: T;
    $ne?: T;
    $gt?: T extends number ? number : never;
    $gte?: T extends number ? number : never;
    $lt?: T extends number ? number : never;
    $lte?: T extends number ? number : never;
    $in?: T[];
    $nin?: T[];
    $exists?: boolean;
    $regex?: string;
    $options?: string;
    $elemMatch?: Record<string, any>;
    $size?: number;
    $type?: string | number;
    $mod?: [number, number];
    $text?: {
        $search: string;
        $language?: string;
        $caseSensitive?: boolean;
        $diacriticSensitive?: boolean;
    };
    $expr?: Record<string, any>;
    // Add other operators as needed
}



// Flexible query type supporting dot notation and operators
export type OperationQuery = {
    [K in DotNotationPaths<InventoryItem>]?: InventoryItemFieldValues[K] | MongoOperator<InventoryItemFieldValues[K]>;
} & {
    $or?: OperationQuery[];
    $and?: OperationQuery[];
    $nor?: OperationQuery[];
    $not?: OperationQuery;
};