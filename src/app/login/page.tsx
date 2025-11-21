'use client'

import { login, signup } from './actions'
import { useState, use } from 'react'
import { useLanguage } from '@/context/LanguageContext'

export default function LoginPage({ searchParams }: { searchParams: Promise<{ message: string, error: string }> }) {
    const [isLogin, setIsLogin] = useState(true)
    const params = use(searchParams)
    const { t } = useLanguage()

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-primary mb-2">Ezekata</h1>
                    <p className="text-muted text-lg">E-Z-Khata - {t('login.signIn')}</p>
                </div>

                <div className="card bg-surface p-8 rounded-xl shadow-lg border border-border">
                    {params?.error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{params.error}</span>
                        </div>
                    )}
                    {params?.message && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{params.message}</span>
                        </div>
                    )}

                    <form className="space-y-6">
                        {!isLogin && (
                            <>
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary mb-1">{t('login.fullName')}</label>
                                    <input id="fullName" name="fullName" type="text" required className="input w-full" placeholder="Ali Khan" />
                                </div>
                                <div>
                                    <label htmlFor="businessName" className="block text-sm font-medium text-text-secondary mb-1">{t('login.shopName')}</label>
                                    <input id="businessName" name="businessName" type="text" required className="input w-full" placeholder="Bismillah General Store" />
                                </div>
                            </>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                                {t('login.email')}
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="input w-full"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                                {t('login.password')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="input w-full"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex flex-col gap-4">
                            {isLogin ? (
                                <button formAction={login} className="btn btn-primary w-full justify-center">
                                    {t('login.login')}
                                </button>
                            ) : (
                                <button formAction={signup} className="btn btn-primary w-full justify-center">
                                    {t('login.createAccount')}
                                </button>
                            )}

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-surface text-muted">{t('common.or')}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="btn btn-secondary w-full justify-center"
                            >
                                {isLogin ? t('login.createNewAccount') : t('login.alreadyHaveAccount')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
