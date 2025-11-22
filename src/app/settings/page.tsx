
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { updateShopDetails } from './actions';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Shop Settings</h1>
                <p className="text-text-secondary">Update your shop information</p>
            </div>

            <div className="bg-surface rounded-xl p-8 shadow-sm border border-border max-w-2xl">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
                        <SettingsIcon className="text-primary" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">Shop Details</h2>
                        <p className="text-sm text-text-secondary">Keep your shop information up to date</p>
                    </div>
                </div>

                <form action={updateShopDetails} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-text-primary">Shop Name</label>
                        <input
                            name="businessName"
                            type="text"
                            className="w-full p-3 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="e.g. Bismillah General Store"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2 text-text-primary">Owner Name</label>
                        <input
                            name="fullName"
                            type="text"
                            className="w-full p-3 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                            placeholder="Your full name"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-text-primary">Shop Phone</label>
                            <input
                                name="shopPhone"
                                type="tel"
                                className="w-full p-3 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="0300-1234567"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-text-primary">Shop Address</label>
                            <input
                                name="shopAddress"
                                type="text"
                                className="w-full p-3 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                placeholder="Street, City"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-primary hover:bg-primary-dark transition-colors shadow-md">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
