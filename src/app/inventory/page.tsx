
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, Package, Filter, X, Upload } from 'lucide-react';
import { useState } from 'react';
import { addInventoryItem } from './actions';

export default function InventoryPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="heading-1" style={{ marginBottom: 0 }}>Inventory</h1>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> Add Item
                </button>
            </div>

            {/* Add Item Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-surface rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h2 className="text-xl font-bold">Add New Item</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-secondary">
                                <X size={24} />
                            </button>
                        </div>

                        <form action={async (formData) => {
                            await addInventoryItem(formData);
                            setIsModalOpen(false);
                        }} className="p-4 space-y-4">

                            {/* Image Upload */}
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-background">
                                <Upload size={32} className="text-text-secondary mb-2" />
                                <label htmlFor="image" className="text-primary font-medium cursor-pointer">
                                    Upload Product Image
                                </label>
                                <input type="file" id="image" name="image" accept="image/*" className="hidden" />
                                <p className="text-xs text-muted mt-1">PNG, JPG up to 5MB</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Item Name</label>
                                    <input name="name" type="text" required className="input" placeholder="e.g. PVC Pipe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select name="category" className="input">
                                        <option value="sanitary">Sanitary</option>
                                        <option value="electrical">Electrical</option>
                                        <option value="plumbing">Plumbing</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Price (Rs)</label>
                                    <input name="price" type="number" required className="input" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Quantity</label>
                                    <input name="quantity" type="number" required className="input" placeholder="0" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Size</label>
                                    <input name="size" type="text" className="input" placeholder="e.g. 4 inch" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Color</label>
                                    <input name="color" type="text" className="input" placeholder="e.g. White" />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button type="submit" className="btn btn-primary w-full justify-center">
                                    Save Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 rounded-lg p-2 flex-1" style={{ border: '1px solid var(--border)' }}>
                        <Search size={20} className="text-muted" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            className="w-full"
                            style={{ outline: 'none', border: 'none', background: 'transparent' }}
                        />
                    </div>
                    <button className="btn btn-secondary">
                        <Filter size={20} /> Filter
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr className="border-b">
                                <th className="p-3 font-medium text-muted">Item Name</th>
                                <th className="p-3 font-medium text-muted">Category</th>
                                <th className="p-3 font-medium text-muted">Stock</th>
                                <th className="p-3 font-medium text-muted">Price</th>
                                <th className="p-3 font-medium text-muted">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="border-b" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded flex items-center justify-center text-muted" style={{ backgroundColor: '#F3F4F6' }}>
                                                <Package size={16} />
                                            </div>
                                            <span className="font-medium">Item {i}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-muted">Sanitary</td>
                                    <td className="p-3 font-medium">{100 - i * 10} pcs</td>
                                    <td className="p-3">Rs {500 + i * 50}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full font-medium ${i === 4 ? 'bg-red-100 text-danger' : 'bg-green-100 text-success'}`} style={{ fontSize: '0.75rem' }}>
                                            {i === 4 ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
