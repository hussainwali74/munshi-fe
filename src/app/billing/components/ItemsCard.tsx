import React from 'react';
import { Search, Package, Plus, Minus, Trash2, Loader2 } from 'lucide-react';
import type { CartItem } from '../types';

interface ItemsCardProps {
    itemQuery: string;
    itemResults: any[];
    cart: CartItem[];
    isSearching: boolean;
    isRtl: boolean;
    onQueryChange: (value: string) => void;
    onAddItem: (item: any) => void;
    onUpdateQty: (id: string, qty: number) => void;
    onRemoveItem: (id: string) => void;
    searchRef: React.RefObject<HTMLDivElement>;
    t: (key: string, options?: Record<string, string | number>) => string;
}

export default function ItemsCard({
    itemQuery,
    itemResults,
    cart,
    isSearching,
    isRtl,
    onQueryChange,
    onAddItem,
    onUpdateQty,
    onRemoveItem,
    searchRef,
    t,
}: ItemsCardProps) {
    return (
        <div className="bg-surface rounded-xl p-6 shadow-md border border-border flex flex-col" style={{ minHeight: '450px' }}>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Package size={18} className="text-green-600 dark:text-green-400" />
                    </div>
                    {t('billing.items')}
                    {cart.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                            {cart.length}
                        </span>
                    )}
                </h2>
            </div>

            <p className="text-sm text-text-secondary mb-4">{t('billing.itemsHelp')}</p>

            <div className="relative mb-4" ref={searchRef}>
                <input
                    type="text"
                    className={`w-full p-3.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                    placeholder={t('billing.searchItems')}
                    value={itemQuery}
                    onChange={(e) => onQueryChange(e.target.value)}
                />
                <Search className={`absolute top-1/2 -translate-y-1/2 text-text-secondary ${isRtl ? 'right-4' : 'left-4'}`} size={18} />
                {isSearching && (
                    <Loader2 className={`absolute top-1/2 -translate-y-1/2 text-primary animate-spin ${isRtl ? 'left-4' : 'right-4'}`} size={18} />
                )}

                {itemResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl shadow-xl border border-border z-20 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                        {itemResults.map(item => (
                            <div
                                key={item.id}
                                className="p-3 hover:bg-background cursor-pointer border-b border-border last:border-0 flex justify-between items-center transition-colors"
                                onClick={() => onAddItem(item)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center">
                                        <Package size={18} className="text-text-secondary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-text-primary">{item.name}</p>
                                        <p className="text-xs text-text-secondary">{t('billing.stock')}: {item.quantity}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-primary">Rs {item.selling_price}</p>
                                    <button className="text-xs text-primary hover:underline flex items-center gap-1">
                                        <Plus size={12} /> {t('billing.addItem')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {itemQuery.trim().length > 0 && !isSearching && itemResults.length === 0 && (
                    <div className="mt-3 rounded-lg border border-border bg-background p-3 text-sm text-text-secondary">
                        <p className="font-semibold text-text-primary">{t('billing.itemNotFoundShort')}</p>
                        <p>{t('billing.itemNotFoundHelp')}</p>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto border border-border rounded-xl bg-background/50">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-text-secondary">
                        <Package size={48} className="mb-3 opacity-30" />
                        <p className="text-center">{t('billing.cartEmpty')}</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm table-fixed">
                        <thead className="bg-background text-text-secondary font-medium sticky top-0 border-b border-border">
                            <tr>
                                <th className="p-3 w-[6%]">{t('billing.sr')}</th>
                                <th className="p-3 w-[34%]">{t('billing.item')}</th>
                                <th className="p-3 text-center w-[22%]">{t('billing.qty')}</th>
                                <th className={`p-3 w-[18%] ${isRtl ? 'text-left' : 'text-right'}`}>{t('billing.rate')}</th>
                                <th className={`p-3 w-[15%] ${isRtl ? 'text-left' : 'text-right'}`}>{t('billing.total')}</th>
                                <th className="p-3 w-[5%]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {cart.map((item, index) => (
                                <tr key={item.id} className="hover:bg-background/80 transition-colors">
                                    <td className="p-3 text-text-secondary">{index + 1}</td>
                                    <td className="p-3">
                                        <span className="font-medium text-text-primary">{item.name}</span>
                                        <p className="text-xs text-text-secondary">{t('billing.maxStock', { max: item.maxQty })}</p>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                className="w-8 h-8 rounded-lg bg-surface border border-border hover:bg-background hover:border-primary flex items-center justify-center transition-colors"
                                                onClick={() => onUpdateQty(item.id, item.qty - 1)}
                                                aria-label={t('billing.decreaseQty')}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <input
                                                type="number"
                                                value={item.qty}
                                                onChange={(e) => onUpdateQty(item.id, parseInt(e.target.value) || 1)}
                                                className="w-14 text-center p-1.5 rounded-lg border border-border bg-surface text-text-primary focus:border-primary outline-none"
                                                min="1"
                                                max={item.maxQty}
                                            />
                                            <button
                                                className="w-8 h-8 rounded-lg bg-surface border border-border hover:bg-background hover:border-primary flex items-center justify-center transition-colors"
                                                onClick={() => onUpdateQty(item.id, item.qty + 1)}
                                                aria-label={t('billing.increaseQty')}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className={`p-3 text-text-secondary ${isRtl ? 'text-left' : 'text-right'}`}>
                                        Rs {item.price}
                                    </td>
                                    <td className={`p-3 font-bold text-text-primary ${isRtl ? 'text-left' : 'text-right'}`}>
                                        Rs {item.price * item.qty}
                                    </td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => onRemoveItem(item.id)}
                                            className="p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                            aria-label={t('billing.removeItem')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
