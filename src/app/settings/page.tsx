
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { updateShopDetails } from './actions';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="heading-1">Shop Settings</h1>
                <p className="text-muted">Update your shop information</p>
            </div>

            <div className="card max-w-2xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
                        <SettingsIcon className="text-primary" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Shop Details</h2>
                        <p className="text-sm text-muted">Keep your shop information up to date</p>
                    </div>
                </div>

                <form action={updateShopDetails} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Shop Name</label>
                        <input
                            name="businessName"
                            type="text"
                            className="input w-full"
                            placeholder="e.g. Bismillah General Store"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Owner Name</label>
                        <input
                            name="fullName"
                            type="text"
                            className="input w-full"
                            placeholder="Your full name"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Shop Phone</label>
                            <input
                                name="shopPhone"
                                type="tel"
                                className="input w-full"
                                placeholder="0300-1234567"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Shop Address</label>
                            <input
                                name="shopAddress"
                                type="text"
                                className="input w-full"
                                placeholder="Street, City"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="btn btn-primary">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
