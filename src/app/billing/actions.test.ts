import { createBill } from './actions'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

type QueuedResponse = {
    data: unknown
    error: unknown
}

const responseQueue: QueuedResponse[] = []

const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    then: jest.fn((resolve) => resolve(responseQueue.shift() ?? { data: null, error: null })),
}

const mockFrom = jest.fn(() => mockQueryBuilder)
const mockRpc = jest.fn()

jest.mock('@/lib/db', () => ({
    getDb: jest.fn(() => ({
        from: mockFrom,
        rpc: mockRpc,
    })),
}))

jest.mock('@/lib/auth', () => ({
    getSession: jest.fn(),
    verifyPassword: jest.fn(),
    hashPassword: jest.fn(),
    createSession: jest.fn(),
    deleteSession: jest.fn(),
}))

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}))

describe('Billing actions - createBill', () => {
    const mockSession = { userId: 'user-123' }
    const mockedGetDb = getDb as jest.Mock

    const createBaseFormData = () => {
        const formData = new FormData()
        formData.append('customerId', 'customer-1')
        formData.append('items', JSON.stringify([{ id: 'item-1', name: 'Ceramic Tile', qty: 3, price: 120, maxQty: 10 }]))
        formData.append('finalAmount', '360')
        formData.append('paidAmount', '100')
        formData.append('paymentMode', 'credit')
        formData.append('billNumber', 'B-001')
        return formData
    }

    beforeEach(() => {
        jest.clearAllMocks()
        responseQueue.length = 0
        ;(getSession as jest.Mock).mockResolvedValue(mockSession)
        mockRpc.mockResolvedValue({ error: null })
    })

    it('deducts inventory quantities and creates the transaction', async () => {
        responseQueue.push(
            {
                data: [{ id: 'item-1', name: 'Ceramic Tile', quantity: 10 }],
                error: null,
            },
            {
                data: [{ id: 'item-1' }],
                error: null,
            },
            {
                data: { id: 'tx-1' },
                error: null,
            }
        )

        const transaction = await createBill(createBaseFormData())

        expect(transaction).toEqual({ id: 'tx-1' })
        expect(mockedGetDb).toHaveBeenCalled()
        expect(mockFrom).toHaveBeenCalledWith('inventory')
        expect(mockQueryBuilder.update).toHaveBeenCalledWith({ quantity: 7 })
        expect(mockFrom).toHaveBeenCalledWith('transactions')
        expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
            expect.objectContaining({
                user_id: 'user-123',
                customer_id: 'customer-1',
                amount: 360,
                type: 'credit',
                description: 'Bill #B-001',
                bill_amount: 360,
                paid_amount: 100,
            })
        )
        expect(mockRpc).toHaveBeenCalledWith('update_customer_balance', {
            p_customer_id: 'customer-1',
            p_amount: 260,
        })
        expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
        expect(revalidatePath).toHaveBeenCalledWith('/inventory')
        expect(revalidatePath).toHaveBeenCalledWith('/khata')
    })

    it('rejects the bill when requested quantity exceeds available stock', async () => {
        const formData = createBaseFormData()
        formData.set('items', JSON.stringify([{ id: 'item-1', name: 'Ceramic Tile', qty: 20, price: 120, maxQty: 10 }]))

        responseQueue.push({
            data: [{ id: 'item-1', name: 'Ceramic Tile', quantity: 5 }],
            error: null,
        })

        await expect(createBill(formData)).rejects.toThrow('Ceramic Tile has only 5 in stock')

        expect(mockFrom).toHaveBeenCalledWith('inventory')
        expect(mockFrom).not.toHaveBeenCalledWith('transactions')
        expect(mockQueryBuilder.update).not.toHaveBeenCalled()
        expect(mockRpc).not.toHaveBeenCalled()
    })
})
