
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, UserCheck, Phone } from 'lucide-react';

export default function EmployeesPage() {
    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold mb-0">Employees</h1>
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-primary hover:bg-primary-dark transition-colors">
                    <Plus size={20} /> Add Employee
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-surface rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-text-secondary bg-gray-100">
                                    <UserCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-text-primary">Employee {i}</h3>
                                    <p className="text-text-secondary text-sm">Salesman</p>
                                </div>
                            </div>
                            <span className="px-2 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">Active</span>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-text-secondary text-sm">
                                <Phone size={16} />
                                <span>0300-987654{i}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Salary</span>
                                <span className="font-medium text-text-primary">Rs 25,000</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Joined</span>
                                <span className="font-medium text-text-primary">Jan 2024</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 py-2 px-3 rounded-lg border border-border text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-colors text-sm font-medium">View Profile</button>
                            <button className="flex-1 py-2 px-3 rounded-lg border border-border text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-colors text-sm font-medium">Attendance</button>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
