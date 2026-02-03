export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    selling_price: number;
    quantity: number;
    size?: string | null;
    color?: string | null;
    image_url?: string | null;
    low_stock_threshold?: number | null;
}

export type InventorySearchItem = Pick<
    InventoryItem,
    'id' | 'name' | 'selling_price' | 'quantity' | 'category'
>;
