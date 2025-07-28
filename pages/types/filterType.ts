export type filterType = 'status' | 'date' | 'amount' | 'custom';
export interface IFilterType {
    status: string[];
    date: string;
    amount: { min: number; max: number };
}
