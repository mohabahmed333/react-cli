import { ColumnDef } from "@tanstack/react-table";

export enum Mohabtatus {
  Processing = "Processing",
  Cancelled = "Cancelled",
  Delivered = "Delivered"
}

export interface Customer {
  name: string;
  phone: string;
}

export interface TOrder {
  id: string;
  orderId: string;
  customer: Customer;
  amount: number;
  status: Mohabtatus;
  date: Date;
  branch?:string
}

export type OrderColumnType = ColumnDef<TOrder>[];
