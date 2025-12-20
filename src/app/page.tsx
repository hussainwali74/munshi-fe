
'use client';

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
  Zap,
  Layers
} from 'lucide-react';
import styles from './page.module.css';
import { useLanguage } from '@/context/LanguageContext';

export default function LandingPage() {
  const { t, language } = useLanguage();
  const isRtl = language === 'ur';

  return (
    <div className="min-h-screen bg-background text-text-primary" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <span>EZ</span>
            </div>
            <span className={styles.logoText}>Khata</span>
          </div>
          <nav className={styles.headerNav}>
            <Link href="#features" className={styles.navLink}>{t('landing.features')}</Link>
            <Link href="#how-it-works" className={styles.navLink}>{t('landing.howItWorks')}</Link>
          </nav>
          <div className={styles.headerActions}>
            <Link href="/login" className={styles.loginLink}>
              {t('landing.login')}
            </Link>
            <Link href="/dashboard" className={styles.headerButton}>
              {t('landing.tryFree')} <ArrowRight size={16} />
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
              {t('landing.badge')}
            </div>

            <h1 className={styles.heroTitle}>
              {t('landing.heroTitle')} <br />
              <span>{t('landing.heroTitleHighlight')}</span>
            </h1>

            <p className="text-lg text-text-secondary mb-4 leading-relaxed">
              {t('landing.heroDescription')}
            </p>
            <p className="font-[family-name:var(--font-urdu)] text-xl text-text-primary mb-8 font-semibold" dir="rtl">
              {t('landing.heroUrdu')}
            </p>

            <div className={styles.heroButtons}>
              <Link href="/dashboard" className={styles.heroButton}>
                {t('landing.tryFreeWeb')}
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
            <h2>{t('landing.featuresTitle')}</h2>
            <p>
              {t('landing.featuresSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BarChart3 size={32} />}
              title={t('landing.featureKhata')}
              description={t('landing.featureKhataDesc')}
            />
            <FeatureCard
              icon={<Layers size={32} />}
              title={t('landing.featureInventory')}
              description={t('landing.featureInventoryDesc')}
            />
            <FeatureCard
              icon={<Users size={32} />}
              title={t('landing.featureEmployees')}
              description={t('landing.featureEmployeesDesc')}
            />
            <FeatureCard
              icon={<Globe size={32} />}
              title={t('landing.featureBilingual')}
              description={t('landing.featureBilingualDesc')}
            />
            <FeatureCard
              icon={<ShieldCheck size={32} />}
              title={t('landing.featureAuth')}
              description={t('landing.featureAuthDesc')}
            />
            <FeatureCard
              icon={<Lock size={32} />}
              title={t('landing.featureSecurity')}
              description={t('landing.featureSecurityDesc')}
            />
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className={`${styles.section} ${styles.whySection}`}>
        <div className={styles.container}>
          <div className={styles.sectionTitle}>
            <h2>{t('landing.whyTitle')}</h2>
          </div>
          <div className={styles.whyGrid}>
            {[
              { title: t('landing.whySimple'), desc: t('landing.whySimpleDesc') },
              { title: t('landing.whyRetail'), desc: t('landing.whyRetailDesc') },
              { title: t('landing.whyMobile'), desc: t('landing.whyMobileDesc') },
              { title: t('landing.whyReliable'), desc: t('landing.whyReliableDesc') }
            ].map((item, i) => (
              <div key={i} className={styles.whyCard}>
                <div className={styles.whyBadge}>
                  {i + 1}
                </div>
                <h3 className={styles.whyTitle}>{item.title}</h3>
                <p className={styles.whyDescription}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionTitle}>
            <h2>{t('landing.howItWorksTitle')}</h2>
            <p>{t('landing.howItWorksSubtitle')}</p>
          </div>

          <div className={styles.howItWorksGrid}>
            {/* Connecting Line (Desktop) */}
            <div className={styles.connectingLine}></div>

            {[
              { icon: Smartphone, title: t('landing.stepSignUp'), desc: t('landing.stepSignUpDesc') },
              { icon: Users, title: t('landing.stepAddCustomers'), desc: t('landing.stepAddCustomersDesc') },
              { icon: BarChart3, title: t('landing.stepTrackKhata'), desc: t('landing.stepTrackKhataDesc') },
              { icon: Zap, title: t('landing.stepGrow'), desc: t('landing.stepGrowDesc') }
            ].map((step, i) => (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepIcon}>
                  <step.icon size={32} />
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>{t('landing.ctaTitle')}</h2>
          <p className={styles.ctaDescription}>
            {t('landing.ctaSubtitle')}
          </p>
          <Link href="/dashboard" className={styles.ctaButton}>
            {t('landing.ctaButton')} <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerGrid}>
            <div>
              <div className={styles.footerBrand}>
                <div className={styles.footerLogo}>
                  <span>EZ</span>
                </div>
                <span className={styles.logoText}>EZ Khata</span>
              </div>
              <p className={styles.footerDescription}>
                {t('landing.footerDescription')}
              </p>
              <p className={styles.footerUrdu} dir="rtl">
                {t('landing.footerUrdu')}
              </p>
            </div>

            <div className={styles.footerLinks}>
              <h4>{t('landing.product')}</h4>
              <ul>
                <li><Link href="#features">{t('landing.features')}</Link></li>
                <li><Link href="#how-it-works">{t('landing.howItWorks')}</Link></li>
                <li><Link href="/pricing">{t('landing.pricing')}</Link></li>
              </ul>
            </div>
            <div className={styles.footerLinks}>
              <h4>{t('landing.company')}</h4>
              <ul>
                <li><Link href="/about">{t('landing.aboutUs')}</Link></li>
                <li><Link href="/careers">{t('landing.careers')}</Link></li>
                <li><Link href="/contact">{t('landing.contact')}</Link></li>
              </ul>
            </div>
            <div className={styles.footerLinks}>
              <h4>{t('landing.legal')}</h4>
              <ul>
                <li><Link href="/privacy">{t('landing.privacy')}</Link></li>
                <li><Link href="/terms">{t('landing.terms')}</Link></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>
              © {new Date().getFullYear()} EZ Khata. All rights reserved.
            </p>
            <div className={styles.socialIcons}>
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
      <div className={styles.featureIcon}>
        {icon}
      </div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDescription}>
        {description}
      </p>
    </div>
  );
}

