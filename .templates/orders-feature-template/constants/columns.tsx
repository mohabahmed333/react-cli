import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { ColumnDef, Table, Row } from "@tanstack/react-table";
import { TOrder, OrderStatus } from "../types/Orders";
import Tooltip from "@/shared/components/Customtooltip/Customtooltip";
 

// Define the type for the click handlers
interface GetOrderColumnsProps {
  onCustomerNameClick: (customer: { name: string; phone: string }) => void;
  onOrderIdClick: (order: TOrder) => void;
}

// Extend the Row type to include the methods we need
type TableRow = Row<TOrder> & {
  getIsSelected: () => boolean;
  toggleSelected: (value: boolean) => void;
  original: TOrder;
};

interface StatusColors {
  [key: string]: string;
  Processing: string;
  Cancelled: string;
  Delivered: string;
}
// exclude this from eslint max-lines-per-function
/* eslint-disable max-lines-per-function */
 
export const getOrderColumns = ({
  onCustomerNameClick,
  onOrderIdClick
}: GetOrderColumnsProps): ColumnDef<TOrder>[] => {
  const isRTL = false;
  const directionClass = isRTL ? 'rtl' : 'ltr';

  // Format date to display as "15 January 2024"
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Define cell renderers with proper types
  const renderOrderIdCell = ({ row }: { row: TableRow }) => (
    <div className={`self-stretch flex items-center gap-2 ${directionClass}`}>
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="w-4 h-4 relative bg-background border cursor-pointer"
      />
      <button
        className="whitespace-nowrap text-foreground text-left hover:underline cursor-pointer pl-2"
        onClick={(e) => {
          e.stopPropagation();
          onOrderIdClick(row.original);
        }}
      >
        <Tooltip maxLength={20}>{row.original.orderId}</Tooltip>
      </button>
    </div>
  );

  const renderCustomerCell = ({ row }: { row: TableRow }) => {
    const { customer } = row.original;
    return (
      <div className="self-stretch flex flex-col">
        <button
          className="text-foreground text-sm cursor-pointer font-medium text-left hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            onCustomerNameClick(customer);
          }}
        >
          <Tooltip maxLength={20}>{customer.name}</Tooltip>
        </button>
        <div className="text-muted-foreground text-xs">
          {customer.phone}
        </div>
      </div>
    );
  };

  const renderAmountCell = ({ row }: { row: TableRow }) => (
    <div className="self-stretch text-foreground text-sm">
      {row.original.amount.toLocaleString()} KWD
    </div>
  );

  const renderStatusCell = ({ row }: { row: TableRow }) => {
    const { status } = row.original;
    const statusColors: StatusColors = {
      [OrderStatus.Processing]: 'bg-gray-50 text-accent-foreground',
      [OrderStatus.Cancelled]: 'bg-red-50 text-red-700',
      [OrderStatus.Delivered]: 'bg-green-50 text-green-700',
    };

    return (
      <div className="self-stretch">
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </div>
    );
  };

  const renderDateCell = ({ row }: { row: TableRow }) => (
    <div className="self-stretch text-foreground text-sm">
      {formatDate(row.original.date)}
    </div>
  );

  const renderActionsCell = ({ row }: { row: TableRow }) => {
    const order = row.original;
    return (
      <div className={`self-stretch ml-auto   justify-end flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
        <DropdownMenu >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="self-stretch  h-8 w-8 p-0"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isRTL ? "start" : "end"} className="bg-background">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.id)}
            >
              Copy Order ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Order Details</DropdownMenuItem>
            <DropdownMenuItem>Update Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };
  return [
    {
      id: "select",
      accessorKey: "orderId",
      header: ({ table }: { table: Table<TOrder> }) => (
        <div className={`self-stretch text-sm font-semibold flex items-center gap-2 ${directionClass}`}>
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="w-4 h-4 relative bg-background border cursor-pointer"
          />
          <div className="p-2 text-muted-foreground   rounded-md">
            Order ID
          </div>
        </div>
      ),
      cell: renderOrderIdCell,
      enableSorting: false,

    },
    {
      accessorKey: "customer",
      header: () => (
        <div className={`self-stretch text-sm font-semibold ${directionClass}`}>
          Customer
        </div>
      ),
      cell: renderCustomerCell,
      enableSorting: true,
    },
    {
      accessorKey: "amount",
      enableSorting: true,
      header: () => (
        <div className={`self-stretch text-sm font-semibold ${directionClass}`}>
            Amount
        </div>
      ),
      cell: renderAmountCell,
      
    },
    {
      accessorKey: "status",
      enableSorting: false,
      header: () => (
        <div className={`self-stretch text-sm font-semibold ${directionClass}`}>
          Status
        </div>
      ),
      cell: renderStatusCell,

    },
    {
      accessorKey: "date",
      enableSorting: true,
      header: () => (
        <div className={`self-stretch text-sm font-semibold ${directionClass}`}>
            Date
        </div>
      ),
      cell: renderDateCell,

    },
    {
      id: "actions",
      enableHiding: false,
      cell: renderActionsCell,
      size: 20,

    },
  ];
};


