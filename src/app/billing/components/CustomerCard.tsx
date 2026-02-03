import React from 'react';
import { Search, Plus, User, X, Loader2 } from 'lucide-react';
import { formatCNIC } from '@/lib/utils';
import type { Customer } from '../types';

interface CustomerCardProps {
    selectedCustomer: Customer | null;
    customerQuery: string;
    customerResults: Customer[];
    isSearching: boolean;
    isRtl: boolean;
    onQueryChange: (value: string) => void;
    onSelectCustomer: (customer: Customer) => void;
    onClearCustomer: () => void;
    onAddCustomer: () => void;
    searchRef: React.RefObject<HTMLDivElement>;
    t: (key: string, options?: Record<string, string | number>) => string;
}

export default function CustomerCard({
    selectedCustomer,
    customerQuery,
    customerResults,
    isSearching,
    isRtl,
    onQueryChange,
    onSelectCustomer,
    onClearCustomer,
    onAddCustomer,
    searchRef,
    t,
}: CustomerCardProps) {
    return (
        <div className="bg-surface rounded-xl p-6 shadow-md border border-border" ref={searchRef}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <User size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    {t('billing.customer')}
                </h2>
                <button
                    onClick={onAddCustomer}
                    className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                >
                    <Plus size={16} /> {t('billing.newCustomer')}
                </button>
            </div>

            <p className="text-sm text-text-secondary mb-4">{t('billing.customerHelp')}</p>

            {selectedCustomer ? (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {selectedCustomer.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-text-primary">{selectedCustomer.name}</p>
                            <p className="text-sm text-text-secondary">
                                {selectedCustomer.phone || selectedCustomer.address || '-'}
                                {selectedCustomer.cnic && ` • ${formatCNIC(selectedCustomer.cnic)}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClearCustomer}
                        className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <input
                        type="text"
                        className={`w-full p-3.5 rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                        placeholder={t('billing.searchCustomer')}
                        value={customerQuery}
                        onChange={(e) => onQueryChange(e.target.value)}
                    />
                    <Search className={`absolute top-1/2 -translate-y-1/2 text-text-secondary ${isRtl ? 'right-4' : 'left-4'}`} size={18} />
                    {isSearching && (
                        <Loader2 className={`absolute top-1/2 -translate-y-1/2 text-primary animate-spin ${isRtl ? 'left-4' : 'right-4'}`} size={18} />
                    )}

                    {customerResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-xl shadow-xl border border-border z-20 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                            {customerResults.map(c => (
                                <div
                                    key={c.id}
                                    className="p-3 hover:bg-background cursor-pointer border-b border-border last:border-0 flex items-center gap-3 transition-colors"
                                    onClick={() => onSelectCustomer(c)}
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                        {c.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-text-primary">{c.name}</p>
                                        <p className="text-xs text-text-secondary">
                                            {c.phone}
                                            {c.cnic && ` • ${formatCNIC(c.cnic)}`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {customerQuery.trim().length > 0 && !isSearching && customerResults.length === 0 && (
                        <div className="mt-3 rounded-lg border border-border bg-background p-3 text-sm text-text-secondary">
                            <p className="font-semibold text-text-primary">{t('billing.customerNotFound')}</p>
                            <p>{t('billing.customerNotFoundHelp')}</p>
                            <button
                                onClick={onAddCustomer}
                                className="mt-2 inline-flex items-center gap-2 text-primary font-semibold"
                            >
                                <Plus size={14} /> {t('billing.addNewCustomer')}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
