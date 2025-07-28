import { useCallback, useRef } from "react";
import { TableFilters } from "@/shared/components/tables/PaginatedTable/components/customfilters";
import { TOrder } from "./types/Products";
import { getOrderColumns } from "./constants/columns";
import { FilterItems } from "./constants/filters";
import { initialFilters } from "./constants/intialFilterData";
import { ColumnDef, Table as TableType } from "@tanstack/react-table";
import CustomerDetails from "../models/customerDetails";
import OrderDetailsModel from "../models/OrderDetails/OrderDetails";
import { useCustomerModal, useOrderModal, useOrdersData } from "./hooks";
import { ClipboardList } from "lucide-react";
import Table from "../tables";
import { FilterItem } from "../tables/PaginatedTable/components/customfilters/types/FilterItem";
import { FilterObject } from "../tables/PaginatedTable/components/customfilters/utils";
import { IFilterType } from "./types/filterType";
import { PageHeaderClassNames } from "../pageHeader/types";

const OrdersView = <T extends FilterObject>({
    columnsProp,
    data,
    pageName = "Products",
    enableExport = true,
    filters = FilterItems,
    initialFilterItems = 
    initialFilters as T extends IFilterType ? T : never,
    pageHeaderClassNames
}: {
    columnsProp?: ColumnDef<TOrder>[];
    data?: TOrder[];
    pageName?: string;
    enableExport?: boolean;
    height?: string;
    filters?: FilterItem[];
    initialFilterItems?: T;
    pageHeaderClassNames?: PageHeaderClassNames;
}) => {
    // Custom hooks
    const { loading, data: orderData } = useOrdersData(data);
    const { customerModal, openCustomerModal, closeCustomerModal }
        = useCustomerModal();
    const { orderModal, openOrderModal, closeOrderModal } =
        useOrderModal();

    // Refs
    const tableRef = useRef<TableType<TOrder> | null>(null);

    // Table handlers
    const handleExport = useCallback((selectedItems: TOrder[]) => {
        console.log("Exporting selected rows:", selectedItems);
    }, []);

    // Computed values
    const columns = columnsProp || getOrderColumns({
        onCustomerNameClick: openCustomerModal,
        onOrderIdClick: openOrderModal
    });
    //   fetchFn={() => Promise.resolve({ data: inventoryData, meta: { totalRowCount: inventoryData.length } })}
    const fetchOrders = () => {
        return Promise.resolve({ data: orderData, meta: { totalRowCount: orderData.length } });
    }
    const filtersItems = filters || FilterItems;
    const initialFiltersItem = initialFilterItems || initialFilters;
    return (
        <div className="self-stretch bg-background ">
            <div className="py-4  ">
                <Table<TOrder>
                    mode="infinite"
                    name="Products"
                    loading={loading}
                    columns={columns}
                    fetchFn={fetchOrders}
                    tableRef={tableRef}
                    queryKey="Products"
                    EmptyIconProp={<ClipboardList className="size-12 font-thin text-gray-500" />}
                    fetchSize={5}
                    estimateSize={() => 5}
                    overscan={5}
                    classNames={{
                        containerClassName: "!h-[calc(100vh-170px)]",
                   
                    }}

                >
                    {enableExport && (
                        <Table.PageHeader<TOrder> pageName={pageName} classNames={pageHeaderClassNames} />
                    )}
                    <TableFilters>
                        <TableFilters.searchInput
                            mode="uncontrolled"
                            param="search"
                            placeholder="Search by ID, Customer name / number..."
                            className="w-96"
                        />
                        <TableFilters.ModelFilter
                            FilterItems={filtersItems}
                            initialFilters={initialFiltersItem}
                        />
                    </TableFilters>
                    <Table.SelectionBar<TOrder>
                        onExport={handleExport}
                    />
                    
                </Table>
                <CustomerDetails
                    open={customerModal.isOpen}
                    setOpen={(isOpen) => {
                        if (!isOpen) {
                            closeCustomerModal();
                        }
                    }}
                />
                <OrderDetailsModel
                    open={orderModal.isOpen}
                    setOpen={(isOpen) => {
                        if (!isOpen) {
                            closeOrderModal();
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default OrdersView;