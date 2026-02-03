'use client'

import { login, signup } from './actions'
import { useState, useActionState } from 'react'
import { useLanguage } from '@/context/LanguageContext'

import { Loader2, Facebook, Twitter, Linkedin } from 'lucide-react'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const { t, dir, language } = useLanguage()
    const isRtl = language === 'ur'

    // Use separate states for login and signup
    const [loginState, loginAction, isLoginPending] = useActionState(login, {})
    const [signupState, signupAction, isSignupPending] = useActionState(signup, {})

    // Determine which state to show
    const state = isLogin ? loginState : signupState

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4 sm:p-6 lg:p-8" dir={dir}>
            <div className="w-full max-w-4xl flex rounded-2xl overflow-hidden shadow-2xl bg-white">
                {/* Left Side - Form */}
                <div className={`w-full lg:w-1/2 p-8 sm:p-12 ${isRtl ? 'text-right' : 'text-left'}`}>
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{isLogin ? t('login.login') : t('login.register')}</h1>
                        <p className="text-sm text-gray-600">{isLogin ? t('login.signIn') : t('login.createAccount')}</p>
                    </div>

                    {/* Error Message */}
                    {state?.error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                            {state.error}
                        </div>
                    )}

                    {/* Success Message */}
                    {state?.message && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
                            {state.message}
                        </div>
                    )}

                    <form action={isLogin ? loginAction : signupAction} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('login.fullName')}
                                    </label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 text-sm"
                                        placeholder={t('login.placeholders.fullName')}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('login.shopName')}
                                    </label>
                                    <input
                                        id="businessName"
                                        name="businessName"
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 text-sm"
                                        placeholder={t('login.placeholders.shopName')}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('login.phoneNumber')}
                                    </label>
                                    <input
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        type="tel"
                                        required
                                        dir="ltr"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 text-sm"
                                        placeholder={t('login.placeholders.phone')}
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label htmlFor={isLogin ? "identifier" : "email"} className="block text-sm font-medium text-gray-700 mb-1">
                                {isLogin ? t('login.emailOrPhone') : t('login.email')}
                            </label>
                            <input
                                id={isLogin ? "identifier" : "email"}
                                name={isLogin ? "identifier" : "email"}
                                type={isLogin ? "text" : "email"}
                                autoComplete={isLogin ? "username" : "email"}
                                required
                                dir="ltr"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 text-sm"
                                placeholder={isLogin ? t('login.placeholders.emailOrPhone') : t('login.placeholders.email')}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                {t('login.password')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                required
                                dir="ltr"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 text-sm"
                                placeholder={t('login.placeholders.password')}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoginPending || isSignupPending}
                                className="w-full py-3 rounded-lg text-white font-semibold shadow-md transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg text-sm bg-emerald-600 hover:bg-emerald-700"
                            >
                                {(isLoginPending || isSignupPending) ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    isLogin ? t('login.login') : t('login.register')
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Social Login */}
                    <div className="mt-6">
                        <div className="flex items-center justify-center gap-4">
                            <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white hover:bg-sky-600 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white hover:bg-blue-800 transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Switch between Login/Signup */}
                    <div className="mt-6 text-center text-sm text-gray-600">
                        {isLogin ? (
                            <span>
                                {t('login.noAccount')}{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(false)}
                                    className="font-medium text-emerald-600 hover:text-emerald-700 focus:outline-none"
                                >
                                    {t('login.register')}
                                </button>
                            </span>
                        ) : (
                            <span>
                                {t('login.haveAccount')}{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(true)}
                                    className="font-medium text-emerald-600 hover:text-emerald-700 focus:outline-none"
                                >
                                    {t('login.login')}
                                </button>
                            </span>
                        )}
                    </div>
                </div>

                {/* Right Side - Welcome Panel */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-500 to-emerald-600 p-12 flex-col justify-center items-center text-white">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4">{t('login.welcomeBackTitle')}</h2>
                        <p className="text-emerald-50 text-sm leading-relaxed mb-8">
                            {t('login.welcomeBackSubtitle')}
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className="inline-block px-8 py-2.5 border-2 border-white rounded-full text-sm font-semibold hover:bg-white hover:text-emerald-600 transition-all cursor-pointer"
                        >
                            {t('login.noAccountYet')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
