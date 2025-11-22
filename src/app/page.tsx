
import Link from 'next/link';
import { ArrowRight, CheckCircle2, BarChart3, Users, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary" dir="ltr">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold">Ezekata</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it Works</Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Reviews</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Login
            </Link>
            <Link
              href="/dashboard"
              className="btn btn-primary text-sm px-4 py-2 rounded-full flex items-center gap-2 group"
            >
              Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(var(--primary-rgb),0.1),transparent)]"></div>
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            New: Inventory Management System
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Manage Your Dukan <br />
            <span className="text-primary">Like a Pro</span>
          </h1>
          <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            The easiest way to manage Khata (Ledger), Inventory, and Employees for your shop. Built for Pakistani businesses with Urdu support.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link
              href="/dashboard"
              className="btn btn-primary px-8 py-4 text-lg rounded-full w-full sm:w-auto shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
            >
              Open My Dukan
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 text-lg font-medium text-text-primary hover:bg-surface rounded-full w-full sm:w-auto transition-colors border border-border"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-surface/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Stop using paper registers. Switch to a secure, digital system that grows with your business.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BarChart3 className="w-10 h-10 text-primary" />}
              title="Digital Khata"
              description="Track customer credits (Udhar) and payments easily. Send reminders and get paid faster."
            />
            <FeatureCard
              icon={<CheckCircle2 className="w-10 h-10 text-success" />}
              title="Smart Inventory"
              description="Manage stock levels, get low stock alerts, and track item pricing history effortlessly."
            />
            <FeatureCard
              icon={<Users className="w-10 h-10 text-warning" />}
              title="Staff Management"
              description="Keep track of employee details, attendance, and performance all in one place."
            />
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 border-y border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="inline-block p-4 rounded-2xl bg-primary/10 mb-6">
                <ShieldCheck className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-6">Bank-Grade Security</h2>
              <ul className="space-y-4">
                {[
                  "Secure Cloud Storage",
                  "Daily Backups",
                  "Encrypted Data Transfer",
                  "24/7 Access from Anywhere"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 bg-surface p-8 rounded-3xl border border-border shadow-xl">
               <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-danger font-bold">A</div>
                      <div>
                        <p className="font-bold">Ahmed Ali</p>
                        <p className="text-sm text-muted">Purchase on Udhar</p>
                      </div>
                    </div>
                    <p className="font-bold text-danger">- Rs 1,500</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-success font-bold">S</div>
                      <div>
                        <p className="font-bold">Sara Khan</p>
                        <p className="text-sm text-muted">Payment Received</p>
                      </div>
                    </div>
                    <p className="font-bold text-success">+ Rs 5,000</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Modernize Your Shop?</h2>
          <p className="text-xl text-text-secondary mb-10">
            Join thousands of shopkeepers using Ezekata to save time and grow their business.
          </p>
          <Link
            href="/dashboard"
            className="btn btn-primary px-8 py-4 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all inline-flex items-center gap-2"
          >
            Get Started for Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">E</span>
            </div>
            <span className="font-bold text-lg">Ezekata</span>
          </div>
          <p className="text-text-secondary text-sm">
            © {new Date().getFullYear()} Ezekata. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-background p-8 rounded-2xl border border-border hover:shadow-lg transition-shadow">
      <div className="mb-6 bg-surface w-16 h-16 rounded-xl flex items-center justify-center border border-border/50">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}
