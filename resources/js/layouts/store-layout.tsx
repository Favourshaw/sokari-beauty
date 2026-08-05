import { StoreFooter } from '@/components/store/store-footer';
import { StoreHeader } from '@/components/store/store-header';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren, useEffect, useState } from 'react';

export default function StoreLayout({ children }: PropsWithChildren) {
    const { flash } = usePage<SharedData>().props;
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // The storefront is intentionally a light, luxury palette — never dark.
    useEffect(() => {
        document.documentElement.classList.remove('dark');
    }, []);

    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
        } else if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
        }
    }, [flash]);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }, [toast]);

    return (
        <div className="flex min-h-screen flex-col">
            <StoreHeader />
            <main className="flex-1">{children}</main>
            <StoreFooter />

            {toast && (
                <div
                    className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg ${
                        toast.type === 'success' ? 'bg-foreground' : 'bg-destructive'
                    }`}
                    role="status"
                >
                    {toast.message}
                </div>
            )}
        </div>
    );
}
