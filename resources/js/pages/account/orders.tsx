import AccountLayout from '@/layouts/account-layout';
import { cn } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';

interface OrderRow {
    order_number: string;
    status: string;
    payment_status: string;
    items_count: number;
    grand_total_formatted: string;
    placed_at: string | null;
    url: string;
}

const statusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-200 text-gray-700',
    refunded: 'bg-red-100 text-red-800',
};

export default function Orders({ orders }: { orders: { data: OrderRow[] } }) {
    return (
        <AccountLayout title="My Orders">
            <Head title="My Orders — Sokari Beauty" />
            {orders.data.length === 0 ? (
                <div className="border-border rounded-2xl border border-dashed p-10 text-center">
                    <p className="text-muted-foreground text-sm">You haven’t placed any orders yet.</p>
                    <Link href="/shop" className="bg-primary text-primary-foreground mt-4 inline-block rounded-full px-6 py-2.5 text-sm font-medium">Start shopping</Link>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {orders.data.map((order) => (
                        <Link key={order.order_number} href={order.url} className="border-border hover:border-primary flex items-center justify-between rounded-2xl border p-5 transition-colors">
                            <div>
                                <p className="text-sm font-medium">{order.order_number}</p>
                                <p className="text-muted-foreground text-xs">
                                    {order.placed_at} · {order.items_count} item{order.items_count > 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={cn('rounded-full px-3 py-1 text-xs font-medium capitalize', statusColor[order.status] ?? 'bg-gray-100 text-gray-700')}>{order.status}</span>
                                <span className="text-sm font-semibold">{order.grand_total_formatted}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </AccountLayout>
    );
}
