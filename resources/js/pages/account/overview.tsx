import AccountLayout from '@/layouts/account-layout';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { Heart, MapPin, Package, PoundSterling } from 'lucide-react';

interface RecentOrder {
    order_number: string;
    status: string;
    total: string;
    placed_at: string | null;
    url: string;
}

interface Props {
    stats: { orders: number; total_spent: string; wishlist: number };
    recent_orders: RecentOrder[];
    has_delivery: boolean;
    profile: { name: string; email: string; phone: string | null };
}

const statusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-200 text-gray-700',
    refunded: 'bg-red-100 text-red-800',
};

export default function Overview({ stats, recent_orders, has_delivery, profile }: Props) {
    const cards = [
        { label: 'Orders', value: stats.orders, icon: Package, href: '/account/orders' },
        { label: 'Total spent', value: stats.total_spent, icon: PoundSterling, href: '/account/orders' },
        { label: 'Wishlist', value: stats.wishlist, icon: Heart, href: '/account/wishlist' },
    ];

    return (
        <AccountLayout title={`Hi, ${profile.name.split(' ')[0]}`}>
            <Head title="My Account — Sokari Beauty" />

            <div className="grid gap-4 sm:grid-cols-3">
                {cards.map((card) => (
                    <Link key={card.label} href={card.href} className="border-border hover:border-primary rounded-2xl border p-5 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-xs tracking-wide uppercase">{card.label}</span>
                            <card.icon size={16} className="text-muted-foreground" />
                        </div>
                        <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                    </Link>
                ))}
            </div>

            {!has_delivery && (
                <Link href="/account/delivery" className="bg-cream mt-6 flex items-center gap-3 rounded-2xl p-5">
                    <MapPin size={18} className="text-primary" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">Add your delivery details</p>
                        <p className="text-muted-foreground text-xs">Save your address once and we’ll prefill it at checkout.</p>
                    </div>
                    <span className="text-primary text-sm font-medium">Add →</span>
                </Link>
            )}

            <div className="mt-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">Recent orders</h2>
                    <Link href="/account/orders" className="text-primary text-sm">View all</Link>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                    {recent_orders.length === 0 && (
                        <div className="border-border rounded-2xl border border-dashed p-8 text-center">
                            <p className="text-muted-foreground text-sm">You haven’t placed any orders yet.</p>
                            <Link href="/shop" className="bg-primary text-primary-foreground mt-4 inline-block rounded-full px-6 py-2.5 text-sm font-medium">Start shopping</Link>
                        </div>
                    )}
                    {recent_orders.map((order) => (
                        <Link key={order.order_number} href={order.url} className="border-border hover:border-primary flex items-center justify-between rounded-2xl border p-4 transition-colors">
                            <div>
                                <p className="text-sm font-medium">{order.order_number}</p>
                                <p className="text-muted-foreground text-xs">{order.placed_at}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={cn('rounded-full px-3 py-1 text-xs font-medium capitalize', statusColor[order.status] ?? 'bg-gray-100 text-gray-700')}>{order.status}</span>
                                <span className="text-sm font-semibold">{order.total}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AccountLayout>
    );
}
