import { FilterItem } from "@/shared/components/tables/PaginatedTable/components/customfilters/types/FilterItem";
import { IFilterType } from "../types/filterType";

export const FilterItems: FilterItem<IFilterType>[] = [
  {
    id: 'status',
    type: 'status',
    props: {
      options: [
        { label: 'Active', id: 'active' },
        { label: 'Inactive', id: 'inactive' },
      ]
    }
  },
  {
    id: 'category',
    type: 'status',
    props: {
      label: 'Category',
      className: 'mt-2',
      options: [
        { label: 'Capsule', id: 'Capsule' },
        { label: 'Tablet', id: 'Tablet' },
        { label: 'Injection', id: 'Injection' },
        { label: 'Syrup', id: 'Syrup' },
        { label: 'Ointment', id: 'Ointment' },
        { label: 'Cream', id: 'Cream' },
        { label: 'Drops', id: 'Drops' },
        { label: 'Inhaler', id: 'Inhaler' },
        { label: 'Suppository', id: 'Suppository' },
        { label: 'Patch', id: 'Patch' },
        { label: 'Gel', id: 'Gel' },
        { label: 'Powder', id: 'Powder' },
        { label: 'Solution', id: 'Solution' },
        { label: 'Suspension', id: 'Suspension' },
      ]
    }
  },


  {
    id: 'stock',
    type: 'amount',
    props: {
      className: 'w-full my-0 py-0',
      label: 'Stock',
    }
  },
  {
    id: 'price',
    type: 'amount',
    props: {
      symbol: 'KWD',
    }
  },

];

