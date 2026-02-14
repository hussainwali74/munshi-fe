import { buildBillingHref } from './billing-navigation';

describe('buildBillingHref', () => {
    it('returns base billing path when no context is provided', () => {
        expect(buildBillingHref()).toBe('/billing');
    });

    it('includes customerId and transactionId when provided', () => {
        expect(buildBillingHref({ customerId: 'cust-1', transactionId: 'tx-1' }))
            .toBe('/billing?customerId=cust-1&transactionId=tx-1');
    });

    it('includes only available parameters', () => {
        expect(buildBillingHref({ customerId: 'cust-7' }))
            .toBe('/billing?customerId=cust-7');
    });
});
