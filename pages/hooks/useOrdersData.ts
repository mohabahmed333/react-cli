import { useState, useEffect } from 'react';
import { TOrder } from '../types/Products';
import { ordersData } from '../constants/ordersData';

export const useOrdersData = (externalData?: TOrder[]) => {
    const [loading, setLoading] = useState(false);
    const [ordersDataM, setOrdersData] = useState<TOrder[]>(ordersData);

    useEffect(() => {
        if (externalData) {
            setOrdersData(externalData);
            return;
        }

        setLoading(true);
        const timeOut = setTimeout(() => {
            try {
                setOrdersData(ordersData);
                setLoading(false);
            } catch (err) {
                setLoading(false);
                console.error("Failed to load Products:", err);
            }
        }, 1000);
        
        return () => clearTimeout(timeOut);
    }, [externalData]);

    return {
        loading,
        data: externalData || ordersDataM
    };
};
