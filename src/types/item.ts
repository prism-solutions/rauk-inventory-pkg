interface StatusDetails {
  orderId?: string;
  date?: Date;
  temporary?: boolean;
  expiration?: Date;
}

interface Entities {
  readonly apiId: string;
  readonly entityId: string;
  readonly factoryId: string;
  readonly brandId: string;
}

interface Location {
  id?: string;
  name?: string;
  details?: Record<string, any>;
}

interface TransitTo {
  id?: string;
  client?: string;
}

interface BrandDetails {
  id?: string;
  name?: string;
  type?: string;
  subType?: string;
}

interface Color {
  id?: string;
  name: string;
}

interface FactoryDetails {
  id?: string;
  name?: string;
  type?: string;
  subType?: string;
}

interface Deleted {
  status: boolean;
  deletionDate?: Date;
}

interface LocationHistoryEntry {
  id: string;
  name: string;
  date: Date;
}

export interface InventoryItem {
  hardcode?: string;
  readonlyentities: Entities;
  currentLocation: Location;
  transitTo?: TransitTo;
  availability: Map<"produced" | "reserved" | "sold", StatusDetails>;
  sku: string;
  brandDetails?: BrandDetails;
  packageQuantity: number;
  color: Color;
  factoryDetails?: FactoryDetails;
  deleted: Deleted;
  locationHistory?: LocationHistoryEntry[];
  createdAt?: Date;
  updatedAt?: Date;
  readonly id: string;
}
