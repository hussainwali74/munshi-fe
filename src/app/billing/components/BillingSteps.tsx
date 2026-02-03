import React from 'react';

interface BillingStepsProps {
    currentStep: number;
    steps: { label: string; hint?: string }[];
}

export default function BillingSteps({ currentStep, steps }: BillingStepsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isComplete = stepNumber < currentStep;

                return (
                    <div
                        key={step.label}
                        className={`rounded-xl border p-3 transition-all ${isActive
                            ? 'border-primary bg-primary/10 shadow-md'
                            : isComplete
                                ? 'border-success/40 bg-success/10'
                                : 'border-border bg-surface'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${isActive
                                    ? 'bg-primary text-white'
                                    : isComplete
                                        ? 'bg-success text-white'
                                        : 'bg-background text-text-secondary'
                                    }`}
                            >
                                {stepNumber}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-text-primary">{step.label}</p>
                                {step.hint && (
                                    <p className="text-xs text-text-secondary">{step.hint}</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
