import StoreLayout from '@/layouts/store-layout';
import { cn } from '@/lib/utils';
import { Link, router, usePage } from '@inertiajs/react';
import { Heart, LayoutGrid, LogOut, MapPin, Package, User } from 'lucide-react';
import { type PropsWithChildren } from 'react';

const nav = [
    { label: 'Overview', href: '/account', icon: LayoutGrid, exact: true },
    { label: 'Orders', href: '/account/orders', icon: Package, exact: false },
    { label: 'Delivery details', href: '/account/delivery', icon: MapPin, exact: false },
    { label: 'Wishlist', href: '/account/wishlist', icon: Heart, exact: false },
    { label: 'Profile', href: '/account/profile', icon: User, exact: false },
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
                            {nav.map((item) => {
                                const active = item.exact ? current === item.href : current.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors',
                                            active ? 'bg-accent text-foreground font-medium' : 'text-muted-foreground hover:bg-muted',
                                        )}
                                    >
                                        <item.icon size={16} /> {item.label}
                                    </Link>
                                );
                            })}
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
