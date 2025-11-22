
import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Users,
  ShieldCheck,
  Smartphone,
  Globe,
  Lock,
  Database,
  Server,
  Zap,
  Layers,
  Download
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary" dir="ltr">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border z-50 transition-all duration-300">
        <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 text-text-primary no-underline font-bold text-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-[10px] flex items-center justify-center text-white font-extrabold text-xl shadow-glow">
              <span>D</span>
            </div>
            <span className="text-2xl font-bold text-text-primary">Digital Dukan</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="#features" className="text-text-secondary font-medium text-[0.95rem] transition-colors duration-200 no-underline hover:text-primary">Features</Link>
            <Link href="#how-it-works" className="text-text-secondary font-medium text-[0.95rem] transition-colors duration-200 no-underline hover:text-primary">How it Works</Link>
            <Link href="#tech-stack" className="text-text-secondary font-medium text-[0.95rem] transition-colors duration-200 no-underline hover:text-primary">Tech</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-text-primary font-semibold no-underline">
              Login
            </Link>
            <Link
              href="/dashboard"
              className="bg-primary text-white py-[0.6rem] px-5 rounded-[50px] font-semibold no-underline flex items-center gap-2 transition-all duration-300 shadow-md hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-glow"
            >
              Try Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-[140px] pb-20 bg-[radial-gradient(circle_at_50%_0%,_rgba(16,185,129,0.1)_0%,_transparent_70%)] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 lg:justify-between lg:text-left">
          <div className="flex-1 max-w-[600px]">
             <div className="inline-flex items-center gap-2 bg-[rgba(16,185,129,0.1)] text-primary-dark py-2 px-4 rounded-[50px] text-sm font-semibold mb-6 border border-[rgba(16,185,129,0.2)]">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              The #1 App for Pakistani Shopkeepers
            </div>

            <h1 className="text-[2.5rem] md:text-[3.5rem] font-extrabold leading-[1.1] mb-6 text-text-primary">
              Digital Dukan – The <br />
              <span className="text-primary">Smart Online Khata App</span>
            </h1>

            <p className="text-lg text-text-secondary mb-4 leading-relaxed">
              Manage udhar, stock, employees, and payments — all in one easy app.
            </p>
            <p className="font-[family-name:var(--font-urdu)] text-xl text-text-primary mb-8 font-semibold" dir="rtl">
              آن لائن کھاتہ اور اسٹاک مینجمنٹ، آپ کی دکان کے لیے
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button className="bg-gradient-to-br from-primary to-primary-dark text-white py-4 px-8 rounded-[50px] font-bold text-lg border-none cursor-pointer flex items-center justify-center gap-3 transition-all duration-300 shadow-glow hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)]">
                <Download size={20} /> Download App
              </button>
              <Link
                href="/dashboard"
                className="bg-surface text-text-primary py-4 px-8 rounded-[50px] font-bold text-lg border border-border no-underline flex items-center justify-center transition-all duration-200 hover:bg-background hover:border-text-secondary"
              >
                Try Free on Web
              </Link>
            </div>
          </div>

          {/* Mobile App Mockup */}
          <div className="relative z-10 perspective-[1000px]">
             <div className="w-[300px] h-[600px] bg-[#111] rounded-[40px] p-[10px] shadow-[0_0_0_2px_#333,0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_20px_rgba(16,185,129,0.3)] relative transform -rotate-y-5 rotate-x-5 transition-transform duration-500 hover:rotate-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[25px] bg-[#111] rounded-b-[16px] z-20"></div>

                <div className="bg-gray-100 w-full h-full rounded-[32px] overflow-hidden relative flex flex-col">
                  {/* App Header */}
                  <div className="bg-gradient-to-br from-primary to-primary-dark pt-10 px-5 pb-5 text-white rounded-b-[24px] shadow-lg">
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <p className="text-xs opacity-80">Welcome back</p>
                        <p className="font-bold">Bismillah General Store</p>
                      </div>
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Users size={16} />
                      </div>
                    </div>
                    <div className="bg-white/10 border border-white/20 rounded-[16px] p-4 backdrop-blur-sm">
                      <p className="text-xs opacity-80 mb-1">Total Udhar (Receivable)</p>
                      <p className="text-2xl font-bold">Rs 45,200</p>
                    </div>
                  </div>

                  {/* App Body */}
                  <div className="flex-1 p-5 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white p-4 rounded-[16px] flex flex-col items-center gap-2 shadow-sm transition-transform hover:-translate-y-0.5">
                         <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><BarChart3 size={20}/></div>
                         <span className="text-xs font-bold text-gray-700">Khata</span>
                      </div>
                      <div className="bg-white p-4 rounded-[16px] flex flex-col items-center gap-2 shadow-sm transition-transform hover:-translate-y-0.5">
                         <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><Layers size={20}/></div>
                         <span className="text-xs font-bold text-gray-700">Stock</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-[20px] p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-xs text-gray-800">Recent Activity</h3>
                        <span className="text-xs text-primary">View All</span>
                      </div>
                      <div className="space-y-3">
                         <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                           <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">A</div>
                             <div>
                               <p className="text-xs font-bold text-gray-800">Ali Khan</p>
                               <p className="text-[10px] text-gray-500">Udhar given</p>
                             </div>
                           </div>
                           <span className="text-xs font-bold text-red-500">- Rs 500</span>
                         </div>
                         <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                           <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">S</div>
                             <div>
                               <p className="text-xs font-bold text-gray-800">Sana</p>
                               <p className="text-[10px] text-gray-500">Payment received</p>
                             </div>
                           </div>
                           <span className="text-xs font-bold text-green-500">+ Rs 1,200</span>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* App Nav */}
                  <div className="bg-white py-4 px-8 flex justify-between items-center border-t border-gray-100">
                    <div className="flex flex-col items-center text-primary text-[0.65rem] gap-1 font-bold"><BarChart3 size={20}/><span className="mt-1">Home</span></div>
                    <div className="flex flex-col items-center text-gray-400 text-[0.65rem] gap-1"><Users size={20}/><span className="mt-1">Customers</span></div>
                    <div className="flex flex-col items-center text-gray-400 text-[0.65rem] gap-1"><Layers size={20}/><span className="mt-1">Items</span></div>
                  </div>
                </div>
             </div>

             {/* Floating Badges */}
             <div className="absolute top-10 -left-20 bg-white py-3 px-5 rounded-[16px] shadow-lg flex items-center gap-3 z-30 min-w-[200px] animate-[float_3s_ease-in-out_infinite]">
                <div className="w-10 h-10 bg-[rgba(16,185,129,0.1)] text-primary rounded-full flex items-center justify-center"><CheckCircle2 size={20} /></div>
                <div>
                  <p className="text-xs text-gray-500">Stock Updated</p>
                  <p className="font-bold text-xs text-gray-800">Automatically</p>
                </div>
             </div>

             <div className="absolute bottom-20 -right-14 bg-white py-3 px-5 rounded-[16px] shadow-lg flex items-center gap-3 z-30 min-w-[200px] animate-[float_3s_ease-in-out_infinite] delay-[1.5s]">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 p-2 rounded-full flex items-center justify-center"><Globe size={20} /></div>
                <div>
                  <p className="text-xs text-gray-500">Language</p>
                  <p className="font-bold text-xs text-gray-800 font-[family-name:var(--font-urdu)]" dir="rtl">اردو / English</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <h2 className="text-[2.25rem] font-extrabold mb-4 text-text-primary">Everything You Need to Run Your Shop</h2>
            <p className="text-lg text-text-secondary">
              Digital Dukan replaces your paper registers with a secure, easy-to-use mobile app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BarChart3 size={32} />}
              title="Khata (Ledger)"
              description="Manage customer credits (Udhar) and payments. Send reminders, track dues, and keep clean digital records."
            />
            <FeatureCard
              icon={<Layers size={32} />}
              title="Inventory Management"
              description="Track stock levels, prices, and get low-stock alerts. Inventory updates automatically with every sale."
            />
            <FeatureCard
              icon={<Users size={32} />}
              title="Employee Management"
              description="Manage staff details, track attendance, and salaries easily within the app."
            />
             <FeatureCard
              icon={<Globe size={32} />}
              title="Bilingual Support"
              description="Full Urdu support and clean UX designed specifically for Pakistani shopkeepers. Switch languages instantly."
            />
            <FeatureCard
              icon={<ShieldCheck size={32} />}
              title="Secure Custom Authentication"
              description="Custom Postgres users table with bcrypt hashing and JWT sessions. You own your data completely."
            />
            <FeatureCard
              icon={<Lock size={32} />}
              title="Air-Tight Security"
              description="Vendor-independent database access. Policies ensure your data is only accessible by the secure server."
            />
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-24 bg-background relative">
        <div className="max-w-[1200px] mx-auto px-6">
           <div className="text-center max-w-[700px] mx-auto mb-16">
            <h2 className="text-[2.25rem] font-extrabold mb-4 text-text-primary">Why Pakistani Shopkeepers Love Digital Dukan</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Simple to Use", desc: "Designed for anyone, no tech skills needed." },
              { title: "For Retail", desc: "Perfect for Kiryana, Medical, and General Stores." },
              { title: "Mobile & Desktop", desc: "Works on your phone and laptop seamlessly." },
              { title: "100% Reliable", desc: "Accurate calculations, zero errors." }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[20px] shadow-sm text-center relative overflow-hidden border border-border">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full flex items-center justify-center font-extrabold mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-text-secondary text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-[700px] mx-auto mb-16">
             <h2 className="text-[2.25rem] font-extrabold mb-4 text-text-primary">How It Works</h2>
             <p className="text-lg text-text-secondary">Get started in minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-10 left-[50px] right-[50px] h-[2px] bg-[#E5E7EB] z-0"></div>

            {[
              { icon: Smartphone, title: "Sign Up", desc: "Create your secure account in seconds." },
              { icon: Users, title: "Add Customers", desc: "Add your customers or inventory items." },
              { icon: BarChart3, title: "Track Khata", desc: "Record udhar and payments daily." },
              { icon: Zap, title: "Grow Business", desc: "View insights and grow your profits." }
            ].map((step, i) => (
              <div key={i} className="text-center relative z-10 bg-background">
                <div className="w-20 h-20 bg-white border border-border rounded-full flex items-center justify-center mx-auto mb-6 text-primary shadow-md">
                  <step.icon size={32} />
                </div>
                <h3 className="font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-text-secondary">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech-stack" className="py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-16">
            <div className="w-full md:w-1/2">
              <h2 className="flex items-center gap-4 text-[2rem] font-extrabold mb-6">
                <Server className="text-primary" /> Built with Modern Tech
              </h2>
              <p className="text-text-secondary mb-6 leading-relaxed text-lg">
                Digital Dukan is built on a robust, scalable stack ensuring speed and security.
              </p>
              <ul className="list-none p-0">
                {["Next.js 16 (App Router)", "Supabase (Custom Schema)", "Postgres Database", "bcrypt + jose (Secure JWT Auth)"].map((tech, i) => (
                  <li key={i} className="flex items-center gap-3 mb-4 text-[1.1rem] font-medium">
                    <span className="w-2 h-2 bg-primary rounded-full"></span> {tech}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-6">
               {[
                 { icon: Database, label: "Postgres" },
                 { icon: ShieldCheck, label: "JWT Auth" },
                 { icon: Zap, label: "Next.js" },
                 { icon: Lock, label: "RLS Policies" }
               ].map((tech, i) => (
                 <div key={i} className="bg-white p-8 rounded-[20px] flex flex-col items-center justify-center shadow-md border border-border font-semibold">
                   <tech.icon className="text-primary mb-1" size={32} />
                   <span>{tech.label}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Deployment Banner */}
      <section className="bg-black text-white p-4 flex justify-center items-center gap-4">
          <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center font-black text-[0.8rem]">V</div>
          <p className="font-medium">Deploy instantly on Vercel — fast, secure, and scalable.</p>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-surface text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[2.5rem] font-extrabold mb-4">Start Your Digital Journey Today</h2>
          <p className="text-xl text-text-secondary mb-10">
            Join the community of smart shopkeepers.
          </p>
          <Link
            href="/dashboard"
            className="bg-gradient-to-br from-primary to-primary-dark text-white py-4 px-8 rounded-[50px] font-bold text-[1.125rem] border-none cursor-pointer flex items-center justify-center gap-3 transition-all duration-300 shadow-glow hover:-translate-y-0.5 hover:shadow-xl w-fit mx-auto"
          >
            Get Started for Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border pt-16 pb-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 text-text-primary no-underline font-bold text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-[10px] flex items-center justify-center text-white font-extrabold text-xl shadow-glow">
                  <span>D</span>
                </div>
                <span className="text-2xl font-bold text-text-primary">Digital Dukan</span>
              </div>
              <p className="text-text-secondary mt-4 leading-relaxed">
                The best companion for your business. Secure, fast, and reliable.
              </p>
              <p className="font-[family-name:var(--font-urdu)] text-[1.1rem] text-primary mt-4 font-semibold" dir="rtl">
                کاروبار میں برکت، ڈیجیٹل دکان کی حرکت
              </p>
            </div>

            {[
              { title: "Product", links: [ { l: "Features", h: "#features" }, { l: "How it Works", h: "#how-it-works" }, { l: "Pricing", h: "/pricing" } ] },
              { title: "Company", links: [ { l: "About Us", h: "/about" }, { l: "Careers", h: "/careers" }, { l: "Contact", h: "/contact" } ] },
              { title: "Legal", links: [ { l: "Privacy Policy", h: "/privacy" }, { l: "Terms of Service", h: "/terms" } ] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-bold mb-6">{col.title}</h4>
                <ul className="list-none p-0">
                  {col.links.map((link, j) => (
                    <li key={j} className="mb-3">
                      <Link href={link.h} className="text-text-secondary no-underline transition-colors hover:text-primary">{link.l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-text-secondary text-sm">
            <p>
              © {new Date().getFullYear()} Digital Dukan. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {/* Social Icons placeholders */}
              <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center text-text-secondary transition-all duration-200 cursor-pointer hover:bg-primary hover:text-white">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </div>
               <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center text-text-secondary transition-all duration-200 cursor-pointer hover:bg-primary hover:text-white">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-surface border border-border p-8 rounded-[24px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary">
      <div className="w-[60px] h-[60px] bg-[rgba(16,185,129,0.1)] text-primary rounded-[16px] flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}
