import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import SalePage from '../page'
import { useLanguage } from '@/context/LanguageContext'
import { createSaleReceipt, getSaleInventoryItems } from '../actions'
import { searchCustomers } from '@/app/dashboard/search-actions'
import { useRouter } from 'next/navigation'

jest.mock('@/context/LanguageContext', () => ({
    useLanguage: jest.fn(),
}))

jest.mock('@/app/dashboard/search-actions', () => ({
    searchCustomers: jest.fn(),
}))

jest.mock('../actions', () => ({
    getSaleInventoryItems: jest.fn(),
    createSaleReceipt: jest.fn(),
}))

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}))

jest.mock('react-hot-toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}))

describe('Sale page', () => {
    const mockT = jest.fn((key: string) => key)
    const push = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useLanguage as jest.Mock).mockReturnValue({ language: 'en', t: mockT })
        ;(useRouter as jest.Mock).mockReturnValue({ push })
        ;(getSaleInventoryItems as jest.Mock).mockResolvedValue([
            {
                id: 'item-1',
                name: 'Ceramic Wall Tiles (8x12)',
                category: 'tiles',
                selling_price: 85,
                quantity: 20,
            },
        ])
        ;(searchCustomers as jest.Mock).mockResolvedValue([])
    })

    it('renders sale layout and inventory items', async () => {
        render(<SalePage />)

        await waitFor(() => {
            expect(getSaleInventoryItems).toHaveBeenCalled()
        })

        expect(screen.getByText('sale.newSale')).toBeInTheDocument()
        expect(screen.getByText('Ceramic Wall Tiles (8x12)')).toBeInTheDocument()
    })

    it('submits receipt when customer and cart are valid', async () => {
        ;(createSaleReceipt as jest.Mock).mockResolvedValue({
            transactionId: 'tx-1',
            customerId: 'customer-1',
        })

        render(<SalePage />)

        await waitFor(() => {
            expect(getSaleInventoryItems).toHaveBeenCalled()
        })

        fireEvent.click(screen.getByText('Ceramic Wall Tiles (8x12)'))
        fireEvent.change(screen.getByPlaceholderText('sale.customerSearchPlaceholder'), { target: { value: 'Ali' } })
        fireEvent.change(screen.getByPlaceholderText('sale.phoneNumberPlaceholder'), { target: { value: '0300-1234567' } })
        fireEvent.click(screen.getByRole('button', { name: 'sale.generateReceipt' }))

        await waitFor(() => {
            expect(createSaleReceipt).toHaveBeenCalledTimes(1)
        })
        expect(push).toHaveBeenCalledWith('/khata/customer-1/transactions/tx-1')
    })
})
