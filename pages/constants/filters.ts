import { FilterItem } from "@/shared/components/tables/PaginatedTable/components/customfilters/types/FilterItem";
import { IFilterType } from "../types/filterType";
export const FilterItems: FilterItem<IFilterType>[] = [
  {
    id: 'status',
    type: 'status',
    props: {
      label: "Status",
      options: [
        { label: 'Processing', id: 'Processing' },
        { label: 'Delivered', id: 'Delivered' },
        { label: 'Cancelled', id: 'Cancelled' },
      ],
    }
  },
  {
    id: "date",
    type: "date",
    props: {
      label: "Date",
    }
  },
  {
    id: 'amount',
    type: 'amount',
    props: {
      symbol: "KWD"
    }
  },

];

