
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
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary" dir="ltr">
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <span>EZ</span>
            </div>
            <span className={styles.logoText}>Khata</span>
          </div>
          <nav className={styles.nav}>
            <Link href="#features" className={styles.navLink}>Features</Link>
            <Link href="#how-it-works" className={styles.navLink}>How it Works</Link>
            <Link href="#tech-stack" className={styles.navLink}>Tech</Link>
          </nav>
          <div className={styles.headerActions}>
            <Link href="/login" className={styles.loginLink}>
              Login
            </Link>
            <Link
              href="/dashboard"
              className={styles.tryFreeBtn}
            >
              Try Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroText}>
            <div className={styles.badge}>
              <span className={styles.pingWrapper}>
                <span className={styles.ping}></span>
                <span className={styles.pingDot}></span>
              </span>
              The #1 App for Pakistani Shopkeepers
            </div>

            <h1 className={styles.heroTitle}>
              EZ Khata – The <br />
              <span>Smart Online Khata App</span>
            </h1>

            <p className={styles.heroSubtitle}>
              Manage udhar, stock, employees, and payments — all in one easy app.
            </p>
            <p className={styles.heroUrdu} dir="rtl">
              آن لائن کھاتہ اور اسٹاک مینجمنٹ، آپ کی دکان کے لیے
            </p>

            <div className={styles.heroButtons}>
              {/* <button className={styles.downloadBtn}>
                <Download size={20} /> Download App
              </button> */}
              <Link
                href="/dashboard"
                className={styles.webBtn}
              >
                Try Free on Web
              </Link>
            </div>
          </div>

          {/* Mobile App Mockup */}
          <div className={styles.heroImage}>
            <div className={styles.phoneFrame}>
              <div className={styles.notch}></div>

              <div className={styles.screen}>
                {/* App Header */}
                <div className={styles.appHeader}>
                  <div className={styles.headerTop}>
                    <div>
                      <p className={styles.textXs + " " + styles.opacity80}>Welcome back</p>
                      <p className={styles.fontBold}>Bismillah General Store</p>
                    </div>
                    <div className={styles.userAvatar}>
                      <Users size={16} />
                    </div>
                  </div>
                  <div className={styles.statsCard}>
                    <p className={styles.textXs + " " + styles.opacity80 + " " + styles.mb1}>Total Udhar (Receivable)</p>
                    <p className={styles.text2xl + " " + styles.fontBold}>Rs 45,200</p>
                  </div>
                </div>

                {/* App Body */}
                <div className={styles.appBody}>
                  <div className={styles.actionGrid}>
                    <div className={styles.actionCard}>
                      <div className={styles.w10h10 + " " + styles.bgBlue100 + " " + styles.textBlue600 + " " + styles.roundedFull + " " + styles.flexCenter}><BarChart3 size={20} /></div>
                      <span className={styles.textXs + " " + styles.fontBold + " " + styles.textGray700}>Khata</span>
                    </div>
                    <div className={styles.actionCard}>
                      <div className={styles.w10h10 + " " + styles.bgGreen100 + " " + styles.textGreen600 + " " + styles.roundedFull + " " + styles.flexCenter}><Layers size={20} /></div>
                      <span className={styles.textXs + " " + styles.fontBold + " " + styles.textGray700}>Stock</span>
                    </div>
                  </div>

                  <div className={styles.recentActivity}>
                    <div className={styles.flexCenter + " " + styles.justifyBetween + " " + styles.mb3}>
                      <h3 className={styles.fontBold + " " + styles.textXs + " " + styles.textGray800}>Recent Activity</h3>
                      <span className={styles.textXs + " " + styles.textPrimary}>View All</span>
                    </div>
                    <div className={styles.spaceY3}>
                      <div className={styles.activityRow}>
                        <div className={styles.flexCenter + " " + styles.gap2}>
                          <div className={styles.w8h8 + " " + styles.roundedFull + " " + styles.bgRed100 + " " + styles.textRed600 + " " + styles.flexCenter + " " + styles.textXs + " " + styles.fontBold}>A</div>
                          <div>
                            <p className={styles.textXs + " " + styles.fontBold + " " + styles.textGray800}>Ali Khan</p>
                            <p className={styles.textSmall + " " + styles.textGray500}>Udhar given</p>
                          </div>
                        </div>
                        <span className={styles.textXs + " " + styles.fontBold + " " + styles.textRed500}>- Rs 500</span>
                      </div>
                      <div className={styles.activityRow}>
                        <div className={styles.flexCenter + " " + styles.gap2}>
                          <div className={styles.w8h8 + " " + styles.roundedFull + " " + styles.bgGreen100 + " " + styles.textGreen600 + " " + styles.flexCenter + " " + styles.textXs + " " + styles.fontBold}>S</div>
                          <div>
                            <p className={styles.textXs + " " + styles.fontBold + " " + styles.textGray800}>Sana</p>
                            <p className={styles.textSmall + " " + styles.textGray500}>Payment received</p>
                          </div>
                        </div>
                        <span className={styles.textXs + " " + styles.fontBold + " " + styles.textGreen500}>+ Rs 1,200</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* App Nav */}
                <div className={styles.appNav}>
                  <div className={`${styles.navItem} ${styles.active}`}><BarChart3 size={20} /><span className={styles.mt1 + " " + styles.fontBold}>Home</span></div>
                  <div className={styles.navItem}><Users size={20} /><span className={styles.mt1}>Customers</span></div>
                  <div className={styles.navItem}><Layers size={20} /><span className={styles.mt1}>Items</span></div>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className={`${styles.floatingBadge} ${styles.badgeTop}`}>
              <div className={styles.badgeIcon}><CheckCircle2 size={20} /></div>
              <div>
                <p className={styles.textXs + " " + styles.textGray500}>Stock Updated</p>
                <p className={styles.fontBold + " " + styles.textXs + " " + styles.textGray800}>Automatically</p>
              </div>
            </div>

            <div className={`${styles.floatingBadge} ${styles.badgeBottom}`}>
              <div className={styles.bgBlue100 + " " + styles.p2 + " " + styles.roundedFull + " " + styles.textBlue600}><Globe size={20} /></div>
              <div>
                <p className={styles.textXs + " " + styles.textGray500}>Language</p>
                <p className={styles.fontBold + " " + styles.textXs + " " + styles.textGray800 + " " + styles.urduText}>اردو / English</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`${styles.section} ${styles.featuresSection}`}>
        <div className={styles.container}>
          <div className={styles.sectionTitle}>
            <h2>Everything You Need to Run Your Shop</h2>
            <p>
              EZ Khata replaces your paper registers with a secure, easy-to-use mobile app.
            </p>
          </div>

          <div className={styles.grid}>
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
      <section className={`${styles.section} ${styles.whySection}`}>
        <div className={styles.container}>
          <div className={styles.sectionTitle}>
            <h2>Why Pakistani Shopkeepers Love EZ Khata</h2>
          </div>
          <div className={styles.whyGrid}>
            {[
              { title: "Simple to Use", desc: "Designed for anyone, no tech skills needed." },
              { title: "For Retail", desc: "Perfect for Kiryana, Medical, and General Stores." },
              { title: "Mobile & Desktop", desc: "Works on your phone and laptop seamlessly." },
              { title: "100% Reliable", desc: "Accurate calculations, zero errors." }
            ].map((item, i) => (
              <div key={i} className={styles.whyCard}>
                <div className={styles.whyNumber}>
                  {i + 1}
                </div>
                <h3 className={styles.fontBold + " " + styles.textLg + " " + styles.mb2}>{item.title}</h3>
                <p className={styles.textTextSecondary + " " + styles.textSm}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionTitle}>
            <h2>How It Works</h2>
            <p>Get started in minutes.</p>
          </div>

          <div className={styles.stepsGrid}>
            {/* Connecting Line (Desktop) */}
            <div className={styles.connectingLine}></div>

            {[
              { icon: Smartphone, title: "Sign Up", desc: "Create your secure account in seconds." },
              { icon: Users, title: "Add Customers", desc: "Add your customers or inventory items." },
              { icon: BarChart3, title: "Track Khata", desc: "Record udhar and payments daily." },
              { icon: Zap, title: "Grow Business", desc: "View insights and grow your profits." }
            ].map((step, i) => (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepIcon}>
                  <step.icon size={32} />
                </div>
                <h3 className={styles.fontBold + " " + styles.textXl + " " + styles.mb2}>{step.title}</h3>
                <p className={styles.textTextSecondary}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech-stack" className={`${styles.section} ${styles.featuresSection}`}>
        <div className={styles.container}>
          <div className={styles.techContent}>
            <div className={styles.mdHalf}>
              <h2 className={styles.techTitle}>
                <Server className={styles.textPrimary} /> Built with Modern Tech
              </h2>
              <p className={styles.textTextSecondary + " " + styles.mb6 + " " + styles.leadingRelaxed}>
                EZ Khata is built on a robust, scalable stack ensuring speed and security.
              </p>
              <ul className={styles.techList}>
                <li><span className={styles.dot}></span> Next.js 16 (App Router)</li>
                <li><span className={styles.dot}></span> Supabase (Custom Schema)</li>
                <li><span className={styles.dot}></span> Postgres Database</li>
                <li><span className={styles.dot}></span> bcrypt + jose (Secure JWT Auth)</li>
              </ul>
            </div>
            <div className={styles.mdHalf + " " + styles.techGrid}>
              <div className={styles.techItem}>
                <Database className={styles.textPrimary + " " + styles.mb1} size={32} />
                <span>Postgres</span>
              </div>
              <div className={styles.techItem}>
                <ShieldCheck className={styles.textPrimary + " " + styles.mb1} size={32} />
                <span>JWT Auth</span>
              </div>
              <div className={styles.techItem}>
                <Zap className={styles.textPrimary + " " + styles.mb1} size={32} />
                <span>Next.js</span>
              </div>
              <div className={styles.techItem}>
                <Lock className={styles.textPrimary + " " + styles.mb1} size={32} />
                <span>RLS Policies</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container + " " + styles.maxWidth3xl + " " + styles.mxAuto}>
          <h2 className={styles.ctaTitle}>Start Your Digital Journey Today</h2>
          <p className={styles.ctaSubtitle}>
            Join the community of smart shopkeepers.
          </p>
          <Link
            href="/dashboard"
            className={styles.downloadBtn}
            style={{ width: 'fit-content', margin: '0 auto' }}
          >
            Get Started for Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.logo}>
                <div className={styles.logoIcon}>
                  <span>D</span>
                </div>
                <span className={styles.logoText}>EZ Khata</span>
              </div>
              <p>
                The best companion for your business. Secure, fast, and reliable.
              </p>
              <p className={styles.footerUrdu} dir="rtl">
                کاروبار میں برکت، ڈیجیٹل دکان کی حرکت
              </p>
            </div>

            <div className={styles.footerLinks}>
              <h4>Product</h4>
              <ul>
                <li><Link href="#features">Features</Link></li>
                <li><Link href="#how-it-works">How it Works</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
              </ul>
            </div>
            <div className={styles.footerLinks}>
              <h4>Company</h4>
              <ul>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/careers">Careers</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className={styles.footerLinks}>
              <h4>Legal</h4>
              <ul>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>
              © {new Date().getFullYear()} EZ Khata. All rights reserved.
            </p>
            <div className={styles.flexCenter + " " + styles.gap4}>
              {/* Social Icons placeholders */}
              <div className={styles.socialIcon}>
                <svg className={styles.w4h4} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </div>
              <div className={styles.socialIcon}>
                <svg className={styles.w4h4} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
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
    <div className={styles.featureCard}>
      <div className={styles.iconBox}>
        {icon}
      </div>
      <h3 className={styles.textXl + " " + styles.fontBold + " " + styles.mb3}>{title}</h3>
      <p className={styles.textTextSecondary + " " + styles.leadingRelaxed}>
        {description}
      </p>
    </div>
  );
}
