import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { InventoryColumnType, InventoryStatus } from "../types/Tinventory";
import { MoreHorizontal, AlertCircle } from "lucide-react";
import Tooltip from '@/shared/components/Customtooltip/Customtooltip';
/* eslint-disable max-lines-per-function */

// disable eslint for the next line
export const getInventoryColumns = (): InventoryColumnType => {
  // const { t } = useTranslation('', {
  //   keyPrefix: "inventory",
  // }
  // );

  const isRTL = false;
  const directionClass = isRTL ? 'rtl' : 'ltr';

  return [
    {
      id: "select",
      accessorKey: "itemName",
      size:200,
      header: ({ table }) => (
        <div className={`self-stretch flex items-center gap-2 ${directionClass}`}>
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="w-4 h-4 relative bg-background border"
          />
          <div className="p-2 text-muted-foreground">
            Item Name
          </div>
        </div>
      ),
      cell: ({ row }) => (
        <div className={`self-stretch max-w-[150px]  cursor-pointer text-foreground text-sm font-normal flex items-center gap-2 ${directionClass}`}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="w-4 h-4 relative bg-background border"
          />
          <div className="whitespace-nowrap ml-2 max-w-[150px]">
            <Tooltip maxLength={20}>
              {row.original.itemName}
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "sku",
      header: () => (
        <div className="self-stretch ">
          SKU
        </div>
      ),
      cell: ({ row }) => (
        <div className="self-stretch  capitalize">
          <Tooltip maxLength={20}>{row.getValue("sku")}</Tooltip>
        </div>
      ),
      enableSorting: false,
    },



    {
      accessorKey: "category",
      enableSorting: false,
      header: () => (
        <div className="self-stretch ">
          Category
        </div>
      ),
      cell: ({ row }) => (
        <div className="self-stretch  capitalize">
          {row.getValue("category")}
        </div>
      ),
    },
    {
      accessorKey: "expireDate",
      enableSorting: true,
      header: () => (
        <div className="self-stretch">
          Expire Date
        </div>
      ),
      cell: ({ row }) => {
        const {expireDate} = row.original;
        return (
          <div className="self-stretch">
            {expireDate ? expireDate.toLocaleDateString() : "N/A"}
          </div>
        );
      },
    },

    {
      accessorKey: "stock",
      enableSorting: true,
      header: () => (
        <div className="self-stretch">
          Stock
        </div>
      ),
      cell: ({ row }) => {
        const stock = Number(row.getValue("stock"));
        if (stock === 0) {
          return (
            <div className="self-stretch flex items-center">
              <div className="h-9 px-3 bg-secondary rounded-md flex items-center">
                <div className="text-muted-foreground text-sm font-medium leading-tight">
                  Out of Stock
                </div>
              </div>
            </div>
          );
        }
        if (stock < 10) {
          return (
            <div className="self-stretch flex items-center gap-1">
              <span className="text-destructive text-sm font-medium">
                {stock.toString().padStart(2, '0')}
              </span>
              <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
            </div>
          );
        }

        // Normal stock
        return (
          <div className="self-stretch">
            {stock} Units
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      enableSorting: false,
      header: () => (
        <div className="self-stretch ">
          Price
        </div>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"));

        return (
          <div className={`self-stretch  ${isRTL ? 'text-right' : 'text-left'}`}>
            {amount + " " + "USD"}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      enableSorting: false,
      header: () => (
        <div className="self-stretch ">
          Status
        </div>
      ),
      cell: ({ row }) => {
        const isActive = row.original.status === InventoryStatus.Active;
        return (
          <div className={`self-stretch  flex items-center space-x-2 ${directionClass}`}>
            <Switch
              id="status-switch"
              checked={isActive}
              onCheckedChange={(value) => {
                // CHANGE the status logic here
                row.original.status = value ? InventoryStatus.Active : InventoryStatus.Inactive;
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="self-stretch justify-start text-foreground text-sm font-medium">
              {isActive ? "Active" : "Inactive"}
            </div>
          </div>
        );
      },
    },
    {
      size: 40,
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const inventoryItem = row.original;
        return (
          <div className={`self-stretch ml-auto  flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="self-stretch  h-8 w-8 p-0"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"}>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(inventoryItem.id)}
                >
                  Copy Item ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View Item Details</DropdownMenuItem>
                <DropdownMenuItem>Edit Inventory</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
};
