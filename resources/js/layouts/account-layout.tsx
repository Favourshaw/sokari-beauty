import StoreLayout from '@/layouts/store-layout';
import { cn } from '@/lib/utils';
import { Link, router, usePage } from '@inertiajs/react';
import { Heart, LogOut, Package, Settings } from 'lucide-react';
import { type PropsWithChildren } from 'react';

const nav = [
    { label: 'Orders', href: '/account/orders', icon: Package },
    { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
    { label: 'Profile', href: '/settings/profile', icon: Settings },
];

export default function AccountLayout({ children, title }: PropsWithChildren<{ title: string }>) {
    const current = usePage().url;

    return (
        <StoreLayout>
            <div className="section-y">
                <div className="store-container">
                    <h1 className="text-3xl font-light tracking-tight">{title}</h1>
                    <div className="mt-8 grid gap-10 lg:grid-cols-[200px_1fr]">
                        <aside className="flex flex-col gap-1">
                            {nav.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors',
                                        current.startsWith(item.href) ? 'bg-accent text-foreground font-medium' : 'text-muted-foreground hover:bg-muted',
                                    )}
                                >
                                    <item.icon size={16} /> {item.label}
                                </Link>
                            ))}
                            <button
                                onClick={() => router.post('/logout')}
                                className="text-muted-foreground hover:bg-muted flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm"
                            >
                                <LogOut size={16} /> Log out
                            </button>
                        </aside>
                        <div>{children}</div>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
