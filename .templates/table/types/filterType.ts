export type filterType = 'status' | 'amount';
export interface IFilterType {
    status: string[];
    category: string[];
    stock: { min: number, max: number , minMax?: string };
    price: { min: number, max: number , minMax?: string };
}
