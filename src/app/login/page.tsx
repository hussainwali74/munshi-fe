'use client'

import { login, signup } from './actions'
import { useState, useActionState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { Loader2, Store, User, Lock, Mail, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const { t } = useLanguage()

    // Use separate states for login and signup
    const [loginState, loginAction, isLoginPending] = useActionState(login, {})
    const [signupState, signupAction, isSignupPending] = useActionState(signup, {})

    // Determine which state to show
    const state = isLogin ? loginState : signupState

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden font-sans">
            {/* Background Elements - Subtle */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary opacity-[0.03] blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary-dark opacity-[0.03] blur-[100px]" />
            </div>

            <div className="w-full max-w-[400px] p-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-3 tracking-tight">Ezekata</h1>
                    <p className="text-text-secondary text-sm font-medium">
                        E-Z-Khata – Sign in to manage your shop
                    </p>
                </div>

                {/* Card */}
                <div className="bg-surface rounded-2xl p-8 shadow-xl border border-border">
                    {/* Tabs */}
                    <div className="grid grid-cols-2 p-1 bg-background rounded-xl mb-8 border border-border">
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                isLogin
                                    ? 'bg-surface text-primary shadow-sm ring-1 ring-black/5'
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            {t('login.login')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                !isLogin
                                    ? 'bg-surface text-primary shadow-sm ring-1 ring-black/5'
                                    : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            {t('login.createAccount')}
                        </button>
                    </div>

                    {/* Error Message */}
                    {state?.error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{state.error}</span>
                        </div>
                    )}

                    {/* Success Message */}
                    {state?.message && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 text-sm">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{state.message}</span>
                        </div>
                    )}

                    <form action={isLogin ? loginAction : signupAction} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        required
                                        className="w-full h-12 pl-11 pr-4 bg-background border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                        placeholder={t('login.placeholders.fullName')}
                                    />
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
                                        <Store className="h-5 w-5" />
                                    </div>
                                    <input
                                        id="businessName"
                                        name="businessName"
                                        type="text"
                                        required
                                        className="w-full h-12 pl-11 pr-4 bg-background border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                        placeholder={t('login.placeholders.shopName')}
                                    />
                                </div>
                            </>
                        )}

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="w-full h-12 pl-11 pr-4 bg-background border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                placeholder={t('login.placeholders.email')}
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-secondary group-focus-within:text-primary transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                required
                                className="w-full h-12 pl-11 pr-4 bg-background border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                                placeholder={t('login.placeholders.password')}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoginPending || isSignupPending}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white font-bold shadow-lg shadow-primary/20 transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {(isLoginPending || isSignupPending) ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    isLogin ? t('login.login') : t('login.createAccount')
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Trust Line */}
                    <div className="mt-8 flex items-center justify-center gap-2 text-text-secondary text-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Your data is securely encrypted.</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
