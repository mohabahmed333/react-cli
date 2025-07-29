import { TableFilters } from "@/shared/components/tables/PaginatedTable/components/customfilters";
import { useState, useEffect, useMemo } from "react";
import { getInventoryColumns } from "./constants/columns";
import { inventoryData } from "./constants/data";
import { FilterItems } from "./constants/filters";
import { initialFilters } from "./constants/intialFilterData";
import { Tinventory_updated } from "./types/Tinventory";
import DropdownMenuElias from "./components/DropDownElias";
import Table from "../tables";
import ProductDetails from "./components/InventoryDetails";
import { ProductsDetailsModal } from "@/features/adminDashboard/components/shared/ProductsDetailsModal/productsDetailsModal";
type UserType = 'admin' | 'pharmacist';

const InventoryView = ({
    pageName = "Inventory",
    allowImporting = false,
    userType = 'pharmacist' as UserType
}: {
    pageName?: string,
    allowImporting?: boolean,
    userType?: UserType
}) => {
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Tinventory_updated>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const columns = getInventoryColumns()
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, []);

    const handleRowClick = (product: Tinventory_updated) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    // Close modal handler
    const handleCloseModal = (_open?: boolean) => {
        setIsModalOpen(false);
    };

    const handleExport = (selectedItems: Tinventory_updated[]) => {
        console.log(selectedItems, 'selectedItemsClicked')
    };

    const handleStatusChange = (checked: boolean) => {
        console.log('Status changed to:', checked);
    };
    const data = useMemo(() =>
        Promise.resolve({
            data: inventoryData,
            meta: { totalRowCount: inventoryData.length }
        }), [])
    return (
        <div>
            <Table<Tinventory_updated>
                name="Inventory"
                mode="infinite"
                queryKey="inventory"
                fetchFn={() => data}
                loading={loading}
                columns={columns}
                onRowClick={handleRowClick}

            >
                {!allowImporting && (
                    <Table.PageHeader<Tinventory_updated>
                        pageName={pageName}
                        onExport={handleExport}
                    />
                )}
                <TableFilters>
                    <TableFilters.searchInput
                        mode="uncontrolled"
                        param="search"
                        placeholder="search by Name, SKU"
                    />
                    <TableFilters.ModelFilter
                        FilterItems={FilterItems}
                        initialFilters={initialFilters}
                    />
                    {allowImporting && (
                        <DropdownMenuElias />
                    )}
                </TableFilters>
                <Table.SelectionBar<Tinventory_updated>
                    onExport={handleExport}
                    onChangeStatus={handleStatusChange}

                />
            </Table>

            {userType === 'admin' ? (
                <ProductsDetailsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            ) : (
                <ProductDetails
                    product={selectedProduct}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />

            )}
        </div>
    );
};

export default InventoryView;
