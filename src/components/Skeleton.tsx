'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
    className,
    variant = 'rectangular',
    width,
    height,
    animation = 'pulse',
}: SkeletonProps) {
    const baseClasses = 'bg-gray-200 dark:bg-gray-700';

    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: '',
        rounded: 'rounded-xl',
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'skeleton-wave',
        none: '',
    };

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    return (
        <div
            className={cn(
                baseClasses,
                variantClasses[variant],
                animationClasses[animation],
                className
            )}
            style={style}
        />
    );
}

// Pre-built skeleton components for common use cases
export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn('bg-surface rounded-xl p-6 shadow-md border border-border', className)}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Skeleton variant="circular" width={48} height={48} />
                    <div className="space-y-2">
                        <Skeleton variant="text" width={120} height={20} />
                        <Skeleton variant="text" width={80} height={14} />
                    </div>
                </div>
                <Skeleton variant="rounded" width={60} height={24} />
            </div>
            <div className="space-y-3 mb-6">
                <Skeleton variant="text" width="60%" height={14} />
                <div className="flex justify-between">
                    <Skeleton variant="text" width="30%" height={14} />
                    <Skeleton variant="text" width="20%" height={14} />
                </div>
                <div className="flex justify-between">
                    <Skeleton variant="text" width="30%" height={14} />
                    <Skeleton variant="text" width="25%" height={14} />
                </div>
            </div>
            <div className="flex gap-3">
                <Skeleton variant="rounded" className="flex-1" height={40} />
                <Skeleton variant="rounded" width={48} height={40} />
            </div>
        </div>
    );
}

export function SkeletonCustomerRow({ className }: { className?: string }) {
    return (
        <div className={cn('bg-surface rounded-xl p-5 shadow-md border border-border', className)}>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <Skeleton variant="circular" width={48} height={48} />
                    <div className="space-y-2 flex-1">
                        <Skeleton variant="text" width="40%" height={20} />
                        <Skeleton variant="text" width="25%" height={14} />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right space-y-2">
                        <Skeleton variant="text" width={40} height={12} />
                        <Skeleton variant="text" width={100} height={24} />
                        <Skeleton variant="rounded" width={60} height={20} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton variant="rounded" width={32} height={32} />
                        <Skeleton variant="rounded" width={32} height={32} />
                        <Skeleton variant="circular" width={20} height={20} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SkeletonTableRow({ columns = 6, className }: { columns?: number; className?: string }) {
    return (
        <tr className={cn('hover:bg-background/50', className)}>
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="p-3">
                    {i === 0 ? (
                        <div className="flex items-center gap-3">
                            <Skeleton variant="rounded" width={48} height={48} />
                            <Skeleton variant="text" width={100} height={16} />
                        </div>
                    ) : i === columns - 1 ? (
                        <div className="flex gap-1">
                            <Skeleton variant="circular" width={32} height={32} />
                            <Skeleton variant="circular" width={32} height={32} />
                        </div>
                    ) : (
                        <Skeleton variant="text" width={i === 4 ? 60 : 80} height={16} />
                    )}
                </td>
            ))}
        </tr>
    );
}

export function SkeletonStatCard({ className }: { className?: string }) {
    return (
        <div className={cn('bg-surface rounded-xl p-6 shadow-md border border-border', className)}>
            <div className="flex items-start justify-between mb-2">
                <Skeleton variant="text" width="60%" height={16} />
                <Skeleton variant="rounded" width={40} height={40} />
            </div>
            <Skeleton variant="text" width="50%" height={32} className="mb-1" />
            <Skeleton variant="text" width="40%" height={14} />
        </div>
    );
}

export function SkeletonTransactionRow({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center justify-between p-3 rounded-lg border-b border-border', className)}>
            <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="space-y-2">
                    <Skeleton variant="text" width={100} height={16} />
                    <Skeleton variant="text" width={150} height={12} />
                </div>
            </div>
            <div className="text-right space-y-2">
                <Skeleton variant="text" width={80} height={16} />
                <Skeleton variant="text" width={100} height={12} />
            </div>
        </div>
    );
}

export function SkeletonTranslationCard({ className }: { className?: string }) {
    return (
        <div className={cn('bg-surface border border-border rounded-lg p-4', className)}>
            <div className="mb-3 border-b border-border pb-2">
                <Skeleton variant="text" width="80%" height={18} />
            </div>
            <Skeleton variant="text" width="70%" height={24} />
        </div>
    );
}

export function SkeletonProfileDetails({ className }: { className?: string }) {
    return (
        <div className={cn('space-y-4', className)}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Skeleton variant="circular" width={64} height={64} />
                <div className="space-y-2 flex-1">
                    <Skeleton variant="text" width="40%" height={24} />
                    <Skeleton variant="text" width="25%" height={16} />
                </div>
            </div>
            {/* Details */}
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-background">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="space-y-2 flex-1">
                        <Skeleton variant="text" width="30%" height={12} />
                        <Skeleton variant="text" width="50%" height={16} />
                    </div>
                </div>
            ))}
        </div>
    );
}
