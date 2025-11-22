'use client'

import { login, signup } from './actions'
import { useState, useActionState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { Loader2, Store, User, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const { t } = useLanguage()

    // Use separate states for login and signup
    const [loginState, loginAction, isLoginPending] = useActionState(login, {})
    const [signupState, signupAction, isSignupPending] = useActionState(signup, {})

    // Determine which state to show
    const state = isLogin ? loginState : signupState

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-primary opacity-10 blur-3xl" />
                <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-accent opacity-10 blur-3xl" />
            </div>

            <div className="w-full max-w-md p-4 relative z-10">
                <div className="text-center mb-8 fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-glow">
                        <Store className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold gradient-text mb-2">Ezekata</h1>
                    <p className="text-muted text-lg">E-Z-Khata - {t('login.signIn')}</p>
                </div>

                <div className="glass-card rounded-2xl p-8 slide-up">
                    {/* Tabs */}
                    <div className="flex p-1 bg-surface/50 rounded-xl mb-8 border border-border relative">
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                                isLogin
                                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            {t('login.login')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                                !isLogin
                                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            {t('login.createAccount')}
                        </button>
                    </div>

                    {state?.error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 animate-shake">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">{state.error}</span>
                        </div>
                    )}

                    {state?.message && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 fade-in">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">{state.message}</span>
                        </div>
                    )}

                    <form action={isLogin ? loginAction : signupAction} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-5 fade-in">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        required
                                        className="input w-full pl-10 bg-background/50 focus:bg-background transition-colors"
                                        placeholder={t('login.placeholders.fullName')}
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                                        <Store className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="businessName"
                                        name="businessName"
                                        type="text"
                                        required
                                        className="input w-full pl-10 bg-background/50 focus:bg-background transition-colors"
                                        placeholder={t('login.placeholders.shopName')}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="input w-full pl-10 bg-background/50 focus:bg-background transition-colors"
                                placeholder={t('login.placeholders.email')}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                required
                                className="input w-full pl-10 bg-background/50 focus:bg-background transition-colors"
                                placeholder={t('login.placeholders.password')}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoginPending || isSignupPending}
                            className="btn btn-gradient w-full justify-center h-11 mt-2"
                        >
                            {(isLoginPending || isSignupPending) ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                isLogin ? t('login.login') : t('login.createAccount')
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
