import { createSaleReceipt, getSaleInventoryItems } from './actions'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { createBill } from '@/app/billing/actions'

type QueuedResponse = {
    data: unknown
    error: unknown
}

const responseQueue: QueuedResponse[] = []

const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    then: jest.fn((resolve) => resolve(responseQueue.shift() ?? { data: null, error: null })),
}

const mockFrom = jest.fn(() => mockQueryBuilder)

jest.mock('@/lib/db', () => ({
    getDb: jest.fn(() => ({
        from: mockFrom,
    })),
}))

jest.mock('@/lib/auth', () => ({
    getSession: jest.fn(),
    verifyPassword: jest.fn(),
    hashPassword: jest.fn(),
    createSession: jest.fn(),
    deleteSession: jest.fn(),
}))

jest.mock('@/app/billing/actions', () => ({
    createBill: jest.fn(),
}))

describe('Sale actions', () => {
    const mockedGetDb = getDb as jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        responseQueue.length = 0
        ;(getSession as jest.Mock).mockResolvedValue({ userId: 'user-123' })
    })

    describe('getSaleInventoryItems', () => {
        it('maps inventory rows for sale page', async () => {
            responseQueue.push({
                data: [
                    {
                        id: 'item-1',
                        name: 'Tile',
                        category: null,
                        selling_price: 120,
                        quantity: 50,
                    },
                ],
                error: null,
            })

            const result = await getSaleInventoryItems()

            expect(mockedGetDb).toHaveBeenCalled()
            expect(mockFrom).toHaveBeenCalledWith('inventory')
            expect(result).toEqual([
                {
                    id: 'item-1',
                    name: 'Tile',
                    category: 'other',
                    selling_price: 120,
                    quantity: 50,
                },
            ])
        })
    })

    describe('createSaleReceipt', () => {
        it('creates receipt using existing customer and passes total with GST to createBill', async () => {
            responseQueue.push({
                data: [{ id: 'customer-1' }],
                error: null,
            })
            ;(createBill as jest.Mock).mockResolvedValue({ id: 'tx-1' })

            const formData = new FormData()
            formData.append('customerName', 'Ali')
            formData.append('customerPhone', '0300-1234567')
            formData.append('gstRate', '18')
            formData.append('items', JSON.stringify([
                { id: 'item-1', name: 'Faucet', price: 2200, qty: 2, maxQty: 10 },
            ]))

            const result = await createSaleReceipt(formData)

            expect(mockFrom).toHaveBeenCalledWith('customers')
            expect(createBill).toHaveBeenCalledTimes(1)

            const billFormData = (createBill as jest.Mock).mock.calls[0][0] as FormData
            expect(billFormData.get('customerId')).toBe('customer-1')
            expect(billFormData.get('paymentMode')).toBe('cash')
            expect(billFormData.get('paidAmount')).toBe('5192')
            expect(billFormData.get('finalAmount')).toBe('5192')

            expect(result).toEqual({
                transactionId: 'tx-1',
                customerId: 'customer-1',
                subtotal: 4400,
                gstAmount: 792,
                totalAmount: 5192,
            })
        })

        it('creates customer when phone is not found', async () => {
            responseQueue.push(
                {
                    data: [],
                    error: null,
                },
                {
                    data: { id: 'customer-new' },
                    error: null,
                }
            )
            ;(createBill as jest.Mock).mockResolvedValue({ id: 'tx-2' })

            const formData = new FormData()
            formData.append('customerName', 'Hassan')
            formData.append('customerPhone', '0311-1111111')
            formData.append('items', JSON.stringify([
                { id: 'item-2', name: 'Sink', price: 3500, qty: 1, maxQty: 5 },
            ]))

            await createSaleReceipt(formData)

            expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    user_id: 'user-123',
                    name: 'Hassan',
                    phone: '0311-1111111',
                    balance: 0,
                })
            )

            const billFormData = (createBill as jest.Mock).mock.calls[0][0] as FormData
            expect(billFormData.get('customerId')).toBe('customer-new')
        })

        it('uses selected customer id when customerId is provided', async () => {
            responseQueue.push({
                data: [{ id: 'customer-selected' }],
                error: null,
            })
            ;(createBill as jest.Mock).mockResolvedValue({ id: 'tx-3' })

            const formData = new FormData()
            formData.append('customerId', 'customer-selected')
            formData.append('items', JSON.stringify([
                { id: 'item-3', name: 'Shower Head', price: 1800, qty: 1, maxQty: 5 },
            ]))

            const result = await createSaleReceipt(formData)

            expect(mockQueryBuilder.insert).not.toHaveBeenCalled()

            const billFormData = (createBill as jest.Mock).mock.calls[0][0] as FormData
            expect(billFormData.get('customerId')).toBe('customer-selected')
            expect(result).toEqual({
                transactionId: 'tx-3',
                customerId: 'customer-selected',
                subtotal: 1800,
                gstAmount: 324,
                totalAmount: 2124,
            })
        })
    })
})
