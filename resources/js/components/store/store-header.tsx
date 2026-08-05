import { CurrencySwitcher } from '@/components/store/currency-switcher';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
];

export function StoreHeader() {
    const { auth, cart } = usePage<SharedData>().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const accountHref = auth.user ? (auth.user.role === 'customer' ? '/account/orders' : '/admin') : '/login';

    return (
        <header className="border-border bg-background/90 sticky top-0 z-50 border-b backdrop-blur">
            <div className="store-container flex h-16 items-center justify-between gap-4 lg:h-20">
                <Link href="/" className="text-xl font-semibold tracking-[0.25em] uppercase">
                    Sokari
                </Link>

                <nav className="hidden items-center gap-8 lg:flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="hover:text-primary text-sm font-medium tracking-wide transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-1">
                    <div className="mr-1 hidden sm:block">
                        <CurrencySwitcher />
                    </div>
                    <Link href="/shop" aria-label="Search" className="hover:bg-muted rounded-full p-2 transition-colors">
                        <Search size={18} />
                    </Link>
                    <Link href={accountHref} aria-label="Account" className="hover:bg-muted rounded-full p-2 transition-colors">
                        <User size={18} />
                    </Link>
                    <Link href="/cart" aria-label="Cart" className="hover:bg-muted relative rounded-full p-2 transition-colors">
                        <ShoppingBag size={18} />
                        {cart?.count > 0 && (
                            <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                                {cart.count}
                            </span>
                        )}
                    </Link>
                    <button
                        type="button"
                        aria-label="Menu"
                        onClick={() => setMobileOpen((v) => !v)}
                        className="hover:bg-muted rounded-full p-2 transition-colors lg:hidden"
                    >
                        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>
            </div>

            <div className={cn('border-border border-t lg:hidden', mobileOpen ? 'block' : 'hidden')}>
                <nav className="store-container flex flex-col py-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="hover:text-primary py-2 text-sm font-medium"
                            onClick={() => setMobileOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}
