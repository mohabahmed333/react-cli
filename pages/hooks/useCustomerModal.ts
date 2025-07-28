import { useState, useCallback } from 'react';

interface Customer {
    name: string;
    phone: string;
}

interface CustomerModalState {
    isOpen: boolean;
    selectedCustomer: Customer | null;
}

export const useCustomerModal = () => {
    const [customerModal, setCustomerModal] = useState<CustomerModalState>({
        isOpen: false,
        selectedCustomer: null
    });

    const openCustomerModal = useCallback((customer: Customer) => {
        setCustomerModal({
            isOpen: true,
            selectedCustomer: customer
        });
    }, []);

    const closeCustomerModal = useCallback(() => {
        setCustomerModal({
            isOpen: false,
            selectedCustomer: null
        });
    }, []);

    return {
        customerModal,
        openCustomerModal,
        closeCustomerModal
    };
};
