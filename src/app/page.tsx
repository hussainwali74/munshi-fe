
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowUpRight, ArrowDownLeft, AlertTriangle, Users } from 'lucide-react';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="heading-1">Dashboard</h1>
        <p className="text-muted">Welcome back to your Digital Dukan</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 grid-cols-2 grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Udhar (Receivable)"
          value="Rs 45,200"
          icon={<ArrowUpRight className="text-danger" />}
          trend="+12% this month"
        />
        <StatCard
          title="Total Payable"
          value="Rs 12,500"
          icon={<ArrowDownLeft className="text-success" />}
          trend="-5% this month"
        />
        <StatCard
          title="Low Stock Items"
          value="3 Items"
          icon={<AlertTriangle className="text-warning" />}
          trend="Needs attention"
        />
        <StatCard
          title="Active Customers"
          value="128"
          icon={<Users className="text-primary" />}
          trend="+4 new today"
        />
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 grid-cols-3 gap-8">
        <div className="lg-col-span-2">
          <div className="card">
            <h2 className="heading-2 mb-4">Recent Transactions</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i % 2 === 0 ? 'bg-red-100 text-danger' : 'bg-green-100 text-success'}`}>
                      {i % 2 === 0 ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>
                    <div>
                      <p className="font-semibold">Ahmed Ali</p>
                      <p className="text-sm text-muted">Plumbing Pipe x 2</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${i % 2 === 0 ? 'text-danger' : 'text-success'}`}>
                      {i % 2 === 0 ? '-' : '+'} Rs {i * 500}
                    </p>
                    <p className="text-sm text-muted">Today, 10:30 AM</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card mb-6">
            <h2 className="heading-2 mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              <button className="btn btn-primary w-full justify-start">
                <ArrowUpRight size={20} /> Add Udhar (Credit)
              </button>
              <button className="btn btn-secondary w-full justify-start">
                <ArrowDownLeft size={20} /> Add Payment
              </button>
              <button className="btn btn-secondary w-full justify-start">
                <Users size={20} /> Add New Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, trend }: any) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-2">
        <p className="text-muted font-medium">{title}</p>
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </div>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-sm text-muted">{trend}</p>
    </div>
  );
}
