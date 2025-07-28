import { useState, useCallback } from 'react';
import { TOrder } from '../types/Orders';

interface OrderModalState {
    isOpen: boolean;
    selectedOrder: TOrder | null;
}

export const useOrderModal = () => {
    const [orderModal, setOrderModal] = useState<OrderModalState>({
        isOpen: false,
        selectedOrder: null
    });

    const openOrderModal = useCallback((order: TOrder) => {
        setOrderModal({
            isOpen: true,
            selectedOrder: order
        });
    }, []);

    const closeOrderModal = useCallback(() => {
        setOrderModal({
            isOpen: false,
            selectedOrder: null
        });
    }, []);

    return {
        orderModal,
        openOrderModal,
        closeOrderModal
    };
};
