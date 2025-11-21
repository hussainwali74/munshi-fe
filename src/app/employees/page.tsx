
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, UserCheck, Phone } from 'lucide-react';

export default function EmployeesPage() {
    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="heading-1" style={{ marginBottom: 0 }}>Employees</h1>
                <button className="btn btn-primary">
                    <Plus size={20} /> Add Employee
                </button>
            </div>

            <div className="grid grid-cols-1 grid-cols-2 grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="card">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-muted" style={{ backgroundColor: '#F3F4F6' }}>
                                    <UserCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Employee {i}</h3>
                                    <p className="text-muted text-sm">Salesman</p>
                                </div>
                            </div>
                            <span className="px-2 py-1 rounded-full bg-green-100 text-success" style={{ fontSize: '0.75rem' }}>Active</span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-muted text-sm">
                                <Phone size={16} />
                                <span>0300-987654{i}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">Salary</span>
                                <span className="font-medium">Rs 25,000</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted">Joined</span>
                                <span className="font-medium">Jan 2024</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="btn btn-secondary w-full p-2" style={{ fontSize: '0.875rem' }}>View Profile</button>
                            <button className="btn btn-secondary w-full p-2" style={{ fontSize: '0.875rem' }}>Attendance</button>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
