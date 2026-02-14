'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Mic, MicOff, Receipt } from 'lucide-react';
import { searchCustomers } from '@/app/dashboard/search-actions';
import { searchInventoryItems, createBill, getBillingDraftFromTransaction, getCustomerForBilling } from './actions';
import { getShopDetails } from '@/app/settings/actions';
import AddCustomerModal from '@/components/AddCustomerModal';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'react-hot-toast';
import BillingSteps from './components/BillingSteps';
import CustomerCard from './components/CustomerCard';
import ItemsCard from './components/ItemsCard';
import SummaryCard from './components/SummaryCard';
import InvoiceDetailPanel from './components/InvoiceDetailPanel';
import InvoiceSuccessModal from './components/InvoiceSuccessModal';
import { calculateBalanceDue, calculateBillTotals, generateBillNumber } from './utils';
import type { BillReceipt, CartItem, Customer, DiscountType, PaymentMode, ShopDetails } from './types';
import type { Language } from '@/lib/translations';
import { createTranslator } from '@/lib/translator';
import { useSearchParams } from 'next/navigation';
import type { InventorySearchItem } from '@/types/inventory';

type SpeechRecognitionResultLike = { transcript: string };
type SpeechRecognitionResultListLike = ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
type SpeechRecognitionEventLike = { results: SpeechRecognitionResultListLike };
type SpeechRecognitionLike = {
    continuous: boolean;
    lang: string;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    start: () => void;
};
type WebkitSpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function BillingPageContent() {
    const { t, language } = useLanguage();
    const isRtl = language === 'ur';
    const searchParams = useSearchParams();
    const customerIdParam = searchParams.get('customerId');
    const transactionIdParam = searchParams.get('transactionId');

    const [customerQuery, setCustomerQuery] = useState('');
    const [customerResults, setCustomerResults] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

    const [itemQuery, setItemQuery] = useState('');
    const [itemResults, setItemResults] = useState<InventorySearchItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);

    const [discountType, setDiscountType] = useState<DiscountType>('fixed');
    const [discountValue, setDiscountValue] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');

    const [isListening, setIsListening] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
    const [isSearchingItem, setIsSearchingItem] = useState(false);

    const [shopDetails, setShopDetails] = useState<ShopDetails | null>(null);
    const [billNumber, setBillNumber] = useState(generateBillNumber());
    const [completedBill, setCompletedBill] = useState<BillReceipt | null>(null);
    const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');
    const [autoPrint, setAutoPrint] = useState(false);

    const lastPrintedRef = useRef<string | null>(null);
    const hydratedTransactionRef = useRef<string | null>(null);
    const originalTitleRef = useRef<string | null>(null);

    const customerSearchRef = useRef<HTMLDivElement>(null);
    const itemSearchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadShopDetails = async () => {
            const details = await getShopDetails();
            setShopDetails(details);
        };
        loadShopDetails();
    }, []);

    useEffect(() => {
        if (transactionIdParam) return;
        if (!customerIdParam || selectedCustomer) return;

        let active = true;
        const loadCustomer = async () => {
            const customer = await getCustomerForBilling(customerIdParam);
            if (!active) return;
            if (customer) {
                setSelectedCustomer(customer);
                setCustomerQuery('');
                setCustomerResults([]);
            }
        };
        loadCustomer();

        return () => {
            active = false;
        };
    }, [customerIdParam, selectedCustomer, transactionIdParam]);

    useEffect(() => {
        if (!transactionIdParam) {
            hydratedTransactionRef.current = null;
            return;
        }
        if (hydratedTransactionRef.current === transactionIdParam) return;

        let active = true;
        const loadDraft = async () => {
            const draft = await getBillingDraftFromTransaction(transactionIdParam);
            if (!active || !draft) return;

            setSelectedCustomer(draft.customer);
            setCustomerQuery('');
            setCustomerResults([]);
            setCart(draft.items);
            setDiscountType('fixed');
            setDiscountValue(draft.discountAmount);
            setPaymentMode(draft.paymentMode);
            setPaidAmount(draft.paidAmount);
            setBillNumber(draft.billNumber || generateBillNumber());
            hydratedTransactionRef.current = transactionIdParam;
        };

        loadDraft();

        return () => {
            active = false;
        };
    }, [transactionIdParam]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const storedFormat = window.localStorage.getItem('billing.printFormat');
        if (storedFormat === 'a4' || storedFormat === 'thermal') {
            setPrintFormat(storedFormat);
        }
        const storedAutoPrint = window.localStorage.getItem('billing.autoPrint');
        setAutoPrint(storedAutoPrint === 'true');
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem('billing.printFormat', printFormat);
    }, [printFormat]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem('billing.autoPrint', autoPrint ? 'true' : 'false');
    }, [autoPrint]);

    useEffect(() => {
        if (customerQuery.trim().length > 0 && !selectedCustomer) {
            setIsSearchingCustomer(true);
        }
        const delayDebounceFn = setTimeout(async () => {
            if (customerQuery.trim().length > 0 && !selectedCustomer) {
                const data = await searchCustomers(customerQuery);
                setCustomerResults(data || []);
            } else {
                setCustomerResults([]);
            }
            setIsSearchingCustomer(false);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [customerQuery, selectedCustomer]);

    useEffect(() => {
        if (itemQuery.trim().length > 0) {
            setIsSearchingItem(true);
        }
        const delayDebounceFn = setTimeout(async () => {
            if (itemQuery.trim().length > 0) {
                const data = await searchInventoryItems(itemQuery);
                setItemResults(data || []);
            } else {
                setItemResults([]);
            }
            setIsSearchingItem(false);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [itemQuery]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (customerSearchRef.current && !customerSearchRef.current.contains(event.target as Node)) {
                setCustomerResults([]);
            }
            if (itemSearchRef.current && !itemSearchRef.current.contains(event.target as Node)) {
                setItemResults([]);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { subTotal, discountAmount, totalAmount } = calculateBillTotals(cart, discountType, discountValue);
    const balanceDue = calculateBalanceDue(totalAmount, paidAmount, paymentMode);

    useEffect(() => {
        if (paymentMode === 'cash') {
            setPaidAmount(totalAmount);
        }
    }, [paymentMode, totalAmount]);

    useEffect(() => {
        if (paymentMode === 'credit' && paidAmount > totalAmount) {
            setPaidAmount(totalAmount);
        }
    }, [paidAmount, totalAmount, paymentMode]);

    useEffect(() => {
        if (!completedBill || !autoPrint) return;
        if (typeof window === 'undefined' || typeof window.print !== 'function') return;
        if (lastPrintedRef.current === completedBill.billNumber) return;
        lastPrintedRef.current = completedBill.billNumber;
        const timer = window.setTimeout(() => window.print(), 300);
        return () => window.clearTimeout(timer);
    }, [completedBill, autoPrint]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleBeforePrint = () => {
            if (!completedBill) return;
            if (!originalTitleRef.current) {
                originalTitleRef.current = document.title;
            }
            const printLang = (document.body.dataset.printLang as Language | undefined) || language;
            document.body.dataset.printLang = printLang;
            const titleT = createTranslator(printLang);
            const shopTitle = shopDetails?.businessName || titleT('billing.invoice.shopNameFallback');
            document.title = `${shopTitle} - ${titleT('billing.invoice.invoiceLabel')} #${completedBill.billNumber}`;
        };

        const handleAfterPrint = () => {
            if (originalTitleRef.current) {
                document.title = originalTitleRef.current;
                originalTitleRef.current = null;
            }
            document.body.removeAttribute('data-print-lang');
        };

        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
            if (originalTitleRef.current) {
                document.title = originalTitleRef.current;
                originalTitleRef.current = null;
            }
            document.body.removeAttribute('data-print-lang');
        };
    }, [completedBill, shopDetails, language]);

    const handlePaymentModeChange = (mode: PaymentMode) => {
        setPaymentMode(mode);
        if (mode === 'credit') {
            setPaidAmount(0);
        }
    };

    const currentStep = completedBill
        ? 4
        : !selectedCustomer
            ? 1
            : cart.length === 0
                ? 2
                : 3;

    const addToCart = (item: InventorySearchItem) => {
        if (Number(item.quantity) <= 0) {
            toast.error(t('billing.outOfStock'));
            return;
        }

        const existing = cart.find(i => i.id === item.id);
        if (existing && existing.qty >= existing.maxQty) {
            toast.error(t('billing.maxStockAvailable', { max: existing.maxQty }));
            return;
        }

        setCart(prev => {
            const existingItem = prev.find(i => i.id === item.id);
            if (existingItem) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { id: item.id, name: item.name, price: item.selling_price, qty: 1, maxQty: item.quantity }];
        });
        setItemQuery('');
        setItemResults([]);
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const updateQty = (id: string, qty: number) => {
        if (qty < 1) return;

        const item = cart.find(i => i.id === id);
        if (item && qty > item.maxQty) {
            toast.error(t('billing.maxStockAvailable', { max: item.maxQty }));
            setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.maxQty } : i));
            return;
        }

        setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    };

    const handleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window)) {
            toast.error(t('billing.voiceNotSupported'));
            return;
        }

        const RecognitionCtor = (window as Window & { webkitSpeechRecognition: WebkitSpeechRecognitionConstructor }).webkitSpeechRecognition;
        const recognition = new RecognitionCtor();
        recognition.continuous = false;
        recognition.lang = language === 'ur' ? 'ur-PK' : 'en-PK';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = async (event: SpeechRecognitionEventLike) => {
            const transcript = event.results[0][0].transcript;

            const match = transcript.match(/^(\d+)\s+(.+)$/);
            let qty = 1;
            let query = transcript;

            if (match) {
                qty = parseInt(match[1]);
                query = match[2];
            }

            const items = await searchInventoryItems(query);
            if (items && items.length > 0) {
                const item = items[0];
                if (item.quantity <= 0) {
                    toast.error(t('billing.outOfStock'));
                    return;
                }

                setCart(prev => {
                    const existing = prev.find(i => i.id === item.id);
                    if (existing) {
                        const newQty = Math.min(existing.qty + qty, existing.maxQty);
                        return prev.map(i => i.id === item.id ? { ...i, qty: newQty } : i);
                    }

                    const boundedQty = Math.min(qty, item.quantity);
                    return [...prev, { id: item.id, name: item.name, price: item.selling_price, qty: boundedQty, maxQty: item.quantity }];
                });

                if (qty > item.quantity) {
                    toast.error(t('billing.maxStockAvailable', { max: item.quantity }));
                }
                toast.success(t('billing.addedToCart', { item: item.name }));
            } else {
                toast.error(t('billing.itemNotFound', { query }));
            }
        };

        recognition.start();
    };

    const handleSubmit = async () => {
        if (!selectedCustomer) {
            toast.error(t('billing.selectCustomerAlert'));
            return;
        }
        if (cart.length === 0) {
            toast.error(t('billing.cartEmptyAlert'));
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('customerId', selectedCustomer.id);
            formData.append('items', JSON.stringify(cart));
            formData.append('totalAmount', subTotal.toString());
            formData.append('discount', discountAmount.toString());
            formData.append('finalAmount', totalAmount.toString());
            formData.append('paidAmount', paidAmount.toString());
            formData.append('paymentMode', paymentMode);
            formData.append('billNumber', billNumber);

            const transaction = await createBill(formData);

            const receipt: BillReceipt = {
                billNumber,
                createdAt: new Date().toISOString(),
                customer: selectedCustomer,
                items: cart,
                shopDetails,
                subTotal,
                discountAmount,
                totalAmount,
                paidAmount: paymentMode === 'cash' ? totalAmount : paidAmount,
                paymentMode,
                transactionId: transaction?.id,
            };

            setCompletedBill(receipt);
            setCart([]);
            setSelectedCustomer(null);
            setCustomerQuery('');
            setPaidAmount(0);
            setDiscountValue(0);
            setPaymentMode('cash');
            setItemQuery('');
            setItemResults([]);
            setBillNumber(generateBillNumber());
            toast.success(t('billing.billCreated'));
        } catch (error) {
            console.error(error);
            const message = error instanceof Error && error.message ? error.message : t('billing.failedCreateBill');
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const canSubmit = !!selectedCustomer && cart.length > 0;

    const steps = [
        { label: t('billing.steps.customer'), hint: t('billing.steps.customerHint') },
        { label: t('billing.steps.items'), hint: t('billing.steps.itemsHint') },
        { label: t('billing.steps.payment'), hint: t('billing.steps.paymentHint') },
        { label: t('billing.steps.print'), hint: t('billing.steps.printHint') },
    ];

    return (
        <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6">
            <div className="print:hidden">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Receipt size={28} className="text-primary" />
                            </div>
                            {t('billing.title')}
                        </h1>
                        <p className="text-text-secondary mt-1">{t('billing.subtitle')}</p>
                    </div>
                    <button
                        onClick={handleVoiceInput}
                        className={`p-3 rounded-xl transition-all shadow-sm ${isListening
                            ? 'bg-red-100 text-red-600 animate-pulse border-2 border-red-300'
                            : 'bg-surface border border-border text-text-secondary hover:text-primary hover:border-primary'
                            }`}
                        title={t('billing.voiceBilling')}
                    >
                        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                </div>

                <div className="mt-4 mb-6">
                    <BillingSteps currentStep={currentStep} steps={steps} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <CustomerCard
                            selectedCustomer={selectedCustomer}
                            customerQuery={customerQuery}
                            customerResults={customerResults}
                            isSearching={isSearchingCustomer}
                            isRtl={isRtl}
                            onQueryChange={setCustomerQuery}
                            onSelectCustomer={(customer) => {
                                setSelectedCustomer(customer);
                                setCustomerResults([]);
                                setCustomerQuery('');
                            }}
                            onClearCustomer={() => {
                                setSelectedCustomer(null);
                                setCustomerQuery('');
                            }}
                            onAddCustomer={() => setIsAddCustomerOpen(true)}
                            searchRef={customerSearchRef}
                            t={t}
                        />

                        <ItemsCard
                            itemQuery={itemQuery}
                            itemResults={itemResults}
                            cart={cart}
                            isSearching={isSearchingItem}
                            isRtl={isRtl}
                            onQueryChange={setItemQuery}
                            onAddItem={addToCart}
                            onUpdateQty={updateQty}
                            onRemoveItem={removeFromCart}
                            searchRef={itemSearchRef}
                            t={t}
                        />
                    </div>

                    <div className="space-y-6">
                        <SummaryCard
                            subTotal={subTotal}
                            discountAmount={discountAmount}
                            totalAmount={totalAmount}
                            discountType={discountType}
                            discountValue={discountValue}
                            paidAmount={paidAmount}
                            paymentMode={paymentMode}
                            balanceDue={balanceDue}
                            isSubmitting={isSubmitting}
                            canSubmit={canSubmit}
                            onDiscountTypeChange={setDiscountType}
                            onDiscountValueChange={setDiscountValue}
                            onPaymentModeChange={handlePaymentModeChange}
                            onPaidAmountChange={setPaidAmount}
                            onSubmit={handleSubmit}
                            t={t}
                        />
                    </div>
                </div>

                <AddCustomerModal
                    isOpen={isAddCustomerOpen}
                    onClose={() => setIsAddCustomerOpen(false)}
                    onSuccess={() => {
                        toast.success(t('billing.customerAdded'));
                    }}
                />
            </div>

            {completedBill && (
                <InvoiceSuccessModal
                    bill={completedBill}
                    onClose={() => setCompletedBill(null)}
                    t={t}
                >
                    <InvoiceDetailPanel
                        bill={completedBill}
                        t={t}
                        printFormat={printFormat}
                        actionSlot={(
                            <button
                                type="button"
                                onClick={() => setCompletedBill(null)}
                                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-text-primary font-semibold hover:bg-background transition-colors"
                            >
                                {t('billing.invoice.done')}
                            </button>
                        )}
                    />
                </InvoiceSuccessModal>
            )}
        </div>
    );
}

export default function BillingPage() {
    return (
        <Suspense fallback={<div className="text-text-secondary">Loading...</div>}>
            <BillingPageContent />
        </Suspense>
    );
}
