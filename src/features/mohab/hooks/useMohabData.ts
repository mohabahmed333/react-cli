import { useState, useEffect } from 'react';
import { TOrder } from '../types/Mohab';
import { MohabData } from '../constants/MohabData';

export const useMohabData = (externalData?: TOrder[]) => {
    const [loading, setLoading] = useState(false);
    const [MohabDataM, setMohabData] = useState<TOrder[]>(MohabData);

    useEffect(() => {
        if (externalData) {
            setMohabData(externalData);
            return;
        }

        setLoading(true);
        const timeOut = setTimeout(() => {
            try {
                setMohabData(MohabData);
                setLoading(false);
            } catch (err) {
                setLoading(false);
                console.error("Failed to load Mohab:", err);
            }
        }, 1000);
        
        return () => clearTimeout(timeOut);
    }, [externalData]);

    return {
        loading,
        data: externalData || MohabDataM
    };
};
