import { IFilterType } from "../types/filterType";


export const initialFilters: IFilterType = {
    status: [],
    category: [],
    stock: { min: 0, max: 0 },
    price: { min: 0, max: 0 },
};
