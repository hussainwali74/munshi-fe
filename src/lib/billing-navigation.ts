interface BillingNavigationParams {
    customerId?: string | null;
    transactionId?: string | null;
}

export const buildBillingHref = ({ customerId, transactionId }: BillingNavigationParams = {}) => {
    const params = new URLSearchParams();

    if (customerId) {
        params.set('customerId', customerId);
    }

    if (transactionId) {
        params.set('transactionId', transactionId);
    }

    const query = params.toString();
    return query ? `/billing?${query}` : '/billing';
};
