import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';

interface Item { name: string; variant: string | null; sku: string | null; quantity: number; unit_price: string; line_total: string }
interface Shipment { tracking_number: string | null; carrier: string | null; tracking_url: string | null; status: string }
interface TimelineEntry { status: string; note: string | null; by: string | null; at: string }
interface Order {
    order_number: string; email: string; phone: string | null; status: string; payment_status: string; payment_method: string;
    placed_at: string | null; customer_note: string | null; subtotal: string; discount: string | null; shipping: string; tax: string; grand_total: string;
    shipping_address: Record<string, string> | null; shipping_method: string | null; items: Item[]; shipment: Shipment | null;
    timeline: TimelineEntry[]; refunds: { amount: string; reason: string | null; at: string }[];
}
interface Props { order: Order; statuses: string[]; can_refund: boolean }

const input = 'border-border h-9 w-full rounded-lg border px-3 text-sm outline-none';

export default function OrderShow({ order, statuses, can_refund }: Props) {
    const status = useForm({ status: order.status, note: '' });
    const fulfill = useForm({ tracking_number: order.shipment?.tracking_number ?? '', carrier: order.shipment?.carrier ?? '', tracking_url: order.shipment?.tracking_url ?? '', note: '' });
    const refund = useForm({ amount: '', reason: '' });

    const base = `/admin/orders/${order.order_number}`;
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Orders', href: '/admin/orders' }, { title: order.order_number, href: '#' }];
    const addr = order.shipping_address;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />
            <div className="grid gap-6 p-4 lg:grid-cols-3">
                <div className="flex flex-col gap-6 lg:col-span-2">
                    <div className="border-border rounded-xl border">
                        <div className="flex items-center justify-between p-5">
                            <div>
                                <h1 className="text-xl font-semibold">{order.order_number}</h1>
                                <p className="text-muted-foreground text-sm">{order.placed_at}</p>
                            </div>
                            <span className={cn('rounded-full px-3 py-1 text-xs font-medium capitalize', order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800')}>{order.payment_status}</span>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="text-muted-foreground border-border border-y text-left text-xs uppercase">
                                <tr><th className="px-5 py-2 font-medium">Item</th><th className="px-5 py-2 font-medium">Qty</th><th className="px-5 py-2 text-right font-medium">Total</th></tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, i) => (
                                    <tr key={i} className="border-border border-b last:border-0">
                                        <td className="px-5 py-3">{item.name}{item.variant ? ` · ${item.variant}` : ''}<span className="text-muted-foreground block text-xs">{item.sku}</span></td>
                                        <td className="px-5 py-3">{item.quantity}</td>
                                        <td className="px-5 py-3 text-right">{item.line_total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex flex-col gap-1.5 border-t p-5 text-sm">
                            <Row label="Subtotal" value={order.subtotal} />
                            {order.discount && <Row label="Discount" value={`-${order.discount}`} />}
                            <Row label="Shipping" value={order.shipping} />
                            <Row label="VAT (incl.)" value={order.tax} muted />
                            <div className="mt-1 flex justify-between border-t pt-2 font-semibold"><span>Total</span><span>{order.grand_total}</span></div>
                        </div>
                    </div>

                    {/* Fulfillment / tracking */}
                    <div className="border-border rounded-xl border p-5">
                        <h2 className="text-sm font-medium">Fulfillment & tracking</h2>
                        <form onSubmit={(e) => { e.preventDefault(); fulfill.post(`${base}/fulfill`, { preserveScroll: true }); }} className="mt-4 grid gap-3 sm:grid-cols-2">
                            <input className={input} placeholder="Tracking number" value={fulfill.data.tracking_number} onChange={(e) => fulfill.setData('tracking_number', e.target.value)} />
                            <input className={input} placeholder="Carrier (e.g. Royal Mail)" value={fulfill.data.carrier} onChange={(e) => fulfill.setData('carrier', e.target.value)} />
                            <input className={cn(input, 'sm:col-span-2')} placeholder="Tracking URL" value={fulfill.data.tracking_url} onChange={(e) => fulfill.setData('tracking_url', e.target.value)} />
                            <button className="bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium sm:col-span-2" disabled={fulfill.processing}>Mark shipped & notify customer</button>
                        </form>
                        {order.shipment?.tracking_number && <p className="text-muted-foreground mt-3 text-xs">Current: {order.shipment.carrier} · {order.shipment.tracking_number}</p>}
                    </div>

                    {order.timeline.length > 0 && (
                        <div className="border-border rounded-xl border p-5">
                            <h2 className="text-sm font-medium">Timeline</h2>
                            <ol className="mt-4 flex flex-col gap-3">
                                {order.timeline.map((e, i) => (
                                    <li key={i} className="flex gap-3 text-sm">
                                        <span className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                                        <div>
                                            <p className="font-medium capitalize">{e.status}{e.note ? ` — ${e.note}` : ''}</p>
                                            <p className="text-muted-foreground text-xs">{e.at}{e.by ? ` · ${e.by}` : ''}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-4">
                    <div className="border-border rounded-xl border p-5">
                        <h2 className="text-sm font-medium">Update status</h2>
                        <form onSubmit={(e) => { e.preventDefault(); status.post(`${base}/status`, { preserveScroll: true }); }} className="mt-3 flex flex-col gap-2">
                            <select className={input} value={status.data.status} onChange={(e) => status.setData('status', e.target.value)}>
                                {statuses.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                            </select>
                            <input className={input} placeholder="Note (optional)" value={status.data.note} onChange={(e) => status.setData('note', e.target.value)} />
                            <button className="bg-foreground text-background rounded-lg py-2 text-sm font-medium" disabled={status.processing}>Update</button>
                        </form>
                        {order.payment_status !== 'paid' && (
                            <button onClick={() => router.post(`${base}/mark-paid`, {}, { preserveScroll: true })} className="border-border mt-2 w-full rounded-lg border py-2 text-sm">Mark as paid</button>
                        )}
                    </div>

                    <div className="border-border rounded-xl border p-5 text-sm">
                        <h2 className="text-sm font-medium">Customer</h2>
                        <p className="mt-3">{order.email}</p>
                        {order.phone && <p className="text-muted-foreground">{order.phone}</p>}
                        {addr && (
                            <div className="mt-3 border-t pt-3 leading-relaxed">
                                <p className="text-muted-foreground text-xs uppercase">Ship to</p>
                                <p>{addr.first_name} {addr.last_name}<br />{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />{addr.city} {addr.postcode}<br />{addr.country}</p>
                                <p className="text-muted-foreground mt-2">{order.shipping_method}</p>
                            </div>
                        )}
                        {order.customer_note && <p className="bg-muted mt-3 rounded-lg p-3 text-xs">“{order.customer_note}”</p>}
                    </div>

                    {can_refund && order.payment_status === 'paid' && (
                        <div className="border-border rounded-xl border p-5">
                            <h2 className="text-sm font-medium">Refund</h2>
                            <form onSubmit={(e) => { e.preventDefault(); refund.post(`${base}/refund`, { preserveScroll: true, onSuccess: () => refund.reset() }); }} className="mt-3 flex flex-col gap-2">
                                <input className={input} placeholder="Amount (£)" value={refund.data.amount} onChange={(e) => refund.setData('amount', e.target.value)} />
                                <input className={input} placeholder="Reason (optional)" value={refund.data.reason} onChange={(e) => refund.setData('reason', e.target.value)} />
                                <button className="bg-destructive rounded-lg py-2 text-sm font-medium text-white" disabled={refund.processing}>Issue refund</button>
                            </form>
                        </div>
                    )}
                    {order.refunds.length > 0 && (
                        <div className="border-border rounded-xl border p-5 text-sm">
                            <h2 className="text-sm font-medium">Refunds</h2>
                            {order.refunds.map((r, i) => <p key={i} className="text-muted-foreground mt-2">{r.amount} — {r.reason ?? 'no reason'} ({r.at})</p>)}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
    return <div className="flex justify-between"><span className={muted ? 'text-muted-foreground' : ''}>{label}</span><span>{value}</span></div>;
}
