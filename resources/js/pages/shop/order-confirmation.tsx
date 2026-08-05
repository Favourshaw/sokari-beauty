import StoreLayout from '@/layouts/store-layout';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

interface OrderItem {
    name: string;
    variant: string | null;
    quantity: number;
    line_total_formatted: string;
}

interface Order {
    order_number: string;
    email: string;
    status: string;
    payment_method: string;
    subtotal_formatted: string;
    discount_formatted: string | null;
    shipping_formatted: string;
    tax_formatted: string;
    grand_total_formatted: string;
    items: OrderItem[];
}

export default function OrderConfirmation({ order, bank_details }: { order: Order; bank_details: string | null }) {
    return (
        <StoreLayout>
            <Head title={`Order ${order.order_number} — Sokari Beauty`} />
            <div className="section-y">
                <div className="store-container max-w-2xl">
                    <div className="flex flex-col items-center text-center">
                        <CheckCircle2 className="text-primary" size={48} />
                        <h1 className="mt-4 text-3xl font-light tracking-tight">Thank you for your order</h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Order <span className="text-foreground font-medium">{order.order_number}</span> — a confirmation has been sent to {order.email}.
                        </p>
                    </div>

                    {bank_details && (
                        <div className="border-border mt-8 rounded-2xl border p-6">
                            <h2 className="text-sm font-semibold tracking-wide uppercase">Bank transfer details</h2>
                            <p className="text-muted-foreground mt-1 text-xs">Please transfer {order.grand_total_formatted} using your order number as the reference.</p>
                            <pre className="text-foreground mt-3 text-sm whitespace-pre-wrap">{bank_details}</pre>
                        </div>
                    )}

                    <div className="bg-cream mt-8 rounded-3xl p-6">
                        <h2 className="text-sm font-semibold tracking-wide uppercase">Summary</h2>
                        <div className="mt-4 flex flex-col gap-3">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span>
                                        {item.name}
                                        {item.variant ? ` · ${item.variant}` : ''} × {item.quantity}
                                    </span>
                                    <span>{item.line_total_formatted}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex flex-col gap-2 border-t pt-4 text-sm">
                            <div className="flex justify-between"><span>Subtotal</span><span>{order.subtotal_formatted}</span></div>
                            {order.discount_formatted && <div className="flex justify-between"><span>Discount</span><span>{order.discount_formatted}</span></div>}
                            <div className="flex justify-between"><span>Shipping</span><span>{order.shipping_formatted}</span></div>
                            <div className="text-muted-foreground flex justify-between"><span>VAT (incl.)</span><span>{order.tax_formatted}</span></div>
                            <div className="mt-2 flex justify-between border-t pt-3 text-base font-semibold"><span>Total</span><span>{order.grand_total_formatted}</span></div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center gap-3">
                        <Link href="/shop" className="bg-primary text-primary-foreground rounded-full px-7 py-3 text-sm font-medium">Continue Shopping</Link>
                        <Link href="/account/orders" className="border-border rounded-full border px-7 py-3 text-sm font-medium">View Orders</Link>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
