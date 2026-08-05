import AccountLayout from '@/layouts/account-layout';
import { Head } from '@inertiajs/react';
import { Truck } from 'lucide-react';

interface Tracking {
    number: string | null;
    carrier: string | null;
    url: string | null;
    status: string;
    shipped_at: string | null;
    delivered_at: string | null;
}

interface Order {
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string;
    placed_at: string | null;
    subtotal_formatted: string;
    discount_formatted: string | null;
    shipping_formatted: string;
    tax_formatted: string;
    grand_total_formatted: string;
    shipping_address: Record<string, string> | null;
    shipping_method: string | null;
    items: { name: string; variant: string | null; quantity: number; line_total_formatted: string }[];
    tracking: Tracking | null;
    timeline: { status: string; note: string | null; at: string }[];
}

export default function OrderDetail({ order }: { order: Order }) {
    const addr = order.shipping_address;

    return (
        <AccountLayout title={`Order ${order.order_number}`}>
            <Head title={`Order ${order.order_number} — Sokari Beauty`} />
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="flex flex-col gap-6">
                    {order.tracking && (
                        <div className="bg-cream rounded-2xl p-5">
                            <div className="flex items-center gap-2">
                                <Truck size={18} className="text-primary" />
                                <h2 className="text-sm font-semibold tracking-wide uppercase">Tracking</h2>
                            </div>
                            <div className="mt-3 text-sm">
                                {order.tracking.carrier && <p><span className="text-muted-foreground">Carrier:</span> {order.tracking.carrier}</p>}
                                {order.tracking.number && <p><span className="text-muted-foreground">Tracking number:</span> {order.tracking.number}</p>}
                                {order.tracking.shipped_at && <p><span className="text-muted-foreground">Shipped:</span> {order.tracking.shipped_at}</p>}
                                {order.tracking.url && (
                                    <a href={order.tracking.url} target="_blank" rel="noreferrer" className="text-primary mt-2 inline-block font-medium">Track your parcel →</a>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="border-border rounded-2xl border p-5">
                        <h2 className="text-sm font-semibold tracking-wide uppercase">Items</h2>
                        <div className="mt-4 flex flex-col gap-3">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span>{item.name}{item.variant ? ` · ${item.variant}` : ''} × {item.quantity}</span>
                                    <span>{item.line_total_formatted}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex flex-col gap-2 border-t pt-4 text-sm">
                            <div className="flex justify-between"><span>Subtotal</span><span>{order.subtotal_formatted}</span></div>
                            {order.discount_formatted && <div className="flex justify-between"><span>Discount</span><span>{order.discount_formatted}</span></div>}
                            <div className="flex justify-between"><span>Shipping</span><span>{order.shipping_formatted}</span></div>
                            <div className="text-muted-foreground flex justify-between"><span>VAT (incl.)</span><span>{order.tax_formatted}</span></div>
                            <div className="mt-1 flex justify-between border-t pt-3 font-semibold"><span>Total</span><span>{order.grand_total_formatted}</span></div>
                        </div>
                    </div>

                    {order.timeline.length > 0 && (
                        <div className="border-border rounded-2xl border p-5">
                            <h2 className="text-sm font-semibold tracking-wide uppercase">Timeline</h2>
                            <ol className="mt-4 flex flex-col gap-3">
                                {order.timeline.map((event, i) => (
                                    <li key={i} className="flex gap-3 text-sm">
                                        <span className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                                        <div>
                                            <p className="font-medium capitalize">{event.status}{event.note ? ` — ${event.note}` : ''}</p>
                                            <p className="text-muted-foreground text-xs">{event.at}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>

                <aside className="border-border h-fit rounded-2xl border p-5 text-sm">
                    <h2 className="text-sm font-semibold tracking-wide uppercase">Details</h2>
                    <dl className="mt-4 flex flex-col gap-2">
                        <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd className="capitalize">{order.status}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted-foreground">Payment</dt><dd className="capitalize">{order.payment_status}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted-foreground">Method</dt><dd className="capitalize">{order.payment_method?.replace('_', ' ')}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted-foreground">Placed</dt><dd>{order.placed_at}</dd></div>
                    </dl>
                    {addr && (
                        <div className="mt-4 border-t pt-4">
                            <h3 className="text-muted-foreground text-xs tracking-wide uppercase">Ship to</h3>
                            <p className="mt-2 leading-relaxed">
                                {addr.first_name} {addr.last_name}<br />
                                {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                                {addr.city}{addr.county ? `, ${addr.county}` : ''} {addr.postcode}<br />
                                {addr.country}
                            </p>
                        </div>
                    )}
                </aside>
            </div>
        </AccountLayout>
    );
}
