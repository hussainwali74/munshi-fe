'use client';

import { X } from 'lucide-react';
import { addCustomer } from '@/app/khata/actions';
import { useLanguage } from '@/context/LanguageContext';

interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddCustomerModal({ isOpen, onClose, onSuccess }: AddCustomerModalProps) {
    const { t } = useLanguage();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div className="bg-surface rounded-[0.75rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
                    <h2 className="text-lg font-bold text-text-primary">{t('khata.addNewCustomer') || 'Add New Customer'}</h2>
                    <button
                        onClick={onClose}
                        className="text-text-secondary hover:text-text-primary transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form action={async (formData) => {
                    await addCustomer(formData);
                    onClose();
                    if (onSuccess) onSuccess();
                }} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-text-primary">
                            {t('khata.customerName') || 'Customer Name'} *
                        </label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="w-full p-3 rounded-[0.75rem] border border-border bg-surface text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-200"
                            placeholder="Ahmed Ali"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-text-primary">
                            {t('khata.phoneNumber') || 'Phone Number'}
                        </label>
                        <input
                            name="phone"
                            type="tel"
                            className="w-full p-3 rounded-[0.75rem] border border-border bg-surface text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-200"
                            placeholder="0300-1234567"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-text-primary">
                            {t('khata.address') || 'Address'}
                        </label>
                        <input
                            name="address"
                            type="text"
                            className="w-full p-3 rounded-[0.75rem] border border-border bg-surface text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all duration-200"
                            placeholder="Street, Area, City"
                        />
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[0.75rem] font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-primary text-white hover:bg-primary-dark hover:-translate-y-px">
                            {t('khata.addCustomer') || 'Add Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
