import { ColumnDef } from "@tanstack/react-table";
export enum InventoryStatus {
  Active = "active",
  Inactive = "inactive",
}
export type Tinventory = {
  productName: string;
  sku: string;
  price: string;
  category: string;
};
export type Tinventory_updated = {
  id: string,
  itemName: string,
  sku: string,
  stock: number,
  price: number,
  category:string,
  status: InventoryStatus,
  expireDate?: Date | null
};

export type InventoryColumnType = ColumnDef<Tinventory_updated>[];