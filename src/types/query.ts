import { InventoryItem } from "./item";

type DotNotationPaths<T, Prefix extends string = ''> = T extends object
    ? {
        [K in keyof T & string]: T[K] extends object
        ? `${Prefix}${K}` | DotNotationPaths<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
    : never;

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
    // Add other operators as needed
}

// Map InventoryItem fields to their types
type InventoryItemFieldValues = {
    [K in DotNotationPaths<InventoryItem>]: K extends keyof InventoryItem
    ? InventoryItem[K]
    : K extends `${infer P}.${infer Q}`
    ? P extends keyof InventoryItem
    ? Q extends keyof InventoryItem[P]
    ? InventoryItem[P][Q]
    : never
    : never
    : never;
};

// Flexible query type supporting dot notation and operators
export type OperationQuery = {
    [K in DotNotationPaths<InventoryItem>]?: InventoryItemFieldValues[K] | MongoOperator<InventoryItemFieldValues[K]>;
} & {
    $or?: OperationQuery[];
    $and?: OperationQuery[];
    $nor?: OperationQuery[];
    $not?: OperationQuery;
    $in?: any[];
    $nin?: any[];
    $exists?: boolean;
    $regex?: string;
    $options?: string;
    $elemMatch?: OperationQuery;
    $size?: number;
    $type?: string | number;
    $mod?: [number, number];
    $text?: {
        $search: string;
        $language?: string;
        $caseSensitive?: boolean;
        $diacriticSensitive?: boolean;
    };
    $gt?: any;
    $gte?: any;
    $lt?: any;
    $lte?: any;
    $ne?: any;
    $eq?: any;
    $all?: any[];
    $expr?: Record<string, any>;
    // Add other logical operators as needed
};