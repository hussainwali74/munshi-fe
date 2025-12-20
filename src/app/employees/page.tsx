
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { Search, Plus, UserCheck, Phone, X, Trash2, Calendar, Briefcase, DollarSign, Edit } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect } from 'react';
import { addEmployee, getEmployees, deleteEmployee, updateEmployee } from './actions';
import { toast } from 'react-hot-toast';

export default function EmployeesPage() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ur';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
    const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchEmployees = async () => {
        const data = await getEmployees();
        setEmployees(data || []);
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            await addEmployee(formData);
            toast.success('Employee added successfully');
            handleCloseModal();
            await fetchEmployees(); // Refresh the list
        } catch (error) {
            console.error('Error adding employee:', error);
            toast.error('❌ Failed to add employee');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await deleteEmployee(id);
                toast.success('Employee deleted successfully');
                await fetchEmployees();
            } catch (error) {
                console.error('Error deleting employee:', error);
                toast.error('❌ Failed to delete employee');
            }
        }
    };

    const handleEdit = (employee: any) => {
        setEditingEmployee(employee);
        setSelectedEmployee(null); // Close profile modal if open
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            await updateEmployee(formData);
            toast.success('Employee updated successfully');
            setEditingEmployee(null);
            await fetchEmployees();
        } catch (error) {
            console.error('Error updating employee:', error);
            toast.error('❌ Failed to update employee');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const getRoleTranslation = (role: string) => {
        const roleKey = `employees.roles.${role}`;
        return t(roleKey);
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6" dir={isRtl ? 'rtl' : 'ltr'}>
                <h1 className="text-3xl font-bold mb-0 tracking-tight">{t('employees.title')}</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[0.75rem] font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-primary text-white hover:bg-primary-dark hover:-translate-y-px"
                >
                    <Plus size={20} /> {t('employees.addEmployee')}
                </button>
            </div>

            {/* Add Employee Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleCloseModal}>
                    <div className="bg-surface rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h2 className="text-xl font-bold">{t('employees.addEmployee')}</h2>
                            <button onClick={handleCloseModal} className="text-text-secondary hover:text-text-primary">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-text-primary">{t('employees.employeeName')}</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    placeholder={t('employees.placeholders.name')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-text-primary">{t('employees.phone')}</label>
                                <input
                                    name="phone"
                                    type="tel"
                                    disabled={isSubmitting}
                                    className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    placeholder="0300-1234567"
                                    dir="ltr"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-text-primary">{t('employees.roleLabel')}</label>
                                    <select
                                        name="role"
                                        disabled={isSubmitting}
                                        className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    >
                                        <option value="salesman">{t('employees.roles.salesman')}</option>
                                        <option value="cashier">{t('employees.roles.cashier')}</option>
                                        <option value="manager">{t('employees.roles.manager')}</option>
                                        <option value="helper">{t('employees.roles.helper')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-text-primary">{t('employees.salary')}</label>
                                    <input
                                        name="salary"
                                        type="number"
                                        disabled={isSubmitting}
                                        className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                        placeholder={t('employees.placeholders.salary')}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-text-primary">{t('employees.joinDate')}</label>
                                <input
                                    name="joinDate"
                                    type="date"
                                    disabled={isSubmitting}
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-primary text-white hover:bg-primary-dark hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? t('common.loading') : t('employees.addEmployee')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Employees Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" dir={isRtl ? 'rtl' : 'ltr'}>
                {employees.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <UserCheck size={48} className="mx-auto text-text-secondary mb-4" />
                        <h3 className="text-xl font-semibold text-text-primary mb-2">
                            {t('employees.noEmployees') || 'No employees yet'}
                        </h3>
                        <p className="text-text-secondary mb-4">
                            {t('employees.addFirstEmployee') || 'Add your first employee to get started'}
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[0.75rem] font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-primary text-white hover:bg-primary-dark hover:-translate-y-px"
                        >
                            <Plus size={20} /> {t('employees.addEmployee')}
                        </button>
                    </div>
                ) : (
                    employees.map((employee) => (
                        <div key={employee.id} className="bg-surface rounded-xl p-6 shadow-md border border-border hover:bg-background transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-text-secondary bg-background">
                                        <UserCheck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-text-primary">{employee.name}</h3>
                                        <p className="text-text-secondary text-sm">{getRoleTranslation(employee.role)}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${employee.status === 'active'
                                    ? 'bg-green-500/20 text-green-500'
                                    : 'bg-text-secondary/20 text-text-secondary'
                                    }`}>
                                    {t(`employees.${employee.status}`)}
                                </span>
                            </div>

                            <div className="space-y-3 mb-6">
                                {employee.phone && (
                                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                                        <Phone size={16} />
                                        <span dir="ltr">{employee.phone}</span>
                                    </div>
                                )}
                                {employee.salary && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">{t('employees.salary')}</span>
                                        <span className="font-medium text-text-primary">Rs {employee.salary.toLocaleString()}</span>
                                    </div>
                                )}
                                {employee.join_date && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">{t('employees.joined')}</span>
                                        <span className="font-medium text-text-primary">{formatDate(employee.join_date)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedEmployee(employee)}
                                    className="flex-1 py-2 px-3 rounded-xl border border-border text-text-secondary hover:bg-background hover:text-text-primary transition-colors text-sm font-medium"
                                >
                                    {t('employees.viewProfile')}
                                </button>
                                <button
                                    onClick={() => handleDelete(employee.id, employee.name)}
                                    className="py-2 px-3 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium"
                                    title={t('common.delete')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* View Profile Modal */}
            {selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedEmployee(null)}>
                    <div className="bg-surface rounded-xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h2 className="text-xl font-bold">{t('employees.viewProfile')}</h2>
                            <button onClick={() => setSelectedEmployee(null)} className="text-text-secondary hover:text-text-primary">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Profile Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center text-text-secondary bg-background">
                                    <UserCheck size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-text-primary">{selectedEmployee.name}</h3>
                                    <p className="text-text-secondary">{getRoleTranslation(selectedEmployee.role)}</p>
                                </div>
                                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${selectedEmployee.status === 'active'
                                    ? 'bg-green-500/20 text-green-500'
                                    : 'bg-text-secondary/20 text-text-secondary'
                                    }`}>
                                    {t(`employees.${selectedEmployee.status}`)}
                                </span>
                            </div>

                            {/* Profile Details */}
                            <div className="space-y-4">
                                {selectedEmployee.phone && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                                        <Phone size={20} className="text-primary" />
                                        <div>
                                            <p className="text-xs text-text-secondary">{t('employees.phone')}</p>
                                            <p className="font-medium text-text-primary" dir="ltr">{selectedEmployee.phone}</p>
                                        </div>
                                    </div>
                                )}

                                {selectedEmployee.salary && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                                        <DollarSign size={20} className="text-primary" />
                                        <div>
                                            <p className="text-xs text-text-secondary">{t('employees.salary')}</p>
                                            <p className="font-medium text-text-primary">Rs {selectedEmployee.salary.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                                    <Briefcase size={20} className="text-primary" />
                                    <div>
                                        <p className="text-xs text-text-secondary">{t('employees.roleLabel')}</p>
                                        <p className="font-medium text-text-primary">{getRoleTranslation(selectedEmployee.role)}</p>
                                    </div>
                                </div>

                                {selectedEmployee.join_date && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background">
                                        <Calendar size={20} className="text-primary" />
                                        <div>
                                            <p className="text-xs text-text-secondary">{t('employees.joinDate')}</p>
                                            <p className="font-medium text-text-primary">{formatDate(selectedEmployee.join_date)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => handleEdit(selectedEmployee)}
                                    className="flex-1 py-3 px-6 rounded-xl font-semibold bg-primary text-white hover:bg-primary-dark transition-colors"
                                >
                                    {t('common.edit')}
                                </button>
                                <button
                                    onClick={() => setSelectedEmployee(null)}
                                    className="flex-1 py-3 px-6 rounded-xl font-semibold border border-border text-text-primary hover:bg-background transition-colors"
                                >
                                    {t('common.close')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Employee Modal */}
            {editingEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setEditingEmployee(null)}>
                    <div className="bg-surface rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h2 className="text-xl font-bold">{t('employees.editEmployee') || 'Edit Employee'}</h2>
                            <button onClick={() => setEditingEmployee(null)} className="text-text-secondary hover:text-text-primary">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-4 space-y-4">
                            <input type="hidden" name="id" value={editingEmployee.id} />

                            <div>
                                <label className="block text-sm font-medium mb-1 text-text-primary">{t('employees.employeeName')}</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    disabled={isSubmitting}
                                    defaultValue={editingEmployee.name}
                                    className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    placeholder={t('employees.placeholders.name')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-text-primary">{t('employees.phone')}</label>
                                <input
                                    name="phone"
                                    type="tel"
                                    disabled={isSubmitting}
                                    defaultValue={editingEmployee.phone || ''}
                                    className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    placeholder="0300-1234567"
                                    dir="ltr"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-text-primary">{t('employees.roleLabel')}</label>
                                    <select
                                        name="role"
                                        disabled={isSubmitting}
                                        defaultValue={editingEmployee.role || 'salesman'}
                                        className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    >
                                        <option value="salesman">{t('employees.roles.salesman')}</option>
                                        <option value="cashier">{t('employees.roles.cashier')}</option>
                                        <option value="manager">{t('employees.roles.manager')}</option>
                                        <option value="helper">{t('employees.roles.helper')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-text-primary">{t('employees.salary')}</label>
                                    <input
                                        name="salary"
                                        type="number"
                                        disabled={isSubmitting}
                                        defaultValue={editingEmployee.salary || ''}
                                        className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                        placeholder={t('employees.placeholders.salary')}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-text-primary">{t('employees.joinDate')}</label>
                                    <input
                                        name="joinDate"
                                        type="date"
                                        disabled={isSubmitting}
                                        defaultValue={editingEmployee.join_date?.split('T')[0] || ''}
                                        className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-text-primary">{t('employees.status') || 'Status'}</label>
                                    <select
                                        name="status"
                                        disabled={isSubmitting}
                                        defaultValue={editingEmployee.status || 'active'}
                                        className="w-full p-2 rounded-lg border border-border bg-surface text-text-primary focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    >
                                        <option value="active">{t('employees.active')}</option>
                                        <option value="inactive">{t('employees.inactive') || 'Inactive'}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 border-none outline-none bg-primary text-white hover:bg-primary-dark hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? t('common.loading') : (t('common.save') || 'Save')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingEmployee(null)}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 px-6 rounded-xl font-semibold border border-border text-text-primary hover:bg-background transition-colors disabled:opacity-50"
                                >
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
