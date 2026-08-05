import { Link, useForm } from '@inertiajs/react';
import { Facebook, Instagram, Send } from 'lucide-react';

const columns = [
    {
        title: 'Explore',
        links: [
            { label: 'Shop All', href: '/shop' },
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
        ],
    },
    {
        title: 'Account',
        links: [
            { label: 'Sign In', href: '/login' },
            { label: 'Register', href: '/register' },
            { label: 'My Orders', href: '/account/orders' },
        ],
    },
];

export function StoreFooter() {
    const form = useForm({ email: '' });

    function subscribe(e: React.FormEvent) {
        e.preventDefault();
        form.post('/newsletter', { preserveScroll: true, onSuccess: () => form.reset() });
    }

    return (
        <footer className="border-border bg-cream border-t">
            <div className="store-container grid gap-10 py-16 md:grid-cols-4">
                <div className="md:col-span-2">
                    <span className="text-xl font-semibold tracking-[0.25em] uppercase">Sokari</span>
                    <p className="text-muted-foreground mt-4 max-w-sm text-sm">
                        Conscious beauty, uncompromised. Clean, effective skincare crafted in the UK and shipped worldwide.
                    </p>
                    <form className="mt-6 flex max-w-sm items-center gap-2" onSubmit={subscribe}>
                        <input
                            type="email"
                            required
                            placeholder="Email address"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            className="border-border focus:ring-primary h-11 w-full rounded-full border bg-white px-4 text-sm outline-none focus:ring-2"
                        />
                        <button
                            type="submit"
                            aria-label="Subscribe"
                            className="bg-primary text-primary-foreground hover:opacity-90 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-opacity"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>

                {columns.map((col) => (
                    <div key={col.title}>
                        <h3 className="text-sm font-semibold tracking-wide uppercase">{col.title}</h3>
                        <ul className="mt-4 flex flex-col gap-2">
                            {col.links.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-muted-foreground hover:text-primary text-sm transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="border-border border-t">
                <div className="store-container flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
                    <p className="text-muted-foreground text-xs">© {new Date().getFullYear()} Sokari Beauty. All rights reserved.</p>
                    <div className="flex items-center gap-3">
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-primary">
                            <Instagram size={18} />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-primary">
                            <Facebook size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
