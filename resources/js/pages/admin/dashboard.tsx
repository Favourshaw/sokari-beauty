import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, PoundSterling, ShoppingCart, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/admin' }];

interface Stats {
    revenue: string;
    orders: number;
    customers: number;
    aov: string;
    pending_orders: number;
    low_stock: number;
}

interface DayRevenue {
    label: string;
    total: number;
    formatted: string;
}

interface RecentOrder {
    order_number: string;
    email: string;
    status: string;
    total: string;
    placed_at: string | null;
    url: string;
}

interface Props {
    stats: Stats;
    revenue_by_day: DayRevenue[];
    recent_orders: RecentOrder[];
    low_stock_products: { name: string; stock: number; url: string }[];
}

export default function AdminDashboard({ stats, revenue_by_day, recent_orders, low_stock_products }: Props) {
    const maxRevenue = Math.max(...revenue_by_day.map((d) => d.total), 1);

    const cards = [
        { label: 'Revenue (paid)', value: stats.revenue, icon: PoundSterling },
        { label: 'Orders', value: stats.orders, icon: ShoppingCart },
        { label: 'Customers', value: stats.customers, icon: Users },
        { label: 'Avg. order value', value: stats.aov, icon: PoundSterling },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Store overview</h1>
                    <p className="text-muted-foreground text-sm">Key metrics for Sokari Beauty.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card) => (
                        <div key={card.label} className="border-border rounded-xl border p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs tracking-wide uppercase">{card.label}</span>
                                <card.icon size={16} className="text-muted-foreground" />
                            </div>
                            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="border-border lg:col-span-2 rounded-xl border p-5">
                        <h2 className="text-sm font-medium">Revenue — last 7 days</h2>
                        <div className="mt-6 flex h-40 items-end gap-3">
                            {revenue_by_day.map((day) => (
                                <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                                    <div className="flex w-full flex-1 items-end">
                                        <div
                                            className="bg-primary/80 hover:bg-primary w-full rounded-t-md transition-colors"
                                            style={{ height: `${Math.max((day.total / maxRevenue) * 100, 2)}%` }}
                                            title={day.formatted}
                                        />
                                    </div>
                                    <span className="text-muted-foreground text-xs">{day.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-border rounded-xl border p-5">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className="text-amber-500" />
                            <h2 className="text-sm font-medium">Low stock ({stats.low_stock})</h2>
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                            {low_stock_products.length === 0 && <p className="text-muted-foreground text-sm">All products well stocked.</p>}
                            {low_stock_products.map((p) => (
                                <Link key={p.name} href={p.url} className="hover:bg-muted flex items-center justify-between rounded-lg px-2 py-1.5 text-sm">
                                    <span className="truncate">{p.name}</span>
                                    <span className="text-amber-600">{p.stock} left</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-border rounded-xl border">
                    <div className="flex items-center justify-between p-5">
                        <h2 className="text-sm font-medium">Recent orders</h2>
                        <Link href="/admin/orders" className="text-primary text-sm">View all</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-muted-foreground border-border border-y text-left text-xs uppercase">
                                <tr>
                                    <th className="px-5 py-2 font-medium">Order</th>
                                    <th className="px-5 py-2 font-medium">Customer</th>
                                    <th className="px-5 py-2 font-medium">Status</th>
                                    <th className="px-5 py-2 font-medium">Date</th>
                                    <th className="px-5 py-2 text-right font-medium">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent_orders.map((order) => (
                                    <tr key={order.order_number} className="border-border hover:bg-muted/50 border-b last:border-0">
                                        <td className="px-5 py-3"><Link href={order.url} className="text-primary font-medium">{order.order_number}</Link></td>
                                        <td className="px-5 py-3">{order.email}</td>
                                        <td className="px-5 py-3 capitalize">{order.status}</td>
                                        <td className="text-muted-foreground px-5 py-3">{order.placed_at}</td>
                                        <td className="px-5 py-3 text-right font-medium">{order.total}</td>
                                    </tr>
                                ))}
                                {recent_orders.length === 0 && (
                                    <tr><td colSpan={5} className="text-muted-foreground px-5 py-8 text-center">No orders yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
