import { IFilterType } from "../types/filterType";

 
export const initialFilters: IFilterType = {
    status: [],
    date: '',
    amount: { min: 0, max: 0 },
};
